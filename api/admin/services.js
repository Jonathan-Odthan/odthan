const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { serviceSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "services.view", sendJson);
      if (guard.error) return;
      const { rows } = await db.query(
        `SELECT s.*, (SELECT count(*) FROM requests r WHERE r.service_id = s.id)::int as request_count
         FROM services s ORDER BY s.created_at DESC`
      );
      return sendJson(res, 200, { services: rows });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const isUpdate = req.method === "PUT";
      const guard = await requirePermission(req, res, isUpdate ? "services.update" : "services.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = serviceSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;
      const ip = getClientIp(req);

      if (isUpdate) {
        const url = new URL(req.url, "http://internal");
        const id = url.searchParams.get("id");
        if (!id) return sendJson(res, 400, { error: "MISSING_ID" });
        await db.query(
          `UPDATE services SET name=$1, description=$2, price=$3, status=$4, updated_at=now() WHERE id=$5`,
          [d.name, d.description || null, d.price, d.status, id]
        );
        await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "UPDATE_SERVICE", module: "services", targetId: id, ip });
        return sendJson(res, 200, { ok: true });
      }

      const { rows } = await db.query(
        `INSERT INTO services (name, description, price, status) VALUES ($1,$2,$3,$4) RETURNING id`,
        [d.name, d.description || null, d.price, d.status]
      );
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "CREATE_SERVICE", module: "services", targetId: rows[0].id, ip });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "DELETE") {
      const guard = await requirePermission(req, res, "services.update", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      const nextStatus = url.searchParams.get("status") === "ACTIVE" ? "ACTIVE" : "INACTIVE";
      await db.query(`UPDATE services SET status = $1, updated_at = now() WHERE id = $2`, [nextStatus, id]);
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "UPDATE_SERVICE", module: "services", targetId: id, metadata: { status: nextStatus } });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT", "DELETE"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
