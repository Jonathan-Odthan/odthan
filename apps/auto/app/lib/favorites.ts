/**
 * Logique des favoris ODTHAN AUTO (stockage local, aucun compte requis).
 *
 * Cette logique vivait auparavant dans app/favoris/page.tsx via un export
 * nommé (`export function getFavorites`), ce qui est INVALIDE pour un
 * fichier page.tsx du App Router Next.js — seuls les exports suivants sont
 * autorisés : default, metadata, generateMetadata, generateStaticParams,
 * dynamic, revalidate, fetchCache, runtime, preferredRegion, maxDuration.
 * Un export nommé additionnel provoque l'erreur de build :
 *   "getFavorites is not a valid Page export field."
 * D'où le déplacement vers lib/.
 */
export interface FavoriteVehicle {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  price: number;
  currency: string;
}

export const FAVORITES_STORAGE_KEY = "odthan_auto_favorites";

export function getFavorites(): FavoriteVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteVehicle[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export function isFavorite(favorites: FavoriteVehicle[], vehicleId: string): boolean {
  return favorites.some((f) => f.id === vehicleId);
}

export function toggleFavorite(favorites: FavoriteVehicle[], vehicle: FavoriteVehicle): FavoriteVehicle[] {
  return isFavorite(favorites, vehicle.id)
    ? favorites.filter((f) => f.id !== vehicle.id)
    : [...favorites, vehicle];
}
