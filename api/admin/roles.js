const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "roles.view", sendJson);
      if (guard.error) return;

      const [roles, permissions, rolePerms] = await Promise.all([
        db.query(`SELECT * FROM roles ORDER BY name ASC`),
        db.query(`SELECT * FROM permissions ORDER BY module ASC, key ASC`),
        db.query(`SELECT role_id, permission_id FROM role_permissions`),
      ]);

      const permsByRole = {};
      rolePerms.rows.forEach((rp) => { (permsByRole[rp.role_id] ||= []).push(rp.permission_id); });

      return sendJson(res, 200, { roles: roles.rows, permissions: permissions.rows, permsByRole });
    }

    if (req.method === "PUT") {
      const guard = await requirePermission(req, res, "roles.update", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const url = new URL(req.url, "http://internal");
      const roleId = url.searchParams.get("id");
      const { rows: roleRows } = await db.query(`SELECT name FROM roles WHERE id = $1`, [roleId]);
      if (roleRows.length === 0) return sendJson(res, 404, { error: "NOT_FOUND" });
      if (roleRows[0].name === "SUPER_ADMIN") return sendJson(res, 400, { error: "IMMUTABLE_ROLE", message: "SUPER_ADMIN a toujours un accès complet — non modifiable." });

      const body = await readJsonBody(req);
      const permissionIds = Array.isArray(body.permissionIds) ? body.permissionIds : [];

      await db.withTransaction(async (client) => {
        await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
        for (const permId of permissionIds) {
          await client.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [roleId, permId]);
        }
      });

      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "PERMISSION_CHANGED", module: "roles", targetId: roleId, metadata: { count: permissionIds.length }, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "PUT"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
