import { randomBytes } from "crypto";
import { prisma } from "@odthan/database";

const SESSION_DURATION_DAYS = 30;

/**
 * Génère un token de session cryptographiquement sûr et l'enregistre en base.
 * Le cookie doit être posé par la route appelante avec les options :
 * httpOnly: true, secure: true, sameSite: "lax", path: "/"
 */
export async function createSession(params: {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: params.userId,
      token,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiresAt,
    },
  });

  return { token: session.token, expiresAt: session.expiresAt };
}

/**
 * Vérifie un token de session côté serveur et retourne l'utilisateur
 * avec ses rôles. Retourne null si la session est invalide ou expirée.
 * NE JAMAIS faire confiance à un rôle envoyé par le client — toujours
 * revérifier ici.
 */
export async function getSessionUser(token: string | undefined | null) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
          profile: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      // Session expirée : nettoyage.
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  if (!session.user.isActive) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    profile: session.user.profile,
    roles: session.user.roles.map((r) => r.role.name),
  };
}

export async function revokeSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function revokeAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
