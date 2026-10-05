const db = require("../../lib/db");
const { getClientSession, readJsonBody, getClientIp } = require("../../lib/security");
const { checkRateLimit } = require("../../lib/rateLimit");
const { newMessageSchema } = require("../../lib/validate-client");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

async function getClientRowId(accountId) {
  const { rows } = await db.query(`SELECT id FROM clients WHERE account_id = $1`, [accountId]);
  return rows[0] ? rows[0].id : null;
}

async function getOrCreateConversation(clientId) {
  const { rows } = await db.query(`SELECT id FROM conversations WHERE client_id = $1 ORDER BY created_at ASC LIMIT 1`, [clientId]);
  if (rows.length > 0) return rows[0].id;
  const created = await db.query(`INSERT INTO conversations (client_id, subject) VALUES ($1,'Discussion avec l''équipe Odthan') RETURNING id`, [clientId]);
  return created.rows[0].id;
}

module.exports = async function handler(req, res) {
  try {
    const session = await getClientSession(req);
    if (!session) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    const clientId = await getClientRowId(session.sub);
    if (!clientId) return sendJson(res, 404, { error: "CLIENT_PROFILE_NOT_FOUND" });

    const conversationId = await getOrCreateConversation(clientId);

    if (req.method === "GET") {
      const { rows } = await db.query(
        `SELECT m.id, m.body, m.sender_type, m.created_at,
                a.first_name as admin_first_name
         FROM messages m
         LEFT JOIN admin_profiles a ON a.id = m.sender_admin_id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC`,
        [conversationId]
      );
      await db.query(`UPDATE messages SET read_at = now() WHERE conversation_id = $1 AND sender_type = 'admin' AND read_at IS NULL`, [conversationId]);
      return sendJson(res, 200, { messages: rows });
    }

    if (req.method === "POST") {
      const rl = await checkRateLimit(`client-message:${session.sub}`, 30, 3600);
      if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED" });

      const body = await readJsonBody(req);
      const parsed = newMessageSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      await db.query(
        `INSERT INTO messages (conversation_id, sender_type, sender_client_id, body) VALUES ($1,'client',$2,$3)`,
        [conversationId, session.sub, parsed.data.body]
      );
      await db.query(`UPDATE conversations SET updated_at = now() WHERE id = $1`, [conversationId]);

      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
