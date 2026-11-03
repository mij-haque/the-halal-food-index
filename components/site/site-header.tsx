"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoLockup } from "@/components/site/seal";
import { BurgerIcon, CircleIcon, CloseIcon, HomeIcon, SearchIcon } from "@/components/site/icons";
import { paletteLinks, primaryNav, urls } from "@/lib/site";

const iconBtn =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-hfi-border bg-hfi-surface text-hfi-t2 transition-colors hover:border-hfi-t3 hover:text-hfi-ink";

export function SiteHeader({ placesCount }: { placesCount: number | null }) {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [palOpen, setPalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || palOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, palOpen]);

  const openMenu = () => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setPalOpen(false);
    setMenuOpen(true);
    requestAnimationFrame(() => closeRef.current?.focus());
  };
  const closeMenu = useCallback(() => {
    if (!menuOpen) return;
    setMenuOpen(false);
    requestAnimationFrame(() => (lastFocus.current ?? burgerRef.current)?.focus());
  }, [menuOpen]);
  const openPal = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setMenuOpen(false);
    setQuery("");
    setPalOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
  const closePal = useCallback(() => {
    if (!palOpen) return;
    setPalOpen(false);
    requestAnimationFrame(() => lastFocus.current?.focus());
  }, [palOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (palOpen) closePal();
        else openPal();
        return;
      }
      if (e.key === "Escape") {
        closePal();
        closeMenu();
        return;
      }
      if (e.key === "Tab" && menuOpen && drawerRef.current) {
        const f = drawerRef.current.querySelectorAll<HTMLElement>("a[href],button");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, palOpen, openPal, closePal, closeMenu]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? paletteLinks.filter((l) => l.label.toLowerCase().includes(q)) : paletteLinks;
  }, [query]);

  return (
    <>
      <header
        className={`hfi-top sticky top-0 z-[70] border-b border-transparent bg-hfi-band transition-colors ${stuck ? "hfi-stuck" : ""}`}
      >
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-[26px] px-7">
          <Link className="inline-flex items-center gap-2.5 whitespace-nowrap" href={urls.home()} aria-label="The Halal Food Index, home">
            <LogoLockup size={32} />
          </Link>
          <nav className="flex gap-[22px] max-[1040px]:hidden" aria-label="Primary">
            {primaryNav.map((n) => (
              <Link key={n.label} href={n.href} className="text-[13.5px] font-medium text-hfi-t2 transition-colors hover:text-hfi-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={iconBtn} onClick={openPal} aria-label="Search the index">
              <SearchIcon className="h-[17px] w-[17px]" />
            </button>
            <button
              ref={burgerRef}
              type="button"
              className={`${iconBtn} hidden max-[1040px]:flex`}
              onClick={openMenu}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="hfi-menu"
            >
              <BurgerIcon className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[210]" id="hfi-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="hfi-menu-scrim absolute inset-0 bg-[rgba(15,15,15,.16)]" onClick={closeMenu} />
          <nav
            ref={drawerRef}
            className="hfi-drawer absolute bottom-0 right-0 top-0 w-[min(84%,360px)] overflow-y-auto px-[22px] pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-[14px] shadow-[-8px_0_34px_rgba(15,15,15,.14)]"
            aria-label="Site menu"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) closeMenu();
            }}
          >
            <div className="mb-1 flex min-h-[52px] items-center gap-2.5">
              <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
                <LogoLockup size={30} />
              </span>
              <button
                ref={closeRef}
                type="button"
                className="ml-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-hfi-border bg-hfi-surface text-hfi-t2"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="pb-1.5 pt-5 text-[10.5px] font-bold uppercase tracking-[.11em] text-hfi-t3">Browse</div>
            <div>
              {[{ label: "Home", href: urls.home() }, ...primaryNav].map((n) => (
                <Link key={n.label} href={n.href} className={mlink}>
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="pb-1.5 pt-5 text-[10.5px] font-bold uppercase tracking-[.11em] text-hfi-t3">The index</div>
            <div>
              <Link href={urls.addRestaurant()} className={mlink}>
                Add a restaurant
              </Link>
              <Link href={urls.reportProblem()} className={mlink}>
                Report a problem
              </Link>
            </div>
            <p className="mt-[18px] border-t border-hfi-divider pt-[14px] text-xs leading-[1.6] text-hfi-t3">
              {placesCount ? `${placesCount} places listed` : "Halal places listed"}
              <br />
              Greater Manchester
            </p>
          </nav>
        </div>
      )}

      {palOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-[rgba(15,15,15,.26)] px-5 pb-5 pt-[112px] backdrop-blur-[3px] max-[640px]:items-end max-[640px]:p-0 max-[640px]:backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Search the index"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePal();
          }}
        >
          <div className="hfi-pal flex max-h-[min(480px,calc(100vh-152px))] w-full max-w-[600px] flex-col overflow-hidden rounded-[15px] bg-white shadow-[0_24px_70px_rgba(15,15,15,.19)] max-[640px]:max-h-[80vh] max-[640px]:max-w-none max-[640px]:rounded-b-none max-[640px]:rounded-t-[20px]">
            <div className="mx-auto mb-0.5 mt-[9px] hidden h-1 w-[38px] rounded-[3px] bg-[#DDD] max-[640px]:block" aria-hidden="true" />
            <div className="flex items-center gap-3 border-b border-hfi-divider px-5 py-[18px]">
              <SearchIcon className="h-[18px] w-[18px] shrink-0 text-hfi-t3" />
              <label className="sr-only" htmlFor="hfi-q">
                Search the index
              </label>
              <input
                ref={inputRef}
                id="hfi-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search venues, chains, areas…"
                autoComplete="off"
                className="min-w-0 flex-1 border-none bg-transparent text-base leading-[1.4] text-hfi-ink outline-none placeholder:text-hfi-t3"
              />
              <button
                type="button"
                onClick={closePal}
                className="shrink-0 cursor-pointer rounded-md border border-hfi-border px-[9px] py-1.5 text-[10.5px] font-bold tracking-[.05em] text-hfi-t3 max-[640px]:hidden"
              >
                ESC
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-2 pt-1">
              <div className="px-5 pb-1.5 pt-[14px] text-[11.5px] font-semibold text-hfi-t3">{query.trim() ? "Matches" : "Quick links"}</div>
              {matches.length === 0 && (
                <p className="px-5 py-2 text-[13.5px] text-hfi-t2">Nothing matches yet. Full search is on its way.</p>
              )}
              {matches.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setPalOpen(false)}
                  className="mx-2 flex min-h-11 cursor-pointer items-center gap-[13px] rounded-[10px] px-3 py-[9px] hover:bg-[#F4F4F4]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-hfi-pill text-hfi-t2">
                    {l.icon === "home" ? <HomeIcon className="h-4 w-4" /> : <CircleIcon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{l.label}</span>
                    <span className="mt-px block text-[12.5px] text-hfi-t3">{l.hint}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const mlink =
  "flex min-h-[52px] items-center gap-3 border-b border-hfi-divider px-0.5 text-[17px] font-semibold tracking-[-.3px] last:border-b-0";
