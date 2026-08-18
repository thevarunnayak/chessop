"use client";

import { useState, useEffect, useTransition } from "react";
import { Chessboard } from "react-chessboard";
import { BoardOrientation, BoardTheme, CustomSquareStyles } from "@/types/chess";
import { cn } from "@/lib/utils/cn";

interface ChessBoardProps {
  fen: string;
  orientation?: BoardOrientation;
  theme?: BoardTheme;
  showCoordinates?: boolean;
  onMove?: (sourceSquare: string, targetSquare: string, promotionPiece?: string) => boolean;
  getLegalMoves?: (square: string) => { to: string; captured?: string }[];
  customSquareStyles?: CustomSquareStyles;
  isInteractive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onResize?: (newWidth: number) => void;
}

const THEME_COLORS: Record<BoardTheme, { dark: string; light: string }> = {
  classic: { dark: "#b58863", light: "#f0d9b5" },
  midnight: { dark: "#2d3748", light: "#718096" },
  tournament: { dark: "#769656", light: "#eeeed2" },
  emerald: { dark: "#1e532d", light: "#7ee787" },
};

export function ChessBoard({
  fen,
  orientation = "white",
  theme = "tournament",
  showCoordinates = true,
  onMove,
  getLegalMoves,
  customSquareStyles = {},
  isInteractive = true,
  className,
  style,
  onResize,
}: ChessBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = THEME_COLORS[theme] || THEME_COLORS.tournament;

  function handleResizeStart(clientX: number) {
    if (!onResize) return;
    const startX = clientX;
    const startWidth = style?.maxWidth ? parseInt(String(style.maxWidth), 10) || 480 : 480;
    let rafId: number | null = null;

    function handleMove(currentX: number) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const deltaX = currentX - startX;
        const newWidth = Math.min(680, Math.max(300, startWidth + deltaX));
        onResize!(newWidth);
      });
    }

    function onMouseMove(e: MouseEvent) {
      handleMove(e.clientX);
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    }

    function onEnd() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);
  }

  function handleSquareClick(square: string) {
    if (!isInteractive || !onMove) return;

    if (!selectedSquare) {
      setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Try making move from selectedSquare to target square
    const success = onMove(selectedSquare, square);
    startTransition(() => {
      setSelectedSquare(null);
    });

    if (!success) {
      // Re-select target square if it might be a new piece selection
      setSelectedSquare(square);
    }
  }

  function handlePieceDrop(sourceSquare: string, targetSquare: string): boolean {
    if (!isInteractive || !onMove) return false;
    const success = onMove(sourceSquare, targetSquare);
    setSelectedSquare(null);
    return success;
  }

  const legalMoveStyles: CustomSquareStyles = {};
  if (selectedSquare && getLegalMoves) {
    const moves = getLegalMoves(selectedSquare);
    for (const m of moves) {
      if (m.captured) {
        legalMoveStyles[m.to] = {
          background: "radial-gradient(circle, transparent 52%, rgba(210, 153, 34, 0.8) 53%)",
          borderRadius: "50%",
        };
      } else {
        legalMoveStyles[m.to] = {
          background: "radial-gradient(circle, rgba(63, 185, 80, 0.75) 24%, transparent 25%)",
          borderRadius: "50%",
        };
      }
    }
  }

  const highlightStyles: CustomSquareStyles = {
    ...customSquareStyles,
    ...legalMoveStyles,
    ...(selectedSquare
      ? {
          [selectedSquare]: {
            backgroundColor: "rgba(210, 153, 34, 0.5)",
          },
        }
      : {}),
  };

  if (!mounted) {
    return (
      <div
        className={cn("relative w-full max-w-[min(560px,calc(100vh-15rem))] aspect-square rounded-xl overflow-hidden border border-surface-border bg-surface shadow-2xl select-none flex items-center justify-center min-h-[300px]", className)}
        style={style}
      >
        <div className="w-10 h-10 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full max-w-[min(560px,calc(100vh-15rem))] aspect-square rounded-xl overflow-hidden border border-surface-border bg-surface shadow-2xl select-none flex items-center justify-center min-h-[300px]", className)}
      style={style}
    >
      <Chessboard
        position={fen}
        boardOrientation={orientation}
        arePiecesDraggable={isInteractive}
        onPieceDrop={handlePieceDrop}
        onSquareClick={handleSquareClick}
        customBoardStyle={{
          borderRadius: "0.75rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
        customDarkSquareStyle={{ backgroundColor: colors.dark }}
        customLightSquareStyle={{ backgroundColor: colors.light }}
        customSquareStyles={highlightStyles}
        showBoardNotation={showCoordinates}
        animationDuration={200}
      />

      {onResize && (
        <div
          onMouseDown={(e) => handleResizeStart(e.clientX)}
          onTouchStart={(e) => e.touches.length > 0 && handleResizeStart(e.touches[0].clientX)}
          className="absolute bottom-0 right-0 z-30 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 group opacity-60 hover:opacity-100 transition-opacity"
          title="Drag corner to resize board"
        >
          <svg className="w-3 h-3 text-gray-400 group-hover:text-brand-gold" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="8" y1="2" x2="2" y2="8" />
            <line x1="8" y1="5" x2="5" y2="8" />
            <line x1="8" y1="8" x2="8" y2="8" />
          </svg>
        </div>
      )}
    </div>
  );
}
