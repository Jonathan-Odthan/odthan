const { clearClientSessionCookie, getClientSession } = require("../../lib/security");
const { sendJson, methodNotAllowed } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const session = await getClientSession(req);
  clearClientSessionCookie(res, req);
  if (session) await logAudit({ actorType: "client", actorId: session.sub, action: "LOGOUT", module: "client_auth" });
  return sendJson(res, 200, { ok: true });
};
