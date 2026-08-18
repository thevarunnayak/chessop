"use client";

import { useState } from "react";
import Link from "next/link";
import { Opening } from "@/types/opening";
import { getOpeningById } from "@/lib/openings/service";
import { ChevronDown, ChevronRight, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface VariationTreeProps {
  currentOpening?: Opening;
  className?: string;
}

export function VariationTree({ currentOpening, className }: VariationTreeProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!currentOpening) return null;

  // Resolve child opening objects
  const childrenOpenings = (currentOpening.childrenIds || [])
    .map((id) => getOpeningById(id))
    .filter(Boolean) as Opening[];

  return (
    <div className={cn("rounded-xl border border-surface-border bg-surface overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-muted border-b border-surface-border hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-brand-accent" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
            Variation Tree
          </h3>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 font-mono text-xs overflow-x-auto">
          {/* Active Node */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-brand-accent bg-brand-accent/10 text-foreground font-semibold">
            <span className="text-brand-gold font-mono text-[11px]">ECO {currentOpening.eco}</span>
            <span className="truncate">{currentOpening.name}</span>
          </div>

          {/* Child Variations Tree */}
          {childrenOpenings.length > 0 ? (
            <div className="pl-4 border-l-2 border-surface-border space-y-2">
              {childrenOpenings.slice(0, 10).map((child) => (
                <div key={child.id} className="relative flex items-center gap-2">
                  <span className="text-gray-400 font-mono">├──</span>
                  <Link
                    href={`/explorer?moves=${encodeURIComponent(child.moves.join(","))}`}
                    className="flex-1 flex items-center justify-between p-2 rounded-md border border-surface-border bg-surface-muted hover:bg-surface-hover hover:border-brand-accent/40 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="truncate">{child.name}</span>
                    <span className="text-[10px] text-brand-gold ml-2 shrink-0">{child.eco}</span>
                  </Link>
                </div>
              ))}
              {childrenOpenings.length > 10 && (
                <div className="text-[11px] text-gray-400 italic pl-6">
                  + {childrenOpenings.length - 10} more variations indexed
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic text-center py-2">
              Deepest indexed leaf line (no sub-variations).
            </div>
          )}
        </div>
      )}
    </div>
  );
}
