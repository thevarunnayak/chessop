import { Database, Compass, GitBranch, Trophy, Sparkles, Zap, Target, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Card */}
      <div className="p-8 rounded-2xl border border-surface-border bg-gradient-to-r from-surface via-surface to-brand/15 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shadow-xl">
        <Logo size="hero" showText={false} />
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/25 text-xs font-mono text-brand-gold font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Interactive Chess Opening Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            About ChessOp
          </h1>
          <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
            Built to make learning, visualizing, and practicing chess opening theory intuitive, fast, and accessible for everyone.
          </p>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-brand-accent" />
          Core Platform Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-200 text-sm">
              <Compass className="w-4 h-4 text-brand-accent" />
              <span>3,500+ Openings & ECO Index</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore ECO classifications from Volume A through E with move-by-move continuations, FEN lookup, and instant searching.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-200 text-sm">
              <GitBranch className="w-4 h-4 text-brand-gold" />
              <span>Interactive Theory Graph</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A dynamic visual move tree mapping opening branches, ECO tags, and transpositions with smooth panning and zooming.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-200 text-sm">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Repertoire Practice Trainer</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Test your opening recall with interactive drill cards, progress tracking, and move-by-move feedback.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-200 text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>20 Famous Opening Traps</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Master legendary tactical traps (Lasker, Stafford, Noah's Ark, Fishing Pole) with step-by-step walkthroughs.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture & Open Source */}
      <div className="p-6 rounded-2xl border border-surface-border bg-surface space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base border-b border-surface-border pb-3">
          <Database className="w-5 h-5 text-blue-400" />
          <h3>Open Source Data & Technical Stack</h3>
        </div>
        <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
          <p>
            In chess, different move orders often lead to the exact same board position (transposition). ChessOp uses canonical FEN position hashing as the primary identity for positions, resolving transpositions across thousands of opening lines instantly without network latency.
          </p>
          <p>
            All opening classifications and ECO codes are powered by the open-source <a href="https://github.com/lichess-org/chess-openings" target="_blank" rel="noopener noreferrer" className="text-brand-accent underline hover:text-white">Lichess Openings Dataset</a> (CC0 Public Domain). Move validation, check detection, and SAN move generation are handled client-side using <code className="font-mono text-brand-accent font-bold">chess.js</code> and Stockfish 16.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 pt-3 border-t border-surface-border/50">
          <ShieldCheck className="w-4 h-4 text-brand-gold" />
          <span>Open Data (CC0 Public Domain) • Next.js 14 • Tailwind CSS • Stockfish 16</span>
        </div>
      </div>
    </div>
  );
}
