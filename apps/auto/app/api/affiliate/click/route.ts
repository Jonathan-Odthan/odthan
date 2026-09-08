import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, checkRateLimit } from "@odthan/auth";
import { affiliateClickSchema } from "@odthan/validation";
import { recordAffiliateClick, AFFILIATE_COOKIE_NAME, getAffiliateCookieMaxAgeSeconds } from "@odthan/tracking";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`affiliate-click:${ip}`, { max: 60, windowMs: 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = affiliateClickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const token = req.cookies.get("odthan_session")?.value;
  const user = await getSessionUser(token);

  const click = await recordAffiliateClick({
    affiliateCode: parsed.data.affiliateCode,
    vehicleId: parsed.data.vehicleId,
    sessionId: parsed.data.sessionId,
    userId: user?.id,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!click) {
    return NextResponse.json({ error: "Code affilié invalide ou inactif." }, { status: 404 });
  }

  const response = NextResponse.json({ success: true });
  // Le tracking survit à la navigation pendant une durée configurable.
  response.cookies.set(AFFILIATE_COOKIE_NAME, parsed.data.affiliateCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAffiliateCookieMaxAgeSeconds(),
  });

  return response;
}
