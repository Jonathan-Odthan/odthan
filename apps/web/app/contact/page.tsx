"use client";

import { useState } from "react";
import { Button } from "@odthan/ui";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="mb-2 text-3xl font-bold text-white">Contact</h1>
      <p className="mb-10 text-[#A0A0A0]">Une question ? Écrivez-nous.</p>

      {status === "sent" ? (
        <div className="rounded-lg border border-[#D4AF37]/40 bg-[#0D0D0D] p-6 text-[#F1D77A]">
          Votre message a bien été envoyé. Nous vous répondrons rapidement.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "error" && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Une erreur est survenue. Vérifiez le formulaire et réessayez.
            </div>
          )}
          <input
            required
            placeholder="Nom complet"
            value={form.name}
            onChange={update("name")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update("email")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
          <input
            required
            placeholder="Sujet"
            value={form.subject}
            onChange={update("subject")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
          <textarea
            required
            rows={5}
            placeholder="Votre message"
            value={form.message}
            onChange={update("message")}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
          <Button type="submit" disabled={status === "sending"} className="w-full">
            {status === "sending" ? "Envoi..." : "Envoyer le message"}
          </Button>
        </form>
      )}
    </div>
  );
}
