"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@odthan/ui";

function getOrCreateSessionId(): string {
  const key = "odthan_session_id";
  let sid = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!sid) {
    sid = crypto.randomUUID();
    if (typeof window !== "undefined") localStorage.setItem(key, sid);
  }
  return sid;
}

export function VehicleLeadForm({ vehicleId }: { vehicleId: string }) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Enregistre le clic d'affiliation dès l'arrivée sur la fiche, si ?ref= est présent.
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateCode: ref,
        vehicleId,
        sessionId: getOrCreateSessionId(),
      }),
    }).catch(() => {
      // Le tracking ne doit jamais bloquer la navigation de l'utilisateur.
    });
  }, [searchParams, vehicleId]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/auto/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleId, affiliateCode: searchParams.get("ref") ?? undefined }),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-[#D4AF37]/40 bg-[#0D0D0D] p-6 text-[#F1D77A]">
        Votre demande a bien été envoyée. Un conseiller vous contactera rapidement.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-6">
      <h3 className="mb-2 font-bold text-white">Demander un devis</h3>
      {status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Une erreur est survenue. Réessayez.
        </div>
      )}
      <input
        required
        placeholder="Nom complet"
        value={form.name}
        onChange={update("name")}
        className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
      />
      <input
        required
        placeholder="Téléphone"
        value={form.phone}
        onChange={update("phone")}
        className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
      />
      <input
        placeholder="Email (optionnel)"
        type="email"
        value={form.email}
        onChange={update("email")}
        className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
      />
      <textarea
        placeholder="Message (optionnel)"
        rows={3}
        value={form.message}
        onChange={update("message")}
        className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
      />
      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Envoi..." : "Envoyer la demande"}
      </Button>
    </form>
  );
}
