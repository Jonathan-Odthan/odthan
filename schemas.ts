import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caracteres minimum"),
});

export const clientSchema = z.object({
  firstName: z.string().min(1, "Prenom requis"),
  lastName: z.string().min(1, "Nom requis"),
  company: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional().or(z.literal("")),
});

export const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const requestSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
});

export const requestStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "APPROVED", "IN_PROGRESS", "WAITING_CLIENT", "COMPLETED", "CANCELLED"]),
  note: z.string().optional().or(z.literal("")),
});

export const orderSchema = z.object({
  clientId: z.string().uuid(),
  requestId: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const paymentSchema = z.object({
  clientId: z.string().uuid(),
  orderId: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().positive(),
  currency: z.string().default("HTG"),
  method: z.enum(["CASH", "BANK_TRANSFER", "MONCASH", "NATCASH", "CARD", "OTHER"]),
  reference: z.string().optional().or(z.literal("")),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().or(z.literal("")),
  orderId: z.string().uuid().optional().or(z.literal("")),
  clientId: z.string().uuid().optional().or(z.literal("")),
});

export const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  roleId: z.string().uuid(),
  password: z.string().min(8).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});
