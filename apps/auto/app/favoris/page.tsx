"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@odthan/ui";
import { getFavorites, saveFavorites, type FavoriteVehicle } from "../lib/favorites";

// SEUL "default" est exporté ici, conformément aux exports autorisés par
// le App Router Next.js pour un fichier page.tsx. La logique métier
// (getFavorites, stockage) vit désormais dans app/lib/favorites.ts.
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  function removeFavorite(id: string) {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold text-white">Mes favoris</h1>

      {favorites.length === 0 ? (
        <p className="text-[#A0A0A0]">
          Vous n&apos;avez pas encore de véhicule favori. Parcourez le{" "}
          <Link href="/vehicules" className="text-[#F1D77A] hover:underline">catalogue</Link>.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {favorites.map((v) => (
            <Card key={v.id}>
              <Link href={`/vehicules/${v.slug}`}>
                <h3 className="font-bold text-white">{v.brandName} {v.name}</h3>
                <p className="mt-2 text-lg font-bold text-[#D4AF37]">
                  {v.price.toLocaleString()} {v.currency}
                </p>
              </Link>
              <button
                onClick={() => removeFavorite(v.id)}
                className="mt-4 text-xs text-[#A0A0A0] hover:text-red-400"
              >
                Retirer des favoris
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
