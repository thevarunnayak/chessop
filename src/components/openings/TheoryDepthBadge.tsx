"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TheoryDepthBadgeProps {
  isKnownTheory: boolean;
  depth: number;
  className?: string;
}

export function TheoryDepthBadge({ isKnownTheory, depth, className }: TheoryDepthBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono font-medium transition-colors",
        isKnownTheory
          ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
          : "border-amber-500/40 bg-amber-500/10 text-amber-400",
        className
      )}
    >
      {isKnownTheory ? (
        <>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-accent" />
          <span>Known Opening Position (Ply {depth})</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Opening theory coverage ends at ply {depth}</span>
        </>
      )}
    </div>
  );
}
