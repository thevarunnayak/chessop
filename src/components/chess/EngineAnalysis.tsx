"use client";

import { useState, useEffect } from "react";
import { EngineEvalResult, fetchEngineEvaluation } from "@/lib/chess/engineAnalysis";
import { Cpu, Zap, Activity, CheckCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EngineAnalysisProps {
  fen: string;
  className?: string;
}

export function EngineAnalysis({ fen, className }: EngineAnalysisProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EngineEvalResult | null>(null);

  useEffect(() => {
    if (!isEnabled || !fen) return;

    let isSubscribed = true;
    setLoading(true);

    fetchEngineEvaluation(fen).then((res) => {
      if (isSubscribed) {
        setEvalResult(res);
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [fen, isEnabled]);

  if (!isEnabled) {
    return (
      <div className={cn("p-3 rounded-xl border border-surface-border bg-surface flex items-center justify-between", className)}>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Cpu className="w-4 h-4" />
          <span>Stockfish Engine Analysis</span>
        </div>
        <button
          onClick={() => setIsEnabled(true)}
          className="px-3 py-1 rounded-lg border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-xs font-mono font-semibold hover:bg-brand-accent/20 transition-colors"
        >
          Enable Engine
        </button>
      </div>
    );
  }

  // Calculate evaluation text & bar percentage
  let evalText = "+0.00";
  let whitePercent = 50;

  if (evalResult) {
    if (evalResult.mate !== undefined) {
      evalText = evalResult.mate > 0 ? `#M${evalResult.mate}` : `#M${Math.abs(evalResult.mate)}`;
      whitePercent = evalResult.mate > 0 ? 100 : 0;
    } else if (evalResult.cp !== undefined) {
      const cp = evalResult.cp;
      const formatted = (cp / 100).toFixed(2);
      evalText = cp > 0 ? `+${formatted}` : formatted;

      // Sigmoid normalization for evaluation bar (0% to 100%)
      // 50% = 0.00, 75% = +2.00, 25% = -2.00
      const winningChance = 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
      whitePercent = Math.min(98, Math.max(2, winningChance));
    }
  }

  return (
    <div className={cn("p-4 rounded-xl border border-surface-border bg-surface space-y-3 shadow-md", className)}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-surface-border">
        <div className="flex flex-wrap items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-accent shrink-0" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
            Stockfish 16 Analysis
          </h4>
          {evalResult?.isCloud && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/30 shrink-0">
              Cloud Eval (D{evalResult.depth})
            </span>
          )}
        </div>

        <button
          onClick={() => setIsEnabled(false)}
          className="text-xs font-mono text-gray-400 hover:text-gray-200 shrink-0 ml-auto sm:ml-0"
        >
          Disable
        </button>
      </div>

      {/* Eval Bar & Numerical Score */}
      <div className="flex items-center gap-3">
        {/* Numerical Score Badge */}
        <div className={cn(
          "px-3 py-2 rounded-lg font-mono text-sm font-extrabold border shrink-0 min-w-[70px] text-center",
          evalResult?.mate !== undefined
            ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
            : (evalResult?.cp || 0) >= 0
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
        )}>
          {loading ? "..." : evalText}
        </div>

        {/* Visual Evaluation Bar */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span>White ({whitePercent.toFixed(0)}%)</span>
            <span>Black ({(100 - whitePercent).toFixed(0)}%)</span>
          </div>
          <div className="h-3 w-full rounded-full bg-surface-border overflow-hidden flex">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${whitePercent}%` }}
            />
            <div
              className="h-full bg-gray-600 transition-all duration-500"
              style={{ width: `${100 - whitePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suggested Line */}
      {evalResult?.pvSan && evalResult.pvSan.length > 0 && (
        <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400">Best Line:</span>
          <span className="text-gray-200 font-semibold truncate max-w-[280px]">
            {evalResult.pvSan.join(" ")}
          </span>
        </div>
      )}
    </div>
  );
}
