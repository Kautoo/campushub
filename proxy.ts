import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Gates /dashboard/** using the Auth.js JWT session cookie (optimistic check
 * only — no DB in the proxy). Unauthenticated dashboard visits redirect to
 * /login?next=<path>; logged-in users are redirected away from /login and
 * /register.
 */
const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Without DATABASE_URL there is no auth backend: let dashboard requests
  // through so pages render their honest setup notices (degradation contract).
  const unconfigured = !process.env.DATABASE_URL;

  const token = unconfigured
    ? null
    : (await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        cookieName: SECURE_SESSION_COOKIE,
      })) ??
      (await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        cookieName: SESSION_COOKIE,
      }));

  const signedIn = Boolean(token?.sub);

  if (!unconfigured && pathname.startsWith("/dashboard") && !signedIn) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.search = "";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }
  if (!unconfigured && (pathname === "/login" || pathname === "/register") && signedIn) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
