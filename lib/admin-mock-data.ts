export type HalalStatus = "Certified" | "Partial" | "Not Halal" | "Unknown";
export type ListingStatus = "Active" | "Unverified" | "Closed" | "Temporarily Closed";
export type ListingType =
  | "Restaurant"
  | "Café"
  | "Brunch Spot"
  | "Dessert Place"
  | "Takeaway"
  | "Food Truck"
  | "Bakery";
export type CertType =
  | "HMC"
  | "HFA"
  | "Self-Certified"
  | "Awaiting"
  | "Not Certified";
export type JobStatus = "queued" | "running" | "complete" | "failed";

export interface AdminListing {
  id: string;
  name: string;
  slug: string;
  type: ListingType;
  area: string;
  cuisines: string[];
  alcoholServed?: boolean;
  halalStatus: HalalStatus;
  cert: CertType;
  status: ListingStatus;
  score: number;
  featured: boolean;
  address: string;
  postcode: string;
  city: string;
  phone?: string;
  website?: string;
  instagram?: string;
  gradientFrom: string;
  gradientTo: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  priceRange: 1 | 2 | 3 | 4;
}

export interface ChainMenuItem {
  item: string;
  status: "Halal" | "Not Halal" | "Varies" | "Unknown";
  notes?: string;
}

export interface AdminChain {
  id: string;
  name: string;
  category: "Fast Food" | "Casual Dining" | "Café" | "Bakery" | "Pizza" | "Chicken";
  halalStatus: HalalStatus;
  halalItemCount: number;
  totalItemCount: number;
  lastVerified: string;
  website: string;
  gradientFrom: string;
  gradientTo: string;
  menuItems: ChainMenuItem[];
  faq: { question: string; answer: string }[];
  verifiedBy: string;
}

export interface AdminJob {
  id: string;
  name: string;
  type: "Apify Scrape" | "Google Refresh" | "Bulk Verify" | "Data Export" | "Chain Status Update";
  description: string;
  status: JobStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  log?: string[];
  error?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  type: "create" | "update" | "verify" | "delete" | "export";
}

export interface PendingVerification {
  id: string;
  name: string;
  cuisine: string;
  addedDate: string;
  gradientFrom: string;
  gradientTo: string;
}

// ─── 10 Admin Listings ─────────────────────────────────────────────────────

export const adminListings: AdminListing[] = [
  {
    id: "1",
    name: "Zouk Restaurant",
    slug: "zouk-restaurant-manchester",
    type: "Restaurant",
    area: "City Centre",
    cuisines: ["Pakistani", "Indian"],
    halalStatus: "Certified",
    cert: "HMC",
    status: "Active",
    score: 9.2,
    featured: true,
    address: "The Orient, Lloyd Street",
    postcode: "M2 5WA",
    city: "Manchester",
    phone: "0161 233 1090",
    website: "https://zoukteabar.co.uk",
    instagram: "@zoukmanchester",
    gradientFrom: "#10B981",
    gradientTo: "#065F46",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
    reviewCount: 3241,
    priceRange: 2,
  },
  {
    id: "2",
    name: "Mughli",
    slug: "mughli-rusholme",
    type: "Restaurant",
    area: "Rusholme",
    cuisines: ["Indian"],
    halalStatus: "Certified",
    cert: "HFA",
    status: "Active",
    score: 9.0,
    featured: true,
    address: "30 Wilmslow Road",
    postcode: "M14 5TQ",
    city: "Manchester",
    phone: "0161 248 0900",
    gradientFrom: "#F59E0B",
    gradientTo: "#92400E",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
    reviewCount: 2187,
    priceRange: 2,
  },
  {
    id: "3",
    name: "Taka Taka",
    slug: "taka-taka-northern-quarter",
    type: "Restaurant",
    area: "Northern Quarter",
    cuisines: ["Lebanese", "Mediterranean"],
    halalStatus: "Certified",
    cert: "HFA",
    status: "Active",
    score: 8.9,
    featured: true,
    address: "68 High Street",
    postcode: "M4 1ES",
    city: "Manchester",
    phone: "0161 834 2200",
    gradientFrom: "#F59E0B",
    gradientTo: "#D97706",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
    reviewCount: 1432,
    priceRange: 2,
  },
  {
    id: "4",
    name: "Istanbul Grill",
    slug: "istanbul-grill-longsight",
    type: "Restaurant",
    area: "Longsight",
    cuisines: ["Turkish"],
    halalStatus: "Certified",
    cert: "HMC",
    status: "Active",
    score: 8.7,
    featured: false,
    address: "512 Stockport Road",
    postcode: "M13 0RQ",
    city: "Manchester",
    phone: "0161 256 4422",
    gradientFrom: "#EF4444",
    gradientTo: "#7F1D1D",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
    reviewCount: 1654,
    priceRange: 1,
  },
  {
    id: "5",
    name: "Sweet Surrender",
    slug: "sweet-surrender-northern-quarter",
    type: "Dessert Place",
    area: "Northern Quarter",
    cuisines: ["Desserts", "Waffles", "Crepes"],
    halalStatus: "Certified",
    cert: "HFA",
    status: "Active",
    score: 8.6,
    featured: false,
    address: "14 Church Street",
    postcode: "M4 1PN",
    city: "Manchester",
    phone: "0161 839 4400",
    instagram: "@sweetsurrenderMCR",
    gradientFrom: "#EC4899",
    gradientTo: "#9333EA",
    createdAt: "2024-03-10T00:00:00Z",
    updatedAt: "2024-10-20T00:00:00Z",
    reviewCount: 892,
    priceRange: 1,
  },
  {
    id: "6",
    name: "Bundobust",
    slug: "bundobust-manchester",
    type: "Restaurant",
    area: "Oxford Road",
    cuisines: ["Indian", "Street Food"],
    halalStatus: "Certified",
    cert: "HFA",
    status: "Active",
    score: 8.5,
    featured: true,
    address: "53 Oxford Street",
    postcode: "M1 6EJ",
    city: "Manchester",
    phone: "0161 359 6757",
    website: "https://bundobust.com",
    instagram: "@bundobust",
    alcoholServed: true,
    gradientFrom: "#3B82F6",
    gradientTo: "#1E3A8A",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-10-15T00:00:00Z",
    reviewCount: 2891,
    priceRange: 1,
  },
  {
    id: "7",
    name: "Al-Faisal",
    slug: "al-faisal-rusholme",
    type: "Restaurant",
    area: "Rusholme",
    cuisines: ["Pakistani", "Kashmiri"],
    halalStatus: "Partial",
    cert: "Self-Certified",
    status: "Active",
    score: 8.4,
    featured: false,
    address: "72 Wilmslow Road",
    postcode: "M14 5AL",
    city: "Manchester",
    phone: "0161 256 3440",
    gradientFrom: "#8B5CF6",
    gradientTo: "#4C1D95",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-09-01T00:00:00Z",
    reviewCount: 987,
    priceRange: 1,
  },
  {
    id: "8",
    name: "Lahori Karahi House",
    slug: "lahori-karahi-house-cheetham-hill",
    type: "Restaurant",
    area: "Cheetham Hill",
    cuisines: ["Pakistani", "Punjabi"],
    halalStatus: "Certified",
    cert: "HMC",
    status: "Active",
    score: 8.1,
    featured: false,
    address: "207 Cheetham Hill Road",
    postcode: "M8 0SE",
    city: "Manchester",
    phone: "0161 740 1200",
    gradientFrom: "#F97316",
    gradientTo: "#9A3412",
    createdAt: "2024-04-05T00:00:00Z",
    updatedAt: "2024-09-15T00:00:00Z",
    reviewCount: 623,
    priceRange: 1,
  },
  {
    id: "9",
    name: "Basmati Blues",
    slug: "basmati-blues-didsbury",
    type: "Restaurant",
    area: "Didsbury",
    cuisines: ["Indian", "Bangladeshi"],
    halalStatus: "Partial",
    cert: "Self-Certified",
    status: "Temporarily Closed",
    score: 7.8,
    featured: false,
    address: "44 Lapwing Lane",
    postcode: "M20 2NT",
    city: "Manchester",
    phone: "0161 448 9090",
    gradientFrom: "#14B8A6",
    gradientTo: "#0F766E",
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-11-05T00:00:00Z",
    reviewCount: 411,
    priceRange: 2,
  },
  {
    id: "10",
    name: "Crown Fried Chicken",
    slug: "crown-fried-chicken-hulme",
    type: "Takeaway",
    area: "Hulme",
    cuisines: ["Chicken", "Burgers"],
    halalStatus: "Unknown",
    cert: "Awaiting",
    status: "Unverified",
    score: 7.2,
    featured: false,
    address: "88 Princess Road",
    postcode: "M15 4JY",
    city: "Manchester",
    phone: "0161 227 8800",
    gradientFrom: "#EAB308",
    gradientTo: "#A16207",
    createdAt: "2024-06-10T00:00:00Z",
    updatedAt: "2024-11-10T00:00:00Z",
    reviewCount: 156,
    priceRange: 1,
  },
];

// ─── 7 Chains ───────────────────────────────────────────────────────────────

export const adminChains: AdminChain[] = [
  {
    id: "c1",
    name: "KFC",
    category: "Fast Food",
    halalStatus: "Partial",
    halalItemCount: 12,
    totalItemCount: 38,
    lastVerified: "2024-10-01",
    website: "https://kfc.co.uk",
    gradientFrom: "#EF4444",
    gradientTo: "#B91C1C",
    menuItems: [
      { item: "Original Recipe Chicken (select branches)", status: "Halal", notes: "Only at ~150 halal-certified UK branches" },
      { item: "Zinger Burger (halal branches)", status: "Halal" },
      { item: "Original Recipe Chicken (non-halal branches)", status: "Not Halal" },
      { item: "Coleslaw", status: "Halal" },
      { item: "Corn on the Cob", status: "Halal" },
      { item: "Gravy", status: "Not Halal", notes: "Contains chicken by-product from non-halal supply chain" },
      { item: "Fries", status: "Halal" },
    ],
    faq: [
      { question: "Is KFC halal?", answer: "Only select KFC branches in the UK are halal certified. These are listed on the KFC website. Most branches are not halal." },
      { question: "How do I find a halal KFC near me?", answer: "Use the KFC branch finder on their website and filter by halal." },
    ],
    verifiedBy: "Mij Hassan",
  },
  {
    id: "c2",
    name: "Nando's",
    category: "Casual Dining",
    halalStatus: "Partial",
    halalItemCount: 28,
    totalItemCount: 35,
    lastVerified: "2024-09-15",
    website: "https://nandos.co.uk",
    gradientFrom: "#EF4444",
    gradientTo: "#7F1D1D",
    menuItems: [
      { item: "PERi-PERi Chicken", status: "Halal", notes: "All Nando's chicken in the UK is halal" },
      { item: "Chicken Wrap", status: "Halal" },
      { item: "Grilled Chicken Burger", status: "Halal" },
      { item: "Veggie dishes", status: "Halal" },
      { item: "Fino Pitta", status: "Halal" },
      { item: "Alcohol (beer/wine)", status: "Not Halal", notes: "Alcohol is served at all Nando's" },
      { item: "Halloumi Sticks", status: "Halal" },
    ],
    faq: [
      { question: "Is Nando's halal?", answer: "All Nando's chicken in the UK is halal certified. However, Nando's restaurants serve alcohol, which some Muslims may consider a concern." },
      { question: "Is the chicken at Nando's UK halal?", answer: "Yes, all chicken served at Nando's UK is HFA certified halal." },
    ],
    verifiedBy: "Mij Hassan",
  },
  {
    id: "c3",
    name: "McDonald's",
    category: "Fast Food",
    halalStatus: "Not Halal",
    halalItemCount: 0,
    totalItemCount: 52,
    lastVerified: "2024-08-01",
    website: "https://mcdonalds.com/gb",
    gradientFrom: "#EAB308",
    gradientTo: "#A16207",
    menuItems: [
      { item: "Big Mac", status: "Not Halal" },
      { item: "McChicken Sandwich", status: "Not Halal" },
      { item: "Nuggets", status: "Not Halal" },
      { item: "Fries", status: "Halal", notes: "Cooked in vegetable oil but in shared fryers" },
      { item: "Filet-O-Fish", status: "Varies", notes: "Fish is not meat but fried in shared fryers" },
      { item: "Apple Slices", status: "Halal" },
    ],
    faq: [
      { question: "Is McDonald's halal in the UK?", answer: "No. McDonald's UK does not serve halal meat at any of its UK restaurants. All chicken and beef is from non-halal supply chains." },
      { question: "Are McDonald's fries halal?", answer: "McDonald's UK fries are cooked in vegetable oil with no animal derivatives. However, they are cooked in the same fryers as non-halal meat products." },
    ],
    verifiedBy: "Mij Hassan",
  },
  {
    id: "c4",
    name: "Subway",
    category: "Fast Food",
    halalStatus: "Partial",
    halalItemCount: 8,
    totalItemCount: 24,
    lastVerified: "2024-09-01",
    website: "https://subway.com/en-GB",
    gradientFrom: "#10B981",
    gradientTo: "#065F46",
    menuItems: [
      { item: "Chicken Tikka Sub (halal branches)", status: "Halal" },
      { item: "Meatball Marinara", status: "Not Halal" },
      { item: "Steak & Cheese", status: "Not Halal" },
      { item: "Veggie Delite", status: "Halal" },
      { item: "Tuna Sub", status: "Varies", notes: "Tuna is halal but cross-contamination risk at non-halal branches" },
    ],
    faq: [
      { question: "Is Subway halal?", answer: "Select Subway branches in the UK are halal certified. These are typically in areas with large Muslim populations. Check the Subway website for halal branches near you." },
    ],
    verifiedBy: "Mij Hassan",
  },
  {
    id: "c5",
    name: "Pizza Express",
    category: "Casual Dining",
    halalStatus: "Partial",
    halalItemCount: 15,
    totalItemCount: 40,
    lastVerified: "2024-07-15",
    website: "https://pizzaexpress.com",
    gradientFrom: "#3B82F6",
    gradientTo: "#1E3A8A",
    menuItems: [
      { item: "Chicken dishes (select branches)", status: "Halal", notes: "Halal chicken available at over 100 UK branches" },
      { item: "Margherita Pizza", status: "Halal" },
      { item: "Pepperoni Pizza", status: "Not Halal" },
      { item: "Salame Pizza", status: "Not Halal" },
      { item: "Garlic Bread", status: "Halal" },
      { item: "Pasta dishes (no meat)", status: "Halal" },
    ],
    faq: [
      { question: "Is Pizza Express halal?", answer: "Pizza Express has over 100 halal-certified branches across the UK where the chicken is halal. Alcohol is served at all Pizza Express restaurants." },
    ],
    verifiedBy: "Mij Hassan",
  },
  {
    id: "c6",
    name: "Five Guys",
    category: "Casual Dining",
    halalStatus: "Not Halal",
    halalItemCount: 0,
    totalItemCount: 20,
    lastVerified: "2024-08-20",
    website: "https://fiveguys.co.uk",
    gradientFrom: "#EF4444",
    gradientTo: "#7F1D1D",
    menuItems: [
      { item: "Hamburger", status: "Not Halal" },
      { item: "Cheeseburger", status: "Not Halal" },
      { item: "Bacon Burger", status: "Not Halal", notes: "Contains pork" },
      { item: "Veggie Sandwich", status: "Halal", notes: "No meat, but cooked in same kitchen" },
      { item: "Fries", status: "Halal", notes: "Cooked in vegetable oil — no cross-contamination from meat fryers" },
      { item: "Milkshakes", status: "Halal" },
    ],
    faq: [
      { question: "Is Five Guys halal?", answer: "No. Five Guys does not serve halal meat. All burgers use non-halal beef. The fries and shakes do not contain meat." },
    ],
    verifiedBy: "Mij Hassan",
  },
  {
    id: "c7",
    name: "Greggs",
    category: "Bakery",
    halalStatus: "Partial",
    halalItemCount: 6,
    totalItemCount: 45,
    lastVerified: "2024-10-10",
    website: "https://greggs.co.uk",
    gradientFrom: "#0EA5E9",
    gradientTo: "#0369A1",
    menuItems: [
      { item: "Chicken Bake (halal branches)", status: "Halal", notes: "Available at select halal-certified branches" },
      { item: "Sausage Roll", status: "Not Halal", notes: "Pork sausage" },
      { item: "Steak Bake", status: "Not Halal" },
      { item: "Vegan Sausage Roll", status: "Halal" },
      { item: "Doughnuts", status: "Halal" },
      { item: "Sandwich — no meat", status: "Halal" },
      { item: "Chicken & Bacon Baguette", status: "Not Halal", notes: "Contains bacon (pork)" },
    ],
    faq: [
      { question: "Is Greggs halal?", answer: "Some Greggs branches serve halal-certified chicken products. Check the Greggs website for halal branch locations." },
      { question: "Is the Greggs vegan sausage roll halal?", answer: "Yes, the Greggs vegan sausage roll contains no meat and is considered halal, though it is not officially certified." },
    ],
    verifiedBy: "Mij Hassan",
  },
];

// ─── 5 Jobs ─────────────────────────────────────────────────────────────────

export const adminJobs: AdminJob[] = [
  {
    id: "j1",
    name: "Apify Scrape — Google Maps Manchester",
    type: "Apify Scrape",
    description: "Scrape new halal restaurant listings from Google Maps in Manchester area",
    status: "complete",
    startedAt: "2026-05-16T08:30:00Z",
    completedAt: "2026-05-16T08:33:22Z",
    duration: "3m 22s",
    log: [
      "[08:30:00] Job started",
      "[08:30:01] Connecting to Apify actor: google-maps-scraper",
      "[08:30:05] Actor started successfully",
      "[08:30:10] Searching for: halal restaurant Manchester",
      "[08:31:45] Found 47 new listings",
      "[08:32:10] Processing listing data...",
      "[08:32:55] Deduplicating against existing 423 listings",
      "[08:33:15] 8 new unique listings added to staging",
      "[08:33:20] Writing to database...",
      "[08:33:22] Job completed successfully. 8 new listings staged.",
    ],
  },
  {
    id: "j2",
    name: "Google Places Refresh — Bulk Update",
    type: "Google Refresh",
    description: "Refresh opening hours, phone numbers and ratings from Google Places API",
    status: "running",
    startedAt: "2026-05-16T10:48:00Z",
    log: [
      "[10:48:00] Job started",
      "[10:48:02] Loading 423 listings from database",
      "[10:48:05] Starting Google Places API calls...",
      "[10:49:12] Updated 87/423 listings",
      "[10:50:30] Updated 156/423 listings",
      "[10:51:44] Updated 214/423 listings...",
    ],
  },
  {
    id: "j3",
    name: "Bulk Verify — Certification Check",
    type: "Bulk Verify",
    description: "Check certification expiry dates and flag listings with lapsed certs",
    status: "failed",
    startedAt: "2026-05-16T07:00:00Z",
    completedAt: "2026-05-16T07:02:15Z",
    duration: "2m 15s",
    error: "API timeout: HMC certification API returned 504 after 120s",
    log: [
      "[07:00:00] Job started",
      "[07:00:01] Loading HMC certified listings: 187 found",
      "[07:00:05] Loading HFA certified listings: 142 found",
      "[07:00:10] Connecting to HMC API...",
      "[07:02:10] ERROR: HMC API connection timeout (120s limit exceeded)",
      "[07:02:15] Job failed. 0 listings verified.",
    ],
  },
  {
    id: "j4",
    name: "Data Export — Full CSV",
    type: "Data Export",
    description: "Export all listings to CSV for backup and analysis",
    status: "complete",
    startedAt: "2026-05-16T06:00:00Z",
    completedAt: "2026-05-16T06:01:04Z",
    duration: "1m 4s",
    log: [
      "[06:00:00] Job started",
      "[06:00:01] Fetching 423 listings from database",
      "[06:00:08] Formatting CSV data",
      "[06:00:45] Writing halal-food-index-export-2026-05-16.csv",
      "[06:01:04] Export completed. File size: 1.2MB",
    ],
  },
  {
    id: "j5",
    name: "Chain Status Update — Weekly Sync",
    type: "Chain Status Update",
    description: "Sync halal status for all 7 tracked chains from certification bodies",
    status: "queued",
    log: [],
  },
];

// ─── Activity Feed ───────────────────────────────────────────────────────────

export const activityItems: ActivityItem[] = [
  {
    id: "a1",
    action: "Certification renewed for Zouk Restaurant",
    target: "Zouk Restaurant",
    user: "Mij",
    timestamp: "5 mins ago",
    type: "verify",
  },
  {
    id: "a2",
    action: "New listing added to directory",
    target: "Sweet Surrender",
    user: "Mij",
    timestamp: "1 hour ago",
    type: "create",
  },
  {
    id: "a3",
    action: "Opening hours updated",
    target: "Istanbul Grill",
    user: "Mij",
    timestamp: "2 hours ago",
    type: "update",
  },
  {
    id: "a4",
    action: "Full CSV export completed (423 listings)",
    target: "System",
    user: "System",
    timestamp: "3 hours ago",
    type: "export",
  },
  {
    id: "a5",
    action: "Listing flagged for verification",
    target: "Crown Fried Chicken",
    user: "Mij",
    timestamp: "5 hours ago",
    type: "update",
  },
  {
    id: "a6",
    action: "Partial halal status confirmed",
    target: "Nando's (chain)",
    user: "Mij",
    timestamp: "Yesterday",
    type: "verify",
  },
];

// ─── Pending Verifications ───────────────────────────────────────────────────

export const pendingVerifications: PendingVerification[] = [
  {
    id: "pv1",
    name: "Crown Fried Chicken",
    cuisine: "Chicken · Takeaway",
    addedDate: "Added 10 Jun 2024",
    gradientFrom: "#EAB308",
    gradientTo: "#A16207",
  },
  {
    id: "pv2",
    name: "Basmati Blues",
    cuisine: "Indian · Didsbury",
    addedDate: "Added 1 May 2024",
    gradientFrom: "#14B8A6",
    gradientTo: "#0F766E",
  },
  {
    id: "pv3",
    name: "Al-Faisal",
    cuisine: "Pakistani · Self-Cert",
    addedDate: "Added 1 Mar 2024",
    gradientFrom: "#8B5CF6",
    gradientTo: "#4C1D95",
  },
];

// ─── SEO Types ───────────────────────────────────────────────────────────────

export type KeywordStatus = "targeting" | "not-targeting" | "live";
export type PageStatus = "live" | "draft" | "not-enough-listings" | "needs-content";
export type PageType = "area" | "cuisine" | "cuisine-area" | "chain" | "feature" | "vibe";

export interface SeoKeyword {
  id: string;
  keyword: string;
  volume: "high" | "medium" | "low" | number;
  kd: "low" | "medium" | "high";
  targetPage: string;
  status: KeywordStatus;
  pageType: PageType | "listing";
}

export interface ProgrammaticPage {
  id: string;
  title: string;
  slug: string;
  targetKeyword: string;
  listingsCount: number;
  minListingsRequired: number;
  status: PageStatus;
  pageType: PageType;
  lastUpdated: string;
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
}

export interface SeoRedirect {
  id: string;
  from: string;
  to: string;
  type: "301" | "302";
  created: string;
  active: boolean;
}

// ─── SEO Keywords ────────────────────────────────────────────────────────────

export const seoKeywords: SeoKeyword[] = [
  { id: "k1",  keyword: "halal restaurants manchester",           volume: "high",   kd: "low",    targetPage: "/manchester",                              status: "live",          pageType: "area" },
  { id: "k2",  keyword: "halal brunch manchester",                volume: 720,      kd: "low",    targetPage: "/manchester/halal-brunch",                 status: "targeting",     pageType: "vibe" },
  { id: "k3",  keyword: "is kfc halal",                          volume: "high",   kd: "low",    targetPage: "/is-kfc-halal",                            status: "live",          pageType: "chain" },
  { id: "k4",  keyword: "is nandos halal",                       volume: "high",   kd: "low",    targetPage: "/is-nandos-halal",                         status: "live",          pageType: "chain" },
  { id: "k5",  keyword: "halal indian manchester",               volume: "high",   kd: "low",    targetPage: "/manchester/indian-restaurants",            status: "live",          pageType: "cuisine" },
  { id: "k6",  keyword: "halal turkish manchester",              volume: "high",   kd: "low",    targetPage: "/manchester/turkish-restaurants",           status: "targeting",     pageType: "cuisine" },
  { id: "k7",  keyword: "halal restaurants rusholme",            volume: "high",   kd: "low",    targetPage: "/rusholme",                                status: "live",          pageType: "area" },
  { id: "k8",  keyword: "halal restaurants fallowfield",         volume: "high",   kd: "low",    targetPage: "/fallowfield",                             status: "targeting",     pageType: "area" },
  { id: "k9",  keyword: "halal restaurant prayer room manchester", volume: 480,    kd: "low",    targetPage: "/manchester/halal-prayer-room",            status: "not-targeting", pageType: "feature" },
  { id: "k10", keyword: "halal mocktails manchester",            volume: 320,      kd: "low",    targetPage: "/manchester/halal-mocktails",              status: "not-targeting", pageType: "vibe" },
  { id: "k11", keyword: "halal date night manchester",           volume: 590,      kd: "low",    targetPage: "/manchester/date-night-halal",             status: "targeting",     pageType: "vibe" },
  { id: "k12", keyword: "wheelchair accessible halal restaurant manchester", volume: 210, kd: "low", targetPage: "/manchester/halal-wheelchair-accessible", status: "not-targeting", pageType: "feature" },
  { id: "k13", keyword: "late night halal manchester",           volume: 880,      kd: "low",    targetPage: "/manchester/halal-late-night",             status: "targeting",     pageType: "vibe" },
  { id: "k14", keyword: "student halal food fallowfield",        volume: 390,      kd: "low",    targetPage: "/fallowfield/student-halal",               status: "not-targeting", pageType: "vibe" },
  { id: "k15", keyword: "hmc certified manchester",              volume: "medium", kd: "low",    targetPage: "/manchester/hmc-certified",                status: "not-targeting", pageType: "feature" },
  { id: "k16", keyword: "halal family restaurant manchester",    volume: 720,      kd: "low",    targetPage: "/manchester/family-friendly-halal",        status: "targeting",     pageType: "vibe" },
  { id: "k17", keyword: "is subway halal",                       volume: "high",   kd: "low",    targetPage: "/is-subway-halal",                         status: "live",          pageType: "chain" },
  { id: "k18", keyword: "is greggs halal",                       volume: "high",   kd: "low",    targetPage: "/is-greggs-halal",                         status: "live",          pageType: "chain" },
  { id: "k19", keyword: "halal restaurants open late manchester", volume: 650,     kd: "low",    targetPage: "/manchester/halal-late-night",             status: "targeting",     pageType: "vibe" },
  { id: "k20", keyword: "halal private dining manchester",       volume: 290,      kd: "low",    targetPage: "/manchester/halal-private-dining",         status: "not-targeting", pageType: "feature" },
];

// ─── Programmatic Pages ───────────────────────────────────────────────────────

export const programmaticPages: ProgrammaticPage[] = [
  // Area pages
  { id: "p1",  title: "Halal Restaurants in Rusholme",           slug: "/rusholme",                             targetKeyword: "halal restaurants rusholme",           listingsCount: 8,  minListingsRequired: 3, status: "live",                  pageType: "area",         lastUpdated: "2026-05-10", metaTitle: "Best Halal Restaurants in Rusholme, Manchester", metaDescription: "Discover the best HMC and HFA certified halal restaurants in Rusholme, Manchester's curry mile. Zouk, Al-Faisal and more." },
  { id: "p2",  title: "Halal Restaurants in City Centre",        slug: "/city-centre",                          targetKeyword: "halal restaurants manchester city centre", listingsCount: 5, minListingsRequired: 3, status: "live",                  pageType: "area",         lastUpdated: "2026-05-10" },
  { id: "p3",  title: "Halal Restaurants in Northern Quarter",   slug: "/northern-quarter",                     targetKeyword: "halal restaurants northern quarter",   listingsCount: 3,  minListingsRequired: 3, status: "live",                  pageType: "area",         lastUpdated: "2026-05-08" },
  { id: "p4",  title: "Halal Restaurants in Fallowfield",        slug: "/fallowfield",                          targetKeyword: "halal restaurants fallowfield",        listingsCount: 2,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "area",         lastUpdated: "2026-05-01" },
  { id: "p5",  title: "Halal Restaurants in Didsbury",           slug: "/didsbury",                             targetKeyword: "halal restaurants didsbury",           listingsCount: 1,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "area",         lastUpdated: "2026-04-20" },
  // Cuisine pages
  { id: "p6",  title: "Indian Halal Restaurants Manchester",     slug: "/manchester/indian-restaurants",        targetKeyword: "halal indian manchester",              listingsCount: 5,  minListingsRequired: 3, status: "live",                  pageType: "cuisine",      lastUpdated: "2026-05-10" },
  { id: "p7",  title: "Turkish Halal Restaurants Manchester",    slug: "/manchester/turkish-restaurants",       targetKeyword: "halal turkish manchester",             listingsCount: 2,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "cuisine",      lastUpdated: "2026-05-01" },
  { id: "p8",  title: "Pakistani Halal Restaurants Manchester",  slug: "/manchester/pakistani-restaurants",     targetKeyword: "halal pakistani manchester",           listingsCount: 4,  minListingsRequired: 3, status: "live",                  pageType: "cuisine",      lastUpdated: "2026-05-10" },
  { id: "p9",  title: "Lebanese Halal Restaurants Manchester",   slug: "/manchester/lebanese-restaurants",      targetKeyword: "halal lebanese manchester",            listingsCount: 1,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "cuisine",      lastUpdated: "2026-04-15" },
  // Cuisine+Area pages
  { id: "p10", title: "Indian Restaurants in Rusholme",          slug: "/rusholme/indian-restaurants",          targetKeyword: "halal indian rusholme",                listingsCount: 3,  minListingsRequired: 3, status: "live",                  pageType: "cuisine-area", lastUpdated: "2026-05-10" },
  { id: "p11", title: "Pakistani Restaurants in Rusholme",       slug: "/rusholme/pakistani-restaurants",       targetKeyword: "halal pakistani rusholme",             listingsCount: 2,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "cuisine-area", lastUpdated: "2026-05-01" },
  // Chain pages
  { id: "p12", title: "Is KFC Halal?",                           slug: "/is-kfc-halal",                         targetKeyword: "is kfc halal",                         listingsCount: 0,  minListingsRequired: 0, status: "live",                  pageType: "chain",        lastUpdated: "2026-05-01" },
  { id: "p13", title: "Is Nando's Halal?",                       slug: "/is-nandos-halal",                      targetKeyword: "is nandos halal",                      listingsCount: 0,  minListingsRequired: 0, status: "live",                  pageType: "chain",        lastUpdated: "2026-05-01" },
  { id: "p14", title: "Is McDonald's Halal?",                    slug: "/is-mcdonalds-halal",                   targetKeyword: "is mcdonalds halal",                   listingsCount: 0,  minListingsRequired: 0, status: "live",                  pageType: "chain",        lastUpdated: "2026-04-15" },
  { id: "p15", title: "Is Subway Halal?",                        slug: "/is-subway-halal",                      targetKeyword: "is subway halal",                      listingsCount: 0,  minListingsRequired: 0, status: "live",                  pageType: "chain",        lastUpdated: "2026-05-01" },
  { id: "p16", title: "Is Greggs Halal?",                        slug: "/is-greggs-halal",                      targetKeyword: "is greggs halal",                      listingsCount: 0,  minListingsRequired: 0, status: "live",                  pageType: "chain",        lastUpdated: "2026-05-01" },
  { id: "p17", title: "Is Five Guys Halal?",                     slug: "/is-five-guys-halal",                   targetKeyword: "is five guys halal",                   listingsCount: 0,  minListingsRequired: 0, status: "needs-content",         pageType: "chain",        lastUpdated: "2026-03-01" },
  { id: "p18", title: "Is Pizza Express Halal?",                 slug: "/is-pizza-express-halal",               targetKeyword: "is pizza express halal",               listingsCount: 0,  minListingsRequired: 0, status: "live",                  pageType: "chain",        lastUpdated: "2026-04-20" },
  // Vibe pages
  { id: "p19", title: "Halal Date Night Manchester",             slug: "/manchester/date-night-halal",          targetKeyword: "halal date night manchester",          listingsCount: 2,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "vibe",         lastUpdated: "2026-05-01" },
  { id: "p20", title: "Family Friendly Halal Restaurants Manchester", slug: "/manchester/family-friendly-halal", targetKeyword: "halal family restaurant manchester", listingsCount: 4,  minListingsRequired: 3, status: "live",                  pageType: "vibe",         lastUpdated: "2026-05-10" },
  { id: "p21", title: "Late Night Halal Manchester",             slug: "/manchester/halal-late-night",          targetKeyword: "late night halal manchester",          listingsCount: 2,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "vibe",         lastUpdated: "2026-05-01" },
  { id: "p22", title: "Halal Prayer Room Restaurants Manchester", slug: "/manchester/halal-prayer-room",        targetKeyword: "halal restaurant prayer room manchester", listingsCount: 2, minListingsRequired: 3, status: "not-enough-listings",  pageType: "feature",      lastUpdated: "2026-04-20" },
  { id: "p23", title: "Halal Mocktails Manchester",              slug: "/manchester/halal-mocktails",           targetKeyword: "halal mocktails manchester",           listingsCount: 1,  minListingsRequired: 3, status: "not-enough-listings",   pageType: "vibe",         lastUpdated: "2026-04-01" },
  { id: "p24", title: "Student Halal Food Fallowfield",          slug: "/fallowfield/student-halal",            targetKeyword: "student halal food fallowfield",       listingsCount: 3,  minListingsRequired: 3, status: "live",                  pageType: "vibe",         lastUpdated: "2026-05-08" },
];

// ─── SEO Redirects ───────────────────────────────────────────────────────────

export const seoRedirects: SeoRedirect[] = [
  { id: "r1", from: "/halal-restaurants/manchester", to: "/manchester",           type: "301", created: "2024-03-01", active: true },
  { id: "r2", from: "/curry-mile",                  to: "/rusholme",             type: "301", created: "2024-03-01", active: true },
  { id: "r3", from: "/kfc-halal",                   to: "/is-kfc-halal",         type: "301", created: "2024-04-15", active: true },
  { id: "r4", from: "/nandos-halal",                to: "/is-nandos-halal",      type: "301", created: "2024-04-15", active: true },
  { id: "r5", from: "/manchester/indian",           to: "/manchester/indian-restaurants", type: "301", created: "2024-06-01", active: true },
  { id: "r6", from: "/old-listings/zouk",           to: "/restaurants/zouk-restaurant-manchester", type: "301", created: "2024-07-10", active: true },
  { id: "r7", from: "/blog/is-subway-halal",        to: "/is-subway-halal",      type: "301", created: "2024-08-20", active: false },
];
