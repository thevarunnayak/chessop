"use client";

import { MoveContinuation } from "@/types/opening";
import { ChevronRight, GitCommit } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface VariationListProps {
  continuations: MoveContinuation[];
  onSelectMove: (san: string) => void;
  className?: string;
}

export function VariationList({ continuations, onSelectMove, className }: VariationListProps) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-surface-muted border-b border-surface-border">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-brand-accent" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
            Available Continuations
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-400">
          {continuations.length} {continuations.length === 1 ? "line" : "lines"}
        </span>
      </div>

      <div className="p-3 pt-3.5 pr-2 space-y-2 overflow-y-auto max-h-[300px]">
        {continuations.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-6">
            No further opening continuations indexed in database from this position.
          </div>
        ) : (
          continuations.map((cont, idx) => (
            <button
              key={`${cont.san}-${idx}`}
              onClick={() => onSelectMove(cont.san)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-border bg-surface-muted hover:bg-surface-hover hover:border-brand-accent/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded border border-brand-accent/30 group-hover:bg-brand-accent group-hover:text-white transition-colors">
                  {cont.san}
                </span>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground group-hover:text-brand-accent transition-colors">
                    {cont.openingName || "Theory Continuation"}
                  </span>
                  {cont.eco && (
                    <span className="text-[10px] font-mono text-brand-gold">
                      ECO {cont.eco}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
