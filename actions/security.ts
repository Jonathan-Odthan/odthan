"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/security/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type FormState = { error?: string; success?: string } | null;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changeOwnPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expiree." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const valid = await verifyPassword(parsed.data.currentPassword, profile.passwordHash);
  if (!valid) return { error: "Mot de passe actuel incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.profile.update({ where: { id: profile.id }, data: { passwordHash } });
  await logAudit({ profileId: profile.id, action: "UPDATE_PASSWORD", module: "security" });

  return { success: "Mot de passe mis a jour." };
}

export async function revokeSessionAction(sessionId: string) {
  const session = await getSession();
  if (!session) return;
  await prisma.session.updateMany({
    where: { id: sessionId, profileId: session.sub },
    data: { revokedAt: new Date() },
  });
  await logAudit({ profileId: session.sub, action: "SESSION_REVOKED", module: "security", targetId: sessionId });
  revalidatePath("/admin/security");
}
