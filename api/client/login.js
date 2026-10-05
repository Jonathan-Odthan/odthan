const db = require("../../lib/db");
const { verifyPassword, setClientSessionCookie, getClientIp, readJsonBody } = require("../../lib/security");
const { checkRateLimit } = require("../../lib/rateLimit");
const { clientLoginSchema } = require("../../lib/validate-client");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const ip = getClientIp(req);

  try {
    const rl = await checkRateLimit(`client-login:${ip}`, 10, 300);
    if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." });

    const body = await readJsonBody(req);
    const parsed = clientLoginSchema.safeParse(body);
    if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

    const { email, password } = parsed.data;
    const { rows } = await db.query(`SELECT * FROM client_accounts WHERE email = $1`, [email]);
    const account = rows[0];

    if (!account) {
      await logAudit({ actorType: "client", action: "LOGIN", module: "client_auth", ip, result: "FAILURE", metadata: { email } });
      return sendJson(res, 401, { error: "INVALID_CREDENTIALS", message: "Email ou mot de passe incorrect." });
    }

    if (account.locked_until && new Date(account.locked_until) > new Date()) {
      return sendJson(res, 423, { error: "ACCOUNT_LOCKED", message: "Compte temporairement bloqué suite à trop de tentatives. Réessayez plus tard." });
    }

    const valid = await verifyPassword(password, account.password_hash);
    if (!valid) {
      const attempts = account.failed_attempts + 1;
      const lock = attempts >= MAX_ATTEMPTS;
      await db.query(
        `UPDATE client_accounts SET failed_attempts = $1, locked_until = $2 WHERE id = $3`,
        [lock ? 0 : attempts, lock ? new Date(Date.now() + LOCK_MINUTES * 60000) : null, account.id]
      );
      await logAudit({ actorType: "client", actorId: account.id, action: "LOGIN", module: "client_auth", ip, result: "FAILURE" });
      return sendJson(res, 401, { error: "INVALID_CREDENTIALS", message: "Email ou mot de passe incorrect." });
    }

    if (account.status !== "ACTIVE") {
      return sendJson(res, 403, { error: "ACCOUNT_INACTIVE", message: "Ce compte est désactivé." });
    }

    await db.query(
      `UPDATE client_accounts SET failed_attempts = 0, locked_until = NULL, last_login_at = now() WHERE id = $1`,
      [account.id]
    );
    await setClientSessionCookie(res, req, { sub: account.id, email: account.email });
    await logAudit({ actorType: "client", actorId: account.id, action: "LOGIN", module: "client_auth", ip, result: "SUCCESS" });

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
