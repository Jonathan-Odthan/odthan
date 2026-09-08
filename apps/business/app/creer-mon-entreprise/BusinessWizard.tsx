"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@odthan/ui";

const SECTORS = ["Commerce", "Technologie", "Restauration", "Services", "Import/Export", "Autre"];
const BUDGETS = [
  { value: "<500", label: "Moins de 500 $" },
  { value: "500-2000", label: "500 $ – 2 000 $" },
  { value: "2000-5000", label: "2 000 $ – 5 000 $" },
  { value: "5000+", label: "Plus de 5 000 $" },
];
// Ces IDs doivent correspondre aux services réels en base (voir seed.ts).
// En production, charger la liste dynamiquement via GET /api/business/services.
const STEP_TITLES = [
  "Mon idée",
  "Secteur d'activité",
  "Nom souhaité",
  "Informations du fondateur",
  "Informations de l'entreprise",
  "Services souhaités",
  "Budget",
  "Coordonnées",
  "Résumé",
  "Confirmation",
];

interface WizardState {
  ideaTitle: string;
  sector: string;
  desiredName: string;
  founderInfo: { firstName: string; lastName: string; country: string };
  companyInfo: { legalForm: string; address: string };
  serviceIds: string[];
  budgetRange: string;
  contactPhone: string;
  contactEmail: string;
}

const initialState: WizardState = {
  ideaTitle: "",
  sector: "",
  desiredName: "",
  founderInfo: { firstName: "", lastName: "", country: "" },
  companyInfo: { legalForm: "", address: "" },
  serviceIds: [],
  budgetRange: "",
  contactPhone: "",
  contactEmail: "",
};

export function BusinessWizard({ availableServices }: { availableServices: { id: string; name: string }[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isLastInputStep = step === STEP_TITLES.length - 2; // "Résumé"

  function next() {
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/business/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Une erreur est survenue.");
        return;
      }
      setDone(true);
      setStep(STEP_TITLES.length - 1);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleService(id: string) {
    setData((d) => ({
      ...d,
      serviceIds: d.serviceIds.includes(id)
        ? d.serviceIds.filter((s) => s !== id)
        : [...d.serviceIds, id],
    }));
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between text-xs text-[#A0A0A0]">
        <span>
          Étape {step + 1} / {STEP_TITLES.length}
        </span>
        <span className="text-[#F1D77A]">{STEP_TITLES[step]}</span>
      </div>

      <div className="mb-6 h-1 w-full rounded-full bg-[#0D0D0D]">
        <div
          className="h-1 rounded-full bg-[#D4AF37] transition-all"
          style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-8">
        {step === 0 && (
          <textarea
            rows={4}
            placeholder="Décrivez votre idée d'entreprise..."
            value={data.ideaTitle}
            onChange={(e) => setData({ ...data, ideaTitle: e.target.value })}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setData({ ...data, sector: s })}
                className={`rounded-lg border px-4 py-3 text-sm ${
                  data.sector === s
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F1D77A]"
                    : "border-[#D4AF37]/20 text-[#A0A0A0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <input
            placeholder="Nom commercial souhaité"
            value={data.desiredName}
            onChange={(e) => setData({ ...data, desiredName: e.target.value })}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        )}

        {step === 3 && (
          <div className="space-y-3">
            <input
              placeholder="Prénom"
              value={data.founderInfo.firstName}
              onChange={(e) => setData({ ...data, founderInfo: { ...data.founderInfo, firstName: e.target.value } })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
            <input
              placeholder="Nom"
              value={data.founderInfo.lastName}
              onChange={(e) => setData({ ...data, founderInfo: { ...data.founderInfo, lastName: e.target.value } })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
            <input
              placeholder="Pays"
              value={data.founderInfo.country}
              onChange={(e) => setData({ ...data, founderInfo: { ...data.founderInfo, country: e.target.value } })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <input
              placeholder="Forme juridique envisagée (optionnel)"
              value={data.companyInfo.legalForm}
              onChange={(e) => setData({ ...data, companyInfo: { ...data.companyInfo, legalForm: e.target.value } })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
            <input
              placeholder="Adresse (optionnel)"
              value={data.companyInfo.address}
              onChange={(e) => setData({ ...data, companyInfo: { ...data.companyInfo, address: e.target.value } })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-2 gap-3">
            {availableServices.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`rounded-lg border px-4 py-3 text-sm text-left ${
                  data.serviceIds.includes(s.id)
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F1D77A]"
                    : "border-[#D4AF37]/20 text-[#A0A0A0]"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-3">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                onClick={() => setData({ ...data, budgetRange: b.value })}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm ${
                  data.budgetRange === b.value
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F1D77A]"
                    : "border-[#D4AF37]/20 text-[#A0A0A0]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3">
            <input
              placeholder="Téléphone"
              value={data.contactPhone}
              onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
            <input
              placeholder="Email"
              type="email"
              value={data.contactEmail}
              onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
          </div>
        )}

        {step === 8 && (
          <div className="space-y-2 text-sm text-[#A0A0A0]">
            <p><span className="text-[#F1D77A]">Idée :</span> {data.ideaTitle || "—"}</p>
            <p><span className="text-[#F1D77A]">Secteur :</span> {data.sector || "—"}</p>
            <p><span className="text-[#F1D77A]">Nom souhaité :</span> {data.desiredName || "—"}</p>
            <p><span className="text-[#F1D77A]">Fondateur :</span> {data.founderInfo.firstName} {data.founderInfo.lastName}</p>
            <p><span className="text-[#F1D77A]">Services :</span> {data.serviceIds.length} sélectionné(s)</p>
            <p><span className="text-[#F1D77A]">Budget :</span> {data.budgetRange || "—"}</p>
            <p><span className="text-[#F1D77A]">Contact :</span> {data.contactPhone} / {data.contactEmail}</p>
          </div>
        )}

        {step === 9 && (
          <div className="py-8 text-center">
            {done ? (
              <>
                <p className="mb-2 text-lg font-bold text-[#F1D77A]">Projet soumis avec succès !</p>
                <p className="text-sm text-[#A0A0A0]">
                  Vous pouvez suivre son avancement depuis votre tableau de bord.
                </p>
                <div className="mt-6">
                  <Button onClick={() => router.push("/account/business")}>
                    Voir mon tableau de bord
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#A0A0A0]">Cliquez sur confirmer pour soumettre votre projet.</p>
            )}
          </div>
        )}
      </div>

      {!done && (
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            Retour
          </Button>
          {isLastInputStep ? (
            <Button onClick={next}>Continuer</Button>
          ) : step === STEP_TITLES.length - 2 ? (
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Envoi..." : "Confirmer"}
            </Button>
          ) : (
            <Button onClick={next}>Suivant</Button>
          )}
        </div>
      )}
    </div>
  );
}
