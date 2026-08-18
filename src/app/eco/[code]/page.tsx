"use client";

import { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOpeningsByCategory, getOpeningsByEco } from "@/lib/openings/service";
import { EcoCategory } from "@/types/opening";
import { InfiniteOpeningGrid } from "@/components/openings/InfiniteOpeningGrid";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { Layers, ArrowLeft, Search, ArrowUpDown, ArrowDownAZ, GitBranch } from "lucide-react";

interface EcoCodePageProps {
  params: {
    code: string;
  };
}

const SORT_OPTIONS: SelectOption<"eco" | "name" | "depth">[] = [
  { value: "eco", label: "ECO Code", icon: <ArrowUpDown className="w-3.5 h-3.5 text-brand-gold shrink-0" /> },
  { value: "name", label: "Name (A-Z)", icon: <ArrowDownAZ className="w-3.5 h-3.5 text-brand-accent shrink-0" /> },
  { value: "depth", label: "Move Depth", icon: <GitBranch className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> },
];

export default function EcoCodePage({ params }: EcoCodePageProps) {
  const codeUpper = params.code.toUpperCase().trim();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"eco" | "name" | "depth">("eco");

  const rawOpenings = useMemo(() => {
    if (["A", "B", "C", "D", "E"].includes(codeUpper)) {
      return getOpeningsByCategory(codeUpper as EcoCategory);
    }
    return getOpeningsByEco(codeUpper);
  }, [codeUpper]);

  const filteredOpenings = useMemo(() => {
    return rawOpenings
      .filter((op) => {
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
  }, [rawOpenings, searchQuery, sortOption]);

  if (rawOpenings.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          href="/eco"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ECO Classification Index
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-brand-gold" />
            ECO Volume {codeUpper}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Displaying classified openings in volume {codeUpper}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-surface px-3 py-2 rounded-xl border border-surface-border self-start sm:self-auto">
          <span>{filteredOpenings.length} openings matched</span>
        </div>
      </div>

      {/* Search & Custom Sort Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-surface-border shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search volume ${codeUpper} (e.g. Sicilian, B20, e4 c5)...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border bg-background text-xs text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none"
          />
        </div>

        <CustomSelect
          value={sortOption}
          options={SORT_OPTIONS}
          onChange={(val) => setSortOption(val)}
          className="w-full sm:w-44"
        />
      </div>

      {/* Infinite Scroll Opening Grid */}
      <InfiniteOpeningGrid
        openings={filteredOpenings}
        batchSize={24}
        emptyMessage={`No openings found in Volume ${codeUpper} matching your search query.`}
      />
    </div>
  );
}
