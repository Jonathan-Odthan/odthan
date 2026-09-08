import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { hashPassword, createSession, checkRateLimit } from "@odthan/auth";
import { registerSchema } from "@odthan/validation";

export async function POST(req: NextRequest) {
  // Limite : 5 inscriptions par IP / heure, contre l'abus automatisé.
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`register:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, firstName, lastName, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Message volontairement générique pour ne pas confirmer l'existence d'un compte.
    return NextResponse.json({ error: "Impossible de créer ce compte." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      profile: { create: { firstName, lastName } },
      roles: { create: { roleId: userRole.id } },
    },
  });

  const session = await createSession({
    userId: user.id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipAddress: ip,
  });

  const response = NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  response.cookies.set("odthan_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });

  return response;
}
