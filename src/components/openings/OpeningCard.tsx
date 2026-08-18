"use client";

import Link from "next/link";
import { Opening } from "@/types/opening";
import { ArrowRight, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface OpeningCardProps {
  opening: Opening;
  className?: string;
}

export function OpeningCard({ opening, className }: OpeningCardProps) {
  const moveStr = opening.moves.join(" ");

  return (
    <Link
      href={`/openings/${opening.id}`}
      className={cn(
        "group flex flex-col justify-between p-5 rounded-xl border border-surface-border bg-surface hover:border-brand-accent/50 hover:bg-surface-hover transition-all shadow-sm",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-surface-border text-brand-gold border border-brand-gold/30">
            ECO {opening.eco}
          </span>
          <span className="text-[11px] font-mono text-gray-400">
            {opening.categoryName.split("(")[0].trim()}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground group-hover:text-brand-accent transition-colors line-clamp-1">
          {opening.name}
        </h3>
      </div>

      <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
        <span className="font-mono text-xs text-gray-300 truncate max-w-[220px]">
          {moveStr}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
