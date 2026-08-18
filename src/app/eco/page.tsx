"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, ArrowRight, Search } from "lucide-react";
import { EcoCategory } from "@/types/opening";

const ECO_VOLUMES: { code: EcoCategory; name: string; range: string; description: string; keyOpenings: string[] }[] = [
  {
    code: "A",
    name: "Flank & Irregular Openings",
    range: "A00 – A99",
    description: "Includes English Opening, Réti Opening, Bird's Opening, Larsen's Opening, Dutch Defense, and Benoni Defenses.",
    keyOpenings: ["English Opening", "Réti Opening", "Dutch Defense", "Benoni Defense"],
  },
  {
    code: "B",
    name: "Semi-Open Games (Sicilian & Caro-Kann)",
    range: "B00 – B99",
    description: "Includes Sicilian Defense, French Defense, Caro-Kann Defense, Scandinavian Defense, and Alekhine's Defense.",
    keyOpenings: ["Sicilian Defense", "Caro-Kann Defense", "Scandinavian Defense", "Alekhine Defense"],
  },
  {
    code: "C",
    name: "Open Games & French Defense",
    range: "C00 – C99",
    description: "Includes 1. e4 e5 double king pawn lines: Ruy Lopez (Spanish Opening), Italian Game, Scotch Game, King's Gambit, Petrov Defense, and French Defense.",
    keyOpenings: ["Ruy Lopez", "Italian Game", "French Defense", "King's Gambit"],
  },
  {
    code: "D",
    name: "Closed & Semi-Closed Games",
    range: "D00 – D99",
    description: "Includes Queen's Gambit Declined, Queen's Gambit Accepted, Slav Defense, Semi-Slav Defense, and Grünfeld Defense.",
    keyOpenings: ["Queen's Gambit", "Slav Defense", "Grünfeld Defense", "Chigorin Defense"],
  },
  {
    code: "E",
    name: "Indian Defenses",
    range: "E00 – E99",
    description: "Includes King's Indian Defense, Nimzo-Indian Defense, Queen's Indian Defense, Bogo-Indian Defense, and Catalan Opening.",
    keyOpenings: ["King's Indian Defense", "Nimzo-Indian Defense", "Catalan Opening", "Queen's Indian"],
  },
];

export default function EcoIndexPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/openings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const filteredVolumes = ECO_VOLUMES.filter((vol) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      vol.name.toLowerCase().includes(q) ||
      vol.code.toLowerCase().includes(q) ||
      vol.range.toLowerCase().includes(q) ||
      vol.description.toLowerCase().includes(q) ||
      vol.keyOpenings.some((op) => op.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-brand-gold" />
            ECO Classification System
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Encyclopaedia of Chess Openings taxonomy grouped into volumes A through E
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ECO volume or opening..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-xs text-foreground placeholder-gray-400 focus:border-brand-accent focus:outline-none shadow-sm"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolumes.map((vol) => (
          <Link
            key={vol.code}
            href={`/eco/${vol.code.toLowerCase()}`}
            className="group flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-surface hover:border-brand-gold/50 hover:bg-surface-hover transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-border font-mono text-lg font-bold text-brand-gold">
                  {vol.code}
                </span>
                <span className="font-mono text-xs font-bold text-gray-400 px-2.5 py-1 rounded bg-surface-muted border border-surface-border">
                  {vol.range}
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground group-hover:text-brand-gold transition-colors mb-2">
                {vol.name}
              </h2>

              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {vol.description}
              </p>
            </div>

            <div>
              <div className="pt-3 border-t border-surface-border/50 flex flex-wrap gap-1.5 mb-4">
                {vol.keyOpenings.map((op, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-muted text-gray-300">
                    {op}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-brand-gold">
                <span>Browse Volume {vol.code}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
