const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

// STORAGE_DRIVER=local -> disque du serveur (developpement UNIQUEMENT — les
//   fonctions Vercel tournent sur un filesystem en lecture seule, donc ce
//   driver echoue directement en production, pas seulement "ne persiste pas").
// STORAGE_DRIVER=s3    -> stockage objet prive reel (AWS S3 ou compatible :
//   Cloudflare R2, Backblaze B2, DigitalOcean Spaces...). Le bucket doit rester
//   PRIVE : cette app ne genere jamais d'URL publique, elle recupere toujours
//   le fichier cote serveur via GetObjectCommand puis le streame via
//   /api/admin/documents-download apres verification de session + permission.

const ALLOWED_MIME = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

function isAllowedUpload(mimeType, sizeBytes) {
  if (!ALLOWED_MIME.has(mimeType)) return { ok: false, reason: "Type de fichier non autorisé." };
  if (sizeBytes > MAX_SIZE_BYTES) return { ok: false, reason: "Fichier trop volumineux (15 Mo max)." };
  return { ok: true };
}

function getS3Client() {
  const { S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, S3_ENDPOINT } = process.env;
  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw Object.assign(new Error("STORAGE_NOT_CONFIGURED"), { code: "STORAGE_NOT_CONFIGURED" });
  }
  const client = new S3Client({
    region: S3_REGION || "auto",
    endpoint: S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(S3_ENDPOINT),
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });
  return { client, bucket: S3_BUCKET };
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function saveUpload(buffer, originalName) {
  const driver = process.env.STORAGE_DRIVER || "local";
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${crypto.randomUUID()}-${safeName}`;

  if (driver === "s3") {
    const { client, bucket } = getS3Client();
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer }));
    return key;
  }

  const uploadsDir = path.join(process.cwd(), ".private-uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, key), buffer);
  return key;
}

async function readUpload(storageKey) {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "s3") {
    const { client, bucket } = getS3Client();
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: storageKey }));
    return streamToBuffer(result.Body);
  }
  return fs.readFile(path.join(process.cwd(), ".private-uploads", storageKey));
}

module.exports = { isAllowedUpload, saveUpload, readUpload };
