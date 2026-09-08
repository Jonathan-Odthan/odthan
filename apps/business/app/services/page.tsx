import Link from "next/link";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await prisma.businessService.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-12 text-4xl font-bold text-white">Nos services</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <Link key={s.id} href={`/services/${s.slug}`}>
            <Card className="flex h-full items-center justify-between">
              <div>
                <h2 className="mb-1 font-bold text-[#F1D77A]">{s.name}</h2>
                <p className="text-sm text-[#A0A0A0]">{s.description}</p>
              </div>
              <span className="ml-4 shrink-0 text-lg font-bold text-[#D4AF37]">
                {Number(s.price)} {s.currency}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
