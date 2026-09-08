"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@odthan/ui";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setForm({ currentPassword: "", newPassword: "" });
      // Toutes les sessions ont été révoquées côté serveur — reconnexion nécessaire.
      setTimeout(() => router.push("https://www.odthan.com/connexion"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold text-white">Profil & Sécurité</h1>

      <Card>
        <h2 className="mb-4 font-bold text-[#F1D77A]">Changer mon mot de passe</h2>

        {status === "sent" ? (
          <p className="text-sm text-[#F1D77A]">
            Mot de passe modifié. Vos autres sessions ont été déconnectées. Redirection...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                {error}
              </div>
            )}
            <input
              required
              type="password"
              placeholder="Mot de passe actuel"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
            <input
              required
              type="password"
              placeholder="Nouveau mot de passe (10 caractères min.)"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            />
            <Button type="submit" disabled={status === "sending"} className="w-full">
              {status === "sending" ? "Modification..." : "Changer le mot de passe"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
