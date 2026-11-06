"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
 * Reveal on scroll. Blocks marked data-reveal that start below the fold rise
 * in once as they come into view (14px, 0.5s, the "arrive" curve). Anything
 * already on screen is left alone, and nothing moves for people who ask for
 * reduced motion. The content is always in the HTML; this only adds polish.
 */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const below = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => !el.classList.contains("hfi-in") && el.getBoundingClientRect().top > window.innerHeight,
    );
    if (!below.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("hfi-in");
          el.classList.remove("hfi-pre");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of below) {
      el.classList.add("hfi-pre");
      io.observe(el);
    }
    return () => {
      io.disconnect();
      for (const el of below) el.classList.remove("hfi-pre");
    };
  }, [pathname]);
  return null;
}
