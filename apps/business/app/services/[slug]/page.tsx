import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@odthan/database";
import { Button } from "@odthan/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await prisma.businessService.findUnique({ where: { slug: params.slug } });
  if (!service) return {};
  return { title: service.name, description: service.description };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await prisma.businessService.findUnique({ where: { slug: params.slug } });

  if (!service || !service.active) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold text-white">{service.name}</h1>
      <p className="mb-8 text-2xl font-bold text-[#D4AF37]">
        {Number(service.price)} {service.currency}
      </p>
      <p className="mb-10 leading-relaxed text-[#A0A0A0]">{service.description}</p>
      <Link href="/creer-mon-entreprise">
        <Button variant="primary">Commencer mon projet</Button>
      </Link>
    </div>
  );
}
