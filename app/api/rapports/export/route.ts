import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { getSession } from "@/lib/auth/session";
import { resolvePeriod, type PeriodKey } from "@/lib/utils/period";

function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  const allowed = await hasPermission("reports.view");
  if (!allowed) return NextResponse.json({ error: "Acces refuse." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") as PeriodKey) || "30d";
  const { start, end } = resolvePeriod(period, searchParams.get("from") || undefined, searchParams.get("to") || undefined);

  const payments = await prisma.payment.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { client: true, order: true },
    orderBy: { createdAt: "asc" },
  });

  const rows: (string | number)[][] = [
    ["Numero", "Client", "Commande", "Methode", "Montant", "Devise", "Statut", "Date"],
    ...payments.map((p) => [
      p.number,
      `${p.client.firstName} ${p.client.lastName}`,
      p.order?.number || "",
      p.method,
      String(p.amount),
      p.currency,
      p.status,
      p.createdAt.toISOString(),
    ]),
  ];

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rapport-paiements-${period}.csv"`,
    },
  });
}
