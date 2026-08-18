"use client";

import { useState } from "react";
import { FileText, Copy, Check, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PositionLoaderProps {
  currentFen: string;
  currentPgn: string;
  onLoadFen: (fen: string) => boolean;
  onLoadPgn: (pgn: string) => boolean;
  className?: string;
}

export function PositionLoader({
  currentFen,
  currentPgn,
  onLoadFen,
  onLoadPgn,
  className,
}: PositionLoaderProps) {
  const [activeTab, setActiveTab] = useState<"fen" | "pgn">("fen");
  const [inputFen, setInputFen] = useState("");
  const [inputPgn, setInputPgn] = useState("");
  const [copiedFen, setCopiedFen] = useState(false);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleCopyFen() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentFen);
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    }
  }

  function handleCopyPgn() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentPgn || "1.");
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    }
  }

  function handleApplyFen() {
    setErrorMsg(null);
    if (!inputFen.trim()) return;
    const success = onLoadFen(inputFen.trim());
    if (!success) {
      setErrorMsg("Invalid FEN position string. Please check formatting.");
    } else {
      setInputFen("");
    }
  }

  function handleApplyPgn() {
    setErrorMsg(null);
    if (!inputPgn.trim()) return;
    const success = onLoadPgn(inputPgn.trim());
    if (!success) {
      setErrorMsg("Invalid PGN notation string. Please check move SAN tags.");
    } else {
      setInputPgn("");
    }
  }

  return (
    <div className={cn("flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden", className)}>
      {/* Header Tabs */}
      <div className="flex items-center border-b border-surface-border bg-surface-muted">
        <button
          onClick={() => { setActiveTab("fen"); setErrorMsg(null); }}
          className={cn(
            "flex-1 py-2.5 px-4 text-xs font-mono font-semibold transition-colors border-b-2 text-center",
            activeTab === "fen"
              ? "border-brand-accent text-brand-accent bg-surface"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          FEN Position
        </button>
        <button
          onClick={() => { setActiveTab("pgn"); setErrorMsg(null); }}
          className={cn(
            "flex-1 py-2.5 px-4 text-xs font-mono font-semibold transition-colors border-b-2 text-center",
            activeTab === "pgn"
              ? "border-brand-accent text-brand-accent bg-surface"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          PGN Game
        </button>
      </div>

      <div className="p-4 space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === "fen" ? (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5">
                Current FEN String
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentFen}
                  className="flex-1 font-mono text-xs p-2.5 rounded-lg border border-surface-border bg-surface-muted text-gray-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyFen}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-surface-border bg-surface-muted hover:bg-surface-hover text-xs font-medium text-gray-200 transition-colors"
                >
                  {copiedFen ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFen ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5">
                Import FEN String
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste FEN (e.g. rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1)"
                  value={inputFen}
                  onChange={(e) => setInputFen(e.target.value)}
                  className="flex-1 font-mono text-xs p-2.5 rounded-lg border border-surface-border bg-background text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none"
                />
                <button
                  onClick={handleApplyFen}
                  disabled={!inputFen.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:hover:bg-brand text-xs font-semibold text-white transition-colors"
                >
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5">
                Current PGN Notation
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={currentPgn || "Starting position (1. e4 ...)"}
                  className="w-full font-mono text-xs p-2.5 rounded-lg border border-surface-border bg-surface-muted text-gray-300 focus:outline-none resize-none"
                />
                <button
                  onClick={handleCopyPgn}
                  className="absolute right-2 bottom-2 flex items-center gap-1 px-2.5 py-1 rounded border border-surface-border bg-surface hover:bg-surface-hover text-[11px] text-gray-200"
                >
                  {copiedPgn ? <Check className="w-3 h-3 text-brand-accent" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPgn ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5">
                Import PGN Game
              </label>
              <textarea
                rows={3}
                placeholder="Paste PGN (e.g. 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6)"
                value={inputPgn}
                onChange={(e) => setInputPgn(e.target.value)}
                className="w-full font-mono text-xs p-2.5 rounded-lg border border-surface-border bg-background text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none resize-none"
              />
              <button
                onClick={handleApplyPgn}
                disabled={!inputPgn.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-40 text-xs font-semibold text-white transition-colors"
              >
                <span>Load PGN Game</span>
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
