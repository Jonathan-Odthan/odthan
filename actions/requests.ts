"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { requestSchema, requestStatusSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { generateNumber } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("requests.create");
  const parsed = requestSchema.safeParse({
    clientId: formData.get("clientId"),
    serviceId: formData.get("serviceId"),
    description: formData.get("description") || "",
    priority: formData.get("priority") || "MEDIUM",
    assigneeId: formData.get("assigneeId") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const { assigneeId, ...data } = parsed.data;

  const request = await prisma.request.create({
    data: {
      ...data,
      number: generateNumber("REQ"),
      assigneeId: assigneeId || undefined,
      history: { create: { status: "NEW", note: "Demande creee" } },
    },
  });

  await logAudit({ profileId: profile?.id, action: "CREATE_REQUEST", module: "requests", targetId: request.id });
  revalidatePath("/admin/demandes");
  redirect(`/admin/demandes/${request.id}`);
}

export async function updateRequestStatusAction(requestId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("requests.update");
  const parsed = requestStatusSchema.safeParse({
    status: formData.get("status"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) return { error: "Statut invalide." };

  const profile = await getCurrentProfile();
  await prisma.$transaction([
    prisma.request.update({ where: { id: requestId }, data: { status: parsed.data.status } }),
    prisma.requestHistory.create({ data: { requestId, status: parsed.data.status, note: parsed.data.note || null } }),
  ]);

  await logAudit({ profileId: profile?.id, action: "UPDATE_REQUEST", module: "requests", targetId: requestId, metadata: { status: parsed.data.status } });
  revalidatePath(`/admin/demandes/${requestId}`);
  revalidatePath("/admin/demandes");
  return null;
}
