"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@odthan/ui";

export default function SearchPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ model: "", priceMin: "", priceMax: "", country: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    router.push(`/vehicules${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold text-white">Recherche avancée</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Modèle recherché"
          value={filters.model}
          onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Prix min"
            value={filters.priceMin}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
            className="rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
          <input
            placeholder="Prix max"
            value={filters.priceMax}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
            className="rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        </div>
        <input
          placeholder="Pays"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />
        <Button type="submit" className="w-full">Rechercher</Button>
      </form>
    </div>
  );
}
