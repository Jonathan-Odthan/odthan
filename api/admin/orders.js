const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { orderCreateSchema, orderStatusSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { generateNumber } = require("../../lib/intake");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "orders.view", sendJson);
      if (guard.error) return;
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");

      if (id) {
        const { rows } = await db.query(
          `SELECT o.*, c.first_name, c.last_name, a.first_name as assignee_first_name, a.last_name as assignee_last_name
           FROM orders o JOIN clients c ON c.id = o.client_id LEFT JOIN admin_profiles a ON a.id = o.assignee_id
           WHERE o.id = $1`, [id]
        );
        if (rows.length === 0) return sendJson(res, 404, { error: "NOT_FOUND" });
        const [history, payments, tasks] = await Promise.all([
          db.query(`SELECT * FROM order_history WHERE order_id = $1 ORDER BY created_at DESC`, [id]),
          db.query(`SELECT number, amount, currency, method FROM payments WHERE order_id = $1 ORDER BY created_at DESC`, [id]),
          db.query(`SELECT id, title, status FROM tasks WHERE order_id = $1`, [id]),
        ]);
        return sendJson(res, 200, { order: rows[0], history: history.rows, payments: payments.rows, tasks: tasks.rows });
      }

      const status = url.searchParams.get("status");
      const params = [];
      let where = "";
      if (status) { params.push(status); where = `WHERE o.status = $1`; }
      const { rows } = await db.query(
        `SELECT o.id, o.number, o.status, o.amount, o.amount_paid, o.created_at, c.first_name, c.last_name
         FROM orders o JOIN clients c ON c.id = o.client_id ${where} ORDER BY o.created_at DESC LIMIT 100`, params
      );
      return sendJson(res, 200, { orders: rows });
    }

    if (req.method === "POST") {
      const guard = await requirePermission(req, res, "orders.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = orderCreateSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;

      const number = generateNumber("ORD");
      const { rows } = await db.withTransaction(async (client) => {
        const inserted = await client.query(
          `INSERT INTO orders (number, client_id, request_id, amount, assignee_id, due_date, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          [number, d.clientId, d.requestId || null, d.amount, d.assigneeId || null, d.dueDate || null, d.notes || null]
        );
        await client.query(`INSERT INTO order_history (order_id, status, note) VALUES ($1,'PENDING','Commande creee')`, [inserted.rows[0].id]);
        return inserted;
      });
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "CREATE_ORDER", module: "orders", targetId: rows[0].id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "PUT") {
      const guard = await requirePermission(req, res, "orders.update", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      if (!id) return sendJson(res, 400, { error: "MISSING_ID" });

      const body = await readJsonBody(req);
      const parsed = orderStatusSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      await db.withTransaction(async (client) => {
        await client.query(`UPDATE orders SET status = $1, updated_at = now() WHERE id = $2`, [parsed.data.status, id]);
        await client.query(`INSERT INTO order_history (order_id, status, note) VALUES ($1,$2,$3)`, [id, parsed.data.status, parsed.data.note || null]);
      });
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "UPDATE_ORDER", module: "orders", targetId: id, metadata: { status: parsed.data.status } });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
