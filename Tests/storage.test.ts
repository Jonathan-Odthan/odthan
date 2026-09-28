import { describe, it, expect } from "vitest";
import { isAllowedUpload } from "@/lib/storage";

describe("isAllowedUpload", () => {
  it("accepte un PDF de taille raisonnable", () => {
    expect(isAllowedUpload("application/pdf", 1_000_000).ok).toBe(true);
  });

  it("refuse un type MIME dangereux (executable)", () => {
    expect(isAllowedUpload("application/x-msdownload", 1_000).ok).toBe(false);
  });

  it("refuse un fichier trop volumineux", () => {
    expect(isAllowedUpload("application/pdf", 20 * 1024 * 1024).ok).toBe(false);
  });
});
