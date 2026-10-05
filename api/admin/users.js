const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { userSchema } = require("../../lib/validate-admin");
const { hashPassword, readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "users.view", sendJson);
      if (guard.error) return;
      const { rows } = await db.query(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.last_login_at, r.label as role_label, r.id as role_id
         FROM admin_profiles u JOIN roles r ON r.id = u.role_id ORDER BY u.created_at DESC`
      );
      return sendJson(res, 200, { users: rows });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const isUpdate = req.method === "PUT";
      const guard = await requirePermission(req, res, isUpdate ? "users.update" : "users.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = userSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;
      const ip = getClientIp(req);

      if (isUpdate) {
        const url = new URL(req.url, "http://internal");
        const id = url.searchParams.get("id");
        if (!id) return sendJson(res, 400, { error: "MISSING_ID" });

        if (d.password) {
          const passwordHash = await hashPassword(d.password);
          await db.query(
            `UPDATE admin_profiles SET first_name=$1,last_name=$2,email=$3,phone=$4,role_id=$5,status=$6,password_hash=$7,updated_at=now() WHERE id=$8`,
            [d.firstName, d.lastName, d.email, d.phone || null, d.roleId, d.status, passwordHash, id]
          );
        } else {
          await db.query(
            `UPDATE admin_profiles SET first_name=$1,last_name=$2,email=$3,phone=$4,role_id=$5,status=$6,updated_at=now() WHERE id=$7`,
            [d.firstName, d.lastName, d.email, d.phone || null, d.roleId, d.status, id]
          );
        }
        await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "USER_UPDATED", module: "users", targetId: id, ip });
        return sendJson(res, 200, { ok: true });
      }

      if (!d.password || d.password.length < 8) return sendJson(res, 400, { error: "PASSWORD_REQUIRED", message: "Un mot de passe initial de 8 caractères minimum est requis." });

      const { rows: existing } = await db.query(`SELECT id FROM admin_profiles WHERE email = $1`, [d.email]);
      if (existing.length > 0) return sendJson(res, 409, { error: "EMAIL_TAKEN", message: "Un utilisateur avec cet email existe déjà." });

      const passwordHash = await hashPassword(d.password);
      const { rows } = await db.query(
        `INSERT INTO admin_profiles (first_name,last_name,email,phone,role_id,status,password_hash) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [d.firstName, d.lastName, d.email, d.phone || null, d.roleId, d.status, passwordHash]
      );
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "USER_CREATED", module: "users", targetId: rows[0].id, ip });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "DELETE") {
      const guard = await requirePermission(req, res, "users.delete", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      await db.query(`UPDATE admin_profiles SET status = 'INACTIVE', updated_at = now() WHERE id = $1`, [id]);
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "USER_DEACTIVATED", module: "users", targetId: id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT", "DELETE"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
