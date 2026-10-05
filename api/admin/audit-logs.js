const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

const PAGE_SIZE = 30;

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const guard = await requirePermission(req, res, "audit.view", sendJson);
    if (guard.error) return;

    const url = new URL(req.url, "http://internal");
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const module = url.searchParams.get("module");

    const params = [];
    let where = "";
    if (module) { params.push(module); where = `WHERE l.module = $1`; }

    const [{ rows: countRows }, { rows }, { rows: modules }] = await Promise.all([
      db.query(`SELECT count(*) FROM audit_logs l ${where}`, params),
      db.query(
        `SELECT l.*, a.first_name, a.last_name FROM audit_logs l LEFT JOIN admin_profiles a ON a.id = l.actor_id AND l.actor_type = 'admin'
         ${where} ORDER BY l.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`, params
      ),
      db.query(`SELECT DISTINCT module FROM audit_logs ORDER BY module ASC`),
    ]);

    return sendJson(res, 200, { logs: rows, total: Number(countRows[0].count), page, pageSize: PAGE_SIZE, modules: modules.rows.map(m => m.module) });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
