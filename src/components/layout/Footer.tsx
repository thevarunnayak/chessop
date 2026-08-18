import Link from "next/link";
import { GitBranch, ShieldCheck, Database, Compass } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-surface text-gray-400 text-sm py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="mb-3">
            <Logo size="sm" />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Interactive chess opening encyclopedia & theory graph. Explore over 3,500+ openings and variations move-by-move.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold mb-3">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/explorer" className="hover:text-brand-accent transition-colors flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Interactive Explorer
              </Link>
            </li>
            <li>
              <Link href="/openings" className="hover:text-brand-accent transition-colors flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Openings Catalog (ECO A-E)
              </Link>
            </li>
            <li>
              <Link href="/eco" className="hover:text-brand-accent transition-colors flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> ECO Taxonomy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold mb-3">
            Open Data & Attribution
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-2">
            Data sourced from open-source Lichess Chess Openings (CC0 Public Domain). Chess rules and move engine powered by chess.js.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span>Open Source & Open Data</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 mt-6 border-t border-surface-border/50 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ChessOp Explorer. Built for chess researchers and enthusiasts.
      </div>
    </footer>
  );
}
