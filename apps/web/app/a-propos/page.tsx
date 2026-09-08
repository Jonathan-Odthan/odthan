export const metadata = { title: "À propos" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-6 text-4xl font-bold text-white">À propos d&apos;ODTHAN</h1>
      <div className="space-y-6 leading-relaxed text-[#A0A0A0]">
        <p>
          ODTHAN est un écosystème digital qui réunit entrepreneuriat, automobile et
          investissement au sein d&apos;une même plateforme. Notre ambition est de bâtir
          une infrastructure de confiance où chaque utilisateur, avec un compte unique,
          accède à des services professionnels et sécurisés.
        </p>
        <p>
          Trois activités structurent l&apos;écosystème : <span className="text-[#F1D77A]">ODTHAN BUSINESS</span> pour
          la création d&apos;entreprise, <span className="text-[#F1D77A]">ODTHAN AUTO</span> pour la marketplace
          automobile affiliée, et <span className="text-[#F1D77A]">ODTHAN INVESTIR</span> pour l&apos;exploration
          d&apos;opportunités d&apos;investissement encadrées.
        </p>
        <p>
          Construire. Investir. Développer. — trois verbes qui résument notre feuille de route :
          accompagner nos utilisateurs à chaque étape de leurs projets, avec exigence et transparence.
        </p>
      </div>
    </div>
  );
}
