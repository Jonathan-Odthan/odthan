import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { getSessionUser } from "@odthan/auth";

/**
 * RÈGLE DE SÉCURITÉ :
 * Les documents privés ne sont jamais exposés par une URL publique permanente.
 * Cette route vérifie la propriété du document puis génère une URL signée
 * temporaire depuis le stockage S3-compatible (STORAGE_*), valable quelques minutes.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const document = await prisma.document.findUnique({ where: { id: params.id } });
  if (!document || document.userId !== user.id) {
    // Message générique volontaire : ne pas confirmer l'existence du document à un tiers.
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  if (!process.env.STORAGE_ENDPOINT || !process.env.STORAGE_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Le stockage n'est pas configuré. Renseignez les variables STORAGE_* dans .env." },
      { status: 503 }
    );
  }

  // TODO intégration réelle : générer une URL présignée S3 valable ~5 minutes
  // via le SDK AWS (@aws-sdk/client-s3 + @aws-sdk/s3-request-presigner) en
  // utilisant document.storageKey, STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY.
  return NextResponse.json(
    { error: "Génération d'URL signée à finaliser avec le SDK S3 du fournisseur choisi." },
    { status: 501 }
  );
}
