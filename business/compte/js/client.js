async function clientApi(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
  });
  let data = null;
  try { data = await res.json(); } catch { /* pas de corps JSON */ }
  return { res, data };
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}
function hideError(el) {
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMoney(n) {
  return new Intl.NumberFormat("fr-HT", { style: "currency", currency: "HTG" }).format(Number(n || 0));
}
