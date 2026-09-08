import type { Metadata } from "next";
import { Header, Footer } from "@odthan/ui";
import "./globals.css";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Activités", href: "/activites" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://www.odthan.com"),
  title: {
    default: "ODTHAN | Construire. Investir. Développer.",
    template: "%s | ODTHAN",
  },
  description:
    "ODTHAN est un écosystème digital qui réunit entrepreneuriat, automobile et investissement au sein d'une même plateforme.",
  openGraph: {
    title: "ODTHAN | Construire. Investir. Développer.",
    description:
      "Un écosystème digital qui réunit entrepreneuriat, automobile et investissement.",
    url: "https://www.odthan.com",
    siteName: "ODTHAN",
    images: ["/images/odthan-logo.png"],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ODTHAN | Construire. Investir. Développer.",
    description:
      "Un écosystème digital qui réunit entrepreneuriat, automobile et investissement.",
    images: ["/images/odthan-logo.png"],
  },
  icons: {
    icon: "/images/odthan-logo.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col bg-[#050505] text-white">
        <Header links={navLinks} accountUrl="/connexion" />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
