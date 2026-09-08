import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, checkRateLimit } from "@odthan/auth";
import { businessProjectSchema } from "@odthan/validation";
import { notify } from "@odthan/notifications";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`business-project:${ip}`, { max: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
  }

  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté pour soumettre un projet." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = businessProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { serviceIds, ...data } = parsed.data;

  const project = await prisma.businessProject.create({
    data: {
      userId: user.id,
      ideaTitle: data.ideaTitle,
      sector: data.sector,
      desiredName: data.desiredName,
      founderInfo: data.founderInfo,
      companyInfo: data.companyInfo,
      budgetRange: data.budgetRange,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      status: "SUBMITTED",
      services: { create: serviceIds.map((serviceId) => ({ serviceId })) },
    },
  });

  await notify({
    userId: user.id,
    event: "NEW_BUSINESS_PROJECT",
    title: "Votre projet a été soumis",
    body: `Votre projet "${project.ideaTitle}" est maintenant en cours d'examen.`,
    channels: ["IN_APP", "EMAIL"],
    emailTo: data.contactEmail,
  });

  return NextResponse.json({ success: true, projectId: project.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const projects = await prisma.businessProject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { services: { include: { service: true } } },
  });

  return NextResponse.json({ projects });
}
