import { describe, it, expect } from "vitest";
import { loginSchema, clientSchema, orderSchema, paymentSchema } from "@/lib/validation/schemas";

describe("loginSchema", () => {
  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "pas-un-email", password: "12345678" });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe trop court", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123" });
    expect(result.success).toBe(false);
  });

  it("accepte des identifiants valides", () => {
    const result = loginSchema.safeParse({ email: "admin@odthan.com", password: "motdepasse123" });
    expect(result.success).toBe(true);
  });
});

describe("clientSchema", () => {
  it("exige prenom et nom", () => {
    const result = clientSchema.safeParse({ firstName: "", lastName: "" });
    expect(result.success).toBe(false);
  });

  it("accepte un client minimal valide", () => {
    const result = clientSchema.safeParse({ firstName: "Jean", lastName: "Baptiste" });
    expect(result.success).toBe(true);
  });
});

describe("orderSchema", () => {
  it("rejette un montant negatif", () => {
    const result = orderSchema.safeParse({ clientId: "11111111-1111-1111-1111-111111111111", amount: -10 });
    expect(result.success).toBe(false);
  });
});

describe("paymentSchema", () => {
  it("exige un montant strictement positif", () => {
    const result = paymentSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      amount: 0,
      method: "CASH",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une methode de paiement inconnue", () => {
    const result = paymentSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      amount: 100,
      method: "BITCOIN",
    });
    expect(result.success).toBe(false);
  });
});
