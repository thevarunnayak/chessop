"use client";

import { Suspense, useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ChessGameEngine } from "@/lib/chess/engine";
import { getPositionNode, getOpeningById, getTranspositions } from "@/lib/openings/service";
import { BoardOrientation, BoardTheme, ChessMoveRecord } from "@/types/chess";
import { Opening, PositionNode, MoveContinuation } from "@/types/opening";

import { soundManager } from "@/lib/chess/sound";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveControls } from "@/components/chess/MoveControls";
import { MoveList } from "@/components/chess/MoveList";
import { PositionLoader } from "@/components/chess/PositionLoader";
import { BoardSettings } from "@/components/chess/BoardSettings";
import { EngineAnalysis } from "@/components/chess/EngineAnalysis";

import { OpeningHeader } from "@/components/openings/OpeningHeader";
import { VariationList } from "@/components/openings/VariationList";
import { VariationTree } from "@/components/openings/VariationTree";
import { TranspositionPanel } from "@/components/openings/TranspositionPanel";
import { TheoryDepthBadge } from "@/components/openings/TheoryDepthBadge";

import { AddToCollectionModal } from "@/components/collections/AddToCollectionModal";
import { LoadingSplash } from "@/components/brand/LoadingSplash";
import { Compass, Settings, FileText, List, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function ExplorerContent() {
  const searchParams = useSearchParams();

  const [engine] = useState(() => new ChessGameEngine());
  const [fen, setFen] = useState(() => engine.getFen());
  const [history, setHistory] = useState<ChessMoveRecord[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // Settings, Size & Collection State
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [theme, setTheme] = useState<BoardTheme>("tournament");
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [boardWidth, setBoardWidth] = useState(480);
  const [activeTab, setActiveTab] = useState<"variations" | "moves" | "settings" | "loader">("variations");
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [, startTransition] = useTransition();
  const [fullMoveLine, setFullMoveLine] = useState<string[]>([]);

  // Load URL parameters on mount
  useEffect(() => {
    const movesParam = searchParams.get("moves");
    const fenParam = searchParams.get("fen");

    if (movesParam) {
      engine.reset();
      const moves = movesParam.split(",").filter(Boolean);
      for (const m of moves) {
        engine.makeMove(m);
      }
      const newFen = engine.getFen();
      const newHist = engine.getHistory();
      setFen(newFen);
      setHistory(newHist);
      setFullMoveLine(moves);
      setCurrentMoveIndex(newHist.length - 1);
    } else if (fenParam) {
      if (engine.loadFen(fenParam)) {
        setFen(engine.getFen());
        setHistory([]);
        setFullMoveLine([]);
        setCurrentMoveIndex(-1);
      }
    }
  }, [searchParams, engine]);

  // Sync state after move
  const syncState = useCallback(() => {
    const newFen = engine.getFen();
    const newHist = engine.getHistory();
    setFen(newFen);
    setHistory(newHist);
    setCurrentMoveIndex(newHist.length - 1);

    if (typeof window !== "undefined") {
      if (newHist.length > 0) {
        const moveStr = newHist.map((m) => m.san).join(",");
        window.history.replaceState(null, "", `/explorer?moves=${encodeURIComponent(moveStr)}`);
      } else {
        window.history.replaceState(null, "", "/explorer");
      }
    }
  }, [engine]);

  // Handle playing a move on the board
  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    const res = engine.makeMove({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (res) {
      if (res.captured) {
        soundManager.playCapture();
      } else if (engine.isCheck()) {
        soundManager.playCheck();
      } else {
        soundManager.playMove();
      }

      startTransition(() => {
        const newHist = engine.getHistory().map((h) => h.san);
        setFullMoveLine(newHist);
        syncState();
      });
      return true;
    }
    return false;
  }

  // Handle clicking a continuation move from the variation panel
  function handleSelectContinuation(san: string) {
    const res = engine.makeMove(san);
    if (res) {
      if (res.captured) {
        soundManager.playCapture();
      } else if (engine.isCheck()) {
        soundManager.playCheck();
      } else {
        soundManager.playMove();
      }

      startTransition(() => {
        const newHist = engine.getHistory().map((h) => h.san);
        setFullMoveLine(newHist);
        syncState();
      });
    }
  }

  function handleFirst() {
    engine.reset();
    syncState();
  }

  function handlePrevious() {
    engine.undoMove();
    syncState();
  }

  function handleNext() {
    if (currentMoveIndex < fullMoveLine.length - 1) {
      const nextMove = fullMoveLine[currentMoveIndex + 1];
      if (nextMove && engine.makeMove(nextMove)) {
        soundManager.playMove();
        syncState();
      }
    }
  }

  function handleLast() {
    for (let i = currentMoveIndex + 1; i < fullMoveLine.length; i++) {
      engine.makeMove(fullMoveLine[i]);
    }
    soundManager.playMove();
    syncState();
  }

  function handleReset() {
    engine.reset();
    setFullMoveLine([]);
    syncState();
  }

  function handleSelectMoveIndex(index: number) {
    const fullMoves = history.map((h) => h.san);
    engine.reset();
    for (let i = 0; i <= index; i++) {
      engine.makeMove(fullMoves[i]);
    }
    syncState();
  }

  const canonicalFen = engine.getCanonicalFen();
  const posNode: PositionNode | undefined = getPositionNode(canonicalFen);

  let currentOpening: Opening | undefined = undefined;
  if (posNode && posNode.openingIds && posNode.openingIds.length > 0) {
    currentOpening = getOpeningById(posNode.openingIds[0]);
  }

  let parentOpening: Opening | undefined = undefined;
  if (currentOpening?.parentId) {
    parentOpening = getOpeningById(currentOpening.parentId);
  }

  const transpositions = getTranspositions(canonicalFen, currentOpening?.id);
  const continuations: MoveContinuation[] = posNode?.continuations || [];
  const moveDepth = history.length;
  const isKnownTheory = !!posNode;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:h-[calc(100vh-4.5rem)] flex flex-col lg:overflow-hidden space-y-4">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-accent" />
            Opening Explorer
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Play moves, explore continuations, and navigate opening theory graphs
          </p>
        </div>

        <TheoryDepthBadge isKnownTheory={isKnownTheory} depth={moveDepth} />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:flex-1 lg:overflow-hidden">
        {/* Left Column: Board & Drag Resizer */}
        <div className="lg:col-span-5 flex flex-col items-center gap-3 shrink-0">
          <ChessBoard
            fen={fen}
            orientation={orientation}
            theme={theme}
            showCoordinates={showCoordinates}
            onMove={handleMove}
            getLegalMoves={(sq) => engine.getLegalMoves(sq as any).map((m) => ({ to: m.to, captured: m.captured }))}
            className="w-full"
            style={{ maxWidth: `${boardWidth}px` }}
            onResize={(newWidth) => setBoardWidth(newWidth)}
          />
        </div>

        {/* Right Column: Move Controls, Variations, Opening Metadata & Tabs (Independently Scrollable) */}
        <div className="lg:col-span-7 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pt-2 lg:pb-2">
          {/* Top Move Navigation Controls Bar */}
          <MoveControls
            onFirst={handleFirst}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onLast={handleLast}
            onReset={handleReset}
            onFlip={() => setOrientation(orientation === "white" ? "black" : "white")}
            canPrevious={history.length > 0}
            canNext={currentMoveIndex < fullMoveLine.length - 1}
          />

          <OpeningHeader
            opening={currentOpening}
            parentOpening={parentOpening}
            moveDepth={moveDepth}
            onAddToCollection={() => setShowCollectionModal(true)}
          />

          <EngineAnalysis fen={fen} onPlayMove={handleMove} />

          <TranspositionPanel transpositions={transpositions} />

          <div className="space-y-4">
            <div className="p-1 rounded-xl bg-surface border border-surface-border w-full overflow-hidden">
              <div className="flex items-center gap-1 overflow-x-auto w-full pt-1 pb-1.5 px-0.5">
                <button
                  onClick={() => setActiveTab("variations")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 sm:shrink",
                    activeTab === "variations"
                      ? "bg-surface-hover text-brand-accent border border-brand-accent/30"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <GitBranch className="w-3.5 h-3.5 shrink-0" />
                  <span>Continuations ({continuations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("moves")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 sm:shrink",
                    activeTab === "moves"
                      ? "bg-surface-hover text-brand-accent border border-brand-accent/30"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <List className="w-3.5 h-3.5 shrink-0" />
                  <span>Moves ({history.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("loader")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 sm:shrink",
                    activeTab === "loader"
                      ? "bg-surface-hover text-brand-accent border border-brand-accent/30"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>FEN/PGN</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 sm:shrink",
                    activeTab === "settings"
                      ? "bg-surface-hover text-brand-gold border border-brand-gold/30"
                      : "text-gray-400 hover:text-white"
                  )}
                  title="Board Settings"
                >
                  <Settings className="w-3.5 h-3.5 shrink-0" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {activeTab === "variations" && (
              <div className="space-y-6">
                <VariationList
                  continuations={continuations}
                  onSelectMove={handleSelectContinuation}
                />
                <VariationTree currentOpening={currentOpening} />
              </div>
            )}

            {activeTab === "moves" && (
              <MoveList
                history={history}
                currentMoveIndex={currentMoveIndex}
                onSelectMove={handleSelectMoveIndex}
              />
            )}

            {activeTab === "loader" && (
              <PositionLoader
                currentFen={fen}
                currentPgn={engine.getPgn()}
                onLoadFen={(newFen) => {
                  const ok = engine.loadFen(newFen);
                  if (ok) syncState();
                  return ok;
                }}
                onLoadPgn={(newPgn) => {
                  const ok = engine.loadPgn(newPgn);
                  if (ok) syncState();
                  return ok;
                }}
              />
            )}

            {activeTab === "settings" && (
              <BoardSettings
                orientation={orientation}
                theme={theme}
                showCoordinates={showCoordinates}
                onOrientationChange={setOrientation}
                onThemeChange={setTheme}
                onCoordinatesToggle={setShowCoordinates}
              />
            )}
          </div>
        </div>
      </div>

      <AddToCollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        openingData={{
          openingId: currentOpening?.id,
          name: currentOpening?.name || "Custom Position",
          eco: currentOpening?.eco || "---",
          fen: fen,
          moves: history.map((m) => m.san),
        }}
      />
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<LoadingSplash fullScreen={false} message="Loading Opening Explorer & Theory Graph..." />}>
      <ExplorerContent />
    </Suspense>
  );
}
