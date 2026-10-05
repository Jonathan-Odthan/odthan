const { z } = require("zod");

const clientSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

const serviceSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const requestCreateSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
});
const requestStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "APPROVED", "IN_PROGRESS", "WAITING_CLIENT", "COMPLETED", "CANCELLED"]),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

const orderCreateSchema = z.object({
  clientId: z.string().uuid(),
  requestId: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "WAITING_PAYMENT", "WAITING_CLIENT", "COMPLETED", "CANCELLED"]),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

const paymentSchema = z.object({
  clientId: z.string().uuid(),
  orderId: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().positive(),
  currency: z.string().trim().max(10).default("HTG"),
  method: z.enum(["CASH", "BANK_TRANSFER", "MONCASH", "NATCASH", "CARD", "OTHER"]),
  reference: z.string().trim().max(200).optional().or(z.literal("")),
});

const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  orderId: z.string().uuid().optional().or(z.literal("")),
  subtotal: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  dueDate: z.string().optional().or(z.literal("")),
});

const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().or(z.literal("")),
  orderId: z.string().uuid().optional().or(z.literal("")),
  clientId: z.string().uuid().optional().or(z.literal("")),
});
const taskStatusSchema = z.object({ status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]) });

const userSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  roleId: z.string().uuid(),
  password: z.string().min(8).max(200).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  whatsapp: z.string().trim().min(1).max(30),
  site: z.string().trim().url(),
});

module.exports = {
  clientSchema, serviceSchema, requestCreateSchema, requestStatusSchema,
  orderCreateSchema, orderStatusSchema, paymentSchema, invoiceSchema,
  taskSchema, taskStatusSchema, userSchema, settingsSchema,
};
