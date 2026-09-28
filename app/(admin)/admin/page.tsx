import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";
import { sendMessageAction } from "@/actions/messages";
import ReplyForm from "./reply-form";
import { cn } from "@/lib/utils/cn";

export default async function ConversationPage({ params }: { params: { id: string } }) {
  await requirePermission("messages.view");
  const profile = await getCurrentProfile();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { client: true, messages: { orderBy: { createdAt: "asc" }, include: { sender: true } } },
  });
  if (!conversation) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={conversation.subject || (conversation.client ? `${conversation.client.firstName} ${conversation.client.lastName}` : "Conversation")} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-3 mb-4 max-h-[60vh] overflow-y-auto">
        {conversation.messages.map((m) => {
          const mine = m.senderId === profile?.id;
          return (
            <div key={m.id} className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", mine ? "ml-auto bg-odthan-black text-white" : "bg-odthan-gray")}>
              <p>{m.body}</p>
              <p className={cn("text-[10px] mt-1", mine ? "text-white/60" : "text-gray-400")}>
                {m.sender.firstName} — {formatDate(m.createdAt)}
              </p>
            </div>
          );
        })}
      </div>

      <ReplyForm action={sendMessageAction.bind(null, conversation.id)} />
      <p className="text-xs text-gray-400 mt-2">
        Messagerie interne sans mise a jour temps reel pour l&apos;instant : rechargez la page pour voir les nouveaux messages.
        Un canal Supabase Realtime ou WebSocket peut etre branche ici plus tard sans changer le schema.
      </p>
    </div>
  );
}
