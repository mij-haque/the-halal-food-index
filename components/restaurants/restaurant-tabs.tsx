"use client";

import { useState } from "react";
import { CheckCircle2, Clock, MapPin, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types";

const TABS = ["About", "Halal Info", "Hours", "Reviews", "Location", "FAQ"] as const;
type Tab = (typeof TABS)[number];


export function RestaurantTabs({ restaurant }: { restaurant: Restaurant }) {
  const [active, setActive] = useState<Tab>("About");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-100 -mx-4 sm:mx-0 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max sm:min-w-0 px-4 sm:px-0 gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                active === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {/* ABOUT */}
        {active === "About" && (
          <div className="space-y-5">
            <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
            {restaurant.highlights && (
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-3">Highlights</h3>
                <ul className="space-y-2">
                  {restaurant.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Meals Served</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.meals.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-3 py-1"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HALAL INFO */}
        {active === "Halal Info" && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#0F172A] mb-0.5">
                  {restaurant.halalCertification}
                </div>
                {restaurant.certificationBody && (
                  <div className="text-sm text-gray-600">
                    Certified by: {restaurant.certificationBody}
                  </div>
                )}
              </div>
            </div>
            {restaurant.certExpiry && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 text-sm">
                <span className="text-gray-500">Certificate Expiry</span>
                <span className="font-medium text-[#0F172A]">{restaurant.certExpiry}</span>
              </div>
            )}
            {restaurant.certNotes && (
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-2">Notes</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">
                  {restaurant.certNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* HOURS */}
        {active === "Hours" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {restaurant.openingHours?.map((h, i) => (
                <div
                  key={h.day}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm",
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/60",
                    h.closed && "opacity-50"
                  )}
                >
                  <span className="font-medium text-[#0F172A] w-28">{h.day}</span>
                  <span className="text-gray-600">
                    {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                  </span>
                </div>
              ))}
            </div>
            {restaurant.busyness && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">
                    {restaurant.busyness}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Based on typical visit patterns
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {active === "Reviews" && (
          <div className="space-y-5">
            {/* Score */}
            <div className="flex items-center gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-5xl font-bold text-primary leading-none">
                {restaurant.score}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">
                  out of 10
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Based on {restaurant.reviewCount?.toLocaleString()} reviews
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {restaurant.reviewSummary && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  ✨ AI Review Summary
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {restaurant.reviewSummary}
                </p>
              </div>
            )}

            {/* Keywords */}
            {restaurant.reviewKeywords && (
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-3">
                  Frequently mentioned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.reviewKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs font-medium border border-gray-200 text-gray-600 rounded-full px-3 py-1.5 bg-white"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 border border-emerald-100"
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOCATION */}
        {active === "Location" && (
          <div className="space-y-4">
            {/* Map placeholder */}
            <div className="w-full h-52 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative">
              <div className="text-center text-gray-400">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <span className="text-sm">Map coming soon</span>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <div>{restaurant.location.address}</div>
                  <div>{restaurant.location.city}</div>
                  <div className="font-medium">{restaurant.location.postcode}</div>
                </div>
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-sm text-gray-700 hover:text-primary transition-colors"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              )}
              {restaurant.website && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>

            {/* Meals + amenities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide mb-2">
                  Meals
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {restaurant.meals.map((m) => (
                    <span key={m} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide mb-2">
                  Reservations
                </h3>
                <span className={cn("text-xs font-medium rounded-full px-2.5 py-1",
                  restaurant.reservations
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500")}>
                  {restaurant.reservations ? "Available" : "Walk-in only"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {active === "FAQ" && (
          <div className="space-y-2">
            {restaurant.faqs?.map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#0F172A] pr-4">
                    {faq.question}
                  </span>
                  <span
                    className={cn(
                      "text-gray-400 text-lg leading-none transition-transform shrink-0",
                      openFaq === i && "rotate-45"
                    )}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
            {(!restaurant.faqs || restaurant.faqs.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-8">
                No FAQs available for this restaurant yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
