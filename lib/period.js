function resolvePeriod(period, from, to) {
  const now = new Date();
  const end = to ? new Date(to) : now;
  let start;
  switch (period) {
    case "today": start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case "7d": start = new Date(now.getTime() - 7 * 86400000); break;
    case "3m": start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
    case "year": start = new Date(now.getFullYear(), 0, 1); break;
    case "custom": start = from ? new Date(from) : new Date(now.getFullYear(), 0, 1); break;
    case "30d": default: start = new Date(now.getTime() - 30 * 86400000); break;
  }
  return { start, end };
}
module.exports = { resolvePeriod };
