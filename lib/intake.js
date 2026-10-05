const db = require("./db");

function generateNumber(prefix) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${ts}-${rand}`;
}

/**
 * Trouve un client existant par email, ou en cree un nouveau. Utilise par les
 * formulaires publics (contact, reservation, kòmanse biznis) pour que chaque
 * soumission apparaisse dans le CRM de l'Admin Center, pas seulement dans sa
 * table d'origine.
 */
async function findOrCreateClient({ name, email, phone, whatsapp, city }) {
  const [firstName, ...rest] = (name || "").trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName || "Client";

  const { rows: existing } = await db.query(`SELECT id FROM clients WHERE email = $1`, [email]);
  if (existing.length > 0) return existing[0].id;

  const { rows } = await db.query(
    `INSERT INTO clients (first_name, last_name, email, phone, whatsapp, city, status)
     VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE') RETURNING id`,
    [firstName || "Client", lastName, email, phone || null, whatsapp || null, city || null]
  );
  return rows[0].id;
}

/**
 * Cree une demande (requests) liee a un client, pour unifier les formulaires
 * publics avec le module Demandes de l'Admin Center.
 */
async function createRequestForClient({ clientId, description, source }) {
  const number = generateNumber("REQ");
  return db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO requests (number, client_id, source, description, status, priority)
       VALUES ($1,$2,$3,$4,'NEW','MEDIUM') RETURNING id`,
      [number, clientId, source, description]
    );
    await client.query(
      `INSERT INTO request_history (request_id, status, note) VALUES ($1,'NEW',$2)`,
      [rows[0].id, "Demande recue depuis le site public"]
    );
    return rows[0].id;
  });
}

module.exports = { findOrCreateClient, createRequestForClient, generateNumber };
