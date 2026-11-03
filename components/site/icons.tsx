/* Line icons from the mockups (24px grid, stroke = currentColor). */

type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SearchIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const BurgerIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2.2} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const HomeIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
  </svg>
);
export const CircleIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2L7.9 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
  </svg>
);
export const GlobeIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);
export const PhotoIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="m21 15-5-5L5 19" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const GlassIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <path d="M8 22h8M12 15v7M5 3h14l-1 7a6 6 0 0 1-12 0Z" />
  </svg>
);
export const ChevronDownIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const TagIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l3 2" />
  </svg>
);
export const AlertIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </svg>
);
