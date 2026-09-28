"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type FormState = { error?: string } | null;

const newConversationSchema = z.object({
  subject: z.string().optional().or(z.literal("")),
  clientId: z.string().uuid().optional().or(z.literal("")),
  body: z.string().min(1),
});

export async function createConversationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("messages.send");
  const parsed = newConversationSchema.safeParse({
    subject: formData.get("subject") || "",
    clientId: formData.get("clientId") || "",
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Le message ne peut pas etre vide." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expiree." };

  const conversation = await prisma.conversation.create({
    data: {
      subject: parsed.data.subject || undefined,
      clientId: parsed.data.clientId || undefined,
      participants: { create: { profileId: profile.id } },
      messages: { create: { senderId: profile.id, body: parsed.data.body } },
    },
  });

  revalidatePath("/admin/messages");
  redirect(`/admin/messages/${conversation.id}`);
}

const sendSchema = z.object({ body: z.string().min(1) });

export async function sendMessageAction(conversationId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("messages.send");
  const parsed = sendSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: "Le message ne peut pas etre vide." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expiree." };

  await prisma.message.create({ data: { conversationId, senderId: profile.id, body: parsed.data.body } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  revalidatePath(`/admin/messages/${conversationId}`);
  return null;
}
