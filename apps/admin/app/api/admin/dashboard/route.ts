import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, requireRole, AuthError } from "@odthan/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);

  try {
    requireRole(user, "ADMIN", "SUPER_ADMIN");
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    throw e;
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    businessProjects,
    autoLeads,
    wonLeads,
    affiliatesCount,
    commissions,
    payments,
    investments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.businessProject.count(),
    prisma.autoLead.count(),
    prisma.autoLead.count({ where: { status: "WON" } }),
    prisma.affiliate.count(),
    prisma.commission.findMany(),
    prisma.payment.findMany({ where: { status: "COMPLETED" } }),
    prisma.investment.count(),
  ]);

  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return NextResponse.json({
    totalUsers,
    newUsers,
    businessProjects,
    autoLeads,
    wonLeads,
    affiliatesCount,
    totalCommissions,
    totalRevenue,
    investments,
  });
}
