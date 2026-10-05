const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { resolvePeriod } = require("../../lib/period");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const guard = await requirePermission(req, res, "reports.view", sendJson);
    if (guard.error) return;

    const url = new URL(req.url, "http://internal");
    const period = url.searchParams.get("period") || "30d";
    const { start, end } = resolvePeriod(period, url.searchParams.get("from"), url.searchParams.get("to"));

    const [revenue, paymentsCount, ordersCount, requestsCount, newClients, byService] = await Promise.all([
      db.query(`SELECT coalesce(sum(amount),0) as total FROM payments WHERE created_at BETWEEN $1 AND $2 AND status = 'CONFIRMED'`, [start, end]),
      db.query(`SELECT count(*) FROM payments WHERE created_at BETWEEN $1 AND $2`, [start, end]),
      db.query(`SELECT count(*) FROM orders WHERE created_at BETWEEN $1 AND $2`, [start, end]),
      db.query(`SELECT count(*) FROM requests WHERE created_at BETWEEN $1 AND $2`, [start, end]),
      db.query(`SELECT count(*) FROM clients WHERE created_at BETWEEN $1 AND $2`, [start, end]),
      db.query(
        `SELECT s.name, count(r.id)::int as total FROM requests r JOIN services s ON s.id = r.service_id
         WHERE r.created_at BETWEEN $1 AND $2 GROUP BY s.name ORDER BY total DESC LIMIT 10`, [start, end]
      ),
    ]);

    return sendJson(res, 200, {
      revenue: Number(revenue.rows[0].total),
      paymentsCount: Number(paymentsCount.rows[0].count),
      ordersCount: Number(ordersCount.rows[0].count),
      requestsCount: Number(requestsCount.rows[0].count),
      newClients: Number(newClients.rows[0].count),
      byService: byService.rows,
    });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
