const db = require("../../lib/db");
const { getClientSession, readJsonBody, getClientIp } = require("../../lib/security");
const { checkRateLimit } = require("../../lib/rateLimit");
const { newRequestSchema } = require("../../lib/validate-client");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { generateNumber } = require("../../lib/intake");
const { logAudit } = require("../../lib/audit");

async function getClientRowId(accountId) {
  const { rows } = await db.query(`SELECT id FROM clients WHERE account_id = $1`, [accountId]);
  return rows[0] ? rows[0].id : null;
}

module.exports = async function handler(req, res) {
  try {
    const session = await getClientSession(req);
    if (!session) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    const clientId = await getClientRowId(session.sub);
    if (!clientId) return sendJson(res, 404, { error: "CLIENT_PROFILE_NOT_FOUND" });

    if (req.method === "GET") {
      const { rows } = await db.query(
        `SELECT r.id, r.number, r.description, r.status, r.priority, r.created_at, s.name as service_name,
                o.id as order_id, o.number as order_number, o.amount, o.amount_paid, o.status as order_status
         FROM requests r
         LEFT JOIN services s ON s.id = r.service_id
         LEFT JOIN orders o ON o.request_id = r.id
         WHERE r.client_id = $1
         ORDER BY r.created_at DESC`,
        [clientId]
      );
      return sendJson(res, 200, { requests: rows });
    }

    if (req.method === "POST") {
      const ip = getClientIp(req);
      const rl = await checkRateLimit(`client-request:${session.sub}`, 10, 3600);
      if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED", message: "Trop de demandes envoyées. Réessayez plus tard." });

      const body = await readJsonBody(req);
      const parsed = newRequestSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      const { rows: svc } = await db.query(`SELECT id, name FROM services WHERE id = $1 AND status = 'ACTIVE'`, [parsed.data.serviceId]);
      if (svc.length === 0) return sendJson(res, 400, { error: "SERVICE_NOT_FOUND" });

      const number = generateNumber("REQ");
      const { rows } = await db.withTransaction(async (client) => {
        const inserted = await client.query(
          `INSERT INTO requests (number, client_id, service_id, source, description, status, priority)
           VALUES ($1,$2,$3,'client_portal',$4,'NEW','MEDIUM') RETURNING id, number, created_at`,
          [number, clientId, parsed.data.serviceId, parsed.data.description]
        );
        await client.query(`INSERT INTO request_history (request_id, status, note) VALUES ($1,'NEW','Demande creee depuis le portail client')`, [inserted.rows[0].id]);
        return inserted;
      });
      await logAudit({ actorType: "client", actorId: session.sub, action: "CREATE_REQUEST", module: "requests", targetId: rows[0].id, ip });

      return sendJson(res, 200, { ok: true, request: rows[0] });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
