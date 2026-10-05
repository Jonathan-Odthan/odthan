const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { resolvePeriod } = require("../../lib/period");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const guard = await requirePermission(req, res, "analytics.view", sendJson);
    if (guard.error) return;

    const url = new URL(req.url, "http://internal");
    const period = url.searchParams.get("period") || "30d";
    const { start, end } = resolvePeriod(period, url.searchParams.get("from"), url.searchParams.get("to"));

    const [totalViews, uniqueVisitors, byPage, byReferrer, byCountry, bySite, dailyViews, knownClients] = await Promise.all([
      db.query(`SELECT count(*) FROM analytics_events WHERE created_at BETWEEN $1 AND $2`, [start, end]),
      db.query(`SELECT count(DISTINCT session_id) FROM analytics_events WHERE created_at BETWEEN $1 AND $2`, [start, end]),
      db.query(`SELECT path, count(*)::int as total FROM analytics_events WHERE created_at BETWEEN $1 AND $2 GROUP BY path ORDER BY total DESC LIMIT 10`, [start, end]),
      db.query(`SELECT coalesce(nullif(referrer, ''), 'Direct') as referrer, count(*)::int as total FROM analytics_events WHERE created_at BETWEEN $1 AND $2 GROUP BY referrer ORDER BY total DESC LIMIT 10`, [start, end]),
      db.query(`SELECT coalesce(s.country, 'Inconnu') as country, count(DISTINCT e.session_id)::int as total FROM analytics_events e JOIN analytics_sessions s ON s.id = e.session_id WHERE e.created_at BETWEEN $1 AND $2 GROUP BY s.country ORDER BY total DESC LIMIT 10`, [start, end]),
      db.query(`SELECT site, count(*)::int as total FROM analytics_events WHERE created_at BETWEEN $1 AND $2 GROUP BY site`, [start, end]),
      db.query(`SELECT date_trunc('day', created_at) as day, count(*)::int as total FROM analytics_events WHERE created_at BETWEEN $1 AND $2 GROUP BY day ORDER BY day ASC`, [start, end]),
      db.query(`SELECT count(DISTINCT session_id) FROM analytics_sessions WHERE client_account_id IS NOT NULL AND last_seen_at BETWEEN $1 AND $2`, [start, end]),
    ]);

    return sendJson(res, 200, {
      totalViews: Number(totalViews.rows[0].count),
      uniqueVisitors: Number(uniqueVisitors.rows[0].count),
      knownClients: Number(knownClients.rows[0].count),
      byPage: byPage.rows,
      byReferrer: byReferrer.rows,
      byCountry: byCountry.rows,
      bySite: bySite.rows,
      dailyViews: dailyViews.rows,
    });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
