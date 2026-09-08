import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, requireRole, AuthError } from "@odthan/auth";
import { commissionUpdateSchema } from "@odthan/validation";
import { notify } from "@odthan/notifications";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  try {
    requireRole(user, "ADMIN", "SUPER_ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    throw e;
  }

  const commissions = await prisma.commission.findMany({
    orderBy: { createdAt: "desc" },
    include: { affiliate: { include: { user: { include: { profile: true } } } }, lead: { include: { vehicle: true } } },
  });

  return NextResponse.json({ commissions });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const admin = await getSessionUser(token);
  try {
    requireRole(admin, "ADMIN", "SUPER_ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    throw e;
  }

  const body = await req.json().catch(() => null);
  const parsed = commissionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const commission = await prisma.commission.update({
    where: { id: parsed.data.commissionId },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "PAID" ? new Date() : undefined,
    },
    include: { affiliate: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin!.id,
      action: "UPDATE_COMMISSION_STATUS",
      resource: "Commission",
      resourceId: commission.id,
      metadata: { newStatus: parsed.data.status },
    },
  });

  await notify({
    userId: commission.affiliate.userId,
    event: "NEW_COMMISSION",
    title: "Mise à jour de commission",
    body: `Votre commission de ${commission.amount} ${commission.currency} est maintenant : ${parsed.data.status}.`,
    channels: ["IN_APP"],
  });

  return NextResponse.json({ success: true, commission });
}
