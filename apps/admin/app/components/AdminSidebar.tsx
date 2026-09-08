import Link from "next/link";
import { Logo } from "@odthan/ui";

const sections = [
  {
    title: "Tableau de bord",
    links: [{ label: "Vue d'ensemble", href: "/" }],
  },
  {
    title: "Utilisateurs",
    links: [
      { label: "Clients", href: "/utilisateurs?role=CLIENT" },
      { label: "Investisseurs", href: "/utilisateurs?role=INVESTOR" },
      { label: "Partenaires", href: "/utilisateurs?role=PARTNER" },
      { label: "Affiliés", href: "/utilisateurs?role=AFFILIATE" },
      { label: "Administrateurs", href: "/utilisateurs?role=ADMIN" },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Projets", href: "/business/projets" },
      { label: "Services", href: "/business/services" },
    ],
  },
  {
    title: "Auto",
    links: [
      { label: "Véhicules", href: "/auto/vehicules" },
      { label: "Marques", href: "/auto/marques" },
      { label: "Leads", href: "/auto/leads" },
      { label: "Affiliés", href: "/auto/affilies" },
      { label: "Commissions", href: "/auto/commissions" },
    ],
  },
  {
    title: "Investir",
    links: [
      { label: "Opportunités", href: "/investir/opportunites" },
      { label: "Investissements", href: "/investir/investissements" },
    ],
  },
  {
    title: "Finance",
    links: [
      { label: "Paiements", href: "/finance/paiements" },
      { label: "Factures", href: "/finance/factures" },
    ],
  },
  {
    title: "Système",
    links: [
      { label: "Rôles & permissions", href: "/systeme/roles" },
      { label: "Audit logs", href: "/systeme/audit" },
      { label: "Paramètres", href: "/systeme/parametres" },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-[#D4AF37]/15 bg-[#0D0D0D] p-6 md:block">
      <Logo size="sm" href="/" />
      <nav className="mt-10 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]/70">
              {section.title}
            </h4>
            <ul className="space-y-1">
              {section.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-lg px-3 py-2 text-sm text-[#A0A0A0] hover:bg-[#D4AF37]/10 hover:text-[#F1D77A]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
