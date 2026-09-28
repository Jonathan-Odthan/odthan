import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { createConversationAction } from "@/actions/messages";
import NewConversationForm from "./new-conversation-form";

export default async function NewConversationPage() {
  await requirePermission("messages.send");
  const clients = await prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } });

  return (
    <div>
      <PageHeader title="Nouvelle conversation" />
      <NewConversationForm action={createConversationAction} clients={clients} />
    </div>
  );
}
