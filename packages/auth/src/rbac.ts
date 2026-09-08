import type { RoleName } from "@odthan/database";

export type SessionUser = {
  id: string;
  email: string;
  roles: RoleName[];
};

/**
 * ODTHAN — RBAC (contrôle d'accès basé sur les rôles).
 *
 * RÈGLE DE SÉCURITÉ FONDAMENTALE :
 * Ces vérifications doivent être appelées côté serveur uniquement
 * (Route Handlers, Server Actions, middleware). Un rôle affiché côté
 * client (menu, bouton visible/caché) n'est jamais une preuve
 * d'autorisation — il ne sert qu'à l'expérience utilisateur.
 */

export function hasRole(user: SessionUser | null, ...allowed: RoleName[]): boolean {
  if (!user) return false;
  return user.roles.some((r) => allowed.includes(r));
}

export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, "ADMIN", "SUPER_ADMIN");
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return hasRole(user, "SUPER_ADMIN");
}

export function isAffiliate(user: SessionUser | null): boolean {
  return hasRole(user, "AFFILIATE");
}

export function isInvestor(user: SessionUser | null): boolean {
  return hasRole(user, "INVESTOR");
}

/**
 * À utiliser en tête de chaque Route Handler / Server Action protégée :
 *
 *   const user = await getSessionUser(token);
 *   requireRole(user, "ADMIN", "SUPER_ADMIN");
 *
 * Lève une erreur si l'utilisateur n'a pas l'un des rôles requis.
 */
export function requireRole(user: SessionUser | null, ...allowed: RoleName[]): SessionUser {
  if (!user) {
    throw new AuthError("UNAUTHENTICATED", "Authentification requise.");
  }
  if (!hasRole(user, ...allowed)) {
    throw new AuthError("FORBIDDEN", "Permissions insuffisantes.");
  }
  return user;
}

export class AuthError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}
