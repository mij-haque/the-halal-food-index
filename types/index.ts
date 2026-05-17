export type HalalCertification =
  | "HMC"
  | "HFA"
  | "AHFA"
  | "Self-Certified"
  | "Awaiting Verification";

export type PriceRange = 1 | 2 | 3 | 4;

export interface Cuisine {
  id: string;
  name: string;
  slug: string;
  emoji: string;
}

export interface Location {
  address: string;
  city: string;
  postcode: string;
  region: string;
  lat?: number;
  lng?: number;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine: Cuisine;
  location: Location;
  area: string;
  phone?: string;
  website?: string;
  email?: string;
  priceRange: PriceRange;
  halalCertification: HalalCertification;
  certificationBody?: string;
  certExpiry?: string;
  certNotes?: string;
  score: number;
  reviewCount?: number;
  reviewSummary?: string;
  reviewKeywords?: string[];
  gradientFrom: string;
  gradientTo: string;
  tags: string[];
  highlights?: string[];
  faqs?: Faq[];
  meals: string[];
  amenities: string[];
  reservations?: boolean;
  isOpen: boolean;
  closingTime: string;
  busyness?: string;
  openingHours?: OpeningHours[];
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  cuisine?: string;
  city?: string;
  area?: string;
  priceRange?: PriceRange[];
  certification?: HalalCertification[];
  minScore?: number;
  meals?: string[];
  amenities?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
