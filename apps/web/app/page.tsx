import Image from "next/image";
import Link from "next/link";
import { Button, Card } from "@odthan/ui";

const activities = [
  {
    title: "ODTHAN INVESTIR",
    text: "Découvrez des opportunités et développez vos projets.",
    cta: "Explorer Investir",
    href: "https://investir.odthan.com",
  },
  {
    title: "ODTHAN AUTO",
    text: "Trouvez votre prochain véhicule grâce à notre réseau de partenaires.",
    cta: "Explorer Auto",
    href: "https://auto.odthan.com",
  },
  {
    title: "ODTHAN BUSINESS",
    text: "Créez votre entreprise de zéro et construisez votre présence professionnelle.",
    cta: "Créer mon entreprise",
    href: "https://business.odthan.com",
  },
];

const stats = [
  { value: "3", label: "Activités réunies" },
  { value: "1", label: "Compte central" },
  { value: "100%", label: "Sécurisé" },
];

export default function HomePage() {
  return (
    <>
      {/* SECTION HERO */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <Image
            src="/images/odthan-logo.png"
            alt="ODTHAN"
            width={140}
            height={140}
            priority
            className="mx-auto mb-8"
          />
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl">
            Construire.
            <br />
            <span className="text-[#D4AF37]">Investir.</span>
            <br />
            Développer.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[#A0A0A0]">
            Un écosystème digital qui réunit entrepreneuriat, automobile et
            investissement au sein d&apos;une même plateforme.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/activites">
              <Button variant="primary">Découvrir ODTHAN</Button>
            </Link>
            <Link href="https://business.odthan.com/creer-mon-entreprise">
              <Button variant="secondary">Créer mon projet</Button>
            </Link>
          </div>
        </div>

        {/* halo doré décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl"
        />
      </section>

      {/* SECTION ACTIVITÉS */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            Nos activités
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-[#A0A0A0]">
            Trois univers, une même exigence de qualité et de confiance.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {activities.map((a) => (
              <Card key={a.title} className="flex flex-col justify-between">
                <div>
                  <h3 className="mb-3 text-xl font-bold text-[#F1D77A]">{a.title}</h3>
                  <p className="mb-8 text-sm leading-relaxed text-[#A0A0A0]">{a.text}</p>
                </div>
                <a href={a.href}>
                  <Button variant="secondary" className="w-full">
                    {a.cta}
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRÉSENTATION / VISION / MISSION */}
      <section className="border-y border-[#D4AF37]/10 bg-[#0D0D0D] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">Notre vision</h2>
            <p className="leading-relaxed text-[#A0A0A0]">
              Construire un écosystème digital de confiance où l&apos;entrepreneuriat,
              l&apos;automobile et l&apos;investissement se rencontrent, portés par
              une même exigence de sécurité, de transparence et d&apos;excellence.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">Notre mission</h2>
            <p className="leading-relaxed text-[#A0A0A0]">
              Offrir à chaque utilisateur un accès simple, unifié et sécurisé à des
              services professionnels : création d&apos;entreprise, marketplace
              automobile affiliée, et opportunités d&apos;investissement encadrées.
            </p>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-[#D4AF37]">{s.value}</div>
              <div className="mt-2 text-sm text-[#A0A0A0]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#0D0D0D] to-[#050505] p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Prêt à rejoindre l&apos;écosystème ODTHAN ?
          </h2>
          <p className="mb-8 text-[#A0A0A0]">
            Créez votre compte central et accédez à toutes nos activités.
          </p>
          <Link href="/inscription">
            <Button variant="primary">Créer mon compte</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
