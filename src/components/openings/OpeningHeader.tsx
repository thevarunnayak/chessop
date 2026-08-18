"use client";

import Link from "next/link";
import { Opening } from "@/types/opening";
import { GitBranch, Tag, ArrowRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface OpeningHeaderProps {
  opening?: Opening;
  parentOpening?: Opening;
  moveDepth: number;
  onAddToCollection?: () => void;
  className?: string;
}

export function OpeningHeader({ opening, parentOpening, moveDepth, onAddToCollection, className }: OpeningHeaderProps) {
  if (!opening) {
    return (
      <div className={cn("p-5 rounded-xl border border-surface-border bg-surface", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-border text-gray-400">
              ECO ---
            </span>
            <span className="text-xs text-gray-400 font-mono">Custom Position</span>
          </div>

          {onAddToCollection && (
            <button
              onClick={onAddToCollection}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-xs font-mono font-semibold hover:bg-brand-accent/20 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Prep</span>
            </button>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
          Unclassified Opening Position
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          This valid chess position is outside the standard ECO dataset index.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-5 rounded-xl border border-surface-border bg-surface space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-surface-border text-brand-gold border border-brand-gold/30">
            ECO {opening.eco}
          </span>
          <span className="text-xs font-medium text-gray-300 bg-surface-muted px-2.5 py-1 rounded-md border border-surface-border">
            {opening.categoryName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">
            Depth: {moveDepth} {moveDepth === 1 ? "ply" : "plies"}
          </span>

          {onAddToCollection && (
            <button
              onClick={onAddToCollection}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-xs font-mono font-semibold hover:bg-brand-accent/20 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Prep</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          {opening.name}
        </h1>
        {parentOpening && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <GitBranch className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Branch of</span>
            <Link
              href={`/explorer?moves=${encodeURIComponent(parentOpening.moves.join(","))}`}
              className="text-brand-accent hover:underline font-semibold"
            >
              {parentOpening.name}
            </Link>
          </div>
        )}
      </div>

      {opening.moves.length > 0 && (
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Main Line</span>
          <span className="font-mono text-xs text-brand-accent font-semibold">
            {opening.moves.join(" ")}
          </span>
        </div>
      )}
    </div>
  );
}
