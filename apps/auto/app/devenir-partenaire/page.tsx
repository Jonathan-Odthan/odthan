"use client";

import { useState } from "react";
import { Button } from "@odthan/ui";

export default function BecomePartnerPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Devenir partenaire ODTHAN AUTO", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://www.odthan.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold text-white">Devenir partenaire</h1>
      <p className="mb-10 text-[#A0A0A0]">
        Vous êtes vendeur ou concessionnaire ? Rejoignez le réseau ODTHAN AUTO.
      </p>
      {status === "sent" ? (
        <p className="rounded-lg border border-[#D4AF37]/40 bg-[#0D0D0D] p-6 text-[#F1D77A]">
          Votre demande a été envoyée. Nous vous recontacterons rapidement.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Nom / Société" value={form.name} onChange={update("name")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]" />
          <input required type="email" placeholder="Email" value={form.email} onChange={update("email")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]" />
          <textarea required rows={5} placeholder="Décrivez votre activité" value={form.message} onChange={update("message")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]" />
          <Button type="submit" disabled={status === "sending"} className="w-full">
            {status === "sending" ? "Envoi..." : "Envoyer ma demande"}
          </Button>
        </form>
      )}
    </div>
  );
}
