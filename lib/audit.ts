import "server-only";
import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  profileId?: string | null;
  action: string;
  module: string;
  targetId?: string | null;
  ip?: string | null;
  result?: "SUCCESS" | "FAILURE";
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      profileId: params.profileId ?? null,
      action: params.action,
      module: params.module,
      targetId: params.targetId ?? null,
      ip: params.ip ?? null,
      result: params.result ?? "SUCCESS",
      metadata: params.metadata as any,
    },
  });
}
