import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { createUserAction } from "@/actions/users";
import UserForm from "../user-form";

export default async function NewUserPage() {
  await requirePermission("users.create");
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Nouvel utilisateur" />
      <UserForm action={createUserAction} roles={roles} submitLabel="Creer l'utilisateur" />
    </div>
  );
}
