const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { taskSchema, taskStatusSchema } = require("../../lib/validate-admin");
const { readJsonBody, verifyCsrf, getClientIp } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");
const { logAudit } = require("../../lib/audit");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const guard = await requirePermission(req, res, "tasks.view", sendJson);
      if (guard.error) return;
      const { rows } = await db.query(
        `SELECT t.*, a.first_name as assignee_first_name, a.last_name as assignee_last_name
         FROM tasks t LEFT JOIN admin_profiles a ON a.id = t.assignee_id
         ORDER BY CASE t.status WHEN 'TODO' THEN 0 WHEN 'IN_PROGRESS' THEN 1 ELSE 2 END, t.due_date NULLS LAST`
      );
      return sendJson(res, 200, { tasks: rows });
    }

    if (req.method === "POST") {
      const guard = await requirePermission(req, res, "tasks.create", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });

      const body = await readJsonBody(req);
      const parsed = taskSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });
      const d = parsed.data;

      const { rows } = await db.query(
        `INSERT INTO tasks (title, description, assignee_id, priority, due_date, order_id, client_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [d.title, d.description || null, d.assigneeId || null, d.priority, d.dueDate || null, d.orderId || null, d.clientId || null]
      );

      if (d.assigneeId) {
        await db.query(
          `INSERT INTO notifications (profile_id, type, title, body, link) VALUES ($1,'TASK_ASSIGNED','Nouvelle tâche assignée',$2,'/admin/taches.html')`,
          [d.assigneeId, d.title]
        );
      }

      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "CREATE_TASK", module: "tasks", targetId: rows[0].id, ip: getClientIp(req) });
      return sendJson(res, 200, { ok: true, id: rows[0].id });
    }

    if (req.method === "PUT") {
      const guard = await requirePermission(req, res, "tasks.update", sendJson);
      if (guard.error) return;
      if (!verifyCsrf(req)) return sendJson(res, 403, { error: "CSRF_INVALID" });
      const url = new URL(req.url, "http://internal");
      const id = url.searchParams.get("id");
      const body = await readJsonBody(req);
      const parsed = taskStatusSchema.safeParse(body);
      if (!parsed.success) return sendJson(res, 400, { error: "VALIDATION_ERROR" });

      await db.query(`UPDATE tasks SET status = $1, updated_at = now() WHERE id = $2`, [parsed.data.status, id]);
      await logAudit({ actorType: "admin", actorId: guard.admin.id, action: "UPDATE_TASK", module: "tasks", targetId: id, metadata: { status: parsed.data.status } });
      return sendJson(res, 200, { ok: true });
    }

    return methodNotAllowed(res, ["GET", "POST", "PUT"]);
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
