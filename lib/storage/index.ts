import "server-only";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Interface de stockage unique : le reste de l'app ne connait pas le driver actif.
//
// STORAGE_DRIVER=local  -> disque du serveur. Developpement UNIQUEMENT : les fonctions
//   Vercel tournent sur un systeme de fichiers en lecture seule, donc ce driver echoue
//   directement (et non "juste ne persiste pas") des le premier upload en production.
//
// STORAGE_DRIVER=s3     -> vrai stockage objet prive (AWS S3 ou tout service compatible
//   S3 : Cloudflare R2, Backblaze B2, DigitalOcean Spaces...). C'est le driver a utiliser
//   sur Vercel. Le bucket doit rester PRIVE (pas d'acces public) : cette app ne genere
//   jamais d'URL publique pour un document, elle le recupere toujours cote serveur via
//   GetObjectCommand puis le streame via /api/documents/[id]/download, qui vérifie
//   session + permission avant de servir le fichier. C'est ce qui garantit que les
//   documents prives ne sont jamais accessibles publiquement, comme l'exige le cahier
//   des charges — une alternative comme un stockage "objet public a URL longue" ne
//   donnerait qu'une securite par obscurite, pas un vrai controle d'acces.

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 Mo

export function isAllowedUpload(mimeType: string, sizeBytes: number) {
  if (!ALLOWED_MIME.has(mimeType)) return { ok: false, reason: "Type de fichier non autorise." };
  if (sizeBytes > MAX_SIZE_BYTES) return { ok: false, reason: "Fichier trop volumineux (15 Mo max)." };
  return { ok: true as const };
}

function getS3Client() {
  const { S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, S3_ENDPOINT } = process.env;
  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new Error(
      "Stockage S3 non configure : renseigne S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (et S3_REGION / S3_ENDPOINT si besoin) dans les variables d'environnement avant d'utiliser le module Documents en production."
    );
  }

  const client = new S3Client({
    region: S3_REGION || "auto",
    endpoint: S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(S3_ENDPOINT), // requis par la plupart des services compatibles S3 non-AWS
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });

  return { client, bucket: S3_BUCKET };
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function saveUpload(buffer: Buffer, originalName: string): Promise<{ storageKey: string }> {
  const driver = process.env.STORAGE_DRIVER || "local";
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${crypto.randomUUID()}-${safeName}`;

  if (driver === "s3") {
    const { client, bucket } = getS3Client();
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer }));
    return { storageKey: key };
  }

  // IMPORTANT : ce dossier est hors de /public expres. Les documents ne doivent
  // jamais etre servis par un chemin statique public ; ils passent uniquement par
  // la route /api/documents/[id]/download, qui verifie session + permissions
  // avant de streamer le fichier (voir app/api/documents/[id]/download/route.ts).
  const uploadsDir = path.join(process.cwd(), ".private-uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, key), buffer);
  return { storageKey: key };
}

export async function readUpload(storageKey: string): Promise<Buffer> {
  const driver = process.env.STORAGE_DRIVER || "local";

  if (driver === "s3") {
    const { client, bucket } = getS3Client();
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: storageKey }));
    if (!result.Body) throw new Error("Fichier introuvable sur le stockage S3.");
    return streamToBuffer(result.Body);
  }

  const filePath = path.join(process.cwd(), ".private-uploads", storageKey);
  return fs.readFile(filePath);
}
