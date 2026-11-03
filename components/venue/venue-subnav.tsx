"use client";

import { useEffect, useState } from "react";

export type SubnavLink = { id: string; label: string };

/** Sticky in-page nav with scrollspy. Active state is ink, never green. */
export function VenueSubnav({ links }: { links: SubnavLink[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const pos = window.scrollY + 130;
      let current: string | null = null;
      for (const l of links) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= pos) current = l.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [links]);

  return (
    <nav className="hfi-subnav sticky top-16 z-[60] border-b border-hfi-hair bg-hfi-band" aria-label="Page sections">
      <div className="mx-auto flex h-[46px] max-w-[1236px] items-center gap-[26px] overflow-x-auto px-7 max-[640px]:px-5">
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            aria-current={active === l.id ? "location" : undefined}
            className={`relative flex h-full shrink-0 items-center whitespace-nowrap px-px text-[13px] font-semibold text-hfi-t2 transition-colors hover:text-hfi-ink ${
              active === l.id ? "hfi-active" : ""
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
