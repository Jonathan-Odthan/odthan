import { prisma } from "@odthan/database";

export default async function AdminVehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: true },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Véhicules</h1>
        <span className="text-sm text-[#A0A0A0]">{vehicles.length} véhicule(s)</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-[#0D0D0D] text-left text-[#A0A0A0]">
            <tr>
              <th className="p-4">Véhicule</th>
              <th className="p-4">Marque</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Année</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-[#D4AF37]/10">
                <td className="p-4 text-white">{v.name}</td>
                <td className="p-4 text-[#A0A0A0]">{v.brand.name}</td>
                <td className="p-4 text-[#D4AF37]">{Number(v.price).toLocaleString()} {v.currency}</td>
                <td className="p-4 text-[#A0A0A0]">{v.year}</td>
                <td className="p-4">
                  <span className={v.active ? "text-green-400" : "text-red-400"}>
                    {v.active ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
