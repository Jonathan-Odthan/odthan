import { describe, it, expect } from "vitest";
import { hasRole, isAdmin, isSuperAdmin, requireRole, AuthError, type SessionUser } from "../src/rbac";

const client: SessionUser = { id: "1", email: "client@odthan.com", roles: ["CLIENT"] };
const admin: SessionUser = { id: "2", email: "admin@odthan.com", roles: ["ADMIN"] };
const superAdmin: SessionUser = { id: "3", email: "super@odthan.com", roles: ["SUPER_ADMIN"] };

describe("RBAC", () => {
  it("hasRole retourne false pour un utilisateur null", () => {
    expect(hasRole(null, "ADMIN")).toBe(false);
  });

  it("hasRole détecte correctement un rôle présent", () => {
    expect(hasRole(client, "CLIENT")).toBe(true);
    expect(hasRole(client, "ADMIN")).toBe(false);
  });

  it("isAdmin est vrai pour ADMIN et SUPER_ADMIN", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(superAdmin)).toBe(true);
    expect(isAdmin(client)).toBe(false);
  });

  it("isSuperAdmin est vrai uniquement pour SUPER_ADMIN", () => {
    expect(isSuperAdmin(superAdmin)).toBe(true);
    expect(isSuperAdmin(admin)).toBe(false);
  });

  it("requireRole lève une erreur UNAUTHENTICATED si utilisateur null", () => {
    expect(() => requireRole(null, "ADMIN")).toThrow(AuthError);
    try {
      requireRole(null, "ADMIN");
    } catch (e) {
      expect((e as AuthError).code).toBe("UNAUTHENTICATED");
    }
  });

  it("requireRole lève une erreur FORBIDDEN si rôle insuffisant", () => {
    try {
      requireRole(client, "ADMIN");
      throw new Error("ne devrait pas arriver ici");
    } catch (e) {
      expect((e as AuthError).code).toBe("FORBIDDEN");
    }
  });

  it("requireRole retourne l'utilisateur si le rôle est suffisant", () => {
    expect(requireRole(admin, "ADMIN", "SUPER_ADMIN")).toBe(admin);
  });
});
