"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Plus,
  Link2,
  Utensils,
  MapPin,
  Briefcase,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Settings2,
  BarChart2,
  Hash,
  FileText,
  ArrowUpRight,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  exact?: boolean;
};

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "LISTINGS",
    items: [
      { href: "/admin/listings", label: "All Listings", icon: List },
      { href: "/admin/listings?new=1", label: "Add Listing", icon: Plus },
      { href: "/admin/chains", label: "Chains", icon: Link2 },
      { href: "/admin/cuisines", label: "Cuisines", icon: Utensils },
      { href: "/admin/areas", label: "Areas", icon: MapPin },
    ],
  },
  {
    label: "PIPELINE",
    items: [
      { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
      { href: "/admin/apify", label: "Apify", icon: Zap },
    ],
  },
  {
    label: "SEO",
    items: [
      { href: "/admin/seo", label: "Overview", icon: BarChart2, exact: true },
      { href: "/admin/seo/keywords", label: "Keywords", icon: Hash },
      { href: "/admin/seo/pages", label: "Pages", icon: FileText },
      { href: "/admin/seo/redirects", label: "Redirects", icon: ArrowUpRight },
      { href: "/admin/seo/sitemap", label: "Sitemap", icon: Map },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(href: string, pathname: string, exact?: boolean) {
  const path = href.split("?")[0];
  if (exact) return pathname === path;
  return pathname === path || pathname.startsWith(path + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r border-border bg-white dark:bg-[#111111] transition-all duration-200 sticky top-0 h-screen overflow-y-auto",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-border shrink-0",
          collapsed ? "h-14 justify-center px-3" : "h-14 px-5"
        )}
      >
        {collapsed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo-icon.svg"
            alt="HFI"
            style={{ width: "40px", height: "40px" }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.svg"
            alt="Halal Food Index"
            style={{ width: "160px", height: "auto" }}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {NAV.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <div className="px-4 pt-4 pb-1">
                <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                  {section.label}
                </span>
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href, pathname, item.exact);
              return (
                <div key={item.href} className="relative">
                  {active && !collapsed && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0F172A] dark:bg-white rounded-r-full" />
                  )}
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center mx-2 rounded-lg transition-colors duration-150",
                      collapsed
                        ? "h-10 w-10 mx-auto justify-center"
                        : "gap-3 px-3 py-3",
                      active
                        ? "bg-[#0F172A] dark:bg-white/10 text-white dark:text-white"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")}
                    />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-3 p-3">
            <div className="h-7 w-7 rounded-full bg-[#0F172A] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              M
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">Mij</div>
              <div className="text-[10px] text-muted-foreground truncate">Admin</div>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={toggle}
          className="flex items-center justify-center w-full h-9 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border-t border-border text-xs gap-1"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
