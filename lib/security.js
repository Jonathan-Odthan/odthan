const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify } = require("jose");
const crypto = require("crypto");

const ADMIN_COOKIE = "odthan_admin_session";
const CLIENT_COOKIE = "odthan_client_session";
const CSRF_COOKIE = "odthan_csrf";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h, aligné sur le reste de l'ecosysteme ODTHAN
const CLIENT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 jours

// Cookie partage entre www.odthan.com et business.odthan.com (et tout futur
// sous-domaine) : defini via COOKIE_DOMAIN=".odthan.com" en production.
// En local/preview (pas de vrai domaine), on laisse vide -> cookie sur l'hote exact.
function cookieDomain() {
  return process.env.COOKIE_DOMAIN || "";
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw Object.assign(new Error("JWT_SECRET_NOT_CONFIGURED"), { code: "JWT_SECRET_NOT_CONFIGURED" });
  }
  return new TextEncoder().encode(secret);
}

// ---------- Passwords ----------
async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ---------- JWT ----------
async function signToken(payload, ttlSeconds) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(getSecret());
}
async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

// ---------- Cookies ----------
function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function isHttps(req) {
  return (req.headers["x-forwarded-proto"] || "").includes("https") || process.env.VERCEL === "1";
}

function appendHeader(res, name, value) {
  const existing = res.getHeader(name);
  if (!existing) res.setHeader(name, value);
  else if (Array.isArray(existing)) res.setHeader(name, [...existing, value]);
  else res.setHeader(name, [existing, value]);
}

function setCookie(res, name, value, { maxAge, httpOnly = true, req }) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax"];
  if (httpOnly) parts.push("HttpOnly");
  if (req && isHttps(req)) parts.push("Secure");
  if (cookieDomain()) parts.push(`Domain=${cookieDomain()}`);
  if (typeof maxAge === "number") parts.push(`Max-Age=${maxAge}`);
  appendHeader(res, "Set-Cookie", parts.join("; "));
}

function clearCookie(res, name, req) {
  setCookie(res, name, "", { maxAge: 0, req });
}

// ---------- Sessions admin (equipe Odthan — role + permissions) ----------
async function setAdminSessionCookie(res, req, payload) {
  const token = await signToken(payload, ADMIN_SESSION_TTL_SECONDS);
  setCookie(res, ADMIN_COOKIE, token, { maxAge: ADMIN_SESSION_TTL_SECONDS, httpOnly: true, req });
}
async function getAdminSession(req) {
  const token = parseCookies(req)[ADMIN_COOKIE];
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
function clearAdminSessionCookie(res, req) {
  clearCookie(res, ADMIN_COOKIE, req);
}

// ---------- Sessions client (portail client) ----------
async function setClientSessionCookie(res, req, payload) {
  const token = await signToken(payload, CLIENT_SESSION_TTL_SECONDS);
  setCookie(res, CLIENT_COOKIE, token, { maxAge: CLIENT_SESSION_TTL_SECONDS, httpOnly: true, req });
}
async function getClientSession(req) {
  const token = parseCookies(req)[CLIENT_COOKIE];
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
function clearClientSessionCookie(res, req) {
  clearCookie(res, CLIENT_COOKIE, req);
}

// ---------- CSRF (double-submit cookie) pour toute action admin/client qui modifie des donnees ----------
function issueCsrfToken(res, req) {
  const token = crypto.randomBytes(24).toString("hex");
  setCookie(res, CSRF_COOKIE, token, { maxAge: ADMIN_SESSION_TTL_SECONDS, httpOnly: false, req });
  return token;
}
function verifyCsrf(req) {
  const cookies = parseCookies(req);
  const header = req.headers["x-csrf-token"];
  return Boolean(cookies[CSRF_COOKIE]) && cookies[CSRF_COOKIE] === header;
}

// ---------- Geolocalisation approximative (headers fournis nativement par Vercel, aucun service tiers) ----------
function getGeo(req) {
  return {
    country: req.headers["x-vercel-ip-country"] || null,
    city: req.headers["x-vercel-ip-city"] ? decodeURIComponent(req.headers["x-vercel-ip-city"]) : null,
  };
}

// ---------- Misc ----------
function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
  setAdminSessionCookie,
  getAdminSession,
  clearAdminSessionCookie,
  setClientSessionCookie,
  getClientSession,
  clearClientSessionCookie,
  issueCsrfToken,
  verifyCsrf,
  getGeo,
  getClientIp,
  readJsonBody,
};
