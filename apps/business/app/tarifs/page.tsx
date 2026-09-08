import { prisma } from "@odthan/database";
import { Card, Button } from "@odthan/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tarifs" };

export default async function PricingPage() {
  const services = await prisma.businessService.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="mb-4 text-center text-4xl font-bold text-white">Nos tarifs</h1>
      <p className="mb-12 text-center text-[#A0A0A0]">
        Des tarifs transparents, sans frais cachés.
      </p>

      <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/20">
        {services.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center justify-between px-6 py-4 ${i % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#050505]"}`}
          >
            <span className="text-white">{s.name}</span>
            <span className="font-bold text-[#D4AF37]">{Number(s.price)} {s.currency}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/creer-mon-entreprise">
          <Button variant="primary">Démarrer mon projet</Button>
        </Link>
      </div>
    </div>
  );
}
