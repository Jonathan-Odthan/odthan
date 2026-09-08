import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@odthan/auth";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  COMPLETED: "text-green-400",
  FAILED: "text-red-400",
  REFUNDED: "text-[#A0A0A0]",
};

export default async function PaymentsPage() {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("https://www.odthan.com/connexion");

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { invoice: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold text-white">Mes paiements</h1>

      {payments.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucun paiement pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">
                  {Number(p.amount).toLocaleString()} {p.currency} — {p.provider}
                </p>
                <p className="text-xs text-[#A0A0A0]">{p.createdAt.toLocaleDateString("fr-FR")}</p>
              </div>
              <span className={`text-sm font-semibold ${STATUS_COLORS[p.status]}`}>{p.status}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
