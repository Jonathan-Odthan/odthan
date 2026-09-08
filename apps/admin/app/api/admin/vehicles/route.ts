import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, requireRole, AuthError } from "@odthan/auth";
import { vehicleAdminSchema } from "@odthan/validation";

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

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: true },
  });

  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    throw e;
  }

  const body = await req.json().catch(() => null);
  const parsed = vehicleAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const slug = `${parsed.data.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

  const vehicle = await prisma.vehicle.create({
    data: { ...parsed.data, slug },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      resource: "Vehicle",
      resourceId: vehicle.id,
    },
  });

  return NextResponse.json({ success: true, vehicle }, { status: 201 });
}
