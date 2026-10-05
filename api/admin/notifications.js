const db = require("../../lib/db");
const { getCurrentAdmin } = require("../../lib/permissions");
const { verifyCsrf } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    if (req.method === "GET") {
      const { rows } = await db.query(
        `SELECT * FROM notifications WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 50`, [admin.id]
      );
      return sendJson(res, 200, { notifications: rows });
    }

    if (req.method === "PUT") {
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      if (id) {
        await db.query(`UPDATE notifications SET read_at = now() WHERE id = $1 AND profile_id = $2`, [id, admin.id]);
      } else {
        await db.query(`UPDATE notifications SET read_at = now() WHERE profile_id = $1 AND read_at IS NULL`, [admin.id]);
      }
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "PUT"]);
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
