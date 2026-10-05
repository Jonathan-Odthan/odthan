const db = require("../../lib/db");
const { getClientSession } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const session = await getClientSession(req);
    if (!session) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    const { rows } = await db.query(
      `SELECT id, name, description, price FROM services WHERE status = 'ACTIVE' ORDER BY name ASC`
    );
    return sendJson(res, 200, { services: rows });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
