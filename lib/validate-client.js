const { z } = require("zod");

const email = z.string().trim().email().max(180);
const password = z.string().min(8).max(200);

const clientSignupSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password,
  company: z.string().max(500).optional().or(z.literal("")), // honeypot
});

const clientLoginSchema = z.object({ email, password: z.string().min(1).max(200) });

const newRequestSchema = z.object({
  serviceId: z.string().uuid(),
  description: z.string().trim().min(1).max(4000),
});

const newMessageSchema = z.object({ body: z.string().trim().min(1).max(4000) });

module.exports = { clientSignupSchema, clientLoginSchema, newRequestSchema, newMessageSchema };
