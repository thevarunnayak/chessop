"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getAllOpenings } from "@/lib/openings/service";
import { EcoCategory, Opening } from "@/types/opening";
import { InfiniteOpeningGrid } from "@/components/openings/InfiniteOpeningGrid";
import { BookOpen, Search, Filter, Layers, ArrowUpDown, ArrowDownAZ, GitBranch } from "lucide-react";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { cn } from "@/lib/utils/cn";

const SORT_OPTIONS: SelectOption<"eco" | "name" | "depth">[] = [
  { value: "eco", label: "ECO Code", icon: <ArrowUpDown className="w-3.5 h-3.5 text-brand-gold shrink-0" /> },
  { value: "name", label: "Name (A-Z)", icon: <ArrowDownAZ className="w-3.5 h-3.5 text-brand-accent shrink-0" /> },
  { value: "depth", label: "Move Depth", icon: <GitBranch className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> },
];

const CATEGORIES: { id: "ALL" | EcoCategory; label: string }[] = [
  { id: "ALL", label: "All Volumes" },
  { id: "A", label: "A — Flank & Irregular" },
  { id: "B", label: "B — Semi-Open (Sicilian)" },
  { id: "C", label: "C — Open Games & French" },
  { id: "D", label: "D — Closed & Queen's Gambit" },
  { id: "E", label: "E — Indian Defenses" },
];

function OpeningsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<"ALL" | EcoCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState<"eco" | "name" | "depth">("eco");

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search") || "";
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const allOpenings = useMemo(() => getAllOpenings(), []);

  const filteredOpenings = useMemo(() => {
    return allOpenings
      .filter((op) => {
        if (selectedCategory !== "ALL" && op.category !== selectedCategory) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase().trim();
        return (
          op.name.toLowerCase().includes(q) ||
          op.eco.toLowerCase().includes(q) ||
          op.moves.join(" ").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOption === "name") return a.name.localeCompare(b.name);
        if (sortOption === "depth") return b.moves.length - a.moves.length;
        return a.eco.localeCompare(b.eco);
      });
  }, [allOpenings, selectedCategory, searchQuery, sortOption]);

  const displayedOpenings = filteredOpenings.slice(0, 48);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-brand-accent" />
            Opening Encyclopedia
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse indexed ECO A00–E99 chess openings and main variations
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-surface px-3 py-2 rounded-xl border border-surface-border self-start md:self-auto">
          <Layers className="w-4 h-4 text-brand-gold" />
          <span>{filteredOpenings.length} openings matched</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-4 rounded-2xl bg-surface border border-surface-border shadow-md">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap",
                selectedCategory === cat.id
                  ? "bg-brand text-white border border-brand-accent shadow-sm"
                  : "bg-surface-muted text-gray-300 hover:bg-surface-hover hover:text-white border border-surface-border"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Input & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Sicilian, B20, e4 c5..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-border bg-background text-xs text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none"
            />
          </div>

          <CustomSelect
            value={sortOption}
            options={SORT_OPTIONS}
            onChange={(val) => setSortOption(val)}
            className="w-44"
          />
        </div>
      </div>

      {/* Infinite Scroll Opening Grid */}
      <InfiniteOpeningGrid
        openings={filteredOpenings}
        batchSize={24}
        emptyMessage="No openings found matching your current filter and search query."
      />
    </div>
  );
}

import { LoadingSplash } from "@/components/brand/LoadingSplash";

export default function OpeningsPage() {
  return (
    <Suspense fallback={<LoadingSplash fullScreen={false} message="Loading Opening Catalog & ECO Index..." />}>
      <OpeningsContent />
    </Suspense>
  );
}
