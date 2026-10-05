const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { readUpload } = require("../../lib/storage");
const { sendJson, methodNotAllowed } = require("../../lib/respond");

// Route protegee : verifie session + permission avant de streamer le fichier.
// Les documents ne sont JAMAIS accessibles via une URL statique publique.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const guard = await requirePermission(req, res, "documents.view", sendJson);
  if (guard.error) return;

  const url = new URL(req.url, "http://internal");
  const id = url.searchParams.get("id");
  const { rows } = await db.query(`SELECT * FROM documents WHERE id = $1`, [id]);
  if (rows.length === 0) return sendJson(res, 404, { error: "NOT_FOUND" });
  const doc = rows[0];

  try {
    const buffer = await readUpload(doc.storage_key);
    res.statusCode = 200;
    res.setHeader("Content-Type", doc.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${doc.name.replace(/"/g, "")}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.end(buffer);
  } catch (err) {
    if (err.code === "STORAGE_NOT_CONFIGURED") {
      return sendJson(res, 503, { error: "STORAGE_NOT_CONFIGURED", message: "Stockage S3 non configuré." });
    }
    return sendJson(res, 404, { error: "FILE_NOT_FOUND", message: "Fichier introuvable sur le stockage." });
  }
};
