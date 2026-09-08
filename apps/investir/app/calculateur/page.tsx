"use client";

import { useState } from "react";

// Taux indicatif fixe UNIQUEMENT à titre de démonstration.
// Ne constitue en aucun cas un rendement garanti ni une offre financière.
const INDICATIVE_ANNUAL_RATE = 0.06;

export default function CalculatorPage() {
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(12);

  const projected = amount * Math.pow(1 + INDICATIVE_ANNUAL_RATE / 12, months);
  const gain = projected - amount;

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="mb-2 text-3xl font-bold text-white">Calculateur d&apos;investissement</h1>
      <p className="mb-10 text-[#A0A0A0]">
        Simulez une projection indicative selon un montant et une durée.
      </p>

      <div className="space-y-6 rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-8">
        <div>
          <label className="mb-2 block text-sm text-[#A0A0A0]">Montant ($)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-[#A0A0A0]">Durée (mois) : {months}</label>
          <input
            type="range"
            min={1}
            max={60}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-[#D4AF37]"
          />
        </div>

        <div className="rounded-xl bg-[#050505] p-6">
          <p className="text-sm text-[#A0A0A0]">Capital investi</p>
          <p className="mb-4 text-2xl font-bold text-white">{amount.toLocaleString()} $</p>
          <p className="text-sm text-[#A0A0A0]">Projection indicative</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{projected.toFixed(2)} $</p>
          <p className="mt-1 text-sm text-[#A0A0A0]">Gain estimatif : {gain.toFixed(2)} $</p>
        </div>

        <p className="text-xs text-[#A0A0A0]">
          Simulation indicative, non garantie. Ce calculateur ne constitue pas, à lui seul,
          une offre financière. Les rendements réels dépendent de chaque opportunité et ne
          sont jamais garantis.
        </p>
      </div>
    </div>
  );
}
