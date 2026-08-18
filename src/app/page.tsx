"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Compass, Search, BookOpen, ArrowRight, Zap } from "lucide-react";

const POPULAR_OPENINGS = [
  { id: "sicilian-defense", name: "Sicilian Defense", eco: "B20", category: "Semi-Open Games", moves: "1. e4 c5" },
  { id: "french-defense", name: "French Defense", eco: "C00", category: "Semi-Open Games", moves: "1. e4 e6" },
  { id: "caro-kann-defense", name: "Caro-Kann Defense", eco: "B10", category: "Semi-Open Games", moves: "1. e4 c6" },
  { id: "queens-gambit", name: "Queen's Gambit", eco: "D06", category: "Closed Games", moves: "1. d4 d5 2. c4" },
  { id: "kings-indian-defense", name: "King's Indian Defense", eco: "E60", category: "Indian Defenses", moves: "1. d4 Nf6 2. c4 g6" },
  { id: "ruy-lopez", name: "Ruy Lopez (Spanish Opening)", eco: "C60", category: "Open Games", moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5" },
];

const ECO_CATEGORIES = [
  { code: "A", name: "Flank Openings", moves: "1. c4, 1. Nf3, 1. f4, etc.", count: "750+ variations" },
  { code: "B", name: "Semi-Open Games", moves: "1. e4 c5, 1. e4 c6, 1. e4 d6", count: "1000+ variations" },
  { code: "C", name: "Open Games & French", moves: "1. e4 e5, 1. e4 e6", count: "900+ variations" },
  { code: "D", name: "Closed & Semi-Closed", moves: "1. d4 d5, 1. d4 Nf6 2. c4 e6", count: "800+ variations" },
  { code: "E", name: "Indian Defenses", moves: "1. d4 Nf6 2. c4 g6/e6", count: "650+ variations" },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      window.location.href = `/openings?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = "/openings";
    }
  }

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-surface-border bg-gradient-to-b from-surface/50 to-background py-16 sm:py-24">
        {/* Background Ambient Crest Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-[0.035] pointer-events-none select-none blur-[0.5px]">
          <Image
            src="/brand/logo-transparent.png"
            alt=""
            width={520}
            height={520}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight">
            Master the <span className="text-brand-accent">Chess Opening Tree</span> Move by Move
          </h1>

          <p className="mt-4 text-base sm:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Explore over 3,500+ openings and variations. Search positions, discover transpositions, and navigate line continuations interactively.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/explorer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-hover transition-all shadow-md shadow-brand/20"
            >
              <Compass className="w-5 h-5" />
              Explore Openings
            </Link>
            <Link
              href="/openings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface px-6 py-3.5 text-base font-semibold text-gray-200 hover:bg-surface-hover hover:text-white transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Browse Openings
            </Link>
          </div>

          {/* Functional Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-12 w-full max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search openings (e.g. Sicilian Defense, B20, e4 c5)..."
                className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-surface-border bg-surface text-sm text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-lg bg-brand text-white text-xs font-mono font-bold hover:bg-brand/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Popular Openings Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Popular Openings</h2>
            <p className="text-sm text-gray-400">Explore standard main lines and critical starting positions</p>
          </div>
          <Link href="/openings" className="text-sm font-medium text-brand-accent hover:underline inline-flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_OPENINGS.map((op) => (
            <Link
              key={op.id}
              href={`/explorer?moves=${encodeURIComponent(op.moves.replace(/\d+\.\s*/g, '').replace(/\s+/g, ','))}`}
              className="group flex flex-col justify-between p-5 rounded-xl border border-surface-border bg-surface hover:border-brand-accent/50 hover:bg-surface-hover transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-border text-brand-gold">
                    ECO {op.eco}
                  </span>
                  <span className="text-[11px] text-gray-400 font-sans">{op.category}</span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-brand-accent transition-colors">
                  {op.name}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-300">{op.moves}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-accent transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ECO Classification Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Encyclopaedia of Chess Openings (ECO)</h2>
          <p className="text-sm text-gray-400">Categorized from volume A to E based on official FIDE ECO standards</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ECO_CATEGORIES.map((cat) => (
            <Link
              key={cat.code}
              href={`/eco/${cat.code.toLowerCase()}`}
              className="flex flex-col p-5 rounded-xl border border-surface-border bg-surface hover:border-brand-gold/50 hover:bg-surface-hover transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-border font-mono text-sm font-bold text-brand-gold">
                  {cat.code}
                </span>
                <span className="text-sm font-bold text-foreground">{cat.name}</span>
              </div>
              <span className="text-xs text-gray-400 font-mono mb-2">{cat.moves}</span>
              <span className="mt-auto text-[11px] text-gray-400">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
