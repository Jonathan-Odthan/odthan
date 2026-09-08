"use client";

import { useEffect, useState } from "react";
import { Button } from "@odthan/ui";
import { getFavorites, saveFavorites, isFavorite as checkIsFavorite, toggleFavorite, type FavoriteVehicle } from "../../lib/favorites";

interface Props {
  vehicle: FavoriteVehicle;
}

export function FavoriteButton({ vehicle }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(checkIsFavorite(getFavorites(), vehicle.id));
  }, [vehicle.id]);

  function toggle() {
    const updated = toggleFavorite(getFavorites(), vehicle);
    saveFavorites(updated);
    setIsFavorite(!isFavorite);
  }

  return (
    <Button variant={isFavorite ? "primary" : "secondary"} onClick={toggle} className="w-full">
      {isFavorite ? "★ Retiré des favoris" : "☆ Ajouter aux favoris"}
    </Button>
  );
}
