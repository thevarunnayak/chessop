"use client";

import { useState } from "react";
import { FAMOUS_TRAPS } from "@/lib/traps/trapsData";
import { OpeningTrap, TrapStep } from "@/types/trap";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { ChessGameEngine } from "@/lib/chess/engine";
import { Zap, Flame, Shield, ArrowLeft, ArrowRight, RotateCcw, Lightbulb, CheckCircle2, AlertTriangle, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function playSafeTrapMove(engine: ChessGameEngine, moveStr: string): boolean {
  if (!moveStr) return false;
  if (engine.makeMove(moveStr)) return true;

  const cleaned = moveStr.replace(/[+#]/g, "");
  if (engine.makeMove(cleaned)) return true;

  const capitalized = moveStr.charAt(0).toUpperCase() + moveStr.slice(1);
  if (engine.makeMove(capitalized)) return true;

  const capCleaned = capitalized.replace(/[+#]/g, "");
  if (engine.makeMove(capCleaned)) return true;

  return false;
}

export default function TrapsGuidePage() {
  const [selectedTrap, setSelectedTrap] = useState<OpeningTrap | null>(null);
  const [filterSide, setFilterSide] = useState<"ALL" | "white" | "black">("ALL");
  const [filterDifficulty, setFilterDifficulty] = useState<"ALL" | "Beginner" | "Intermediate" | "Advanced">("ALL");

  // Active Trap Practice State
  const [stepIndex, setStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [userSuccess, setUserSuccess] = useState(false);
  const [wrongMove, setWrongMove] = useState(false);

  // Filter traps catalog
  const filteredTraps = FAMOUS_TRAPS.filter((t) => {
    if (filterSide !== "ALL" && t.side !== filterSide) return false;
    if (filterDifficulty !== "ALL" && t.difficulty !== filterDifficulty) return false;
    return true;
  });

  // Calculate current FEN for selected trap at active stepIndex
  let currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  if (selectedTrap) {
    const engine = new ChessGameEngine();
    const movesToPlay = selectedTrap.moves.slice(0, stepIndex);
    movesToPlay.forEach((m) => playSafeTrapMove(engine, m));
    currentFen = engine.getFen();
  }

  function startTrapPractice(trap: OpeningTrap) {
    setSelectedTrap(trap);
    setStepIndex(0);
    setShowHint(false);
    setUserSuccess(false);
    setWrongMove(false);
  }

  function handleMove(source: string, target: string, promotion?: string): boolean {
    if (!selectedTrap) return false;

    // Build engine at current stepIndex to test user move
    const engine = new ChessGameEngine();
    const movesPlayed = selectedTrap.moves.slice(0, stepIndex);
    movesPlayed.forEach((m) => playSafeTrapMove(engine, m));

    const legalMoves = engine.getLegalMoves(source as any);
    const targetMove = legalMoves.find((m) => m.to === target);
    if (!targetMove) return false;

    const moveRes = engine.makeMove({ from: source, to: target, promotion } as any);
    if (!moveRes) return false;

    const expectedSan = selectedTrap.moves[stepIndex] || "";
    const cleanExpected = expectedSan.replace(/[+#!]/g, "").toLowerCase();
    const cleanUserSan = moveRes.san.replace(/[+#!]/g, "").toLowerCase();

    if (cleanUserSan === cleanExpected || moveRes.from + moveRes.to === cleanExpected) {
      setWrongMove(false);
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);

      if (nextStep >= selectedTrap.moves.length) {
        setUserSuccess(true);
      }
      return true;
    } else {
      setWrongMove(true);
      setTimeout(() => setWrongMove(false), 2000);
      return false;
    }
  }

  function handleNextStep() {
    if (!selectedTrap) return;
    if (stepIndex < selectedTrap.moves.length) {
      const next = stepIndex + 1;
      setStepIndex(next);
      if (next >= selectedTrap.moves.length) {
        setUserSuccess(true);
      }
    }
  }

  function handlePrevStep() {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
      setUserSuccess(false);
    }
  }

  function handleReset() {
    setStepIndex(0);
    setUserSuccess(false);
    setWrongMove(false);
    setShowHint(false);
  }

  const currentStep = selectedTrap?.steps[stepIndex - 1] || null;
  const isComplete = selectedTrap ? stepIndex >= selectedTrap.moves.length : false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-accent font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Opening Tactics & Traps Guide</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Famous Opening Traps
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Master tactical traps, gambit punishments, and early checkmate patterns. Learn how to execute or avoid opening traps step-by-step.
          </p>
        </div>

        {selectedTrap && (
          <button
            onClick={() => setSelectedTrap(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-surface-border text-xs font-mono font-bold text-gray-300 hover:text-white transition-colors self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Traps Catalog</span>
          </button>
        )}
      </div>

      {/* Catalog View */}
      {!selectedTrap ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-surface-border bg-surface shadow-md">
            {/* Side Filter Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Side:</span>
              </span>
              {(["ALL", "white", "black"] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => setFilterSide(side)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border",
                    filterSide === side
                      ? "bg-brand-accent text-black border-brand-accent shadow-md shadow-brand-accent/20"
                      : "bg-surface-muted text-gray-300 border-surface-border hover:bg-surface-hover hover:text-white"
                  )}
                >
                  {side === "ALL" ? "All Sides" : side === "white" ? "White Traps" : "Black Traps"}
                </button>
              ))}
            </div>

            {/* Difficulty Filter Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 mr-1">Difficulty:</span>
              {(["ALL", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border",
                    filterDifficulty === diff
                      ? "bg-brand-accent text-black border-brand-accent shadow-md shadow-brand-accent/20"
                      : "bg-surface-muted text-gray-300 border-surface-border hover:bg-surface-hover hover:text-white"
                  )}
                >
                  {diff === "ALL" ? "All Levels" : diff}
                </button>
              ))}
            </div>
          </div>

          {/* Traps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTraps.map((trap) => (
              <div
                key={trap.id}
                className="p-5 rounded-2xl border border-surface-border bg-surface hover:border-brand-accent/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-3">
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-mono text-xs font-bold">
                      ECO {trap.eco}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded font-mono text-[11px] font-bold border",
                        trap.side === "white"
                          ? "bg-gray-200/10 text-gray-200 border-gray-200/30"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                      )}>
                        {trap.side === "white" ? "White Trap" : "Black Trap"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-gray-400 font-mono text-[10px]">
                        {trap.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title & Opening */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-accent transition-colors">
                      {trap.name}
                    </h3>
                    <span className="text-xs font-mono text-brand-gold">{trap.openingName}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {trap.description}
                  </p>
                </div>

                {/* Practice Button */}
                <button
                  onClick={() => startTrapPractice(trap)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-black font-mono font-bold text-xs transition-colors shadow-md shadow-brand-accent/20"
                >
                  <Flame className="w-4 h-4 fill-current" />
                  <span>Interactive Walkthrough</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Interactive Trap Trainer View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Chessboard */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <ChessBoard
              fen={currentFen}
              orientation={selectedTrap.side}
              onMove={handleMove}
              isInteractive={!isComplete}
              hasBackground={false}
              className="max-w-[480px] w-full shadow-2xl rounded-xl"
            />
          </div>

          {/* Right Column: Move Controls, Trap Details, Step Explanations & Punishment Mode */}
          <div className="lg:col-span-6 space-y-5">
            {/* Move Controls Bar */}
            <div className="flex items-center gap-3 w-full justify-between p-3.5 rounded-2xl border border-surface-border bg-surface shadow-md">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-hover text-gray-300 font-mono text-xs font-semibold transition-colors border border-surface-border"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevStep}
                  disabled={stepIndex === 0}
                  className="p-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-surface-border disabled:opacity-40 disabled:hover:bg-surface-muted text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-gray-300 font-bold px-1">
                  Step {stepIndex} / {selectedTrap.moves.length}
                </span>
                <button
                  onClick={handleNextStep}
                  disabled={isComplete}
                  className="p-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-surface-border disabled:opacity-40 disabled:hover:bg-surface-muted text-gray-200 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-semibold transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Hint</span>
              </button>
            </div>

            {/* Trap Header Metadata */}
            <div className="p-5 rounded-2xl border border-surface-border bg-surface space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded bg-brand-accent/20 border border-brand-accent/40 text-brand-accent font-mono text-xs font-bold">
                  ECO {selectedTrap.eco}
                </span>
                <span className="text-xs font-mono text-brand-gold font-bold">{selectedTrap.openingName}</span>
              </div>

              <h2 className="text-xl font-extrabold text-foreground">{selectedTrap.name}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">{selectedTrap.description}</p>
            </div>

            {/* Active Step Explanation */}
            <div className="p-5 rounded-2xl border border-surface-border bg-surface space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                  <span>Step {stepIndex} Explanation</span>
                </h3>
                {currentStep?.isCriticalStep && (
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold animate-pulse">
                    CRITICAL TRAP STEP
                  </span>
                )}
              </div>

              {wrongMove && (
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Incorrect move! Try again or click Hint for guidance.</span>
                </div>
              )}

              {showHint && !isComplete && (
                <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>Hint: Play move <strong>{selectedTrap.moves[stepIndex]}</strong> on the board.</span>
                </div>
              )}

              {currentStep ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-surface-muted border border-surface-border font-mono text-sm font-bold text-brand-gold">
                      {currentStep.moveSan}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {currentStep.explanation}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-mono">
                  Make a move on the board or click next to begin the trap walkthrough!
                </p>
              )}
            </div>

            {/* Punishment Mode Card */}
            <div className="p-5 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-brand-accent font-mono text-xs font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Punishment & Tactical Execution</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedTrap.punishmentExplanation}
              </p>
            </div>

            {/* Trap Execution Completed Alert */}
            {isComplete && (
              <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-3 text-emerald-300 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-mono font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Trap Walkthrough Completed!</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Congratulations! You have mastered <strong>{selectedTrap.name}</strong>. Practice it in your games or try another opening trap!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
