const db = require("../../lib/db");
const { getCurrentAdmin } = require("../../lib/permissions");
const { hashPassword, verifyPassword, verifyCsrf, readJsonBody, getSession, getAdminSession } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { z } = require("zod");

const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });

module.exports = async function handler(req, res) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    const url = new URL(req.url, "http://internal");
    const action = url.searchParams.get("action");

    if (req.method === "GET" && action === "sessions") {
      // Pas de table admin_sessions distincte : l'app utilise des JWT sans etat
      // stocke cote serveur (hors rate-limit/lockout). On ne peut donc pas lister
      // les sessions actives ailleurs que la session courante.
      return sendJson(res, 200, { sessions: [{ current: true }] });
    }

    if (req.method === "POST" && action === "change-password") {
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const body = await readJsonBody(req);
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      const { rows } = await db.query(`SELECT password_hash FROM admin_profiles WHERE id = $1`, [admin.id]);
      const valid = await verifyPassword(parsed.data.currentPassword, rows[0].password_hash);
      if (!valid) return sendJson(res, 401, { error: "INVALID_PASSWORD", message: "Mot de passe actuel incorrect." });

      const newHash = await hashPassword(parsed.data.newPassword);
      await db.query(`UPDATE admin_profiles SET password_hash = $1, updated_at = now() WHERE id = $2`, [newHash, admin.id]);
      await logAudit({ actorType: "admin", actorId: admin.id, action: "UPDATE_PASSWORD", module: "security" });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
