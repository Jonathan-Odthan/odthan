const db = require("./db");
const { getAdminSession } = require("./security");

// RBAC serveur — meme catalogue de permissions que l'Admin Center d'origine,
// stocke en base (tables roles / permissions / role_permissions, voir db/schema.sql).
// SUPER_ADMIN a toujours acces complet, sans lignes role_permissions a jour.

async function getCurrentAdmin(req) {
  const session = await getAdminSession(req);
  if (!session || !session.sub) return null;

  const { rows } = await db.query(
    `SELECT p.id, p.first_name, p.last_name, p.email, p.status, r.id as role_id, r.name as role_name, r.label as role_label
     FROM admin_profiles p JOIN roles r ON r.id = p.role_id
     WHERE p.id = $1`,
    [session.sub]
  );
  const admin = rows[0];
  if (!admin || admin.status !== "ACTIVE") return null;
  return admin;
}

async function hasPermission(admin, key) {
  if (!admin) return false;
  if (admin.role_name === "SUPER_ADMIN") return true;
  const { rows } = await db.query(
    `SELECT 1 FROM role_permissions rp
     JOIN permissions perm ON perm.id = rp.permission_id
     WHERE rp.role_id = $1 AND perm.key = $2 LIMIT 1`,
    [admin.role_id, key]
  );
  return rows.length > 0;
}

/**
 * A appeler en tete de chaque handler admin protege.
 * Retourne { admin } si autorise, ou envoie directement 401/403 et retourne { error: true }.
 */
async function requirePermission(req, res, key, sendJson) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    sendJson(res, 401, { error: "UNAUTHENTICATED" });
    return { error: true };
  }
  if (key) {
    const ok = await hasPermission(admin, key);
    if (!ok) {
      sendJson(res, 403, { error: "FORBIDDEN" });
      return { error: true };
    }
  }
  return { admin };
}

module.exports = { getCurrentAdmin, hasPermission, requirePermission };
