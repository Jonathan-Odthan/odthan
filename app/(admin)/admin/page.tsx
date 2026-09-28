import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Link from "next/link";

export const metadata = { title: "Recherche" };

export default async function GlobalSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireAuth();
  const q = searchParams.q?.trim();

  if (!q) {
    return (
      <div>
        <PageHeader title="Recherche" />
        <EmptyState message="Saisissez un terme de recherche dans la barre en haut." />
      </div>
    );
  }

  const [clients, orders, requests, payments, services] = await Promise.all([
    prisma.client.findMany({
      where: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
      take: 10,
    }),
    prisma.order.findMany({ where: { number: { contains: q, mode: "insensitive" } }, take: 10, include: { client: true } }),
    prisma.request.findMany({ where: { number: { contains: q, mode: "insensitive" } }, take: 10, include: { client: true } }),
    prisma.payment.findMany({ where: { number: { contains: q, mode: "insensitive" } }, take: 10, include: { client: true } }),
    prisma.service.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10 }),
  ]);

  const totalResults = clients.length + orders.length + requests.length + payments.length + services.length;

  return (
    <div>
      <PageHeader title={`Resultats pour "${q}"`} description={`${totalResults} resultat(s)`} />

      {totalResults === 0 ? (
        <EmptyState message="Aucun resultat." />
      ) : (
        <div className="space-y-6">
          {clients.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Clients</h2>
              <ul className="text-sm space-y-1">
                {clients.map((c) => <li key={c.id}><Link href={`/admin/clients/${c.id}`} className="hover:text-odthan-red focus-ring">{c.firstName} {c.lastName}</Link></li>)}
              </ul>
            </div>
          )}
          {orders.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Commandes</h2>
              <ul className="text-sm space-y-1">
                {orders.map((o) => <li key={o.id}><Link href={`/admin/commandes/${o.id}`} className="hover:text-odthan-red focus-ring">{o.number} — {o.client.firstName} {o.client.lastName}</Link></li>)}
              </ul>
            </div>
          )}
          {requests.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Demandes</h2>
              <ul className="text-sm space-y-1">
                {requests.map((r) => <li key={r.id}><Link href={`/admin/demandes/${r.id}`} className="hover:text-odthan-red focus-ring">{r.number} — {r.client.firstName} {r.client.lastName}</Link></li>)}
              </ul>
            </div>
          )}
          {payments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Paiements</h2>
              <ul className="text-sm space-y-1">
                {payments.map((p) => <li key={p.id}>{p.number} — {p.client.firstName} {p.client.lastName}</li>)}
              </ul>
            </div>
          )}
          {services.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-2">Services</h2>
              <ul className="text-sm space-y-1">
                {services.map((s) => <li key={s.id}>{s.name}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
