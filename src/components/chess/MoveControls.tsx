"use client";

import { useEffect, useCallback } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  RotateCcw,
  ArrowUpDown,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MoveControlsProps {
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onReset: () => void;
  onFlip: () => void;
  canPrevious: boolean;
  canNext: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}

export function MoveControls({
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onReset,
  onFlip,
  canPrevious,
  canNext,
  isPlaying = false,
  onTogglePlay,
  className,
}: MoveControlsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (canPrevious) onPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (canNext) onNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        onFirst();
      } else if (e.key === "End") {
        e.preventDefault();
        onLast();
      }
    },
    [canPrevious, canNext, onPrevious, onNext, onFirst, onLast]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={cn("flex items-center justify-between gap-1 sm:gap-2 p-2 rounded-xl bg-surface border border-surface-border w-full", className)}>
      <div className="flex items-center gap-1">
        <button
          onClick={onReset}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-gray-300 hover:text-white hover:bg-surface-hover transition-colors"
          title="Reset to Starting Position (Home)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onFlip}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-gray-300 hover:text-white hover:bg-surface-hover transition-colors"
          title="Flip Board Orientation"
        >
          <ArrowUpDown className="w-4 h-4 text-brand-accent" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={onFirst}
          disabled={!canPrevious}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-gray-300 hover:text-white hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface-muted disabled:cursor-not-allowed transition-colors"
          title="First Move (Home)"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onPrevious}
          disabled={!canPrevious}
          className="flex h-11 w-11 sm:w-14 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-gray-300 hover:text-white hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface-muted disabled:cursor-not-allowed transition-colors"
          title="Previous Move (←)"
        >
          <ChevronLeft className="w-6 h-6 text-brand-accent" />
        </button>

        {onTogglePlay && (
          <button
            onClick={onTogglePlay}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-accent/40 bg-brand/20 text-brand-accent hover:bg-brand/30 transition-colors"
            title={isPlaying ? "Pause Auto-play" : "Start Auto-play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        )}

        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex h-11 w-11 sm:w-14 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-gray-300 hover:text-white hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface-muted disabled:cursor-not-allowed transition-colors"
          title="Next Move (→)"
        >
          <ChevronRight className="w-6 h-6 text-brand-accent" />
        </button>

        <button
          onClick={onLast}
          disabled={!canNext}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-gray-300 hover:text-white hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface-muted disabled:cursor-not-allowed transition-colors"
          title="Final Move (End)"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
