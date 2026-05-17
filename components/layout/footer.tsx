import Link from "next/link";

const footerLinks = {
  Restaurants: [
    { href: "/restaurants", label: "All Restaurants" },
    { href: "/cuisines", label: "Browse by Cuisine" },
    { href: "/areas", label: "Browse by Area" },
  ],
  Info: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/certifications", label: "Is It Halal?" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-screen-lg px-4 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
          {/* Brand */}
          <div className="sm:flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Halal Food Index"
              className="h-8 w-auto mb-3"
            />
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Manchester&apos;s Trusted Halal Food Guide
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 sm:gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-4">
                  {category}
                </h3>
                <ul className="space-y-1">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center min-h-[44px] text-sm text-[#6B7280] hover:text-[#0F172A] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} Halal Food Index. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
