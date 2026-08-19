"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Opening } from "@/types/opening";
import { ChessGameEngine } from "@/lib/chess/engine";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveControls } from "@/components/chess/MoveControls";
import { OpeningCard } from "@/components/openings/OpeningCard";
import { BoardOrientation } from "@/types/chess";
import { Compass, GitBranch, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { soundManager } from "@/lib/chess/sound";
import { cn } from "@/lib/utils/cn";

interface InteractiveOpeningDetailProps {
  opening: Opening;
  parentOpening?: Opening;
  childrenOpenings: Opening[];
}

export function InteractiveOpeningDetail({
  opening,
  parentOpening,
  childrenOpenings,
}: InteractiveOpeningDetailProps) {
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [currentMoveIndex, setCurrentMoveIndex] = useState(opening.moves.length);

  // Pre-calculate FEN position for each move in the sequence
  const fensByMoveIndex = useMemo(() => {
    const engine = new ChessGameEngine();
    const fens: string[] = [engine.getFen()]; // Index 0 = starting position
    for (const move of opening.moves) {
      engine.makeMove(move);
      fens.push(engine.getFen());
    }
    return fens;
  }, [opening.moves]);

  const currentFen = fensByMoveIndex[currentMoveIndex] ?? fensByMoveIndex[fensByMoveIndex.length - 1];

  function handleFirst() {
    setCurrentMoveIndex(0);
    soundManager.playMove();
  }

  function handlePrevious() {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
      soundManager.playMove();
    }
  }

  function handleNext() {
    if (currentMoveIndex < opening.moves.length) {
      setCurrentMoveIndex(currentMoveIndex + 1);
      soundManager.playMove();
    }
  }

  function handleLast() {
    setCurrentMoveIndex(opening.moves.length);
    soundManager.playMove();
  }

  function handleReset() {
    setCurrentMoveIndex(opening.moves.length);
  }

  function handleFlip() {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  }

  const movesParam = encodeURIComponent(opening.moves.join(","));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/openings"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opening Encyclopedia
        </Link>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl border border-surface-border bg-surface shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold px-3 py-1 rounded-md bg-surface-border text-brand-gold border border-brand-gold/30">
              ECO {opening.eco}
            </span>
            <span className="text-xs font-semibold text-gray-300 bg-surface-muted px-3 py-1 rounded-md border border-surface-border">
              {opening.categoryName}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {opening.name}
          </h1>

          {parentOpening && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <GitBranch className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Parent Line:</span>
              <Link
                href={`/openings/${parentOpening.id}`}
                className="text-brand-accent hover:underline font-semibold"
              >
                {parentOpening.name}
              </Link>
            </div>
          )}
        </div>

        {/* Explore CTA */}
        <Link
          href={`/explorer?moves=${movesParam}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-hover transition-all shadow-md shadow-brand/20 shrink-0"
        >
          <Compass className="w-5 h-5" />
          Explore Position Interactively
        </Link>
      </div>

      {/* Main Grid: Mini Board + Move Controls + Move Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Board Preview (Lg: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-3 lg:sticky lg:top-20 lg:self-start">
          <ChessBoard
            fen={currentFen}
            orientation={orientation}
            isInteractive={false}
            className="w-full"
          />

          <span className="text-xs font-mono text-gray-400">
            Position after Move {currentMoveIndex} of {opening.moves.length}
          </span>
        </div>

        {/* Moves & Metadata (Lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Move Navigation Controls Bar */}
          <MoveControls
            onFirst={handleFirst}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onLast={handleLast}
            onReset={handleReset}
            onFlip={handleFlip}
            canPrevious={currentMoveIndex > 0}
            canNext={currentMoveIndex < opening.moves.length}
          />

          <div className="p-6 rounded-2xl border border-surface-border bg-surface space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-mono font-bold uppercase tracking-wider text-gray-200">
                Standard Move Sequence (SAN)
              </h2>
              <span className="text-xs font-mono text-gray-400">
                Click any move to jump position
              </span>
            </div>

            {/* Move Chips */}
            <div className="p-4 rounded-xl bg-surface-muted border border-surface-border font-mono text-sm sm:text-base font-bold text-brand-accent leading-relaxed flex flex-wrap gap-2">
              {opening.moves.map((m, idx) => {
                const moveNum = idx + 1;
                const isSelected = currentMoveIndex === moveNum;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentMoveIndex(moveNum);
                      soundManager.playMove();
                    }}
                    className={cn(
                      "px-2 py-1 rounded-md transition-all cursor-pointer",
                      isSelected
                        ? "bg-brand-accent text-black font-extrabold shadow-sm scale-105"
                        : "hover:bg-surface-hover hover:text-white text-gray-200"
                    )}
                  >
                    {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ""}
                    {m}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border text-xs">
              <div>
                <span className="text-gray-400 font-mono block mb-1">ECO Classification</span>
                <span className="font-bold text-brand-gold">{opening.eco}</span>
              </div>
              <div>
                <span className="text-gray-400 font-mono block mb-1">Move Depth</span>
                <span className="font-bold text-foreground">{opening.moves.length} plies</span>
              </div>
            </div>
          </div>

          {/* Child Variations Grid */}
          {childrenOpenings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-brand-accent" />
                Continuations & Variations ({childrenOpenings.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {childrenOpenings.map((child) => (
                  <OpeningCard key={child.id} opening={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
