require("dotenv").config();
const db = require("../lib/db");
const { PERMISSIONS_CATALOG, ROLE_DEFAULTS } = require("../lib/permissions-catalog");

async function main() {
  console.log("Seed: permissions...");
  for (const p of PERMISSIONS_CATALOG) {
    await db.query(
      `INSERT INTO permissions (key, module, label) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO UPDATE SET module = $2, label = $3`,
      [p.key, p.module, p.label]
    );
  }

  console.log("Seed: roles...");
  await db.query(
    `INSERT INTO roles (name, label, description) VALUES ('SUPER_ADMIN','Super Administrateur','Acces complet et implicite a tous les modules.')
     ON CONFLICT (name) DO NOTHING`
  );

  for (const roleDef of ROLE_DEFAULTS) {
    const { rows } = await db.query(
      `INSERT INTO roles (name, label) VALUES ($1,$2)
       ON CONFLICT (name) DO UPDATE SET label = $2 RETURNING id`,
      [roleDef.name, roleDef.label]
    );
    const roleId = rows[0].id;
    await db.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
    const { rows: perms } = await db.query(
      `SELECT id FROM permissions WHERE key = ANY($1::text[])`,
      [roleDef.permissions]
    );
    for (const perm of perms) {
      await db.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [roleId, perm.id]
      );
    }
  }

  console.log("Seed: categorie et services de base...");
  const { rows: catRows } = await db.query(
    `INSERT INTO service_categories (name) VALUES ('Creation d''entreprise')
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`
  );
  const categoryId = catRows[0].id;

  const baseServices = [
    "Creation d'entreprise de zero", "Creation de site web", "Boutique en ligne",
    "Creation de page Facebook", "Creation de page Instagram", "Google Business Profile",
    "SEO / referencement", "Identite visuelle", "Nom de domaine",
    "Reservation / enregistrement du nom commercial",
  ];
  for (const name of baseServices) {
    const { rows: existing } = await db.query(`SELECT id FROM services WHERE name = $1`, [name]);
    if (existing.length === 0) {
      await db.query(
        `INSERT INTO services (name, price, category_id, status) VALUES ($1, 0, $2, 'ACTIVE')`,
        [name, categoryId]
      );
    }
  }

  console.log("Seed termine. Aucun compte cree ici : utilise `npm run create-super-admin`.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
