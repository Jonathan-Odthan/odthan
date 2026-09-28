import "server-only";
import { getCurrentProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type PermissionKey =
  | "clients.view" | "clients.create" | "clients.update" | "clients.delete"
  | "services.view" | "services.create" | "services.update" | "services.delete"
  | "requests.view" | "requests.create" | "requests.update" | "requests.delete"
  | "orders.view" | "orders.create" | "orders.update" | "orders.delete"
  | "payments.view" | "payments.create" | "payments.update"
  | "invoices.view" | "invoices.create"
  | "documents.view" | "documents.upload" | "documents.delete"
  | "tasks.view" | "tasks.create" | "tasks.update"
  | "notifications.view"
  | "messages.view" | "messages.send"
  | "reports.view"
  | "users.view" | "users.create" | "users.update" | "users.delete"
  | "roles.view" | "roles.update"
  | "audit.view"
  | "settings.view" | "settings.update"
  | "security.view";

/** SUPER_ADMIN a implicitement toutes les permissions. */
export async function hasPermission(key: PermissionKey): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  if (profile.role.name === "SUPER_ADMIN") return true;
  return profile.role.permissions.some((rp) => rp.permission.key === key);
}

/** A utiliser en haut de chaque Server Component / Server Action sensible. */
export async function requirePermission(key: PermissionKey) {
  const ok = await hasPermission(key);
  if (!ok) redirect("/403");
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "ACTIVE") redirect("/login?disabled=1");
  return profile;
}
