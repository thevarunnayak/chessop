"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getAllOpenings } from "@/lib/openings/service";
import { EcoCategory, Opening } from "@/types/opening";
import { InfiniteOpeningGrid } from "@/components/openings/InfiniteOpeningGrid";
import { BookOpen, Search, Filter, Layers, ArrowUp, ArrowDown, ArrowUpDown, ArrowDownAZ, GitBranch } from "lucide-react";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { cn } from "@/lib/utils/cn";

export type SortField = "eco" | "name" | "depth" | "none";
export type SortDirection = "asc" | "desc" | "none";

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
  const [sortField, setSortField] = useState<SortField>("eco");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search") || "";
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const allOpenings = useMemo(() => getAllOpenings(), []);

  // 3-State Sort Cycle: 1st click = Ascending (↑), 2nd click = Descending (↓), 3rd click = Unsorted (OFF)
  function handleSortSelect(field: SortField) {
    if (field === "none") {
      setSortField("none");
      setSortDirection("none");
      return;
    }

    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField("none");
        setSortDirection("none");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  // Generate dynamic dropdown option labels with directional up/down arrows at the right end
  const sortOptions = useMemo<SelectOption<SortField>[]>(() => {
    return [
      {
        value: "eco",
        label: "ECO Code",
        icon: <ArrowUpDown className="w-3.5 h-3.5 text-brand-gold shrink-0" />,
        rightIcon:
          sortField === "eco" ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-4 h-4 text-brand-gold shrink-0" />
            ) : undefined
          ) : undefined,
      },
      {
        value: "name",
        label: "Name (A-Z)",
        icon: <ArrowDownAZ className="w-3.5 h-3.5 text-brand-accent shrink-0" />,
        rightIcon:
          sortField === "name" ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-4 h-4 text-brand-gold shrink-0" />
            ) : undefined
          ) : undefined,
      },
      {
        value: "depth",
        label: "Move Depth",
        icon: <GitBranch className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        rightIcon:
          sortField === "depth" ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-4 h-4 text-brand-gold shrink-0" />
            ) : undefined
          ) : undefined,
      },
      {
        value: "none",
        label: "Unsorted (Default)",
        icon: <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />,
      },
    ];
  }, [sortField, sortDirection]);

  const filteredOpenings = useMemo(() => {
    let result = allOpenings.filter((op) => {
      if (selectedCategory !== "ALL" && op.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        op.name.toLowerCase().includes(q) ||
        op.eco.toLowerCase().includes(q) ||
        op.moves.join(" ").toLowerCase().includes(q)
      );
    });

    if (sortField !== "none" && sortDirection !== "none") {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortField === "name") {
          cmp = a.name.localeCompare(b.name);
        } else if (sortField === "depth") {
          cmp = a.moves.length - b.moves.length;
        } else if (sortField === "eco") {
          cmp = a.eco.localeCompare(b.eco);
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [allOpenings, selectedCategory, searchQuery, sortField, sortDirection]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
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

        {/* Search Input & Dynamic Sort Dropdown with Direction Arrows */}
        <div className="flex items-center gap-2.5">
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

          {/* Custom Select Sort Field with Integrated Direction Arrows */}
          <CustomSelect
            value={sortField}
            options={sortOptions}
            onChange={(val) => handleSortSelect(val)}
            className="w-56 sm:w-60"
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
