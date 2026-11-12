import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookies } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  clearSessionCookies();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
