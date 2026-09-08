const steps = [
  { title: "Explorez", text: "Parcourez les opportunités actives, chacune validée avant mise en ligne." },
  { title: "Simulez", text: "Utilisez le calculateur pour une projection indicative, non garantie." },
  { title: "Demandez", text: "Soumettez une demande d'investissement — aucun prélèvement automatique." },
  { title: "Validation", text: "Notre équipe examine votre demande manuellement." },
  { title: "Suivi", text: "Suivez votre investissement actif depuis votre portefeuille." },
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
      <p className="mt-12 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 text-xs text-[#A0A0A0]">
        ODTHAN INVESTIR est une infrastructure technique. Aucun rendement n'est garanti et
        ODTHAN n'est pas un établissement financier réglementé.
      </p>
    </div>
  );
}
