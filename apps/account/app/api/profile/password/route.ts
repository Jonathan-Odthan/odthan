import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser, hashPassword, verifyPassword, revokeAllSessions, checkRateLimit } from "@odthan/auth";
import { changePasswordSchema } from "../schema";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`change-password:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const valid = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  // Sécurité : toute autre session active est révoquée après un changement de mot de passe.
  await revokeAllSessions(user.id);

  await prisma.auditLog.create({
    data: { userId: user.id, action: "CHANGE_PASSWORD", resource: "User", resourceId: user.id },
  });

  return NextResponse.json({ success: true });
}
