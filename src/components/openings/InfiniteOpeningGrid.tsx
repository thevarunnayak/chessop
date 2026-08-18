"use client";

import { useState, useEffect, useRef } from "react";
import { Opening } from "@/types/opening";
import { OpeningCard } from "./OpeningCard";
import { Loader2 } from "lucide-react";

interface InfiniteOpeningGridProps {
  openings: Opening[];
  batchSize?: number;
  emptyMessage?: string;
}

export function InfiniteOpeningGrid({
  openings,
  batchSize = 24,
  emptyMessage = "No openings found matching your criteria.",
}: InfiniteOpeningGridProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when opening set changes
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [openings, batchSize]);

  // Setup IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + batchSize, openings.length));
        }
      },
      { rootMargin: "300px" }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [openings.length, batchSize]);

  if (openings.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400 bg-surface rounded-2xl border border-surface-border shadow-md">
        {emptyMessage}
      </div>
    );
  }

  const displayed = openings.slice(0, visibleCount);
  const hasMore = visibleCount < openings.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((op) => (
          <OpeningCard key={op.id} opening={op} />
        ))}
      </div>

      {/* Sentinel & Loading Footer */}
      {hasMore && (
        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-2 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-surface-border shadow-sm">
            <Loader2 className="w-4 h-4 text-brand-accent animate-spin" />
            <span>Loading more openings ({displayed.length} of {openings.length})...</span>
          </div>
        </div>
      )}

      {!hasMore && openings.length > batchSize && (
        <div className="py-4 text-center text-xs font-mono text-gray-400">
          ✓ All {openings.length} openings loaded
        </div>
      )}
    </div>
  );
}
