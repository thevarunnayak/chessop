import { Info, ShieldCheck, Database, Compass, GitBranch } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Brand Hero Card */}
      <div className="p-8 rounded-2xl border border-surface-border bg-gradient-to-r from-surface via-surface to-brand/10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shadow-lg">
        <Logo size="hero" showText={false} />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-xs font-mono text-brand-gold font-bold">
            Official Brand & Graph Encyclopedia
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            ChessOp Explorer
          </h1>
          <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
            The royal knight crest signifies precision, structured theory, and deep tactical exploration across modern and classical chess openings.
          </p>
        </div>
      </div>

      <div className="pb-4 border-b border-surface-border">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Info className="w-6 h-6 text-brand-accent" />
          Data Methodology & Architecture
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Technical specifications, licensing, and graph model principles
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        {/* Section 1 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-surface space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <Compass className="w-5 h-5 text-brand-accent" />
            Product Vision
          </div>
          <p>
            ChessOp Explorer is designed as a modern chess research tool and interactive opening encyclopedia. Rather than serving static chess tables, it models chess openings as a normalized graph using FEN position hashing, allowing users to discover line continuations and transpositions move-by-move.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-surface space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <GitBranch className="w-5 h-5 text-brand-gold" />
            Transposition Engine & FEN Identity
          </div>
          <p>
            In chess, different move orders can reach the exact same board position (transposition). Simple move-sequence indexing fails to detect transpositions. ChessOp treats canonical FEN strings as the primary identity for positions, enabling automatic resolution of line overlaps across different openings.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-surface space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <Database className="w-5 h-5 text-blue-400" />
            Open Source Data & Attribution
          </div>
          <p>
            All chess opening classifications and ECO codes are powered by the open-source Lichess Chess Openings dataset (released under CC0 1.0 Universal / Public Domain). Move validation, check detection, and SAN move generation are handled client-side using <code className="font-mono text-brand-accent font-bold">chess.js</code>.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 pt-2 border-t border-surface-border/50">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>Open Data (CC0) • Permissive BSD/MIT Libraries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
