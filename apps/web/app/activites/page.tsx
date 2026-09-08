import Link from "next/link";
import { Button, Card } from "@odthan/ui";

const activities = [
  {
    title: "ODTHAN BUSINESS",
    tagline: "De l'idée à l'entreprise.",
    text: "Un accompagnement complet pour créer votre entreprise : nom commercial, logo, site web, boutique en ligne, présence en ligne, SEO et marketing digital.",
    href: "https://business.odthan.com",
    cta: "Créer mon entreprise",
  },
  {
    title: "ODTHAN AUTO",
    tagline: "Votre prochain véhicule, en confiance.",
    text: "Une marketplace automobile affiliée avec un réseau de partenaires vérifiés, recherche avancée et suivi de vos demandes.",
    href: "https://auto.odthan.com",
    cta: "Explorer Auto",
  },
  {
    title: "ODTHAN INVESTIR",
    tagline: "Explorez, simulez, décidez.",
    text: "Une infrastructure technique pour découvrir des opportunités d'investissement encadrées, avec un calculateur indicatif et un suivi transparent.",
    href: "https://investir.odthan.com",
    cta: "Explorer Investir",
  },
];

export const metadata = { title: "Nos activités" };

export default function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-12 text-center text-4xl font-bold text-white">Nos activités</h1>
      <div className="space-y-8">
        {activities.map((a) => (
          <Card key={a.title} className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:pr-8">
              <h2 className="mb-1 text-2xl font-bold text-[#F1D77A]">{a.title}</h2>
              <p className="mb-3 text-sm italic text-[#D4AF37]">{a.tagline}</p>
              <p className="text-sm leading-relaxed text-[#A0A0A0]">{a.text}</p>
            </div>
            <a href={a.href} className="shrink-0">
              <Button variant="secondary">{a.cta}</Button>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
