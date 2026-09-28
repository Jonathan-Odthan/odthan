import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils/format";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notifications";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${notifications.length} notification(s)`}
        action={
          hasUnread && (
            <form action={markAllNotificationsReadAction}>
              <button className="focus-ring text-sm rounded-lg border border-gray-200 bg-white px-4 py-2">Tout marquer comme lu</button>
            </form>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState message="Aucune notification pour le moment." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-100">
          {notifications.map((n) => (
            <div key={n.id} className={cn("p-4 flex items-start justify-between gap-4", !n.readAt && "bg-red-50/40")}>
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.readAt && (
                <form action={markNotificationReadAction.bind(null, n.id)}>
                  <button className="focus-ring text-xs text-odthan-red font-medium shrink-0">Marquer comme lu</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
