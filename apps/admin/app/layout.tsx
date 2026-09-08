import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@odthan/auth";
import { AdminSidebar } from "./components/AdminSidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ODTHAN ADMIN", template: "%s | ODTHAN ADMIN" },
  robots: { index: false, follow: false }, // jamais indexé
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);

  // RÈGLE DE SÉCURITÉ : vérification côté serveur, jamais côté client uniquement.
  if (!user || !isAdmin(user)) {
    redirect("https://www.odthan.com/connexion");
  }

  return (
    <html lang="fr">
      <body className="flex min-h-screen bg-[#050505] text-white">
        <AdminSidebar />
        <main className="flex-1 overflow-x-auto">{children}</main>
      </body>
    </html>
  );
}
