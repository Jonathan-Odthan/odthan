import type { Metadata } from "next";
import { Header, Footer } from "@odthan/ui";
import "./globals.css";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Créer mon entreprise", href: "/creer-mon-entreprise" },
  { label: "Services", href: "/services" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://business.odthan.com"),
  title: {
    default: "ODTHAN BUSINESS | Créer son entreprise",
    template: "%s | ODTHAN BUSINESS",
  },
  description: "De l'idée à l'entreprise. Créez votre entreprise et votre présence professionnelle avec ODTHAN BUSINESS.",
  openGraph: {
    title: "ODTHAN BUSINESS | Créer son entreprise",
    description: "De l'idée à l'entreprise.",
    url: "https://business.odthan.com",
    siteName: "ODTHAN BUSINESS",
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
