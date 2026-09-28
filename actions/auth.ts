"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { rateLimit } from "@/lib/security/rate-limit";
import crypto from "crypto";

export type FormState = { error?: string; success?: string } | null;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!allowed) {
    return { error: "Trop de tentatives. Reessayez dans quelques minutes." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide." };
  }

  const { email, password } = parsed.data;
  const profile = await prisma.profile.findUnique({ where: { email }, include: { role: true } });

  if (!profile || !(await verifyPassword(password, profile.passwordHash))) {
    await logAudit({ action: "LOGIN", module: "auth", ip, result: "FAILURE", metadata: { email } });
    return { error: "Identifiants incorrects." };
  }

  if (profile.status !== "ACTIVE") {
    await logAudit({ profileId: profile.id, action: "LOGIN", module: "auth", ip, result: "FAILURE", metadata: { reason: "inactive" } });
    return { error: "Ce compte est desactive. Contactez un administrateur." };
  }

  await createSession(profile.id, profile.role.name, { ip, userAgent: headers().get("user-agent") ?? undefined });
  await prisma.profile.update({ where: { id: profile.id }, data: { lastLoginAt: new Date() } });
  await logAudit({ profileId: profile.id, action: "LOGIN", module: "auth", ip, result: "SUCCESS" });

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const session = await getSession();
  await destroySession();
  if (session) {
    await logAudit({ profileId: session.sub, action: "LOGOUT", module: "auth" });
  }
  redirect("/login");
}

const forgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) return { error: "Trop de demandes. Reessayez plus tard." };

  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Email invalide." };

  const profile = await prisma.profile.findUnique({ where: { email: parsed.data.email } });

  // Reponse identique que le compte existe ou non, pour ne pas reveler les emails valides.
  if (profile) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await prisma.passwordResetToken.create({
      data: { email: profile.email, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    // Envoi d'email non configure dans ce depot : brancher un fournisseur (ex. Resend, SES)
    // dans lib/ et appeler l'envoi ici. En attendant, le lien est journalise cote serveur pour les tests locaux.
    console.info(`[dev] Lien de reinitialisation pour ${profile.email}: /reset-password?token=${rawToken}`);
  }

  return { success: "Si ce compte existe, un lien de reinitialisation a ete envoye." };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Requete invalide." };

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "Lien invalide ou expire. Demandez un nouveau lien." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.profile.update({ where: { email: record.email }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return { success: "Mot de passe mis a jour. Vous pouvez vous connecter." };
}
