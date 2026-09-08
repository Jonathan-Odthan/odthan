"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@odthan/ui";

export function InvestmentRequestForm({
  opportunityId,
  currency,
  minimum,
}: {
  opportunityId: string;
  currency: string;
  minimum: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(minimum);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/investments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, amount, currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://www.odthan.com/connexion");
          return;
        }
        setError(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-[#D4AF37]/40 bg-[#0D0D0D] p-6 text-[#F1D77A]">
        Votre demande a été enregistrée avec le statut « En attente ». Elle sera examinée par
        notre équipe — aucun fonds n&apos;est prélevé automatiquement.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-6">
      <h3 className="font-bold text-white">Faire une demande d&apos;investissement</h3>
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-[#A0A0A0]">Montant ({currency})</label>
        <input
          type="number"
          min={minimum}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />
      </div>
      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Envoi..." : "Soumettre ma demande"}
      </Button>
    </form>
  );
}
