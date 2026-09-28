import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hache et verifie correctement un mot de passe", async () => {
    const hash = await hashPassword("SuperSecret123");
    expect(hash).not.toBe("SuperSecret123");
    expect(await verifyPassword("SuperSecret123", hash)).toBe(true);
  });

  it("rejette un mauvais mot de passe", async () => {
    const hash = await hashPassword("SuperSecret123");
    expect(await verifyPassword("MauvaisMotDePasse", hash)).toBe(false);
  });
});
