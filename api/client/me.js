const db = require("../../lib/db");
const { getClientSession } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const session = await getClientSession(req);
    if (!session) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    const { rows } = await db.query(
      `SELECT id, first_name, last_name, email, phone, status FROM client_accounts WHERE id = $1`,
      [session.sub]
    );
    const account = rows[0];
    if (!account || account.status !== "ACTIVE") return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    return sendJson(res, 200, {
      id: account.id, firstName: account.first_name, lastName: account.last_name, email: account.email, phone: account.phone,
    });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
