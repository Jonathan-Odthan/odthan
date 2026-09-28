import type { PermissionKey } from "@/lib/permissions";

export type NavItem = {
  label: string;
  href: string;
  icon: string; // nom d'icone lucide-react
  permission?: PermissionKey;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Clients", href: "/admin/clients", icon: "Users", permission: "clients.view" },
  { label: "Services", href: "/admin/services", icon: "Boxes", permission: "services.view" },
  { label: "Demandes", href: "/admin/demandes", icon: "Inbox", permission: "requests.view" },
  { label: "Commandes", href: "/admin/commandes", icon: "ClipboardList", permission: "orders.view" },
  { label: "Paiements", href: "/admin/paiements", icon: "Wallet", permission: "payments.view" },
  { label: "Factures", href: "/admin/factures", icon: "FileText", permission: "invoices.view" },
  { label: "Documents", href: "/admin/documents", icon: "FolderLock", permission: "documents.view" },
  { label: "Taches", href: "/admin/taches", icon: "ListChecks", permission: "tasks.view" },
  { label: "Notifications", href: "/admin/notifications", icon: "Bell", permission: "notifications.view" },
  { label: "Messages", href: "/admin/messages", icon: "MessageSquare", permission: "messages.view" },
  { label: "Rapports", href: "/admin/rapports", icon: "BarChart3", permission: "reports.view" },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: "UserCog", permission: "users.view" },
  { label: "Roles & Permissions", href: "/admin/roles", icon: "ShieldCheck", permission: "roles.view" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "History", permission: "audit.view" },
  { label: "Parametres", href: "/admin/settings", icon: "Settings", permission: "settings.view" },
  { label: "Securite", href: "/admin/security", icon: "Lock", permission: "security.view" },
];
