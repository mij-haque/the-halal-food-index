import { NextResponse, type NextRequest } from "next/server";

/*
 * Admin only. Keeps the sign-in fresh and sends signed-out visitors to the
 * sign-in page. It does not decide what anyone can do: the database does
 * that (RLS + public.is_admin()). See lib/admin/auth.ts.
 */

const ACCESS = "hfi_admin_at";
const REFRESH = "hfi_admin_rt";
const OPEN = ["/admin/login", "/admin/callback", "/admin/logout"];
const cookie = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/admin" };

function expiresSoon(jwt: string | undefined): boolean {
  if (!jwt) return true;
  try {
    const part = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), "=")));
    return typeof exp !== "number" || exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (OPEN.some((p) => pathname.startsWith(p))) return res;

  const access = req.cookies.get(ACCESS)?.value;
  if (!expiresSoon(access)) return res;

  const refresh = req.cookies.get(REFRESH)?.value;
  const toLogin = () => {
    const r = NextResponse.redirect(new URL("/admin/login", req.url));
    r.headers.set("X-Robots-Tag", "noindex, nofollow");
    return r;
  };
  if (!refresh) return toLogin();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return toLogin();
  try {
    const r = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (!r.ok) return toLogin();
    const s = await r.json();
    if (!s?.access_token || !s?.refresh_token) return toLogin();
    // Let this request's server code see the new token, and keep it for next time.
    req.cookies.set(ACCESS, s.access_token);
    const next = NextResponse.next({ request: { headers: req.headers } });
    next.headers.set("X-Robots-Tag", "noindex, nofollow");
    next.cookies.set(ACCESS, s.access_token, { ...cookie, maxAge: 60 * 60 });
    next.cookies.set(REFRESH, s.refresh_token, { ...cookie, maxAge: 60 * 60 * 24 * 30 });
    return next;
  } catch {
    return toLogin();
  }
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
