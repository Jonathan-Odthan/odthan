const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { requestCreateSchema, requestStatusSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { generateNumber } = require("../../lib/intake");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "requests.view", sendJson);
      if (guard.error) return;
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");

      if (id) {
        const { rows } = await db.query(
          `SELECT r.*, c.first_name, c.last_name, s.name as service_name, a.first_name as assignee_first_name, a.last_name as assignee_last_name
           FROM requests r JOIN clients c ON c.id = r.client_id LEFT JOIN services s ON s.id = r.service_id LEFT JOIN admin_profiles a ON a.id = r.assignee_id
           WHERE r.id = $1`, [id]
        );
        if (rows.length === 0) return sendJson(res, 404, { error: "NOT_FOUND" });
        const history = await db.query(`SELECT * FROM request_history WHERE request_id = $1 ORDER BY created_at DESC`, [id]);
        return sendJson(res, 200, { request: rows[0], history: history.rows });
      }

      const status = url.searchParams.get("status");
      const params = [];
      let where = "";
      if (status) { params.push(status); where = `WHERE r.status = $1`; }

      const { rows } = await db.query(
        `SELECT r.id, r.number, r.status, r.priority, r.created_at, r.source, c.first_name, c.last_name, s.name as service_name
         FROM requests r JOIN clients c ON c.id = r.client_id LEFT JOIN services s ON s.id = r.service_id
         ${where} ORDER BY r.created_at DESC LIMIT 100`, params
      );
      return sendJson(res, 200, { requests: rows });
    }

    if (req.method === "POST") {
      const guard = await requirePermission(req, res, "requests.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = requestCreateSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;

      const number = generateNumber("REQ");
      const { rows } = await db.withTransaction(async (client) => {
        const inserted = await client.query(
          `INSERT INTO requests (number, client_id, service_id, source, description, priority, assignee_id)
           VALUES ($1,$2,$3,'admin',$4,$5,$6) RETURNING id`,
          [number, d.clientId, d.serviceId, d.description || null, d.priority, d.assigneeId || null]
        );
        await client.query(`INSERT INTO request_history (request_id, status, note) VALUES ($1,'NEW','Demande creee')`, [inserted.rows[0].id]);
        return inserted;
      });
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "CREATE_REQUEST", module: "requests", targetId: rows[0].id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "PUT") {
      const guard = await requirePermission(req, res, "requests.update", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      if (!id) return sendJson(res, 400, { error: "MISSING_ID" });

      const body = await readJsonBody(req);
      const parsed = requestStatusSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      await db.withTransaction(async (client) => {
        await client.query(`UPDATE requests SET status = $1, updated_at = now() WHERE id = $2`, [parsed.data.status, id]);
        await client.query(`INSERT INTO request_history (request_id, status, note) VALUES ($1,$2,$3)`, [id, parsed.data.status, parsed.data.note || null]);
      });
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "UPDATE_REQUEST", module: "requests", targetId: id, metadata: { status: parsed.data.status } });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
