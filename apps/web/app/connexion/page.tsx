"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Logo } from "@odthan/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
      <h1 className="mt-8 mb-2 text-2xl font-bold text-white">Connexion</h1>
      <p className="mb-8 text-sm text-[#A0A0A0]">Accédez à votre compte ODTHAN.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-[#A0A0A0]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-[#A0A0A0]" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#0D0D0D] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

        <p className="text-center text-sm text-[#A0A0A0]">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-[#F1D77A] hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
