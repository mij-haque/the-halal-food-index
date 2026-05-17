import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { restaurants } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Restaurants",
};

const PRICE_SYMBOLS: Record<number, string> = { 1: "£", 2: "££", 3: "£££", 4: "££££" };

export default function AdminRestaurantsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Restaurants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all listings in the directory
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Restaurant
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search restaurants..." className="pl-10 bg-card" />
        </div>
        <select className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option>All statuses</option>
          <option>Verified</option>
          <option>Pending</option>
          <option>Flagged</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Restaurant
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cuisine
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                City
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Certification
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${
                  i % 2 === 0 ? "" : "bg-secondary/10"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.location.address}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.cuisine.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.location.city}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-primary">
                    {r.halalCertification}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {PRICE_SYMBOLS[r.priceRange]}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={r.verified ? "default" : "secondary"} className="text-xs">
                    {r.verified ? "Verified" : "Pending"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Options</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
