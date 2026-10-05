const db = require("../../lib/db");
const { requirePermission } = require("../../lib/permissions");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

// Listes legeres pour remplir les <select> des formulaires (clients actifs,
// services actifs, membres actifs de l'equipe). Necessite juste une session
// admin valide — pas de permission de module specifique, ce sont des options
// de formulaire, pas des donnees sensibles en elles-memes.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const guard = await requirePermission(req, res, null, sendJson);
    if (guard.error) return;

    const [clients, services, admins, roles, openRequests] = await Promise.all([
      db.query(`SELECT id, first_name, last_name, email FROM clients WHERE status = 'ACTIVE' ORDER BY first_name ASC LIMIT 500`),
      db.query(`SELECT id, name, price FROM services WHERE status = 'ACTIVE' ORDER BY name ASC`),
      db.query(`SELECT id, first_name, last_name FROM admin_profiles WHERE status = 'ACTIVE' ORDER BY first_name ASC`),
      db.query(`SELECT id, name, label FROM roles ORDER BY name ASC`),
      db.query(`SELECT r.id, r.number, c.first_name, c.last_name FROM requests r JOIN clients c ON c.id = r.client_id
                LEFT JOIN orders o ON o.request_id = r.id WHERE o.id IS NULL ORDER BY r.created_at DESC LIMIT 100`),
    ]);

    return sendJson(res, 200, { clients: clients.rows, services: services.rows, admins: admins.rows, roles: roles.rows, openRequests: openRequests.rows });
  } catch (err) {
    return handleError(res, err, "fr");
  }
};
