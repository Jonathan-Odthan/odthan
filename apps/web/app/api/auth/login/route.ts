import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { verifyPassword, createSession, checkRateLimit } from "@odthan/auth";
import { loginSchema } from "@odthan/validation";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`login:${ip}`, { max: 10, windowMs: 15 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Message générique volontaire : ne jamais indiquer si l'email existe.
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const session = await createSession({
    userId: user.id,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipAddress: ip,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("odthan_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });

  return response;
}
