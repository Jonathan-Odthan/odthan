import { z } from "zod";

/**
 * ODTHAN — Schémas de validation partagés.
 * Toute donnée entrante côté serveur DOIT être validée ici avant traitement.
 * Ne jamais faire confiance aux données envoyées par le navigateur.
 */

// ---------- Authentification ----------

export const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
  firstName: z.string().min(1, "Prénom requis").max(80),
  lastName: z.string().min(1, "Nom requis").max(80),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Numéro de téléphone invalide")
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Mot de passe requis"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- ODTHAN BUSINESS — Wizard création d'entreprise ----------

export const businessProjectSchema = z.object({
  ideaTitle: z.string().min(3).max(200),
  sector: z.string().min(2).max(100),
  desiredName: z.string().min(2).max(120),
  founderInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    idNumber: z.string().optional(),
    country: z.string().min(2),
  }),
  companyInfo: z
    .object({
      legalForm: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  serviceIds: z.array(z.string().cuid()).min(1, "Sélectionnez au moins un service"),
  budgetRange: z.enum(["<500", "500-2000", "2000-5000", "5000+"]),
  contactPhone: z.string().regex(/^\+?[0-9\s-]{7,20}$/),
  contactEmail: z.string().email(),
});
export type BusinessProjectInput = z.infer<typeof businessProjectSchema>;

export const businessProjectStatusUpdateSchema = z.object({
  projectId: z.string().cuid(),
  status: z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  progress: z.number().int().min(0).max(100).optional(),
});

// ---------- ODTHAN AUTO — Recherche véhicule ----------

export const vehicleSearchSchema = z.object({
  brandSlug: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.coerce.number().int().min(1980).optional(),
  yearMax: z.coerce.number().int().max(2100).optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  mileageMax: z.coerce.number().nonnegative().optional(),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  bodyType: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "recent"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
});
export type VehicleSearchInput = z.infer<typeof vehicleSearchSchema>;

// ---------- ODTHAN AUTO — Lead ----------

export const autoLeadSchema = z.object({
  vehicleId: z.string().cuid(),
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^\+?[0-9\s-]{7,20}$/),
  email: z.string().email().optional(),
  message: z.string().max(1000).optional(),
  affiliateCode: z.string().regex(/^[A-Z0-9-]{4,40}$/).optional(),
});
export type AutoLeadInput = z.infer<typeof autoLeadSchema>;

// ---------- ODTHAN AUTO — Tracking affilié ----------

export const affiliateClickSchema = z.object({
  affiliateCode: z.string().regex(/^[A-Z0-9-]{4,40}$/),
  vehicleId: z.string().cuid().optional(),
  sessionId: z.string().min(8).max(128),
});
export type AffiliateClickInput = z.infer<typeof affiliateClickSchema>;

export const commissionUpdateSchema = z.object({
  commissionId: z.string().cuid(),
  status: z.enum(["PENDING", "APPROVED", "PAID", "REJECTED"]),
});

// ---------- ODTHAN INVESTIR ----------

export const investmentRequestSchema = z.object({
  opportunityId: z.string().cuid(),
  amount: z.coerce.number().positive("Le montant doit être positif"),
  currency: z.enum(["USD", "HTG", "DOP"]).default("USD"),
});
export type InvestmentRequestInput = z.infer<typeof investmentRequestSchema>;

export const investmentCalculatorSchema = z.object({
  amount: z.coerce.number().positive(),
  termMonths: z.coerce.number().int().positive().max(120),
});
export type InvestmentCalculatorInput = z.infer<typeof investmentCalculatorSchema>;

// ---------- Contact / Messages ----------

export const contactRequestSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(5).max(2000),
});
export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

// ---------- Upload de fichiers ----------

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
});
export type FileUploadInput = z.infer<typeof fileUploadSchema>;

// ---------- Admin ----------

export const vehicleAdminSchema = z.object({
  brandId: z.string().cuid(),
  name: z.string().min(1).max(150),
  year: z.coerce.number().int().min(1980).max(2100),
  price: z.coerce.number().positive(),
  currency: z.enum(["USD", "HTG", "DOP"]).default("USD"),
  mileage: z.coerce.number().int().nonnegative(),
  fuel: z.string().min(2),
  transmission: z.string().min(2),
  bodyType: z.string().min(2),
  location: z.string().min(2),
  country: z.string().min(2),
  description: z.string().min(10).max(4000),
  active: z.boolean().default(true),
});
export type VehicleAdminInput = z.infer<typeof vehicleAdminSchema>;
