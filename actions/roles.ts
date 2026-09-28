"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateRolePermissionsAction(roleId: string, formData: FormData) {
  await requirePermission("roles.update");

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.name === "SUPER_ADMIN") return; // SUPER_ADMIN garde un acces total implicite, non modifiable.

  const allPermissions = await prisma.permission.findMany();
  const selectedKeys = new Set(formData.getAll("permissions").map(String));

  const profile = await getCurrentProfile();

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: allPermissions.filter((p) => selectedKeys.has(p.key)).map((p) => ({ roleId, permissionId: p.id })),
    }),
  ]);

  await logAudit({ profileId: profile?.id, action: "PERMISSION_CHANGED", module: "roles", targetId: roleId, metadata: { count: selectedKeys.size } });
  revalidatePath("/admin/roles");
}
