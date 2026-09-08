import Link from "next/link";
import { Button, Card } from "@odthan/ui";

const services = [
  { name: "Création d'entreprise", slug: "creation-entreprise" },
  { name: "Nom commercial", slug: "nom-commercial" },
  { name: "Logo", slug: "logo" },
  { name: "Site web", slug: "site-web" },
  { name: "Boutique en ligne", slug: "boutique-en-ligne" },
  { name: "Présence en ligne", slug: "presence-en-ligne" },
  { name: "SEO", slug: "seo" },
  { name: "Marketing", slug: "marketing" },
];

export default function BusinessHomePage() {
  return (
    <>
      <section className="px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">
            ODTHAN BUSINESS
          </span>
          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
            De l&apos;idée à l&apos;entreprise.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[#A0A0A0]">
            Créez votre entreprise de zéro et construisez votre présence professionnelle
            avec l&apos;accompagnement ODTHAN.
          </p>
          <Link href="/creer-mon-entreprise">
            <Button variant="primary">Créer mon entreprise</Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Nos services</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`}>
                <Card className="h-full text-center">
                  <h3 className="text-sm font-semibold text-[#F1D77A]">{s.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
