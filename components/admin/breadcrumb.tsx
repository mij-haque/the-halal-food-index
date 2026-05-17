"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Admin",
  listings: "Listings",
  chains: "Chains",
  jobs: "Pipeline",
  settings: "Settings",
  cuisines: "Cuisines",
  areas: "Areas",
  apify: "Apify",
  login: "Login",
  seo: "SEO",
  keywords: "Keywords",
  pages: "Pages",
  redirects: "Redirects",
  sitemap: "Sitemap",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-6 py-2 border-b border-border bg-background text-xs text-muted-foreground shrink-0"
    >
      {crumbs.map(({ href, label, isLast }, i) => (
        <div key={href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
          {isLast ? (
            <span className="text-foreground font-medium">{label}</span>
          ) : (
            <Link href={href} className="hover:text-foreground transition-colors">
              {label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
