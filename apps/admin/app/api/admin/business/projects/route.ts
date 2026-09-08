import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, requireRole, AuthError } from "@odthan/auth";
import { businessProjectStatusUpdateSchema } from "@odthan/validation";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  return requireRole(user, "ADMIN", "SUPER_ADMIN");
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    throw e;
  }

  const projects = await prisma.businessProject.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { include: { profile: true } }, services: { include: { service: true } } },
  });

  return NextResponse.json({ projects });
}

export async function PATCH(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    throw e;
  }

  const body = await req.json().catch(() => null);
  const parsed = businessProjectStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const project = await prisma.businessProject.update({
    where: { id: parsed.data.projectId },
    data: { status: parsed.data.status, progress: parsed.data.progress },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_STATUS",
      resource: "BusinessProject",
      resourceId: project.id,
      metadata: { newStatus: parsed.data.status },
    },
  });

  return NextResponse.json({ success: true, project });
}
