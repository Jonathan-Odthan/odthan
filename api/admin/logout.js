const { clearAdminSessionCookie, getAdminSession } = require("../../lib/security");
const { sendJson, methodNotAllowed } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const session = await getAdminSession(req);
  clearAdminSessionCookie(res, req);
  if (session) await logAudit({ actorType: "admin", actorId: session.sub, action: "LOGOUT", module: "auth" });
  return sendJson(res, 200, { ok: true });
};
