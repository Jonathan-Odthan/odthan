import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "odthan_admin_session";
const MAX_AGE_HOURS = Number(process.env.SESSION_MAX_AGE_HOURS || 12);

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET manquant ou trop court. Configure une valeur forte dans .env avant de demarrer l'application."
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  sid: string;
  role: string;
};

export async function createSession(profileId: string, role: string, meta: { ip?: string; userAgent?: string }) {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + MAX_AGE_HOURS * 60 * 60 * 1000);

  const token = await new SignJWT({ sub: profileId, sid: sessionId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.session.create({
    data: {
      id: sessionId,
      profileId,
      tokenHash,
      expiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sid = payload.sid as string;
    const session = await prisma.session.findUnique({ where: { id: sid } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
    return { sub: payload.sub as string, sid, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;
  return prisma.profile.findUnique({
    where: { id: session.sub },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
}

export async function destroySession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      await prisma.session
        .update({ where: { id: payload.sid as string }, data: { revokedAt: new Date() } })
        .catch(() => {});
    } catch {
      // token deja invalide
    }
  }
  cookies().delete(COOKIE_NAME);
}

export async function revokeAllSessions(profileId: string) {
  await prisma.session.updateMany({
    where: { profileId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
