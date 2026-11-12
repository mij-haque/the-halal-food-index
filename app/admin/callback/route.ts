import { NextResponse, type NextRequest } from "next/server";
import { authClient, setSessionCookies } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/** The sign-in link lands here: swap the one-time code for a session. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const fail = NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  if (!code) return fail;
  const { data, error } = await authClient().auth.exchangeCodeForSession(code);
  if (error || !data.session) return fail;
  setSessionCookies(data.session.access_token, data.session.refresh_token);
  return NextResponse.redirect(new URL("/admin", req.url));
}
