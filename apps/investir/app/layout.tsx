import type { Metadata } from "next";
import { Header, Footer } from "@odthan/ui";
import "./globals.css";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Opportunités", href: "/opportunites" },
  { label: "Calculateur", href: "/calculateur" },
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://investir.odthan.com"),
  title: {
    default: "ODTHAN INVESTIR | Opportunités et solutions d'investissement",
    template: "%s | ODTHAN INVESTIR",
  },
  description:
    "ODTHAN INVESTIR propose une infrastructure technique pour explorer des opportunités d'investissement encadrées.",
  openGraph: {
    title: "ODTHAN INVESTIR",
    description: "Opportunités et solutions d'investissement.",
    url: "https://investir.odthan.com",
    siteName: "ODTHAN INVESTIR",
    images: ["/images/odthan-logo.png"],
    locale: "fr_FR",
    type: "website",
  },
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
