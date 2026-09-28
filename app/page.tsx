import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import { updateUserAction } from "@/actions/users";
import UserForm from "../../user-form";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  await requirePermission("users.update");
  const [user, roles] = await Promise.all([
    prisma.profile.findUnique({ where: { id: params.id } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!user) notFound();

  const action = updateUserAction.bind(null, user.id);

  return (
    <div>
      <PageHeader title={`Modifier ${user.firstName} ${user.lastName}`} />
      <UserForm
        action={action}
        roles={roles}
        submitLabel="Enregistrer"
        passwordOptional
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || "",
          roleId: user.roleId,
          status: user.status,
        }}
      />
    </div>
  );
}
