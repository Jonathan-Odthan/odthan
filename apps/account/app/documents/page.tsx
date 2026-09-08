import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@odthan/auth";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("https://www.odthan.com/connexion");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">Mes documents</h1>
      <p className="mb-10 text-sm text-[#A0A0A0]">
        Vos documents sont stockés de manière privée. Les liens de téléchargement sont générés
        à la demande et expirent après usage.
      </p>

      {documents.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucun document pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{doc.name}</p>
                <p className="text-xs text-[#A0A0A0]">
                  {(doc.sizeBytes / 1024).toFixed(0)} Ko • {doc.createdAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
              {/* Le téléchargement doit passer par une route API qui génère
                  une URL signée temporaire depuis STORAGE_* — jamais une URL publique permanente. */}
              <a
                href={`/api/documents/${doc.id}/download`}
                className="text-sm text-[#D4AF37] hover:underline"
              >
                Télécharger
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
