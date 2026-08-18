import { Suspense } from "react";
import { Metadata } from "next";
import { OpeningTheoryGraph } from "@/components/graph/OpeningTheoryGraph";
import { LoadingSplash } from "@/components/brand/LoadingSplash";
import { GitBranch, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Theory Graph & Transposition Visualizer — ChessOp",
  description:
    "Explore the interactive 2D opening tree graph. Visualizing move branches, node transpositions, and overlapping line continuations move by move.",
};

export default function TheoryGraphPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      {/* Top Header Banner */}
      <div className="bg-surface border-b border-surface-border px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-[11px] font-mono text-brand-accent font-bold mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Interactive Move-Tree & Transposition Graph</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-brand-gold" />
            Visual Opening Transposition Graph
          </h1>
        </div>

        <p className="text-xs text-gray-400 max-w-md">
          Drag to pan, scroll to zoom. Click any opening node to inspect the board position and discover transpositions.
        </p>
      </div>

      {/* Main Interactive Graph View */}
      <div className="flex-1 w-full">
        <Suspense fallback={<LoadingSplash message="Generating 2D Theory Graph..." fullScreen={false} />}>
          <OpeningTheoryGraph />
        </Suspense>
      </div>
    </div>
  );
}
