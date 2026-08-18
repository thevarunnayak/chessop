"use client";

import { useState, useEffect, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { getCollections } from "@/lib/openings/collectionsService";
import { getAllOpenings } from "@/lib/openings/service";
import { Collection } from "@/types/collection";
import { EcoCategory } from "@/types/opening";
import { BoardOrientation } from "@/types/chess";
import { soundManager } from "@/lib/chess/sound";
import {
  Target,
  Trophy, 
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  ArrowLeft,
  Flame,
  Award,
  Play,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Built-in Practice Lines
const PRESET_PRACTICE_LINES: PracticeLine[] = [
  {
    id: "sicilian-najdorf",
    name: "Sicilian Najdorf (Main Line)",
    eco: "B90",
    side: "black",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "sicilian-dragon",
    name: "Sicilian Dragon (Yugoslav Attack)",
    eco: "B78",
    side: "black",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6", "Be3", "Bg7", "f3", "O-O", "Qd2", "Nc6"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "sicilian-scheveningen",
    name: "Sicilian Scheveningen",
    eco: "B80",
    side: "black",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "queens-gambit-declined",
    name: "Queen's Gambit Declined",
    eco: "D30",
    side: "black",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7"],
    category: "D",
    source: "Preset Repertoire",
  },
  {
    id: "queens-gambit-accepted",
    name: "Queen's Gambit Accepted",
    eco: "D20",
    side: "black",
    moves: ["d4", "d5", "c4", "dxc4", "Nf3", "Nf6", "e3", "e6", "Bxc4"],
    category: "D",
    source: "Preset Repertoire",
  },
  {
    id: "french-winawer",
    name: "French Defense (Winawer Variation)",
    eco: "C18",
    side: "black",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4", "e5", "c5"],
    category: "C",
    source: "Preset Repertoire",
  },
  {
    id: "caro-kann-classical",
    name: "Caro-Kann Defense (Classical)",
    eco: "B18",
    side: "black",
    moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "caro-kann-advance",
    name: "Caro-Kann Defense (Advance Variation)",
    eco: "B12",
    side: "black",
    moves: ["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "ruy-lopez-closed",
    name: "Ruy Lopez (Closed Main Line)",
    eco: "C84",
    side: "white",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"],
    category: "C",
    source: "Preset Repertoire",
  },
  {
    id: "italian-giuoco-piano",
    name: "Italian Game (Giuoco Piano)",
    eco: "C50",
    side: "white",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4"],
    category: "C",
    source: "Preset Repertoire",
  },
  {
    id: "evans-gambit",
    name: "Italian Game (Evans Gambit)",
    eco: "C51",
    side: "white",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5"],
    category: "C",
    source: "Preset Repertoire",
  },
  {
    id: "kings-indian-mar-del-plata",
    name: "King's Indian (Mar del Plata)",
    eco: "E97",
    side: "black",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"],
    category: "E",
    source: "Preset Repertoire",
  },
  {
    id: "slav-defense-main",
    name: "Slav Defense (Main Line)",
    eco: "D15",
    side: "black",
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5"],
    category: "D",
    source: "Preset Repertoire",
  },
  {
    id: "nimzo-indian-rubinstein",
    name: "Nimzo-Indian Defense (Rubinstein)",
    eco: "E40",
    side: "black",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5"],
    category: "E",
    source: "Preset Repertoire",
  },
  {
    id: "grunfeld-exchange",
    name: "Grünfeld Defense (Exchange Variation)",
    eco: "D85",
    side: "black",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7"],
    category: "D",
    source: "Preset Repertoire",
  },
  {
    id: "london-system",
    name: "London System",
    eco: "D02",
    side: "white",
    moves: ["d4", "d5", "Bf4", "Nf6", "e3", "c5", "c3", "Nc6", "Nd2"],
    category: "D",
    source: "Preset Repertoire",
  },
  {
    id: "english-symmetrical",
    name: "English Opening (Symmetrical)",
    eco: "A30",
    side: "white",
    moves: ["c4", "c5", "Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "Nf3"],
    category: "A",
    source: "Preset Repertoire",
  },
  {
    id: "scandinavian-main",
    name: "Scandinavian Defense (Main Line)",
    eco: "B01",
    side: "black",
    moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5", "d4", "Nf6"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "pirc-defense",
    name: "Pirc Defense (Classical)",
    eco: "B08",
    side: "black",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6", "Nf3", "Bg7", "Be2", "O-O"],
    category: "B",
    source: "Preset Repertoire",
  },
  {
    id: "scotch-game",
    name: "Scotch Game (Mieses Variation)",
    eco: "C45",
    side: "white",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nxc6", "bxc6"],
    category: "C",
    source: "Preset Repertoire",
  },
];

interface PracticeLine {
  id: string;
  name: string;
  eco: string;
  side: BoardOrientation;
  moves: string[];
  category?: string;
  source: string;
}

export default function PracticePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeLine, setActiveLine] = useState<PracticeLine | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"SAVED" | "ALL" | EcoCategory>("SAVED");

  // Game & Practice State
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveIndex, setMoveIndex] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "hint" | null; message: string }>({
    type: null,
    message: "",
  });

  // Score & Stats
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  // Load collections & completed line IDs from localStorage on mount
  useEffect(() => {
    setCollections(getCollections());
    try {
      const saved = localStorage.getItem("chessop_completed_lines");
      if (saved) {
        setCompletedIds(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const allDbOpenings = useMemo(() => getAllOpenings(), []);

  // Compute preset + saved collection lines
  const presetAndSavedLines = useMemo(() => {
    const list: PracticeLine[] = [...PRESET_PRACTICE_LINES];

    collections.forEach((col) => {
      col.items.forEach((item, idx) => {
        if (item.moves && item.moves.length > 0) {
          list.push({
            id: `col-${col.id}-${item.id || idx}`,
            name: item.name,
            eco: item.eco || "ECO",
            side: "black",
            moves: item.moves,
            category: item.eco?.charAt(0)?.toUpperCase() || "A",
            source: `Collection: ${col.name}`,
          });
        }
      });
    });

    return list;
  }, [collections]);

  // Catalog filtered items
  const catalogLines = useMemo(() => {
    let list: PracticeLine[] = [];

    if (activeTab === "SAVED") {
      list = presetAndSavedLines;
    } else {
      list = allDbOpenings
        .filter((op) => activeTab === "ALL" || op.category === activeTab)
        .map((op) => ({
          id: op.id,
          name: op.name,
          eco: op.eco,
          side: "black" as BoardOrientation,
          moves: op.moves,
          category: op.category,
          source: "Opening Catalog",
        }));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (op) =>
          op.name.toLowerCase().includes(q) ||
          op.eco.toLowerCase().includes(q) ||
          op.moves.join(" ").toLowerCase().includes(q)
      );
    }

    return list.slice(0, 60);
  }, [activeTab, allDbOpenings, presetAndSavedLines, searchQuery]);

  function startPracticeLine(line: PracticeLine) {
    setActiveLine(line);
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveIndex(0);
    setLastMove(undefined);
    setIsCompleted(false);
    setFeedback({ type: null, message: "" });
    setMistakes(0);

    // If practicing as Black, computer plays 1st White move automatically
    if (line.side === "black" && line.moves.length > 0) {
      setTimeout(() => {
        try {
          const moveRes = newGame.move(line.moves[0]);
          if (moveRes) {
            setFen(newGame.fen());
            setLastMove({ from: moveRes.from, to: moveRes.to });
            setMoveIndex(1);
            soundManager.playMove();
          }
        } catch (e) {
          console.error("Error executing opponent initial move:", e);
        }
      }, 300);
    }
  }

  function markLineAsCompleted(lineId: string) {
    if (!completedIds.includes(lineId)) {
      const updated = [...completedIds, lineId];
      setCompletedIds(updated);
      try {
        localStorage.setItem("chessop_completed_lines", JSON.stringify(updated));
      } catch {
        // Ignore localStorage write error
      }
    }
  }

  // Handle user move on the board
  function handleMove(from: string, to: string, promotion?: string): boolean {
    if (!activeLine || isCompleted || moveIndex >= activeLine.moves.length) return false;

    const targetExpectedMoveSAN = activeLine.moves[moveIndex];
    const testGame = new Chess(game.fen());

    let attemptedMove;
    try {
      attemptedMove = testGame.move({ from, to, promotion: promotion || "q" });
    } catch {
      return false;
    }

    if (!attemptedMove) return false;

    const isCorrect = attemptedMove.san === targetExpectedMoveSAN || attemptedMove.lan === targetExpectedMoveSAN;

    if (isCorrect) {
      game.move(attemptedMove);
      setFen(game.fen());
      setLastMove({ from: attemptedMove.from, to: attemptedMove.to });
      soundManager.playMove();

      const nextMoveIndex = moveIndex + 1;
      setMoveIndex(nextMoveIndex);

      if (nextMoveIndex >= activeLine.moves.length) {
        setIsCompleted(true);
        setStreak((prev) => prev + 1);
        markLineAsCompleted(activeLine.id);
        setFeedback({
          type: "success",
          message: "🎉 Excellent! Repertoire line mastered perfectly!",
        });
        return true;
      }

      setFeedback({
        type: "success",
        message: `✓ Correct move! (${attemptedMove.san})`,
      });

      // Computer plays opponent move automatically after 450ms
      setTimeout(() => {
        const opponentMoveSAN = activeLine.moves[nextMoveIndex];
        if (opponentMoveSAN) {
          try {
            const oppRes = game.move(opponentMoveSAN);
            if (oppRes) {
              setFen(game.fen());
              setLastMove({ from: oppRes.from, to: oppRes.to });
              soundManager.playMove();
              setMoveIndex(nextMoveIndex + 1);

              if (nextMoveIndex + 1 >= activeLine.moves.length) {
                setIsCompleted(true);
                setStreak((prev) => prev + 1);
                markLineAsCompleted(activeLine.id);
                setFeedback({
                  type: "success",
                  message: "🎉 Repertoire line completed successfully!",
                });
              }
            }
          } catch (e) {
            console.error("Error executing opponent move:", e);
          }
        }
      }, 450);

      return true;
    } else {
      setMistakes((prev) => prev + 1);
      soundManager.playError();
      setFeedback({
        type: "error",
        message: `❌ ${attemptedMove.san} is not in your repertoire! Expected line plays ${targetExpectedMoveSAN}.`,
      });
      return false;
    }
  }

  function handleShowHint() {
    if (activeLine && moveIndex < activeLine.moves.length) {
      const hintMove = activeLine.moves[moveIndex];
      setFeedback({
        type: "hint",
        message: `💡 Hint: The expected repertoire move is "${hintMove}".`,
      });
    }
  }

  const accuracy = activeLine
    ? mistakes === 0
      ? 100
      : Math.max(0, Math.round(100 - (mistakes / (activeLine.moves.length || 1)) * 100))
    : 100;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
            <Target className="w-8 h-8 text-brand-accent" />
            Repertoire Trainer & Practice
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Select a repertoire card below to practice move-by-move. Completed lines are marked green!
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-surface px-3.5 py-2 rounded-xl border border-surface-border text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mastered: <strong className="text-emerald-400">{completedIds.length}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-surface px-3.5 py-2 rounded-xl border border-surface-border text-xs font-mono">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Streak: <strong className="text-amber-400">{streak}</strong></span>
          </div>
        </div>
      </div>

      {/* SCREEN 1: PRACTICE CATALOG CARDS GRID (When no active line selected) */}
      {!activeLine && (
        <div className="space-y-6">
          {/* Search & Tabs */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-4 rounded-2xl bg-surface border border-surface-border shadow-md">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {[
                { id: "SAVED", label: `Saved & Presets (${presetAndSavedLines.length})` },
                { id: "ALL", label: "All Catalog" },
                { id: "A", label: "Volume A" },
                { id: "B", label: "Volume B" },
                { id: "C", label: "Volume C" },
                { id: "D", label: "Volume D" },
                { id: "E", label: "Volume E" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap",
                    activeTab === t.id
                      ? "bg-brand text-white border border-brand-accent shadow-sm"
                      : "bg-surface-muted text-gray-300 hover:bg-surface-hover hover:text-white border border-surface-border"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search practice lines (e.g. Sicilian, B20)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-border bg-background text-xs text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {catalogLines.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400 bg-surface rounded-2xl border border-surface-border">
              No practice cards found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catalogLines.map((item) => {
                const isMastered = completedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group flex flex-col justify-between p-5 rounded-2xl border transition-all shadow-md relative overflow-hidden",
                      isMastered
                        ? "border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-900/30 ring-1 ring-emerald-500/30"
                        : "border-surface-border bg-surface hover:border-brand-accent/50 hover:bg-surface-hover"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "font-mono text-xs font-bold px-2.5 py-1 rounded-lg border",
                            isMastered
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-surface-muted text-brand-gold border-surface-border"
                          )}
                        >
                          {item.eco}
                        </span>

                        {isMastered ? (
                          <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-gray-400">
                            {item.moves.length} moves
                          </span>
                        )}
                      </div>

                      <h3 className={cn("text-base font-bold transition-colors line-clamp-2", isMastered ? "text-emerald-100" : "text-foreground group-hover:text-brand-accent")}>
                        {item.name}
                      </h3>

                      <div className="p-2.5 rounded-xl bg-background/60 border border-surface-border/50 font-mono text-xs text-gray-400 line-clamp-2">
                        {item.moves.slice(0, 6).join(" ")}...
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-gray-400">{item.source}</span>

                      <button
                        onClick={() => startPracticeLine(item)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm",
                          isMastered
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-brand hover:bg-brand-hover text-white"
                        )}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isMastered ? "Practice Again" : "Start Practice"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SCREEN 2: INTERACTIVE PRACTICE BOARD SCREEN (When activeLine is selected) */}
      {activeLine && (
        <div className="space-y-6">
          {/* Back to Catalog Link */}
          <div>
            <button
              onClick={() => setActiveLine(null)}
              className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Practice Catalog Cards
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Clean Board without background container */}
            <div className="lg:col-span-7 lg:sticky lg:top-8 self-start flex justify-center items-center">
              <ChessBoard
                fen={fen}
                orientation={activeLine.side}
                onMove={handleMove}
                getLegalMoves={(sq) => game.moves({ square: sq as Square, verbose: true })}
                className="w-full max-w-[560px] mx-auto shadow-2xl rounded-2xl overflow-hidden"
              />
            </div>

            {/* Right Column: Scrollable Header, Feedback & Progress */}
            <div className="lg:col-span-5 space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
              {/* Active Line Meta Header (Moved to Right Column) */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-surface-border shadow-md">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-gold px-2 py-0.5 rounded bg-surface-muted border border-surface-border">
                      {activeLine.eco}
                    </span>
                    {activeLine.name}
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Practicing as {activeLine.side.toUpperCase()}</p>
                </div>

                <button
                  onClick={() => startPracticeLine(activeLine)}
                  className="px-4 py-2 rounded-xl border border-surface-border bg-surface-muted hover:bg-surface-hover text-xs font-mono font-bold text-gray-200 transition-colors flex items-center gap-2 shrink-0"
                >
                  <RotateCcw className="w-4 h-4 text-brand-accent" />
                  <span>Restart</span>
                </button>
              </div>

              {/* Feedback Card */}
              <div className="p-5 rounded-2xl border border-surface-border bg-surface shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
                    Trainer Feedback
                  </h3>

                  <button
                    onClick={handleShowHint}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono font-semibold hover:bg-amber-500/20 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Show Hint</span>
                  </button>
                </div>

                {feedback.type === "success" && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">{feedback.message}</p>
                    </div>
                  </div>
                )}

                {feedback.type === "error" && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">{feedback.message}</p>
                    </div>
                  </div>
                )}

                {feedback.type === "hint" && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                    <Lightbulb className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">{feedback.message}</p>
                    </div>
                  </div>
                )}

                {!feedback.type && (
                  <div className="p-4 rounded-xl bg-surface-muted border border-surface-border text-gray-400 text-xs leading-relaxed">
                    Make your move on the board. The trainer will automatically validate your choice against the target repertoire.
                  </div>
                )}

                {/* Victory Completion Banner */}
                {isCompleted && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-brand/30 border border-emerald-500/60 text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
                    <Trophy className="w-12 h-12 mx-auto text-emerald-400 animate-bounce" />
                    <div>
                      <h4 className="text-lg font-extrabold text-white">Line Completed & Mastered!</h4>
                      <p className="text-xs text-emerald-200 mt-1">
                        Great job! This card has been marked green in your Practice Catalog.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setActiveLine(null)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-mono font-bold hover:bg-emerald-400 transition-colors inline-flex items-center justify-center gap-2 shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Return to Practice Cards</span>
                      </button>
                      <button
                        onClick={() => startPracticeLine(activeLine)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-mono text-gray-200 hover:text-white hover:bg-surface-hover transition-colors"
                      >
                        Practice Again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Move Sequence Progress Tracker (Hides future unplayed moves) */}
              <div className="p-5 rounded-2xl border border-surface-border bg-surface shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold uppercase tracking-wider text-gray-300">
                    Line Progress ({moveIndex} / {activeLine.moves.length} moves)
                  </span>
                  <span className="text-brand-accent font-bold">
                    {Math.round((moveIndex / (activeLine.moves.length || 1)) * 100)}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden border border-surface-border">
                  <div
                    className="h-full bg-brand-accent transition-all duration-300"
                    style={{ width: `${(moveIndex / (activeLine.moves.length || 1)) * 100}%` }}
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-muted border border-surface-border/50 font-mono text-xs flex flex-wrap gap-1.5 min-h-[52px]">
                  {moveIndex === 0 && (
                    <span className="text-xs text-gray-400 italic">No moves played yet. Play the first move!</span>
                  )}

                  {activeLine.moves.slice(0, moveIndex).map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold"
                    >
                      {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ""} {m}
                    </span>
                  ))}

                  {/* Show Hint Pill if requested */}
                  {feedback.type === "hint" && moveIndex < activeLine.moves.length && (
                    <span className="px-2.5 py-1 rounded-lg border border-amber-500/50 bg-amber-500/20 text-amber-300 text-xs font-bold animate-pulse">
                      {moveIndex % 2 === 0 ? `${Math.floor(moveIndex / 2) + 1}.` : ""} {activeLine.moves[moveIndex]} (Hint)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
