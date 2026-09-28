"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { userSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { revokeAllSessions } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

function parse(formData: FormData) {
  return userSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    roleId: formData.get("roleId"),
    password: formData.get("password") || "",
    status: formData.get("status") || "ACTIVE",
  });
}

export async function createUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("users.create");
  const parsed = parse(formData);
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };
  if (!parsed.data.password || parsed.data.password.length < 8) {
    return { error: "Un mot de passe initial de 8 caracteres minimum est requis." };
  }

  const existing = await prisma.profile.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Un utilisateur avec cet email existe deja." };

  const profile = await getCurrentProfile();
  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.profile.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      roleId: parsed.data.roleId,
      status: parsed.data.status,
      passwordHash,
    },
  });

  await logAudit({ profileId: profile?.id, action: "USER_CREATED", module: "users", targetId: user.id });
  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function updateUserAction(userId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("users.update");
  const parsed = parse(formData);
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const data: Record<string, unknown> = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    roleId: parsed.data.roleId,
    status: parsed.data.status,
  };

  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  await prisma.profile.update({ where: { id: userId }, data });
  await logAudit({ profileId: profile?.id, action: "USER_UPDATED", module: "users", targetId: userId });

  if (parsed.data.status !== "ACTIVE") {
    await revokeAllSessions(userId);
  }

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function deactivateUserAction(userId: string) {
  await requirePermission("users.delete");
  const profile = await getCurrentProfile();
  await prisma.profile.update({ where: { id: userId }, data: { status: "INACTIVE" } });
  await revokeAllSessions(userId);
  await logAudit({ profileId: profile?.id, action: "USER_DEACTIVATED", module: "users", targetId: userId });
  revalidatePath("/admin/utilisateurs");
}
