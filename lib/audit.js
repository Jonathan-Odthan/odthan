const db = require("./db");

async function logAudit({ actorType, actorId, action, module, targetId, ip, result, metadata }) {
  await db.query(
    `INSERT INTO audit_logs (actor_type, actor_id, action, module, target_id, ip, result, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [actorType || null, actorId || null, action, module, targetId || null, ip || null, result || "SUCCESS", metadata ? JSON.stringify(metadata) : null]
  );
}

module.exports = { logAudit };
