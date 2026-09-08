"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Logo } from "@odthan/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20">
      <Logo size="lg" />
      <h1 className="mt-8 mb-2 text-2xl font-bold text-white">Créer un compte</h1>
      <p className="mb-8 text-sm text-[#A0A0A0]">
        Un seul compte pour Business, Auto et Investir.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Prénom"
            value={form.firstName}
            onChange={update("firstName")}
            className="rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
          <input
            required
            placeholder="Nom"
            value={form.lastName}
            onChange={update("lastName")}
            className="rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        </div>

        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update("email")}
          className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />

        <input
          placeholder="Téléphone (optionnel)"
          value={form.phone}
          onChange={update("phone")}
          className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />

        <input
          required
          type="password"
          placeholder="Mot de passe (10 caractères min.)"
          value={form.password}
          onChange={update("password")}
          className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Création..." : "Créer mon compte"}
        </Button>

        <p className="text-center text-sm text-[#A0A0A0]">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-[#F1D77A] hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
