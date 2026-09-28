"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(notificationId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return;
  await prisma.notification.updateMany({
    where: { id: notificationId, profileId: profile.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsReadAction() {
  const profile = await getCurrentProfile();
  if (!profile) return;
  await prisma.notification.updateMany({
    where: { profileId: profile.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/admin/notifications");
}
