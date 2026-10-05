const Busboy = require("busboy");
const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { verifyCsrf, getClientIp } = require("../../lib/security");
const { isAllowedUpload, saveUpload } = require("../../lib/storage");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

const VALID_TYPES = ["CLIENT", "COMPANY", "CONTRACT", "INVOICE", "WORK_FILE", "FINAL_DELIVERABLE"];

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: 15 * 1024 * 1024, files: 1 } });
    const fields = {};
    let fileBuffer = null;
    let fileInfo = null;
    let tooLarge = false;

    bb.on("field", (name, val) => { fields[name] = val; });
    bb.on("file", (_name, stream, info) => {
      const chunks = [];
      stream.on("data", (d) => chunks.push(d));
      stream.on("limit", () => { tooLarge = true; });
      stream.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
        fileInfo = info;
      });
    });
    bb.on("error", reject);
    bb.on("close", () => resolve({ fields, fileBuffer, fileInfo, tooLarge }));
    req.pipe(bb);
  });
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "documents.view", sendJson);
      if (guard.error) return;
      const { rows } = await db.query(
        `SELECT d.id, d.name, d.type, d.mime_type, d.size_bytes, d.created_at,
                c.first_name, c.last_name, o.number as order_number, a.first_name as uploaded_first_name
         FROM documents d LEFT JOIN clients c ON c.id = d.client_id LEFT JOIN orders o ON o.id = d.order_id
         LEFT JOIN admin_profiles a ON a.id = d.uploaded_by_id
         ORDER BY d.created_at DESC LIMIT 100`
      );
      return sendJson(res, 200, { documents: rows });
    }

    if (req.method === "POST") {
      const guard = await requirePermission(req, res, "documents.upload", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const { fields, fileBuffer, fileInfo, tooLarge } = await parseMultipart(req);
      if (tooLarge) return sendJson(res, 400, { error: "FILE_TOO_LARGE", message: "Fichier trop volumineux (15 Mo max)." });
      if (!fileBuffer || !fileInfo) return sendJson(res, 400, { error: "NO_FILE", message: "Sélectionnez un fichier." });
      if (!VALID_TYPES.includes(fields.type)) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      const check = isAllowedUpload(fileInfo.mimeType, fileBuffer.length);
      if (!check.ok) return sendJson(res, 400, { error: "UPLOAD_REJECTED", message: check.reason });

      let storageKey;
      try {
        storageKey = await saveUpload(fileBuffer, fileInfo.filename);
      } catch (e) {
        if (e.code === "STORAGE_NOT_CONFIGURED") {
          return sendJson(res, 503, { error: "STORAGE_NOT_CONFIGURED", message: "Stockage S3 non configuré. Renseignez S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY." });
        }
        throw e;
      }

      const { rows } = await db.query(
        `INSERT INTO documents (name, type, mime_type, size_bytes, storage_key, client_id, order_id, request_id, uploaded_by_id, is_private)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [fileInfo.filename, fields.type, fileInfo.mimeType, fileBuffer.length, storageKey,
         fields.clientId || null, fields.orderId || null, fields.requestId || null, guard.admin.id, fields.isPrivate !== "false"]
      );
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "DOCUMENT_UPLOADED", module: "documents", targetId: rows[0].id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "DELETE") {
      const guard = await requirePermission(req, res, "documents.delete", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      await db.query(`DELETE FROM documents WHERE id = $1`, [id]);
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "DOCUMENT_DELETED", module: "documents", targetId: id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "DELETE"]);
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
