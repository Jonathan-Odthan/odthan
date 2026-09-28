"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { taskSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type FormState = { error?: string } | null;

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("tasks.create");
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    assigneeId: formData.get("assigneeId") || "",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || "",
    orderId: formData.get("orderId") || "",
    clientId: formData.get("clientId") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const { assigneeId, dueDate, orderId, clientId, ...data } = parsed.data;

  const task = await prisma.task.create({
    data: {
      ...data,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      orderId: orderId || undefined,
      clientId: clientId || undefined,
    },
  });

  if (assigneeId) {
    await prisma.notification.create({
      data: { profileId: assigneeId, type: "TASK_ASSIGNED", title: "Nouvelle tache assignee", body: task.title, link: "/admin/taches" },
    });
  }

  await logAudit({ profileId: profile?.id, action: "CREATE_TASK", module: "tasks", targetId: task.id });
  revalidatePath("/admin/taches");
  redirect("/admin/taches");
}

const statusSchema = z.object({ status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]) });

export async function updateTaskStatusAction(taskId: string, nextStatus: string) {
  await requirePermission("tasks.update");
  const parsed = statusSchema.safeParse({ status: nextStatus });
  if (!parsed.success) return;
  const profile = await getCurrentProfile();
  await prisma.task.update({ where: { id: taskId }, data: { status: parsed.data.status } });
  await logAudit({ profileId: profile?.id, action: "UPDATE_TASK", module: "tasks", targetId: taskId, metadata: { status: parsed.data.status } });
  revalidatePath("/admin/taches");
}
