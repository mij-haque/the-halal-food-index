"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterState {
  certifications: string[];
  cuisines: string[];
  areas: string[];
  meals: string[];
  priceRange: number[];
  minRating: number | null;
  amenities: string[];
}

const defaultFilters: FilterState = {
  certifications: [],
  cuisines: [],
  areas: [],
  meals: [],
  priceRange: [],
  minRating: null,
  amenities: [],
};

const CERT_OPTIONS = ["HMC", "HFA", "AHFA", "Self-Certified", "Awaiting Verification"];
const CUISINE_OPTIONS = ["Indian", "Pakistani", "Turkish", "Arabic", "Lebanese", "Burgers", "Desserts", "Pizza", "Bangladeshi"];
const AREA_OPTIONS = ["City Centre", "Rusholme", "Longsight", "Northern Quarter", "Didsbury", "Fallowfield", "Levenshulme", "Chorlton"];
const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Late Night"];
const AMENITY_OPTIONS = ["Delivery", "Takeaway", "Dine-in", "Outdoor Seating", "Parking", "Wheelchair Accessible"];

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={cn(
          "h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
          checked
            ? "bg-primary border-primary"
            : "border-gray-300 group-hover:border-primary/50"
        )}
        style={{ height: "18px", width: "18px" }}
        onClick={onChange}
      >
        {checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700 select-none">{label}</span>
    </label>
  );
}

export function FilterPanel({ isOpen, onClose, onApply }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const toggle = (key: keyof FilterState, value: string | number) => {
    setFilters((prev) => {
      const arr = prev[key] as (string | number)[];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const setMinRating = (val: number) => {
    setFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === val ? null : val,
    }));
  };

  const reset = () => setFilters(defaultFilters);

  const activeCount =
    filters.certifications.length +
    filters.cuisines.length +
    filters.areas.length +
    filters.meals.length +
    filters.priceRange.length +
    (filters.minRating ? 1 : 0) +
    filters.amenities.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-[#0F172A]">Filters</h2>
            {activeCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Halal Certification */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Halal Certification
            </h3>
            <div className="space-y-3">
              {CERT_OPTIONS.map((c) => (
                <CheckItem
                  key={c}
                  label={c}
                  checked={filters.certifications.includes(c)}
                  onChange={() => toggle("certifications", c)}
                />
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Cuisine
            </h3>
            <div className="space-y-3">
              {CUISINE_OPTIONS.map((c) => (
                <CheckItem
                  key={c}
                  label={c}
                  checked={filters.cuisines.includes(c)}
                  onChange={() => toggle("cuisines", c)}
                />
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Area / Neighbourhood
            </h3>
            <div className="space-y-3">
              {AREA_OPTIONS.map((a) => (
                <CheckItem
                  key={a}
                  label={a}
                  checked={filters.areas.includes(a)}
                  onChange={() => toggle("areas", a)}
                />
              ))}
            </div>
          </div>

          {/* Meals */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Meals
            </h3>
            <div className="space-y-3">
              {MEAL_OPTIONS.map((m) => (
                <CheckItem
                  key={m}
                  label={m}
                  checked={filters.meals.includes(m)}
                  onChange={() => toggle("meals", m)}
                />
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Price Range
            </h3>
            <div className="flex gap-2">
              {[
                { val: 1, label: "£" },
                { val: 2, label: "££" },
                { val: 3, label: "£££" },
                { val: 4, label: "££££" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => toggle("priceRange", val)}
                  className={cn(
                    "flex-1 rounded-full border py-2 text-sm font-medium transition-all",
                    filters.priceRange.includes(val)
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 text-gray-600 hover:border-primary/40"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum rating */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Minimum Score
            </h3>
            <div className="flex gap-2">
              {[6, 7, 8, 9].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={cn(
                    "flex-1 rounded-full border py-2 text-sm font-medium transition-all",
                    filters.minRating === r
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 text-gray-600 hover:border-primary/40"
                  )}
                >
                  {r}+
                </button>
              ))}
            </div>
          </div>

          {/* Features / amenities */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Features
            </h3>
            <div className="space-y-3">
              {AMENITY_OPTIONS.map((a) => (
                <CheckItem
                  key={a}
                  label={a}
                  checked={filters.amenities.includes(a)}
                  onChange={() => toggle("amenities", a)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            className="flex-1 rounded-full bg-primary text-white py-3 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Show results
            {activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>
      </div>
    </>
  );
}
