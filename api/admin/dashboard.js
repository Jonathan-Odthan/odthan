const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const guard = await requirePermission(req, res, null, sendJson);
    if (guard.error) return;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalClients, newClients, pendingRequests, ordersInProgress, ordersCompleted,
      revenueToday, revenueMonth, pendingBalance, recentOrders, recentRequests, monthlyPayments, topServices,
    ] = await Promise.all([
      db.query(`SELECT count(*) FROM clients`),
      db.query(`SELECT count(*) FROM clients WHERE created_at >= $1`, [startOfMonth]),
      db.query(`SELECT count(*) FROM requests WHERE status IN ('NEW','REVIEWING')`),
      db.query(`SELECT count(*) FROM orders WHERE status IN ('IN_PROGRESS','CONFIRMED')`),
      db.query(`SELECT count(*) FROM orders WHERE status = 'COMPLETED'`),
      db.query(`SELECT coalesce(sum(amount),0) as total FROM payments WHERE created_at >= $1 AND status = 'CONFIRMED'`, [startOfDay]),
      db.query(`SELECT coalesce(sum(amount),0) as total FROM payments WHERE created_at >= $1 AND status = 'CONFIRMED'`, [startOfMonth]),
      db.query(`SELECT coalesce(sum(amount),0) as amount, coalesce(sum(amount_paid),0) as paid FROM orders WHERE status NOT IN ('CANCELLED','COMPLETED')`),
      db.query(`SELECT o.id, o.number, o.status, o.amount, c.first_name, c.last_name FROM orders o JOIN clients c ON c.id = o.client_id ORDER BY o.created_at DESC LIMIT 5`),
      db.query(`SELECT r.id, r.number, r.status, s.name as service_name, c.first_name, c.last_name FROM requests r JOIN clients c ON c.id = r.client_id LEFT JOIN services s ON s.id = r.service_id ORDER BY r.created_at DESC LIMIT 5`),
      db.query(`SELECT amount, created_at FROM payments WHERE created_at >= $1 AND status = 'CONFIRMED'`, [startOfYear]),
      db.query(`SELECT s.name, count(r.id)::int as total FROM services s LEFT JOIN requests r ON r.service_id = s.id GROUP BY s.id, s.name ORDER BY total DESC LIMIT 5`),
    ]);

    const revenueByMonth = Array.from({ length: 12 }, () => 0);
    monthlyPayments.rows.forEach((p) => { revenueByMonth[new Date(p.created_at).getMonth()] += Number(p.amount); });

    return sendJson(res, 200, {
      totalClients: Number(totalClients.rows[0].count),
      newClients: Number(newClients.rows[0].count),
      pendingRequests: Number(pendingRequests.rows[0].count),
      ordersInProgress: Number(ordersInProgress.rows[0].count),
      ordersCompleted: Number(ordersCompleted.rows[0].count),
      revenueToday: Number(revenueToday.rows[0].total),
      revenueMonth: Number(revenueMonth.rows[0].total),
      pendingBalance: Number(pendingBalance.rows[0].amount) - Number(pendingBalance.rows[0].paid),
      recentOrders: recentOrders.rows,
      recentRequests: recentRequests.rows,
      revenueByMonth,
      topServices: topServices.rows,
    });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
