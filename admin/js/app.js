// Utilitaires partages par toutes les pages admin.

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard.html", icon: "📊" },
  { label: "Clients", href: "/admin/clients.html", icon: "👥", perm: "clients.view" },
  { label: "Services", href: "/admin/services.html", icon: "🧩", perm: "services.view" },
  { label: "Demandes", href: "/admin/demandes.html", icon: "📥", perm: "requests.view" },
  { label: "Commandes", href: "/admin/commandes.html", icon: "📦", perm: "orders.view" },
  { label: "Paiements", href: "/admin/paiements.html", icon: "💳", perm: "payments.view" },
  { label: "Factures", href: "/admin/factures.html", icon: "🧾", perm: "invoices.view" },
  { label: "Documents", href: "/admin/documents.html", icon: "🔒", perm: "documents.view" },
  { label: "Tâches", href: "/admin/taches.html", icon: "✅", perm: "tasks.view" },
  { label: "Notifications", href: "/admin/notifications.html", icon: "🔔", perm: "notifications.view" },
  { label: "Messages", href: "/admin/messages.html", icon: "💬", perm: "messages.view" },
  { label: "Rapports", href: "/admin/rapports.html", icon: "📈", perm: "reports.view" },
  { label: "Analytics visiteurs", href: "/admin/analytics.html", icon: "🌐", perm: "analytics.view" },
  { label: "Utilisateurs", href: "/admin/utilisateurs.html", icon: "🧑‍💼", perm: "users.view" },
  { label: "Rôles & Permissions", href: "/admin/roles.html", icon: "🛡️", perm: "roles.view" },
  { label: "Audit Logs", href: "/admin/audit-logs.html", icon: "🗂️", perm: "audit.view" },
  { label: "Paramètres", href: "/admin/settings.html", icon: "⚙️", perm: "settings.view" },
  { label: "Sécurité", href: "/admin/security.html", icon: "🔐", perm: "security.view" },
];

async function adminApi(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const csrf = getCookie("odthan_csrf");
  if (csrf && opts.method && opts.method !== "GET") headers["X-CSRF-Token"] = csrf;

  const res = await fetch(path, { ...opts, headers, credentials: "include" });
  let data = null;
  try { data = await res.json(); } catch { /* pas de corps JSON */ }

  if (res.status === 401 && !path.endsWith("/api/admin/login")) {
    window.location.href = "/admin/login.html";
    return { res, data: null };
  }
  return { res, data };
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function formatMoney(n) {
  return new Intl.NumberFormat("fr-HT", { style: "currency", currency: "HTG" }).format(Number(n || 0));
}
function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Construit toute la coquille admin (sidebar + topbar) autour du contenu de la
 * page, evitant de dupliquer ce HTML dans chacun des ~18 fichiers. A appeler
 * en tout debut de page avec le HTML du contenu (deja dans le DOM, ex. dans un
 * <template id="page-content">) et le href actif pour la sidebar.
 * Verifie la session et redirige vers /admin/login.html si non authentifie.
 * Retourne le profil admin (role, permissions) ou null si redirection en cours.
 */
async function renderShell(activeHref, pageTitle) {
  const { res, data } = await adminApi("/api/admin/me");
  if (!res.ok || !data) { window.location.href = "/admin/login.html"; return null; }

  const contentTemplate = document.getElementById("page-content");
  const innerHtml = contentTemplate ? contentTemplate.innerHTML : "";

  const allowed = NAV_ITEMS.filter((item) => !item.perm || data.role === "SUPER_ADMIN" || data.permissions.includes(item.perm));

  document.title = pageTitle + " — Odthan Admin Center";
  document.body.innerHTML = `
    <div class="admin-shell">
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="chip"><img src="/assets/logo-full-trans.png" alt="Odthan"></div></div>
        <nav id="sidebar-nav">${allowed.map((item) => `
          <a href="${item.href}" class="${item.href === activeHref ? "active" : ""}">
            <span>${item.icon}</span><span>${item.label}</span>
          </a>`).join("")}
        </nav>
        <div class="logout"><button data-logout>Déconnexion</button></div>
      </aside>
      <div class="main">
        <div class="mobile-topbar">
          <button data-sidebar-toggle aria-label="Menu">☰</button>
          <img src="/assets/icons/favicon-32.png" alt="" style="height:22px">
        </div>
        <div class="topbar">
          <div></div>
          <div class="who" id="topbar-who">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)} — ${escapeHtml(data.roleLabel)}</div>
        </div>
        <div class="content" id="page-root">${innerHtml}</div>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await adminApi("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login.html";
    });
  });
  document.querySelectorAll("[data-sidebar-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
      document.getElementById("sidebar-overlay").classList.toggle("open");
    });
  });
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) overlay.addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
    overlay.classList.remove("open");
  });

  return data;
}

function hasPerm(admin, key) {
  return admin && (admin.role === "SUPER_ADMIN" || admin.permissions.includes(key));
}
