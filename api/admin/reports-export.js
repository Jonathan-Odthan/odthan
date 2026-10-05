const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { resolvePeriod } = require("../../lib/period");
const { sendJson } = require("../../lib/respond");

function toCsv(rows) {
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

module.exports = async function handler(req, res) {
  const guard = await requirePermission(req, res, "reports.view", sendJson);
  if (guard.error) return;

  const url = new URL(req.url, "http://internal");
  const period = url.searchParams.get("period") || "30d";
  const { start, end } = resolvePeriod(period, url.searchParams.get("from"), url.searchParams.get("to"));

  const { rows } = await db.query(
    `SELECT p.number, c.first_name, c.last_name, o.number as order_number, p.method, p.amount, p.currency, p.status, p.created_at
     FROM payments p JOIN clients c ON c.id = p.client_id LEFT JOIN orders o ON o.id = p.order_id
     WHERE p.created_at BETWEEN $1 AND $2 ORDER BY p.created_at ASC`, [start, end]
  );

  const csvRows = [["Numero","Client","Commande","Methode","Montant","Devise","Statut","Date"],
    ...rows.map(p => [p.number, `${p.first_name} ${p.last_name}`, p.order_number || "", p.method, p.amount, p.currency, p.status, new Date(p.created_at).toISOString()])];

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="rapport-paiements-${period}.csv"`);
  res.end(toCsv(csvRows));
};
