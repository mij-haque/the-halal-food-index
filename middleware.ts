import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect all /admin routes except /admin/login
export function middleware(_request: NextRequest) {
  // Auth disabled during development — re-enable before going live
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
