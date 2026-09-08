"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@odthan/ui";

interface Stats {
  code: string;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  sales: number;
  commissionPending: number;
  commissionApproved: number;
  commissionPaid: number;
}

export default function AffiliateDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/dashboard");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible de charger le tableau de bord.");
        return;
      }
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function handleGenerateLink() {
    const res = await fetch("/api/affiliate/dashboard", { method: "POST" });
    if (res.ok) loadStats();
  }

  if (loading) return <div className="px-6 py-16 text-center text-[#A0A0A0]">Chargement...</div>;

  if (error && !stats) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="mb-6 text-[#A0A0A0]">{error}</p>
        <Button onClick={handleGenerateLink}>Devenir partenaire affilié</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">Espace partenaire</h1>
      <p className="mb-8 text-[#A0A0A0]">
        Votre code affilié : <span className="text-[#F1D77A]">{stats?.code}</span>
      </p>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#D4AF37]">{stats?.clicks}</div>
          <div className="text-sm text-[#A0A0A0]">Clics</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#D4AF37]">{stats?.leads}</div>
          <div className="text-sm text-[#A0A0A0]">Leads</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#D4AF37]">{stats?.qualifiedLeads}</div>
          <div className="text-sm text-[#A0A0A0]">Leads qualifiés</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#D4AF37]">{stats?.sales}</div>
          <div className="text-sm text-[#A0A0A0]">Ventes</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#F1D77A]">{stats?.commissionPending.toFixed(2)} $</div>
          <div className="text-sm text-[#A0A0A0]">Commission en attente</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#F1D77A]">{stats?.commissionApproved.toFixed(2)} $</div>
          <div className="text-sm text-[#A0A0A0]">Commission approuvée</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#F1D77A]">{stats?.commissionPaid.toFixed(2)} $</div>
          <div className="text-sm text-[#A0A0A0]">Commission payée</div>
        </Card>
      </div>
    </div>
  );
}
