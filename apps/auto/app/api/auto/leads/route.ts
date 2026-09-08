import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, checkRateLimit } from "@odthan/auth";
import { autoLeadSchema } from "@odthan/validation";
import { notify } from "@odthan/notifications";
import { AFFILIATE_COOKIE_NAME } from "@odthan/tracking";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`auto-lead:${ip}`, { max: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = autoLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);

  // Le code affilié vient soit du body, soit du cookie de tracking posé lors du clic.
  const affiliateCode = parsed.data.affiliateCode ?? req.cookies.get(AFFILIATE_COOKIE_NAME)?.value;

  let affiliateId: string | undefined;
  if (affiliateCode) {
    const affiliate = await prisma.affiliate.findUnique({ where: { code: affiliateCode } });
    if (affiliate?.active) affiliateId = affiliate.id;
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
  if (!vehicle || !vehicle.active) {
    return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
  }

  const lead = await prisma.autoLead.create({
    data: {
      userId: user?.id,
      affiliateId,
      vehicleId: parsed.data.vehicleId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message,
      status: "NEW",
    },
  });

  if (user) {
    await notify({
      userId: user.id,
      event: "NEW_AUTO_LEAD",
      title: "Votre demande a été envoyée",
      body: `Votre demande pour ${vehicle.name} a bien été reçue.`,
      channels: ["IN_APP"],
    });
  }

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
}
