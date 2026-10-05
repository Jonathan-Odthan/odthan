const db = require("../../lib/db");
const { hashPassword, setClientSessionCookie, getClientIp, readJsonBody } = require("../../lib/security");
const { checkRateLimit } = require("../../lib/rateLimit");
const { clientSignupSchema } = require("../../lib/validate-client");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await readJsonBody(req);
    const parsed = clientSignupSchema.safeParse(body);
    if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR", issues: parsed.error.issues });
    if (parsed.data.company) return sendJson(res, 200, { ok: true }); // honeypot

    const ip = getClientIp(req);
    const rl = await checkRateLimit(`signup:${ip}`, 5, 600);
    if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans quelques minutes." });

    const { firstName, lastName, email, phone, password } = parsed.data;

    const { rows: existing } = await db.query(`SELECT id FROM client_accounts WHERE email = $1`, [email]);
    if (existing.length > 0) {
      return sendJson(res, 409, { error: "EMAIL_TAKEN", message: "Un compte existe déjà avec cet email." });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await db.query(
      `INSERT INTO client_accounts (email, password_hash, first_name, last_name, phone, status)
       VALUES ($1,$2,$3,$4,$5,'ACTIVE') RETURNING id`,
      [email, passwordHash, firstName, lastName, phone || null]
    );
    const accountId = rows[0].id;

    // Relie ce compte a une fiche client existante (meme email, ex. cree via
    // un formulaire public) ou en cree une nouvelle, pour que l'admin voie
    // tout de suite ce client dans son CRM.
    const { rows: existingClient } = await db.query(`SELECT id FROM clients WHERE email = $1`, [email]);
    if (existingClient.length > 0) {
      await db.query(`UPDATE clients SET account_id = $1 WHERE id = $2`, [accountId, existingClient[0].id]);
    } else {
      await db.query(
        `INSERT INTO clients (account_id, first_name, last_name, email, phone, status)
         VALUES ($1,$2,$3,$4,$5,'ACTIVE')`,
        [accountId, firstName, lastName, email, phone || null]
      );
    }

    await setClientSessionCookie(res, req, { sub: accountId, email });
    await logAudit({ actorType: "client", actorId: accountId, action: "SIGNUP", module: "client_auth", ip });

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
