import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@odthan/auth";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("https://www.odthan.com/connexion");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold text-white">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucune notification pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.readAt ? "opacity-60" : ""}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <p className="text-sm text-[#A0A0A0]">{n.body}</p>
                </div>
                {!n.readAt && <span className="ml-4 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />}
              </div>
              <p className="mt-2 text-xs text-[#A0A0A0]">{n.createdAt.toLocaleString("fr-FR")}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
