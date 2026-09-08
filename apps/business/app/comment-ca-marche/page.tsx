const steps = [
  { title: "Décrivez votre idée", text: "Partagez votre projet et le secteur d'activité visé." },
  { title: "Choisissez vos services", text: "Sélectionnez création d'entreprise, logo, site web, SEO..." },
  { title: "Validation", text: "Notre équipe examine votre projet et vous contacte." },
  { title: "Réalisation", text: "Nous travaillons sur chaque service sélectionné, avec suivi en temps réel." },
  { title: "Lancement", text: "Votre entreprise est prête à démarrer." },
];

export const metadata = { title: "Comment ça marche" };

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-12 text-center text-4xl font-bold text-white">Comment ça marche</h1>
      <div className="space-y-8">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37] font-bold text-[#D4AF37]">
              {i + 1}
            </div>
            <div>
              <h2 className="mb-1 font-bold text-white">{step.title}</h2>
              <p className="text-sm text-[#A0A0A0]">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
