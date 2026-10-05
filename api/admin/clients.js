const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { clientSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

const PAGE_SIZE = 20;

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "clients.view", sendJson);
      if (guard.error) return;

      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");

      if (id) {
        const { rows } = await db.query(`SELECT * FROM clients WHERE id = $1`, [id]);
        if (rows.length === 0) return sendJson(res, 404, { error: "NOT_FOUND" });
        const [orders, requests, payments, documents] = await Promise.all([
          db.query(`SELECT id, number, status, amount FROM orders WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10`, [id]),
          db.query(`SELECT r.id, r.number, r.status, s.name as service_name FROM requests r LEFT JOIN services s ON s.id = r.service_id WHERE r.client_id = $1 ORDER BY r.created_at DESC LIMIT 10`, [id]),
          db.query(`SELECT id, number, method, amount, currency FROM payments WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10`, [id]),
          db.query(`SELECT id, name, type FROM documents WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10`, [id]),
        ]);
        return sendJson(res, 200, { client: rows[0], orders: orders.rows, requests: requests.rows, payments: payments.rows, documents: documents.rows });
      }

      const page = Math.max(1, Number(url.searchParams.get("page") || 1));
      const q = url.searchParams.get("q");
      const status = url.searchParams.get("status");

      const conditions = [];
      const params = [];
      if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
      if (q) {
        params.push(`%${q}%`);
        conditions.push(`(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length} OR company ILIKE $${params.length} OR phone ILIKE $${params.length})`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

      const [{ rows: countRows }, { rows }] = await Promise.all([
        db.query(`SELECT count(*) FROM clients ${where}`, params),
        db.query(`SELECT * FROM clients ${where} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`, params),
      ]);

      return sendJson(res, 200, { clients: rows, total: Number(countRows[0].count), page, pageSize: PAGE_SIZE });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const isUpdate = req.method === "PUT";
      const guard = await requirePermission(req, res, isUpdate ? "clients.update" : "clients.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = clientSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR", issues: parsed.error.issues });
      const d = parsed.data;
      const ip = getClientIp(req);

      if (isUpdate) {
        const url = new URL(req.url, "http://internal");
        const id = url.searchParams.get("id");
        if (!id) return sendJson(res, 400, { error: "MISSING_ID" });
        await db.query(
          `UPDATE clients SET first_name=$1,last_name=$2,company=$3,email=$4,phone=$5,whatsapp=$6,address=$7,country=$8,city=$9,status=$10,notes=$11,updated_at=now() WHERE id=$12`,
          [d.firstName, d.lastName, d.company || null, d.email || null, d.phone || null, d.whatsapp || null, d.address || null, d.country || null, d.city || null, d.status, d.notes || null, id]
        );
        await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "UPDATE_CLIENT", module: "clients", targetId: id, ip });
        return sendJson(res, 200, { ok: true });
      }

      const { rows } = await db.query(
        `INSERT INTO clients (first_name,last_name,company,email,phone,whatsapp,address,country,city,status,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [d.firstName, d.lastName, d.company || null, d.email || null, d.phone || null, d.whatsapp || null, d.address || null, d.country || null, d.city || null, d.status, d.notes || null]
      );
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "CREATE_CLIENT", module: "clients", targetId: rows[0].id, ip });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "DELETE") {
      const guard = await requirePermission(req, res, "clients.delete", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      if (!id) return sendJson(res, 400, { error: "MISSING_ID" });
      await db.query(`UPDATE clients SET status = 'INACTIVE', updated_at = now() WHERE id = $1`, [id]);
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "DELETE_CLIENT", module: "clients", targetId: id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT", "DELETE"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
