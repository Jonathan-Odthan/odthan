const { getCurrentAdmin } = require("../../lib/permissions");
const db = require("../../lib/db");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return sendJson(res, 401, { error: "UNAUTHENTICATED" });

    let permissions = [];
    if (admin.role_name !== "SUPER_ADMIN") {
      const { rows } = await db.query(
        `SELECT perm.key FROM role_permissions rp JOIN permissions perm ON perm.id = rp.permission_id WHERE rp.role_id = $1`,
        [admin.role_id]
      );
      permissions = rows.map((r) => r.key);
    }

    return sendJson(res, 200, {
      id: admin.id, firstName: admin.first_name, lastName: admin.last_name, email: admin.email,
      role: admin.role_name, roleLabel: admin.role_label, permissions,
    });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
