import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, requireRole, AuthError } from "@odthan/auth";
import { getAffiliateDashboardStats, generateAffiliateCode } from "@odthan/tracking";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);

  try {
    requireRole(user, "AFFILIATE", "ADMIN", "SUPER_ADMIN");
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    throw e;
  }

  const affiliate = await prisma.affiliate.findUnique({ where: { userId: user!.id } });
  if (!affiliate) {
    return NextResponse.json({ error: "Aucun profil affilié trouvé." }, { status: 404 });
  }

  const stats = await getAffiliateDashboardStats(affiliate.id);

  return NextResponse.json({ code: affiliate.code, ...stats });
}

/** Crée le profil affilié de l'utilisateur connecté s'il n'existe pas encore. */
export async function POST(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const existing = await prisma.affiliate.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ code: existing.code });
  }

  const code = await generateAffiliateCode();
  const affiliateRole = await prisma.role.upsert({
    where: { name: "AFFILIATE" },
    update: {},
    create: { name: "AFFILIATE" },
  });

  const affiliate = await prisma.affiliate.create({
    data: { userId: user.id, code },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: affiliateRole.id } },
    update: {},
    create: { userId: user.id, roleId: affiliateRole.id },
  });

  return NextResponse.json({ code: affiliate.code }, { status: 201 });
}
