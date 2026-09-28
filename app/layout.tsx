import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Odthan Admin Center",
    template: "%s | Odthan Admin Center",
  },
  description: "Administration securisee d'Odthan Empire.",
  icons: {
    icon: "/branding/favicon.png",
    apple: "/branding/apple-touch-icon.png",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
