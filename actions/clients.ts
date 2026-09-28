"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { clientSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | null;

function parseClient(formData: FormData) {
  return clientSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    whatsapp: formData.get("whatsapp") || "",
    address: formData.get("address") || "",
    country: formData.get("country") || "",
    city: formData.get("city") || "",
    status: formData.get("status") || "ACTIVE",
    notes: formData.get("notes") || "",
  });
}

export async function createClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("clients.create");
  const parsed = parseClient(formData);
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const client = await prisma.client.create({ data: parsed.data });
  await logAudit({ profileId: profile?.id, action: "CREATE_CLIENT", module: "clients", targetId: client.id });

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${client.id}`);
}

export async function updateClientAction(clientId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("clients.update");
  const parsed = parseClient(formData);
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  await prisma.client.update({ where: { id: clientId }, data: parsed.data });
  await logAudit({ profileId: profile?.id, action: "UPDATE_CLIENT", module: "clients", targetId: clientId });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}`);
}

export async function deactivateClientAction(clientId: string) {
  await requirePermission("clients.delete");
  const profile = await getCurrentProfile();
  await prisma.client.update({ where: { id: clientId }, data: { status: "INACTIVE" } });
  await logAudit({ profileId: profile?.id, action: "DELETE_CLIENT", module: "clients", targetId: clientId, metadata: { mode: "deactivate" } });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}
