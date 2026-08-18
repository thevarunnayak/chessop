"use client";

import { ChessMoveRecord } from "@/types/chess";
import { cn } from "@/lib/utils/cn";

interface MoveListProps {
  history: ChessMoveRecord[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  className?: string;
}

export function MoveList({ history, currentMoveIndex, onSelectMove, className }: MoveListProps) {
  // Group moves into pairs (White move, Black move)
  const movePairs: { white: ChessMoveRecord; black?: ChessMoveRecord; moveNumber: number }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  return (
    <div className={cn("flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-muted border-b border-surface-border">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300">
          Move History
        </span>
        <span className="text-[11px] font-mono text-gray-400">
          {history.length} {history.length === 1 ? "ply" : "plies"}
        </span>
      </div>

      <div className="p-3 overflow-y-auto max-h-[220px] font-mono text-sm space-y-1">
        {history.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-6">
            Starting position. Play a move on the board to begin.
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-x-2 gap-y-1 items-center">
            {movePairs.map((pair) => (
              <div key={pair.moveNumber} className="col-span-12 grid grid-cols-12 items-center py-1 px-2 rounded hover:bg-surface-hover transition-colors">
                {/* Move number */}
                <span className="col-span-2 text-xs text-gray-400 font-bold">
                  {pair.moveNumber}.
                </span>

                {/* White Move */}
                <button
                  onClick={() => onSelectMove(pair.white.moveIndex)}
                  className={cn(
                    "col-span-5 text-left px-2 py-1 rounded text-xs font-semibold transition-all",
                    currentMoveIndex === pair.white.moveIndex
                      ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/40"
                      : "text-gray-200 hover:text-white hover:bg-surface-border/50"
                  )}
                >
                  {pair.white.san}
                </button>

                {/* Black Move */}
                {pair.black ? (
                  <button
                    onClick={() => onSelectMove(pair.black!.moveIndex)}
                    className={cn(
                      "col-span-5 text-left px-2 py-1 rounded text-xs font-semibold transition-all",
                      currentMoveIndex === pair.black.moveIndex
                        ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/40"
                        : "text-gray-200 hover:text-white hover:bg-surface-border/50"
                    )}
                  >
                    {pair.black.san}
                  </button>
                ) : (
                  <span className="col-span-5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
