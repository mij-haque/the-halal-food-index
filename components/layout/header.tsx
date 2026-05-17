"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/restaurants", label: "Restaurants" },
  { href: "/cuisines", label: "Cuisines" },
  { href: "/areas", label: "Areas" },
  { href: "/about", label: "About" },
  { href: "/add-restaurant", label: "Add a Restaurant" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-screen-lg px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center min-h-[44px]"
          aria-label="Halal Food Index — home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Halal Food Index"
            className="h-8 w-auto"
          />
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex items-center justify-center h-11 w-11 rounded-lg text-[#374151] hover:text-[#0F172A] hover:bg-[#F3F4F6] transition-colors"
        >
          {open ? (
            <X className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Dropdown nav */}
      {open && (
        <div className="border-t border-[#E5E7EB] bg-white">
          <nav className="mx-auto max-w-screen-lg px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center h-12 px-3 text-sm font-medium text-[#374151] hover:text-[#0F172A] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
