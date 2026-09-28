import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requirePermission("messages.view");

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { client: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Communication interne — architecture prete pour un chat temps reel Admin <-> Client plus tard"
        action={
          <Link href="/admin/messages/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouvelle conversation
          </Link>
        }
      />

      {conversations.length === 0 ? (
        <EmptyState message="Aucune conversation." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-100">
          {conversations.map((c) => (
            <Link key={c.id} href={`/admin/messages/${c.id}`} className="focus-ring block p-4 hover:bg-odthan-gray/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.subject || (c.client ? `${c.client.firstName} ${c.client.lastName}` : "Conversation")}</p>
                <p className="text-xs text-gray-400">{formatDate(c.updatedAt)}</p>
              </div>
              {c.messages[0] && <p className="text-sm text-gray-500 truncate mt-0.5">{c.messages[0].body}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
