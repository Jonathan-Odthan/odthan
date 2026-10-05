const db = require("../../lib/db");
const { requirePermission, getCurrentAdmin } = require("../../lib/permissions");
const { settingsSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { z } = require("zod");

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "settings.view", sendJson);
      if (guard.error) return;
      const { rows } = await db.query(`SELECT value FROM admin_settings WHERE key = 'company'`);
      return sendJson(res, 200, { company: rows[0] ? rows[0].value : null });
    }

    if (req.method === "PUT") {
      const url = new URL(req.url, "http://internal");
      const section = url.searchParams.get("section");

      if (section === "profile") {
        const admin = await getCurrentAdmin(req);
        if (!admin) return sendJson(res, 401, { error: "UNAUTHENTICATED" });
        if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

        const body = await readJsonBody(req);
        const parsed = profileSchema.safeParse(body);
        if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

        await db.query(`UPDATE admin_profiles SET first_name=$1,last_name=$2,phone=$3,updated_at=now() WHERE id=$4`,
          [parsed.data.firstName, parsed.data.lastName, parsed.data.phone || null, admin.id]);
        await logAudit({ actorType: "admin", actorId: admin.id, action: "UPDATE_PROFILE", module: "settings" });
        return sendJson(res, 200, { ok: true });
      }

      const guard = await requirePermission(req, res, "settings.update", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = settingsSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      await db.query(
        `INSERT INTO admin_settings (key, value) VALUES ('company', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
        [JSON.stringify(parsed.data)]
      );
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "SETTINGS_UPDATED", module: "settings", ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "PUT"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
