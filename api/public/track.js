const crypto = require("crypto");
const db = require("../../lib/db");
const { checkRateLimit } = require("../../lib/rateLimit");
const { getClientIp, getGeo, getClientSession, readJsonBody } = require("../../lib/security");
const { sendJson, methodNotAllowed, handleError } = require("../../lib/respond");

const VISITOR_COOKIE = "odthan_visitor";

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

// Analytics maison, RGPD-friendly : pas de cookie tiers, pas d'empreinte
// (fingerprinting), pas d'IP stockee. L'identifiant visiteur est un cookie
// non-nominatif de premiere partie ; pays/ville viennent des en-tetes que
// Vercel fournit nativement (pas de service tiers).
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`track:${ip}`, 120, 60); // 120 evenements/min/IP — large pour un vrai visiteur, bloque le spam
    if (!rl.allowed) return sendJson(res, 429, { error: "RATE_LIMITED" });

    const body = await readJsonBody(req);
    const site = body.site === "business" ? "business" : "www";
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "/";
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

    let visitorId = parseCookies(req)[VISITOR_COOKIE];
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
      const parts = [`${VISITOR_COOKIE}=${visitorId}`, "Path=/", "SameSite=Lax", `Max-Age=${60 * 60 * 24 * 365}`];
      if ((req.headers["x-forwarded-proto"] || "").includes("https") || process.env.VERCEL === "1") parts.push("Secure");
      if (process.env.COOKIE_DOMAIN) parts.push(`Domain=${process.env.COOKIE_DOMAIN}`);
      res.setHeader("Set-Cookie", parts.join("; "));
    }

    const geo = getGeo(req);
    const clientSession = await getClientSession(req).catch(() => null);

    let sessionRow;
    if (isNewVisitor) {
      const { rows } = await db.query(
        `INSERT INTO analytics_sessions (visitor_id, client_account_id, country, city, user_agent)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [visitorId, clientSession ? clientSession.sub : null, geo.country, geo.city, (req.headers["user-agent"] || "").slice(0, 300)]
      );
      sessionRow = rows[0];
    } else {
      const { rows } = await db.query(`SELECT id FROM analytics_sessions WHERE visitor_id = $1`, [visitorId]);
      if (rows.length === 0) {
        const inserted = await db.query(
          `INSERT INTO analytics_sessions (visitor_id, client_account_id, country, city, user_agent)
           VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [visitorId, clientSession ? clientSession.sub : null, geo.country, geo.city, (req.headers["user-agent"] || "").slice(0, 300)]
        );
        sessionRow = inserted.rows[0];
      } else {
        sessionRow = rows[0];
        await db.query(
          `UPDATE analytics_sessions SET last_seen_at = now(), client_account_id = COALESCE($2, client_account_id) WHERE id = $1`,
          [sessionRow.id, clientSession ? clientSession.sub : null]
        );
      }
    }

    await db.query(
      `INSERT INTO analytics_events (session_id, site, path, referrer) VALUES ($1,$2,$3,$4)`,
      [sessionRow.id, site, path, referrer]
    );

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    if (err.message === "INVALID_JSON") return sendJson(res, 400, { error: "INVALID_JSON" });
    return handleError(res, err, "fr");
  }
};
