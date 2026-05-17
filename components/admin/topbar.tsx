"use client";

import { usePathname } from "next/navigation";
import { Bell, Sun, Moon, Monitor, Search } from "lucide-react";
import { useTheme, type Theme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/listings": "Listings",
  "/admin/chains": "Chains",
  "/admin/cuisines": "Cuisines",
  "/admin/areas": "Areas",
  "/admin/jobs": "Pipeline",
  "/admin/apify": "Apify",
  "/admin/settings": "Settings",
};

const THEME_OPTIONS: { value: Theme; Icon: React.FC<{ className?: string }> }[] = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "system", Icon: Monitor },
];

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path + "/")) return title;
  }
  return "Admin";
}

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const title = getPageTitle(pathname);

  return (
    <header className="h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 border-b border-border bg-background shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <h1 className="text-base font-semibold text-foreground tracking-tight truncate">
        {title}
      </h1>

      {/* Search pill — centered */}
      <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full border border-border bg-secondary text-muted-foreground hover:border-emerald-500/30 hover:text-foreground transition-colors">
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search...</span>
        <kbd className="ml-1 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-background border border-border font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Controls */}
      <div className="flex items-center justify-end gap-2">
        {/* Theme toggle */}
        <div className="flex items-center gap-0.5 h-8 rounded-lg border border-border bg-secondary p-0.5">
          {THEME_OPTIONS.map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={value.charAt(0).toUpperCase() + value.slice(1)}
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-md transition-all duration-150",
                theme === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Notification bell */}
        <button className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* User avatar */}
        <div className="h-8 w-8 rounded-full bg-[#0F172A] flex items-center justify-center text-xs font-bold text-white cursor-pointer select-none">
          M
        </div>
      </div>
    </header>
  );
}
