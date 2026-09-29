import { NextRequest, NextResponse } from "next/server";

// Garde-fou de premier niveau : redirige les visiteurs non authentifies loin de /admin.
// Ce n'est PAS le controle d'acces final : chaque page et chaque server action
// verifie de nouveau la session et les permissions cote serveur (voir lib/permissions).
// jwtVerify n'est pas utilise ici car le runtime Edge du middleware ne doit pas
// toucher a Prisma ; on se contente de verifier la presence du cookie de session.

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "odthan_admin_session";

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
