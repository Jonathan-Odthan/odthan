const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { paymentSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { generateNumber } = require("../../lib/intake");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "payments.view", sendJson);
      if (guard.error) return;
      const { rows } = await db.query(
        `SELECT p.*, c.first_name, c.last_name, o.number as order_number
         FROM payments p JOIN clients c ON c.id = p.client_id LEFT JOIN orders o ON o.id = p.order_id
         ORDER BY p.created_at DESC LIMIT 100`
      );
      return sendJson(res, 200, { payments: rows });
    }

    if (req.method === "POST") {
      const guard = await requirePermission(req, res, "payments.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = paymentSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;
      const number = generateNumber("PAY");

      const result = await db.withTransaction(async (client) => {
        const inserted = await client.query(
          `INSERT INTO payments (number, client_id, order_id, amount, currency, method, status, reference)
           VALUES ($1,$2,$3,$4,$5,$6,'CONFIRMED',$7) RETURNING id`,
          [number, d.clientId, d.orderId || null, d.amount, d.currency, d.method, d.reference || null]
        );
        if (d.orderId) {
          await client.query(`UPDATE orders SET amount_paid = amount_paid + $1 WHERE id = $2`, [d.amount, d.orderId]);
        }
        return inserted;
      });

      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "PAYMENT_CREATED", module: "payments", targetId: result.rows[0].id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true, id: result.rows[0].id });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
