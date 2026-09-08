export const metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-8 text-4xl font-bold text-white">Politique de confidentialité</h1>
      <div className="space-y-6 text-sm leading-relaxed text-[#A0A0A0]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">1. Données collectées</h2>
          <p>
            ODTHAN collecte les données que vous fournissez directement (identité, coordonnées,
            informations de projet) ainsi que des données techniques nécessaires au bon
            fonctionnement de la plateforme (identifiants de session, journaux de sécurité).
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">2. Utilisation des données</h2>
          <p>
            Vos données sont utilisées pour fournir les services demandés (création d&apos;entreprise,
            mise en relation automobile, suivi d&apos;investissement), assurer la sécurité de votre
            compte et, avec votre consentement, vous informer de nos actualités.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">3. Partage des données</h2>
          <p>
            Vos données ne sont partagées qu&apos;avec les prestataires strictement nécessaires
            (paiement, hébergement, communication) et ne sont jamais vendues à des tiers.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">4. Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
            données. Contactez-nous via la page Contact pour exercer ces droits.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[#F1D77A]">5. Sécurité</h2>
          <p>
            Les mots de passe sont hachés, les sessions sont sécurisées, et l&apos;accès aux données
            sensibles est strictement contrôlé par des permissions vérifiées côté serveur.
          </p>
        </section>
      </div>
    </div>
  );
}
