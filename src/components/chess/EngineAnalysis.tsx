"use client";

import { useState, useEffect } from "react";
import { EngineEvalResult, fetchEngineEvaluation, PvLine } from "@/lib/chess/engineAnalysis";
import { Cpu, Zap, Activity, Play, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { t } from "@/lib/i18n";

interface EngineAnalysisProps {
  fen: string;
  onPlayMove?: (from: string, to: string) => void;
  className?: string;
}

export function EngineAnalysis({ fen, onPlayMove, className }: EngineAnalysisProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [multiPvCount, setMultiPvCount] = useState<1 | 3>(3);
  const [evalResult, setEvalResult] = useState<EngineEvalResult | null>(null);

  useEffect(() => {
    if (!isEnabled || !fen) return;

    let isSubscribed = true;
    setLoading(true);

    fetchEngineEvaluation(fen, multiPvCount).then((res) => {
      if (isSubscribed) {
        setEvalResult(res);
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [fen, isEnabled, multiPvCount]);

  if (!isEnabled) {
    return (
      <div className={cn("p-3 rounded-xl border border-surface-border bg-surface flex items-center justify-between", className)}>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Cpu className="w-4 h-4 text-brand-accent" />
          <span>{t("engine.headerTitle")}</span>
        </div>
        <button
          onClick={() => setIsEnabled(true)}
          className="px-3 py-1 rounded-lg border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-xs font-mono font-semibold hover:bg-brand-accent/20 transition-colors"
        >
          {t("engine.enableEngine")}
        </button>
      </div>
    );
  }

  // Calculate top line score for main evaluation bar
  const topPv = evalResult?.pvs?.[0];
  let mainEvalText = "+0.00";
  let whitePercent = 50;

  if (topPv) {
    if (topPv.mate !== undefined) {
      mainEvalText = topPv.mate > 0 ? `#M${topPv.mate}` : `#M${Math.abs(topPv.mate)}`;
      whitePercent = topPv.mate > 0 ? 100 : 0;
    } else if (topPv.cp !== undefined) {
      const cp = topPv.cp;
      const formatted = (cp / 100).toFixed(2);
      mainEvalText = cp > 0 ? `+${formatted}` : formatted;

      const winningChance = 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
      whitePercent = Math.min(98, Math.max(2, winningChance));
    }
  }

  function formatPvScore(pv: PvLine): string {
    if (pv.mate !== undefined) {
      return pv.mate > 0 ? `#M${pv.mate}` : `#M${Math.abs(pv.mate)}`;
    }
    if (pv.cp !== undefined) {
      const formatted = (pv.cp / 100).toFixed(2);
      return pv.cp > 0 ? `+${formatted}` : formatted;
    }
    return "0.00";
  }

  return (
    <div className={cn("p-4 rounded-xl border border-surface-border bg-surface space-y-4 shadow-md", className)}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-accent shrink-0" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
            {t("engine.headerTitle")}
          </h4>
          {evalResult?.isCloud && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/30 shrink-0">
              {t("engine.cloudDepth", { depth: evalResult.depth })}
            </span>
          )}
        </div>

        {/* Multi-PV Toggle & Disable Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-surface-muted border border-surface-border p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setMultiPvCount(1)}
              className={cn("px-2 py-0.5 rounded transition-all", multiPvCount === 1 ? "bg-brand-accent text-black font-bold" : "text-gray-400 hover:text-white")}
            >
              {t("engine.oneLine")}
            </button>
            <button
              onClick={() => setMultiPvCount(3)}
              className={cn("px-2 py-0.5 rounded transition-all", multiPvCount === 3 ? "bg-brand-accent text-black font-bold" : "text-gray-400 hover:text-white")}
            >
              {t("engine.threeLines")}
            </button>
          </div>

          <button
            onClick={() => setIsEnabled(false)}
            className="text-xs font-mono text-gray-400 hover:text-gray-200 shrink-0 ml-1"
          >
            {t("engine.disableEngine")}
          </button>
        </div>
      </div>

      {/* Main Evaluation Meter Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-emerald-400 font-bold">{t("common.white")} {whitePercent.toFixed(0)}%</span>
          <span className="text-gray-200 font-extrabold text-sm">{loading ? "..." : mainEvalText}</span>
          <span className="text-gray-400 font-bold">{t("common.black")} {(100 - whitePercent).toFixed(0)}%</span>
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

      {/* Multi-PV Lines List */}
      <div className="space-y-2 pt-1">
        {loading ? (
          <div className="flex items-center justify-center py-4 text-xs font-mono text-gray-400 gap-2">
            <div className="w-3.5 h-3.5 border-2 border-brand-accent/40 border-t-brand-accent rounded-full animate-spin" />
            <span>{t("engine.evaluatingText", { count: multiPvCount })}</span>
          </div>
        ) : evalResult?.pvs && evalResult.pvs.length > 0 ? (
          evalResult.pvs.map((pv, idx) => {
            const scoreText = formatPvScore(pv);
            const isMate = pv.mate !== undefined;
            const isPositive = (pv.cp || 0) >= 0 || (pv.mate || 0) > 0;

            const firstUci = pv.uciMoves[0];
            const canPlay = onPlayMove && firstUci && firstUci.length >= 4;

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2 rounded-lg border border-surface-border bg-surface-muted hover:border-brand-accent/40 transition-colors text-xs font-mono"
              >
                {/* Score Pill */}
                <span
                  className={cn(
                    "px-2 py-1 rounded font-bold shrink-0 min-w-[55px] text-center border text-[11px]",
                    isMate
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : isPositive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  )}
                >
                  {scoreText}
                </span>

                {/* Candidate Move & PV Line */}
                <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-brand-gold shrink-0">
                    {pv.bestMoveSan || `line ${idx + 1}`}
                  </span>
                  <span className="text-gray-400 truncate text-[11px]">
                    {pv.pvSan.slice(1).join(" ")}
                  </span>
                </div>

                {/* Play Candidate Move Action */}
                {canPlay && (
                  <button
                    onClick={() => onPlayMove(firstUci.slice(0, 2), firstUci.slice(2, 4))}
                    className="p-1 rounded bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-black transition-colors shrink-0"
                    title={t("engine.playMoveTitle", { move: pv.bestMoveSan || "" })}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-xs font-mono text-gray-400 text-center py-2">
            {t("engine.noEval")}
          </div>
        )}
      </div>
    </div>
  );
}
