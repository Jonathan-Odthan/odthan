const db = require("../../lib/db");
const { verifyPassword, setAdminSessionCookie, issueCsrfToken, getClientIp, readJsonBody } = require("../../lib/security");
const { checkRateLimit } = require("../../lib/rateLimit");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");
const { z } = require("zod");

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const ip = getClientIp(req);

  try {
    const rl = await checkRateLimit(`admin-login:${ip}`, 10, 300);
    if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." });

    const body = await readJsonBody(req);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

    const { email, password } = parsed.data;
    const { rows } = await db.query(
      `SELECT p.*, r.name as role_name FROM admin_profiles p JOIN roles r ON r.id = p.role_id WHERE p.email = $1`,
      [email]
    );
    const admin = rows[0];

    if (!admin) {
      await logAudit({ actorType: "admin", action: "LOGIN", module: "auth", ip, result: "FAILURE", metadata: { email } });
      return sendJson(res, 401, { error: "INVALID_CREDENTIALS", message: "Identifiants incorrects." });
    }

    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return sendJson(res, 423, { error: "ACCOUNT_LOCKED", message: "Compte temporairement bloqué. Réessayez plus tard." });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      const attempts = admin.failed_attempts + 1;
      const lock = attempts >= MAX_ATTEMPTS;
      await db.query(`UPDATE admin_profiles SET failed_attempts = $1, locked_until = $2 WHERE id = $3`, [
        lock ? 0 : attempts, lock ? new Date(Date.now() + LOCK_MINUTES * 60000) : null, admin.id,
      ]);
      await logAudit({ actorType: "admin", actorId: admin.id, action: "LOGIN", module: "auth", ip, result: "FAILURE" });
      return sendJson(res, 401, { error: "INVALID_CREDENTIALS", message: "Identifiants incorrects." });
    }

    if (admin.status !== "ACTIVE") {
      await logAudit({ actorType: "admin", actorId: admin.id, action: "LOGIN", module: "auth", ip, result: "FAILURE", metadata: { reason: "inactive" } });
      return sendJson(res, 403, { error: "ACCOUNT_INACTIVE", message: "Ce compte est désactivé. Contactez un administrateur." });
    }

    await db.query(`UPDATE admin_profiles SET failed_attempts = 0, locked_until = NULL, last_login_at = now() WHERE id = $1`, [admin.id]);
    await setAdminSessionCookie(res, req, { sub: admin.id, role: admin.role_name });
    issueCsrfToken(res, req);
    await logAudit({ actorType: "admin", actorId: admin.id, action: "LOGIN", module: "auth", ip, result: "SUCCESS" });

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    if (err.code === "JWT_SECRET_NOT_CONFIGURED") return sendJson(res, 503, { error: "NOT_CONFIGURED", message: "Configuration serveur incomplete (JWT_SECRET)." });
    return handleError(res, err, "fr");
  }
};
