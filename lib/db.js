const { Pool } = require("pg");

let pool = null;

function isConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isConfigured()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Hosted Postgres providers (Vercel Postgres, Neon, Supabase) require SSL.
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) {
    const err = new Error("DATABASE_NOT_CONFIGURED");
    err.code = "DATABASE_NOT_CONFIGURED";
    throw err;
  }
  return p.query(text, params);
}

/**
 * Execute plusieurs requetes dans une vraie transaction. pool.query() attribue
 * une connexion differente a chaque appel, donc BEGIN/COMMIT via query()
 * n'aurait aucun effet reel sur les requetes suivantes — on doit garder le
 * MEME client du pool pour toute la duree de la transaction.
 * Usage: await withTransaction(async (client) => { await client.query(...); });
 */
async function withTransaction(fn) {
  const p = getPool();
  if (!p) {
    const err = new Error("DATABASE_NOT_CONFIGURED");
    err.code = "DATABASE_NOT_CONFIGURED";
    throw err;
  }
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getPool, query, withTransaction, isConfigured };
