import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  businessProjectSchema,
  autoLeadSchema,
  affiliateClickSchema,
  investmentRequestSchema,
  vehicleSearchSchema,
} from "../src/index";

describe("registerSchema", () => {
  it("accepte des données valides", () => {
    const result = registerSchema.safeParse({
      email: "test@odthan.com",
      password: "Abcdefgh12",
      firstName: "Jean",
      lastName: "Dupont",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un mot de passe trop court", () => {
    const result = registerSchema.safeParse({
      email: "test@odthan.com",
      password: "abc123",
      firstName: "Jean",
      lastName: "Dupont",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe sans majuscule", () => {
    const result = registerSchema.safeParse({
      email: "test@odthan.com",
      password: "abcdefgh12",
      firstName: "Jean",
      lastName: "Dupont",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un email invalide", () => {
    const result = registerSchema.safeParse({
      email: "pas-un-email",
      password: "Abcdefgh12",
      firstName: "Jean",
      lastName: "Dupont",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejette un mot de passe vide", () => {
    const result = loginSchema.safeParse({ email: "test@odthan.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("businessProjectSchema", () => {
  const validBase = {
    ideaTitle: "Une boutique en ligne de vêtements",
    sector: "Commerce",
    desiredName: "Mode Élégance",
    founderInfo: { firstName: "Marie", lastName: "Joseph", country: "Haïti" },
    serviceIds: ["clx0000000000000000000001"],
    budgetRange: "500-2000" as const,
    contactPhone: "+509 1234-5678",
    contactEmail: "marie@example.com",
  };

  it("accepte un projet valide", () => {
    expect(businessProjectSchema.safeParse(validBase).success).toBe(true);
  });

  it("rejette un projet sans service sélectionné", () => {
    const result = businessProjectSchema.safeParse({ ...validBase, serviceIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejette un budget hors énumération", () => {
    const result = businessProjectSchema.safeParse({ ...validBase, budgetRange: "1000000" });
    expect(result.success).toBe(false);
  });
});

describe("autoLeadSchema", () => {
  it("accepte un lead sans email (optionnel)", () => {
    const result = autoLeadSchema.safeParse({
      vehicleId: "clx0000000000000000000001",
      name: "Paul",
      phone: "+1 305-555-1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un téléphone invalide", () => {
    const result = autoLeadSchema.safeParse({
      vehicleId: "clx0000000000000000000001",
      name: "Paul",
      phone: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("affiliateClickSchema", () => {
  it("rejette un code affilié au mauvais format", () => {
    const result = affiliateClickSchema.safeParse({
      affiliateCode: "code invalide avec espaces",
      sessionId: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("accepte un code affilié valide", () => {
    const result = affiliateClickSchema.safeParse({
      affiliateCode: "ODTHAN-AUTO-001",
      sessionId: "12345678",
    });
    expect(result.success).toBe(true);
  });
});

describe("investmentRequestSchema", () => {
  it("rejette un montant négatif", () => {
    const result = investmentRequestSchema.safeParse({
      opportunityId: "clx0000000000000000000001",
      amount: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("vehicleSearchSchema", () => {
  it("applique les valeurs par défaut", () => {
    const result = vehicleSearchSchema.parse({});
    expect(result.sort).toBe("recent");
    expect(result.page).toBe(1);
  });
});
