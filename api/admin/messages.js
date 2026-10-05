const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { checkRateLimit } = require("../../lib/rateLimit");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  try {
    const guard = await requirePermission(req, res, "messages.view", sendJson);
    if (guard.error) return;

    const url = new URL(req.url, "http://internal");
    const conversationId = url.searchParams.get("conversationId");

    if (req.method === "GET" && !conversationId) {
      const { rows } = await db.query(
        `SELECT c.id, c.subject, c.updated_at, cl.first_name, cl.last_name,
                (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_type = 'client' AND m.read_at IS NULL)::int as unread
         FROM conversations c LEFT JOIN clients cl ON cl.id = c.client_id
         ORDER BY c.updated_at DESC LIMIT 50`
      );
      return sendJson(res, 200, { conversations: rows });
    }

    if (req.method === "GET" && conversationId) {
      const { rows } = await db.query(
        `SELECT m.*, a.first_name as admin_first_name FROM messages m LEFT JOIN admin_profiles a ON a.id = m.sender_admin_id
         WHERE m.conversation_id = $1 ORDER BY m.created_at ASC`, [conversationId]
      );
      await db.query(`UPDATE messages SET read_at = now() WHERE conversation_id = $1 AND sender_type = 'client' AND read_at IS NULL`, [conversationId]);
      return sendJson(res, 200, { messages: rows });
    }

    if (req.method === "POST") {
      const guardSend = await requirePermission(req, res, "messages.send", sendJson);
      if (guardSend.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const rl = await checkRateLimit(`admin-message:${guardSend.admin.id}`, 60, 3600);
      if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED" });

      const body = await readJsonBody(req);
      if (!body.body || !conversationId) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      await db.query(
        `INSERT INTO messages (conversation_id, sender_type, sender_admin_id, body) VALUES ($1,'admin',$2,$3)`,
        [conversationId, guardSend.admin.id, String(body.body).slice(0, 4000)]
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
