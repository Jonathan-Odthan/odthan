"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type FormState = { error?: string; success?: string } | null;

const companySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  whatsapp: z.string().min(1),
  site: z.string().url(),
});

export async function updateCompanySettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("settings.update");
  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    site: formData.get("site"),
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  await prisma.setting.upsert({
    where: { key: "company" },
    update: { value: parsed.data },
    create: { key: "company", value: parsed.data },
  });

  await logAudit({ profileId: profile?.id, action: "SETTINGS_UPDATED", module: "settings", metadata: { key: "company" } });
  revalidatePath("/admin/settings");
  return { success: "Parametres de l'entreprise mis a jour." };
}

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().or(z.literal("")),
});

export async function updateOwnProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expiree." };

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  await prisma.profile.update({
    where: { id: profile.id },
    data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, phone: parsed.data.phone || null },
  });

  await logAudit({ profileId: profile.id, action: "UPDATE_PROFILE", module: "settings" });
  revalidatePath("/admin/settings");
  return { success: "Profil mis a jour." };
}
