export const metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-8 text-4xl font-bold text-white">Conditions d&apos;utilisation</h1>
      <div className="space-y-6 text-sm leading-relaxed text-[#A0A0A0]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">1. Objet</h2>
          <p>
            Les présentes conditions régissent l&apos;utilisation de la plateforme ODTHAN et de
            ses activités (Business, Auto, Investir).
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">2. Compte utilisateur</h2>
          <p>
            Vous êtes responsable de la confidentialité de vos identifiants et de toute activité
            effectuée depuis votre compte.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">3. Investissement</h2>
          <p>
            ODTHAN INVESTIR est une infrastructure technique. Aucun rendement n&apos;est garanti.
            ODTHAN n&apos;est pas un établissement financier réglementé et toute collecte réelle de
            fonds fait l&apos;objet d&apos;une validation préalable stricte.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">4. Affiliation automobile</h2>
          <p>
            Les commissions d&apos;affiliation ne sont dues qu&apos;après confirmation d&apos;un
            événement commercial défini, jamais sur un simple clic.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">5. Responsabilité</h2>
          <p>
            ODTHAN met tout en œuvre pour assurer la fiabilité de ses services mais ne saurait
            être tenu responsable des décisions prises sur la base des informations fournies.
          </p>
        </section>
      </div>
    </div>
  );
}
