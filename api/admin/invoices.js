const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { invoiceSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { generateNumber } = require("../../lib/intake");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "invoices.view", sendJson);
      if (guard.error) return;
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");

      if (id) {
        const { rows } = await db.query(
          `SELECT i.*, c.first_name, c.last_name, c.company, c.email, o.number as order_number
           FROM invoices i JOIN clients c ON c.id = i.client_id LEFT JOIN orders o ON o.id = i.order_id
           WHERE i.id = $1`, [id]
        );
        if (rows.length === 0) return sendJson(res, 404, { error: "NOT_FOUND" });
        return sendJson(res, 200, { invoice: rows[0] });
      }

      const { rows } = await db.query(
        `SELECT i.id, i.number, i.total, i.status, i.issued_at, c.first_name, c.last_name
         FROM invoices i JOIN clients c ON c.id = i.client_id ORDER BY i.issued_at DESC LIMIT 100`
      );
      return sendJson(res, 200, { invoices: rows });
    }

    if (req.method === "POST") {
      const guard = await requirePermission(req, res, "invoices.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = invoiceSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;
      const total = Math.max(0, d.subtotal - d.discount);
      const number = generateNumber("INV");

      const { rows } = await db.query(
        `INSERT INTO invoices (number, client_id, order_id, subtotal, discount, total, status, due_date)
         VALUES ($1,$2,$3,$4,$5,$6,'DRAFT',$7) RETURNING id`,
        [number, d.clientId, d.orderId || null, d.subtotal, d.discount, total, d.dueDate || null]
      );
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "CREATE_INVOICE", module: "invoices", targetId: rows[0].id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
