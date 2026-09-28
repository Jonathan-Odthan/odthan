"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { isAllowedUpload, saveUpload } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type FormState = { error?: string } | null;

const metaSchema = z.object({
  type: z.enum(["CLIENT", "COMPANY", "CONTRACT", "INVOICE", "WORK_FILE", "FINAL_DELIVERABLE"]),
  clientId: z.string().uuid().optional().or(z.literal("")),
  orderId: z.string().uuid().optional().or(z.literal("")),
  isPrivate: z.string().optional(),
});

export async function uploadDocumentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("documents.upload");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selectionnez un fichier." };

  const parsed = metaSchema.safeParse({
    type: formData.get("type"),
    clientId: formData.get("clientId") || "",
    orderId: formData.get("orderId") || "",
    isPrivate: formData.get("isPrivate") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const check = isAllowedUpload(file.type, file.size);
  if (!check.ok) return { error: check.reason };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expiree." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const { storageKey } = await saveUpload(buffer, file.name);

  const doc = await prisma.document.create({
    data: {
      name: file.name,
      type: parsed.data.type,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
      clientId: parsed.data.clientId || undefined,
      orderId: parsed.data.orderId || undefined,
      uploadedById: profile.id,
      isPrivate: parsed.data.isPrivate === "on",
    },
  });

  await logAudit({ profileId: profile.id, action: "DOCUMENT_UPLOADED", module: "documents", targetId: doc.id });
  revalidatePath("/admin/documents");
  redirect("/admin/documents");
}

export async function deleteDocumentAction(documentId: string) {
  await requirePermission("documents.delete");
  const profile = await getCurrentProfile();
  await prisma.document.delete({ where: { id: documentId } });
  await logAudit({ profileId: profile?.id, action: "DOCUMENT_DELETED", module: "documents", targetId: documentId });
  revalidatePath("/admin/documents");
}
