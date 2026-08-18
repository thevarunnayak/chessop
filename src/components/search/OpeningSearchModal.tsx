"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchOpenings } from "@/lib/openings/service";
import { Opening } from "@/types/opening";
import { Search, X, ArrowRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function OpeningSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Opening[]>([]);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (query.trim()) {
      const res = searchOpenings(query, 12);
      setResults(res);
    } else {
      setResults([]);
    }
  }, [query]);

  function handleSelectOpening(opening: Opening) {
    setIsOpen(false);
    setQuery("");
    router.push(`/openings/${opening.id}`);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl border border-surface-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-surface-border bg-surface-muted">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by opening name, ECO code (B20), or move sequence (e4 c5)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-3 pr-8 bg-transparent text-sm text-foreground placeholder-gray-400 focus:outline-none font-sans"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-surface-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {query.trim() && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No matching openings found for &quot;{query}&quot;.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectOpening(item)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-surface-border/50 bg-surface-muted hover:bg-surface-hover hover:border-brand-accent/40 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-border text-brand-gold">
                    {item.eco}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground group-hover:text-brand-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {item.moves.join(" ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  <Compass className="w-4 h-4" />
                </div>
              </button>
            ))
          )}

          {!query.trim() && (
            <div className="py-6 text-center text-xs text-gray-400 space-y-1">
              <p>Type to search 3,800+ chess openings...</p>
              <p className="text-[11px] font-mono text-gray-500">Try &quot;Sicilian&quot;, &quot;B90&quot;, or &quot;e4 c5&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
