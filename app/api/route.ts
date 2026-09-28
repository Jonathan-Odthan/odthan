import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { readUpload } from "@/lib/storage";
import { getSession } from "@/lib/auth/session";

// Route protegee : verifie la session ET la permission avant de streamer le fichier.
// Les documents ne sont jamais accessibles via une URL statique publique.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifie." }, { status: 401 });

  const allowed = await hasPermission("documents.view");
  if (!allowed) return NextResponse.json({ error: "Acces refuse." }, { status: 403 });

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  try {
    const buffer = await readUpload(doc.storageKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${doc.name.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable sur le stockage." }, { status: 404 });
  }
}
