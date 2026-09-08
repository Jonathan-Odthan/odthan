import type { Metadata } from "next";
import { Header, Footer } from "@odthan/ui";
import "./globals.css";

const navLinks = [
  { label: "Tableau de bord", href: "/" },
  { label: "Notifications", href: "/notifications" },
  { label: "Documents", href: "/documents" },
  { label: "Paiements", href: "/paiements" },
  { label: "Profil", href: "/profil" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://account.odthan.com"),
  title: { default: "Mon compte ODTHAN", template: "%s | ODTHAN" },
  robots: { index: false, follow: false }, // espace personnel, jamais indexé
  icons: { icon: "/images/odthan-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col bg-[#050505] text-white">
        <Header links={navLinks} accountUrl="https://www.odthan.com/connexion" />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
