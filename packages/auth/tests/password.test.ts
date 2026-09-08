import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/password";

describe("password", () => {
  it("hache un mot de passe différemment à chaque appel (salt aléatoire)", async () => {
    const hash1 = await hashPassword("MotDePasse123");
    const hash2 = await hashPassword("MotDePasse123");
    expect(hash1).not.toBe(hash2);
  });

  it("vérifie correctement un mot de passe valide", async () => {
    const hash = await hashPassword("MotDePasse123");
    expect(await verifyPassword("MotDePasse123", hash)).toBe(true);
  });

  it("rejette un mot de passe incorrect", async () => {
    const hash = await hashPassword("MotDePasse123");
    expect(await verifyPassword("MauvaisMotDePasse", hash)).toBe(false);
  });

  it("ne stocke jamais le mot de passe en clair dans le hash", async () => {
    const plain = "MotDePasseSecret";
    const hash = await hashPassword(plain);
    expect(hash).not.toContain(plain);
  });
});
