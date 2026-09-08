import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, checkRateLimit } from "@odthan/auth";
import { investmentRequestSchema } from "@odthan/validation";
import { notify } from "@odthan/notifications";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`investment-request:${ip}`, { max: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
  }

  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = investmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const opportunity = await prisma.investmentOpportunity.findUnique({
    where: { id: parsed.data.opportunityId },
  });

  if (!opportunity || !opportunity.active) {
    return NextResponse.json({ error: "Cette opportunité n'est pas disponible." }, { status: 404 });
  }

  if (parsed.data.amount < Number(opportunity.minimum)) {
    return NextResponse.json(
      { error: `Le montant minimum est de ${opportunity.minimum} ${opportunity.currency}.` },
      { status: 400 }
    );
  }

  // IMPORTANT : statut REQUESTED uniquement. Aucune collecte réelle de fonds
  // n'est déclenchée ici — validation manuelle et conformité requises avant activation.
  const investment = await prisma.investment.create({
    data: {
      userId: user.id,
      opportunityId: opportunity.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      status: "REQUESTED",
    },
  });

  await notify({
    userId: user.id,
    event: "STATUS_CHANGE",
    title: "Demande d'investissement reçue",
    body: `Votre demande pour "${opportunity.title}" est en attente d'examen.`,
    channels: ["IN_APP"],
  });

  return NextResponse.json({ success: true, investmentId: investment.id }, { status: 201 });
}
