"use client";

import Link from "next/link";
import { Opening } from "@/types/opening";
import { RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TranspositionPanelProps {
  transpositions: Opening[];
  className?: string;
}

export function TranspositionPanel({ transpositions, className }: TranspositionPanelProps) {
  if (transpositions.length === 0) return null;

  return (
    <div className={cn("p-4 rounded-xl border border-brand-gold/40 bg-brand-gold/5 space-y-3", className)}>
      <div className="flex items-center gap-2 text-brand-gold">
        <RefreshCw className="w-4 h-4 animate-spin-slow shrink-0" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
          Transposition Detected
        </h4>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        This position can also be reached via alternative move orders:
      </p>

      <div className="space-y-2">
        {transpositions.map((t) => (
          <Link
            key={t.id}
            href={`/explorer?moves=${encodeURIComponent(t.moves.join(","))}`}
            className="flex items-center justify-between p-2.5 rounded-lg border border-surface-border bg-surface hover:bg-surface-hover hover:border-brand-gold transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-border text-brand-gold">
                {t.eco}
              </span>
              <span className="text-xs font-semibold text-foreground group-hover:text-brand-gold transition-colors">
                {t.name}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-gold transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
