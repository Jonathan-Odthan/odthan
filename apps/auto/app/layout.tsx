import type { Metadata } from "next";
import { Header, Footer } from "@odthan/ui";
import "./globals.css";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Véhicules", href: "/vehicules" },
  { label: "Recherche", href: "/recherche" },
  { label: "Marques", href: "/marques" },
  { label: "Favoris", href: "/favoris" },
  { label: "Devenir partenaire", href: "/devenir-partenaire" },
  { label: "Contact", href: "/contact" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://auto.odthan.com"),
  title: {
    default: "ODTHAN AUTO | Marketplace automobile",
    template: "%s | ODTHAN AUTO",
  },
  description: "Trouvez votre prochain véhicule grâce au réseau de partenaires ODTHAN AUTO.",
  openGraph: {
    title: "ODTHAN AUTO | Marketplace automobile",
    description: "Trouvez votre prochain véhicule grâce à notre réseau de partenaires.",
    url: "https://auto.odthan.com",
    siteName: "ODTHAN AUTO",
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
