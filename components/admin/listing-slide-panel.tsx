"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MapPin, Globe, Phone, Plus, Trash2, Search, RefreshCw,
  Star, Minus, AlertTriangle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminListing, HalalStatus, CertType, ListingStatus, ListingType } from "@/lib/admin-mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string | null;
  listings: AdminListing[];
  currentIndex: number;
  onNavigate: (id: string) => void;
}

interface HalalItem {
  item: string;
  status: "Halal" | "Not Halal" | "Varies" | "Unknown";
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLACE_SUGGESTIONS = [
  { name: "Hawksmoor Manchester", address: "184-186 Deansgate, Manchester M3 3WB", postcode: "M3 3WB", city: "Manchester", area: "Deansgate", phone: "0161 836 6980", website: "https://thehawksmoor.com", placeId: "ChIJc3CAbFexe0gRgpBBJTxBPkU", rating: 4.6, reviewCount: 1842 },
  { name: "Elnecot", address: "41 Blossom St, Manchester M4 6AJ", postcode: "M4 6AJ", city: "Manchester", area: "Northern Quarter", phone: "0161 214 2240", website: "https://elnecot.com", placeId: "ChIJqwR2W1SxeUgRpKAeE9LBPMU", rating: 4.4, reviewCount: 723 },
  { name: "Mackie Mayor", address: "1 Eagle St, Manchester M4 5BU", postcode: "M4 5BU", city: "Manchester", area: "Northern Quarter", phone: "0161 706 2050", website: "https://mackiemayor.co.uk", placeId: "ChIJmwT4dFaxe0gRkUBBJTxHPZN", rating: 4.5, reviewCount: 2103 },
];

const VIBE_OPTIONS = [
  "Date Night", "Casual Eats", "Family Friendly", "Special Occasion",
  "Birthday Celebration", "Business Lunch", "Girls Night Out", "After Work",
  "Late Night", "Weekend Brunch", "Ramadan Special", "Eid Celebration",
  "Great for Groups", "Solo Friendly", "Student Friendly", "Kid Friendly",
  "Baby Friendly", "Instagrammable", "Rooftop Dining", "Outdoor Seating",
  "Cosy & Intimate", "Lively & Buzzing", "Quiet & Relaxed", "Live Sports Showing",
  "Shisha Available",
];

const FEATURE_GROUPS = [
  {
    key: "accessibility", label: "Accessibility", defaultOpen: false,
    tooltip: "Helps users with mobility or family needs find suitable venues",
    items: [
      { key: "wheelchair-accessible", label: "Wheelchair Accessible" },
      { key: "pram-friendly", label: "Pram Friendly" },
      { key: "step-free-access", label: "Step-free Access" },
      { key: "accessible-toilets", label: "Accessible Toilets" },
      { key: "high-chairs", label: "High Chairs Available" },
    ],
  },
  {
    key: "religious", label: "Religious Facilities", defaultOpen: false,
    tooltip: "Faith-related facilities that matter to Muslim diners",
    items: [
      { key: "prayer-room", label: "Prayer Room" },
      { key: "wudu-facilities", label: "Wudu Facilities" },
    ],
  },
  {
    key: "parking", label: "Parking & Transport", defaultOpen: false,
    tooltip: "Parking and transport options near this venue",
    items: [
      { key: "free-parking", label: "Free Parking" },
      { key: "paid-parking-nearby", label: "Paid Parking Nearby" },
      { key: "cycle-parking", label: "Cycle Parking" },
      { key: "ev-charging", label: "EV Charging" },
    ],
  },
  {
    key: "dietary", label: "Dietary Options", defaultOpen: true,
    tooltip: "Dietary accommodations — helps users with specific dietary requirements find suitable venues",
    items: [
      { key: "vegetarian", label: "Vegetarian Options" },
      { key: "vegan", label: "Vegan Options" },
      { key: "gluten-free", label: "Gluten Free Options" },
      { key: "nut-allergy-friendly", label: "Nut Allergy Friendly" },
      { key: "dairy-free", label: "Dairy Free Options" },
    ],
  },
  {
    key: "service", label: "Service", defaultOpen: true,
    tooltip: "How this venue operates — helps match users with how they want to dine",
    items: [
      { key: "takeaway", label: "Takeaway" },
      { key: "delivery", label: "Delivery" },
      { key: "dine-in", label: "Dine In" },
      { key: "pre-booking-required", label: "Pre-booking Required" },
      { key: "walk-ins-welcome", label: "Walk-ins Welcome" },
      { key: "drive-through", label: "Drive Through" },
      { key: "click-and-collect", label: "Click and Collect" },
      { key: "catering-available", label: "Catering Available" },
      { key: "private-dining", label: "Private Dining Room" },
    ],
  },
  {
    key: "payment", label: "Payment", defaultOpen: false,
    tooltip: "Payment methods accepted at this venue",
    items: [
      { key: "cash-only", label: "Cash Only" },
      { key: "card-accepted", label: "Card Accepted" },
      { key: "apple-google-pay", label: "Apple / Google Pay" },
      { key: "split-bill-friendly", label: "Split Bill Friendly" },
    ],
  },
] as const;

const DRINKS_ITEMS = [
  { key: "fresh-juices", label: "Fresh Juices" },
  { key: "speciality-coffee", label: "Speciality Coffee" },
  { key: "bubble-tea", label: "Bubble Tea" },
  { key: "alcohol-free-menu", label: "Alcohol Free (entire menu)" },
  { key: "byob", label: "BYOB Allowed" },
] as const;

const INITIAL_FEATURES: Record<string, boolean> = {
  "wheelchair-accessible": false, "pram-friendly": false, "step-free-access": false,
  "accessible-toilets": false, "high-chairs": false,
  "prayer-room": false, "wudu-facilities": false,
  "free-parking": false, "paid-parking-nearby": false, "cycle-parking": false, "ev-charging": false,
  "vegetarian": false, "vegan": false, "gluten-free": false, "nut-allergy-friendly": false, "dairy-free": false,
  "fresh-juices": false, "speciality-coffee": false, "bubble-tea": false, "alcohol-free-menu": false, "byob": false,
  "takeaway": false, "delivery": false, "dine-in": true, "pre-booking-required": false,
  "walk-ins-welcome": false, "drive-through": false, "click-and-collect": false,
  "catering-available": false, "private-dining": false,
  "cash-only": false, "card-accepted": true, "apple-google-pay": false, "split-bill-friendly": false,
};

// ─── Helper components ────────────────────────────────────────────────────────

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-secondary/30 transition-colors">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, mono, prefix }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; prefix?: string }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn(
          "w-full h-9 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors",
          prefix ? "pl-7 pr-3" : "px-3", mono && "font-mono"
        )}
      />
    </div>
  );
}

function PillSelector<T extends string>({ options, value, onChange, colours }: { options: T[]; value: T; onChange: (v: T) => void; colours?: Partial<Record<T, string>> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={cn(
              "text-xs font-semibold h-8 px-3 rounded-full border transition-all duration-150",
              active ? (colours?.[opt] ?? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400") : "border-border bg-secondary text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >{opt}</button>
        );
      })}
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled, disabledReason }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; disabledReason?: string }) {
  return (
    <label className={cn("flex items-center gap-2.5 select-none", disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer")} title={disabled ? disabledReason : undefined}>
      <div
        className={cn("relative w-8 rounded-full transition-colors duration-200 shrink-0", checked ? "bg-emerald-500" : "bg-secondary border border-border")}
        style={{ height: "18px" }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200", checked ? "translate-x-4" : "translate-x-0.5")} />
      </div>
      {label && <span className="text-xs text-foreground">{label}</span>}
    </label>
  );
}

function HalalItemRow({ item, onChange, onRemove }: { item: HalalItem; onChange: (u: HalalItem) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <input value={item.item} onChange={(e) => onChange({ ...item, item: e.target.value })} placeholder="Item name" className="flex-1 h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors" />
      <select value={item.status} onChange={(e) => onChange({ ...item, status: e.target.value as HalalItem["status"] })} className="h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500">
        <option>Halal</option><option>Not Halal</option><option>Varies</option><option>Unknown</option>
      </select>
      <input value={item.notes} onChange={(e) => onChange({ ...item, notes: e.target.value })} placeholder="Notes..." className="w-28 h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors" />
      <button type="button" onClick={onRemove} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="relative group/tip inline-flex shrink-0">
      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
      <div className="absolute left-0 bottom-full mb-1.5 w-52 px-2.5 py-2 rounded-lg bg-foreground text-background text-xs leading-relaxed shadow-lg z-20 pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity">
        {text}
      </div>
    </div>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  const near = len > max * 0.88;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", over ? "bg-red-500" : near ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, (len / max) * 100)}%` }} />
      </div>
      <span className={cn("text-[10px] tabular-nums", over ? "text-red-500" : near ? "text-amber-500" : "text-muted-foreground")}>{len}/{max}</span>
    </div>
  );
}

function FeatureGroup({
  label, tooltip, items, features, onToggle, defaultOpen = false, extra, disabledKeys,
}: {
  label: string; tooltip: string;
  items: readonly { key: string; label: string }[];
  features: Record<string, boolean>;
  onToggle: (key: string) => void;
  defaultOpen?: boolean;
  extra?: React.ReactNode;
  disabledKeys?: Record<string, string>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const selectedCount = items.filter((i) => features[i.key]).length;
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full px-3 py-2.5 bg-secondary/30 hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <Tip text={tooltip} />
        </div>
        <div className="flex items-center gap-2">
          {!open && selectedCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{selectedCount} selected</span>
          )}
          {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-3 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {items.map(({ key, label: lbl }) => (
              <Toggle key={key} label={lbl} checked={features[key] ?? false} onChange={() => onToggle(key)} disabled={!!disabledKeys?.[key]} disabledReason={disabledKeys?.[key]} />
            ))}
          </div>
          {extra}
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ListingSlidePanel({ isOpen, onClose, listingId, listings, currentIndex, onNavigate }: SlidePanelProps) {
  const isNew = listingId === null;
  const listing = listings.find((l) => l.id === listingId) ?? null;

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [types, setTypes] = useState<ListingType[]>(["Restaurant"]);
  const [status, setStatus] = useState<ListingStatus>("Active");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [halalStatus, setHalalStatus] = useState<HalalStatus>("Unknown");
  const [cert, setCert] = useState<CertType>("Awaiting");
  const [certBody, setCertBody] = useState("");
  const [certNotes, setCertNotes] = useState("");
  const [score, setScore] = useState(8.0);
  const [featured, setFeatured] = useState(false);
  const [alcoholServed, setAlcoholServed] = useState(false);
  const [halalItems, setHalalItems] = useState<HalalItem[]>([]);

  // Vibe & Features
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<Record<string, boolean>>({ ...INITIAL_FEATURES });
  const [mocktailOption, setMocktailOption] = useState<"dedicated" | "some" | "soft-only" | "">("");

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState(false);
  const [lastVerifiedDate, setLastVerifiedDate] = useState("");
  const [schemaOpen, setSchemaOpen] = useState(false);

  // Google Places
  const [placeQuery, setPlaceQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [step, setStep] = useState(1);

  const filteredSuggestions = PLACE_SUGGESTIONS.filter(
    (p) => p.name.toLowerCase().includes(placeQuery.toLowerCase()) || p.address.toLowerCase().includes(placeQuery.toLowerCase())
  );

  const selectPlace = (place: typeof PLACE_SUGGESTIONS[0]) => {
    setName(place.name);
    setSlug(place.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    setAddress(place.address); setPostcode(place.postcode); setCity(place.city);
    setArea(place.area); setPhone(place.phone); setWebsite(place.website);
    setPlaceQuery(place.name); setShowSuggestions(false);
    setAutoFilled(true); setTimeout(() => setAutoFilled(false), 2000); setStep(2);
  };

  // Auto-generate meta title
  const autoMetaTitle = useMemo(() => {
    if (!name) return "";
    const loc = area || city || "Manchester";
    return `${name} — Halal ${types[0] || "Restaurant"} in ${loc} | Halal Food Index`;
  }, [name, area, city, types]);

  // Populate form on edit
  useEffect(() => {
    if (listing) {
      setName(listing.name); setSlug(listing.slug); setTypes([listing.type]);
      setStatus(listing.status); setAddress(listing.address); setPostcode(listing.postcode);
      setCity(listing.city); setArea(listing.area); setPhone(listing.phone ?? "");
      setWebsite(listing.website ?? ""); setInstagram(listing.instagram ?? "");
      setHalalStatus(listing.halalStatus); setCert(listing.cert); setScore(listing.score);
      setFeatured(listing.featured); setAlcoholServed(listing.alcoholServed ?? false);
      setHalalItems([]); setVibeTags([]); setFeatures({ ...INITIAL_FEATURES });
      setMocktailOption("");
      setMetaTitle(`${listing.name} — Halal ${listing.type} in ${listing.area} | Halal Food Index`);
      setMetaDesc(""); setLastVerifiedDate(""); setStep(2); setAutoFilled(false); setPlaceQuery("");
    } else {
      setName(""); setSlug(""); setTypes(["Restaurant"]); setStatus("Active");
      setAddress(""); setPostcode(""); setCity(""); setArea(""); setPhone("");
      setWebsite(""); setInstagram(""); setHalalStatus("Unknown"); setCert("Awaiting");
      setCertBody(""); setCertNotes(""); setScore(8.0); setFeatured(false);
      setAlcoholServed(false); setHalalItems([]); setVibeTags([]);
      setFeatures({ ...INITIAL_FEATURES }); setMocktailOption("");
      setMetaTitle(""); setMetaDesc(""); setLastVerifiedDate("");
      setStep(1); setAutoFilled(false); setPlaceQuery("");
    }
  }, [listing, listingId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    if (isOpen) { document.addEventListener("keydown", handleKeyDown); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [isOpen, handleKeyDown]);

  const addHalalItem = () => setHalalItems([...halalItems, { item: "", status: "Halal", notes: "" }]);
  const updateHalalItem = (i: number, u: HalalItem) => setHalalItems(halalItems.map((it, idx) => idx === i ? u : it));
  const removeHalalItem = (i: number) => setHalalItems(halalItems.filter((_, idx) => idx !== i));

  const toggleFeature = (key: string) => {
    setFeatures((f) => {
      const next = { ...f, [key]: !f[key] };
      if (key === "alcohol-free-menu" && next["alcohol-free-menu"]) setAlcoholServed(false);
      return next;
    });
  };
  const handleAlcoholServedChange = (v: boolean) => {
    setAlcoholServed(v);
    if (v) setFeatures((f) => ({ ...f, "alcohol-free-menu": false }));
  };

  const regenerateDesc = async () => {
    setRegenerating(true); setRegenError(false);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const certLabel = cert === "HMC" ? "HMC certified" : cert === "HFA" ? "HFA certified" : cert === "Self-Certified" ? "self-certified" : "";
      const loc = area || city || "Manchester";
      const opts = [
        `${loc}'s go-to spot for ${certLabel ? certLabel + " " : ""}halal food — ${name || "this restaurant"} serves incredible flavours in the heart of Manchester.`,
        `Trusted by Manchester's halal community, ${name || "this restaurant"} in ${loc} is ${certLabel ? certLabel + " and" : ""} highly rated by local foodies.`,
        `From ${loc} to the rest of Manchester — ${name || "this restaurant"} is a ${certLabel || "must-visit"} halal dining destination loved by regulars.`,
      ];
      setMetaDesc(opts[Math.floor(Math.random() * opts.length)].slice(0, 155));
    } catch { setRegenError(true); } finally { setRegenerating(false); }
  };

  const seoScore = useMemo(() => {
    let pts = 0;
    if (name) pts++; if (metaDesc.length >= 50) pts++; if (metaTitle || autoMetaTitle) pts++;
    if (halalStatus !== "Unknown") pts++; if (area) pts++; if (types.length > 0) pts++;
    if (cert !== "Awaiting" && cert !== "Not Certified") pts++; if (vibeTags.length > 0) pts++;
    return pts >= 7 ? "strong" as const : pts >= 5 ? "good" as const : "needs-work" as const;
  }, [name, metaDesc, metaTitle, autoMetaTitle, halalStatus, area, types, cert, vibeTags]);

  const qualifyingPages = useMemo(() => {
    const pages: string[] = [];
    if (area) pages.push(`${area} halal restaurants`);
    if (types[0]) pages.push(`Halal ${types[0].toLowerCase()}s in Manchester`);
    if (area && types[0]) pages.push(`${types[0]}s in ${area}`);
    vibeTags.slice(0, 4).forEach((t) => pages.push(t));
    return pages;
  }, [area, types, vibeTags]);

  const schemaJson = useMemo(() => JSON.stringify({
    "@context": "https://schema.org", "@type": "Restaurant",
    name: name || "Restaurant Name", servesCuisine: "Halal",
    address: { "@type": "PostalAddress", streetAddress: address, addressLocality: city || "Manchester", postalCode: postcode, addressCountry: "GB" },
    telephone: phone, url: website,
  }, null, 2), [name, address, city, postcode, phone, website]);

  const HALAL_COLOURS: Partial<Record<HalalStatus, string>> = {
    Certified: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400",
    Partial: "border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
    "Not Halal": "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400",
    Unknown: "border-border bg-secondary text-muted-foreground",
  };
  const TYPE_OPTIONS: ListingType[] = ["Restaurant", "Café", "Brunch Spot", "Dessert Place", "Takeaway", "Food Truck", "Bakery"];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-[520px] z-50 flex flex-col bg-background shadow-2xl border-l border-border">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{isNew ? "New Listing" : listing?.name ?? ""}</span>
              {!isNew && listing && (
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", listing.status === "Active" ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-secondary text-muted-foreground")}>
                  {listing.status}
                </span>
              )}
            </div>
          </div>
          {!isNew && (
            <div className="flex items-center gap-1">
              <button onClick={() => currentIndex > 0 && onNavigate(listings[currentIndex - 1].id)} disabled={currentIndex <= 0} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors" title="Previous"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => currentIndex < listings.length - 1 && onNavigate(listings[currentIndex + 1].id)} disabled={currentIndex >= listings.length - 1} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors" title="Next"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><X className="h-4 w-4" /></button>
        </div>

        {/* Step indicator */}
        {isNew && (
          <div className="flex items-center gap-0 px-5 py-3 border-b border-border bg-secondary/30 shrink-0">
            {[{ n: 1, label: "Search" }, { n: 2, label: "Enrich" }, { n: 3, label: "Publish" }].map(({ n, label }, i) => (
              <div key={n} className="flex items-center">
                {i > 0 && <div className="w-8 h-px bg-border mx-1" />}
                <div className="flex items-center gap-1.5">
                  <span className={cn("flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold", step >= n ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground border border-border")}>{n}</span>
                  <span className={cn("text-xs font-medium", step >= n ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Google Places search */}
        {isNew && step === 1 && (
          <div className="px-5 py-4 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={placeQuery} onChange={(e) => { setPlaceQuery(e.target.value); setShowSuggestions(e.target.value.length > 0); }} onFocus={() => placeQuery.length > 0 && setShowSuggestions(true)} placeholder="Search Google Places..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                  {filteredSuggestions.map((place) => (
                    <button key={place.placeId} type="button" onClick={() => selectPlace(place)} className="flex items-start gap-3 w-full px-3 py-2.5 hover:bg-secondary transition-colors text-left">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div><div className="text-sm font-semibold text-foreground">{place.name}</div><div className="text-xs text-muted-foreground">{place.address}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setStep(2)} className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">Or add manually</button>
          </div>
        )}

        {autoFilled && (
          <div className="mx-5 mt-3 shrink-0 flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
            <span className="text-emerald-500">✓</span> Fields auto-filled from Google Places
          </div>
        )}

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto">

          {/* ─── Basic Info ─────────────────────────────────────────────────── */}
          <Section title="Basic Info" defaultOpen>
            <Field label="Name"><TextInput value={name} onChange={setName} placeholder="Restaurant name" /></Field>
            <Field label="Slug"><TextInput value={slug} onChange={setSlug} placeholder="auto-generated-slug" mono /></Field>
            <Field label="Type">
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-background min-h-[38px]">
                {types.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {t}<button type="button" onClick={() => setTypes(types.filter((x) => x !== t))} className="text-emerald-400 hover:text-emerald-600"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                <select value="" onChange={(e) => { const v = e.target.value as ListingType; if (v && !types.includes(v)) setTypes([...types, v]); }} className="flex-1 min-w-[80px] h-6 text-xs bg-transparent outline-none text-muted-foreground">
                  <option value="">Add type...</option>
                  {TYPE_OPTIONS.filter((t) => !types.includes(t)).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Status">
              <PillSelector options={["Active", "Unverified", "Closed", "Temporarily Closed"] as ListingStatus[]} value={status} onChange={setStatus} />
            </Field>
          </Section>

          {/* ─── Location ───────────────────────────────────────────────────── */}
          <Section title="Location" defaultOpen>
            <Field label="Address"><TextInput value={address} onChange={setAddress} placeholder="Street address" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Postcode"><TextInput value={postcode} onChange={setPostcode} placeholder="M1 1AE" mono /></Field>
              <Field label="City"><TextInput value={city} onChange={setCity} placeholder="Manchester" /></Field>
            </div>
            <Field label="Area / Neighbourhood"><TextInput value={area} onChange={setArea} placeholder="Northern Quarter" /></Field>
            <Field label="Google Maps URL">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type="url" placeholder="https://maps.google.com/..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
              </div>
            </Field>
            <div className="h-24 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Map preview (requires API key)</span>
            </div>
          </Section>

          {/* ─── Contact & Socials ──────────────────────────────────────────── */}
          <Section title="Contact & Socials">
            <Field label="Phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0161 000 0000" className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
              </div>
            </Field>
            <Field label="Website">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
              </div>
            </Field>
            <Field label="Instagram"><TextInput value={instagram} onChange={setInstagram} prefix="@" placeholder="handle" /></Field>
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Delivery Platforms</label>
              <div className="space-y-2">
                {["Just Eat", "Uber Eats", "Deliveroo"].map((p) => <Toggle key={p} label={p} checked={false} onChange={() => {}} />)}
              </div>
            </div>
          </Section>

          {/* ─── Cuisine & Category ─────────────────────────────────────────── */}
          <Section title="Cuisine & Category" defaultOpen>
            <Field label="Cuisine Types">
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-background min-h-[38px]">
                {["Indian", "Pakistani", "Turkish", "Arabic", "Bangladeshi", "Lebanese"].map((c) => (
                  <span key={c} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {c}<button type="button" className="text-emerald-400 hover:text-emerald-600"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                <input placeholder="Add cuisine..." className="flex-1 min-w-[80px] h-6 text-xs bg-transparent outline-none placeholder:text-muted-foreground" />
              </div>
            </Field>
            <Field label="Price Range">
              <PillSelector options={["£", "££", "£££", "££££"]} value="££" onChange={() => {}} />
            </Field>
          </Section>

          {/* ─── Halal Info ─────────────────────────────────────────────────── */}
          <Section title="Halal Info" defaultOpen>
            <Field label="Halal Status">
              <div className="flex flex-wrap gap-2">
                {(["Certified", "Partial", "Not Halal", "Unknown"] as HalalStatus[]).map((opt) => (
                  <button key={opt} type="button" onClick={() => setHalalStatus(opt)} className={cn("text-xs font-semibold h-9 px-4 rounded-full border transition-all duration-150", halalStatus === opt ? HALAL_COLOURS[opt] : "border-border bg-secondary text-muted-foreground hover:border-foreground/20")}>{opt}</button>
                ))}
              </div>
            </Field>
            <Field label="Certification Type">
              <select value={cert} onChange={(e) => setCert(e.target.value as CertType)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="HMC">HMC Certified</option><option value="HFA">HFA Certified</option>
                <option value="Self-Certified">Self-Certified</option><option value="Awaiting">Awaiting Verification</option>
                <option value="Not Certified">Not Certified</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Certifying Body"><TextInput value={certBody} onChange={setCertBody} placeholder="e.g. HMC" /></Field>
              <Field label="Expiry Date"><input type="date" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></Field>
            </div>
            <Field label="Notes">
              <textarea value={certNotes} onChange={(e) => setCertNotes(e.target.value)} rows={2} placeholder="Certification notes..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-colors" />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-foreground">Per-item Halal Status</label>
                <button type="button" onClick={addHalalItem} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 transition-colors"><Plus className="h-3 w-3" />Add item</button>
              </div>
              {halalItems.length === 0 ? <p className="text-xs text-muted-foreground italic">No per-item data. Click &quot;Add item&quot; to add.</p> : (
                <div className="space-y-1.5">{halalItems.map((it, i) => <HalalItemRow key={i} item={it} onChange={(u) => updateHalalItem(i, u)} onRemove={() => removeHalalItem(i)} />)}</div>
              )}
            </div>
          </Section>

          {/* ─── Features & Facilities ──────────────────────────────────────── */}
          <Section title="Features & Facilities">
            <div className="space-y-2">
              {/* Accessibility, Religious, Parking, Dietary */}
              {FEATURE_GROUPS.slice(0, 4).map((group) => (
                <FeatureGroup key={group.key} label={group.label} tooltip={group.tooltip} items={group.items} features={features} onToggle={toggleFeature} defaultOpen={group.defaultOpen} />
              ))}

              {/* Drinks — with mocktail three-state selector */}
              <FeatureGroup
                label="Drinks"
                tooltip="Non-alcoholic drink options — a popular search filter for Muslim diners looking for interesting drinks"
                items={DRINKS_ITEMS}
                features={features}
                onToggle={toggleFeature}
                defaultOpen={false}
                disabledKeys={alcoholServed ? { "alcohol-free-menu": "Cannot be alcohol free if alcohol is served on premises" } : undefined}
                extra={
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mocktails</span>
                      <Tip text="Mocktail availability is a key search filter. Be specific — 'dedicated menu' ranks better and helps more users find this place." />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {([["dedicated", "Dedicated menu"], ["some", "Some available"], ["soft-only", "Soft drinks only"], ["", "None"]] as const).map(([val, label]) => (
                        <button key={val} type="button" onClick={() => setMocktailOption(val)}
                          className={cn("text-xs font-medium h-7 px-2.5 rounded-full border transition-all", mocktailOption === val ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "border-border bg-secondary text-muted-foreground hover:border-foreground/20")}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                }
              />

              {/* Service, Payment */}
              {FEATURE_GROUPS.slice(4).map((group) => (
                <FeatureGroup key={group.key} label={group.label} tooltip={group.tooltip} items={group.items} features={features} onToggle={toggleFeature} defaultOpen={group.defaultOpen} />
              ))}

              {/* Alcohol */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-3 bg-secondary/30">
                  <Toggle
                    label="Alcohol Served on Premises"
                    checked={alcoholServed}
                    onChange={handleAlcoholServedChange}
                    disabled={features["alcohol-free-menu"]}
                    disabledReason="Cannot serve alcohol if Alcohol Free (entire menu) is enabled"
                  />
                  {alcoholServed && (
                    <div className="flex items-start gap-2 mt-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">This listing serves alcohol. It will be flagged on the public listing page.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* ─── Vibe & Experience ──────────────────────────────────────────── */}
          <Section title="Vibe & Experience">
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <label className="text-xs font-medium text-foreground">Vibe & Atmosphere</label>
                <Tip text="Help users find this place for the right occasion. Select all that apply — these power our SEO category pages." />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VIBE_OPTIONS.map((tag) => {
                  const active = vibeTags.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => setVibeTags(active ? vibeTags.filter((t) => t !== tag) : [...vibeTags, tag])}
                      className={cn("text-xs font-medium h-7 px-2.5 rounded-full border transition-all duration-150", active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "border-border bg-secondary text-muted-foreground hover:border-foreground/20 hover:text-foreground")}
                    >{tag}</button>
                  );
                })}
              </div>
              {vibeTags.length > 0 && <p className="text-[10px] text-muted-foreground mt-2">{vibeTags.length} tag{vibeTags.length !== 1 ? "s" : ""} selected</p>}
            </div>
          </Section>

          {/* ─── Editorial ──────────────────────────────────────────────────── */}
          <Section title="Editorial">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /><label className="text-xs font-medium text-foreground">Featured Listing</label></div>
              <Toggle label="" checked={featured} onChange={setFeatured} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-xs font-medium text-foreground">Our Score</label>
                <Tip text="Our editorial score 0–10 based on food quality, halal compliance, service and value. Set manually by our team." />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 h-9 rounded-lg border border-border bg-background px-2">
                  <button type="button" onClick={() => setScore((s) => Math.max(0, +(s - 0.1).toFixed(1)))} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><Minus className="h-3 w-3" /></button>
                  <input type="number" value={score} onChange={(e) => setScore(Math.min(10, Math.max(0, +e.target.value)))} min={0} max={10} step={0.1} className="w-12 text-center text-sm font-bold text-foreground bg-transparent outline-none tabular-nums" />
                  <button type="button" onClick={() => setScore((s) => Math.min(10, +(s + 0.1).toFixed(1)))} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><Plus className="h-3 w-3" /></button>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 tabular-nums">{score.toFixed(1)} / 10</span>
              </div>
            </div>
            <Field label="Editorial Notes">
              <textarea rows={3} placeholder="Internal notes about this listing..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-colors" />
            </Field>
          </Section>

          {/* ─── SEO ────────────────────────────────────────────────────────── */}
          <Section title="SEO">
            {/* Score indicator */}
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border">
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", seoScore === "strong" ? "bg-emerald-500" : seoScore === "good" ? "bg-amber-500" : "bg-red-500")} />
              <span className="text-xs font-semibold text-foreground">{seoScore === "strong" ? "Strong" : seoScore === "good" ? "Good" : "Needs work"}</span>
              <span className="text-xs text-muted-foreground flex-1">
                {seoScore === "strong" ? "Well optimised for search" : seoScore === "good" ? "Fill in more details to improve" : "Add name, area, halal status and vibe tags"}
              </span>
              <Tip text="How well optimised this listing is for search. Factors: name, meta description, halal status, area, type, certification, vibe tags." />
            </div>

            {/* Meta Title */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-xs font-medium text-foreground">Meta Title</label>
                <Tip text="The blue title users see in Google search results. Auto-generated from name, type and area. Under 60 characters ideally." />
              </div>
              <input type="text" value={metaTitle || autoMetaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={autoMetaTitle || "Auto-generated once you add a name..."} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
              <CharCounter value={metaTitle || autoMetaTitle} max={60} />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-medium text-foreground">Meta Description</label>
                  <Tip text="The grey text under the title in Google. Under 155 characters. We use AI to write unique, helpful descriptions. Click Regenerate for alternatives." />
                </div>
                <button type="button" onClick={regenerateDesc} disabled={regenerating} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 disabled:opacity-50 transition-colors">
                  <RefreshCw className={cn("h-3 w-3", regenerating && "animate-spin")} />
                  {regenerating ? "Generating..." : "Regenerate"}
                </button>
              </div>
              {regenerating ? (
                <div className="w-full h-16 rounded-lg border border-border bg-secondary/30 animate-pulse" />
              ) : (
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} placeholder="Click Regenerate for an AI-written description, or type your own..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-colors" />
              )}
              {regenError && <p className="text-xs text-red-500 mt-1">Generation failed. <button type="button" onClick={regenerateDesc} className="underline">Retry</button></p>}
              <CharCounter value={metaDesc} max={155} />
            </div>

            {/* URL Slug */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-xs font-medium text-foreground">URL Slug</label>
                <Tip text="The web address for this listing. Auto-generated from the name. Only change if absolutely necessary — changing it after publishing creates a redirect automatically." />
              </div>
              <TextInput value={slug} onChange={setSlug} placeholder="restaurant-slug" mono />
            </div>

            {/* Qualifying pages */}
            {qualifyingPages.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">This listing will appear on:</label>
                <div className="flex flex-wrap gap-1.5">
                  {qualifyingPages.map((page) => (
                    <span key={page} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">{page}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Schema preview */}
            <div>
              <button type="button" onClick={() => setSchemaOpen((o) => !o)} className="flex items-center justify-between w-full text-left">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-medium text-foreground cursor-pointer">Schema Preview</label>
                  <Tip text="Hidden code that helps Google understand your listing. Auto-generated — no action needed." />
                </div>
                {schemaOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              {schemaOpen && <pre className="mt-2 p-3 rounded-lg bg-secondary/50 border border-border text-[10px] font-mono text-muted-foreground overflow-x-auto leading-relaxed">{schemaJson}</pre>}
            </div>

            {/* Last verified */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-xs font-medium text-foreground">Last Verified</label>
                <Tip text="When you last confirmed this listing's information is accurate. Updating this signals fresh content to Google." />
              </div>
              <div className="flex items-center gap-2">
                <input type="date" value={lastVerifiedDate} onChange={(e) => setLastVerifiedDate(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                <button type="button" onClick={() => setLastVerifiedDate(new Date().toISOString().split("T")[0])} className="h-9 px-3 rounded-lg border border-border bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">Mark verified today</button>
              </div>
            </div>
          </Section>

          {/* ─── Google Data ────────────────────────────────────────────────── */}
          <Section title="Google Data (read-only)">
            <div className="rounded-lg bg-secondary/50 border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded bg-[#4285F4] flex items-center justify-center"><span className="text-white text-[8px] font-bold">G</span></div>
                <span className="text-xs text-muted-foreground">Auto-filled from Google Places</span>
              </div>
              {[
                { label: "Place ID", value: listing ? "ChIJc3CAbFexe0gRgpBB" : "—", mono: true },
                { label: "Google Rating", value: listing ? "4.6" : "—" },
                { label: "Review Count", value: listing ? listing.reviewCount.toLocaleString() : "—" },
                { label: "Last Synced", value: listing ? "Today, 08:30" : "—" },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("text-foreground", mono && "font-mono")}>{value}</span>
                </div>
              ))}
              <button type="button" className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-500 transition-colors mt-2"><RefreshCw className="h-3 w-3" />Refresh from Google</button>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-background shrink-0">
          <span className="text-xs text-muted-foreground">{listing ? `Last updated ${new Date(listing.updatedAt).toLocaleDateString("en-GB")}` : "New listing"}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button type="button" onClick={() => { setStep(3); onClose(); }} className="h-9 px-5 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">Save Listing</button>
          </div>
        </div>
      </div>
    </>
  );
}
