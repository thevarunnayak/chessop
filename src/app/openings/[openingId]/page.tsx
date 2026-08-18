import { notFound } from "next/navigation";
import Link from "next/link";
import { getOpeningById, getAllOpenings } from "@/lib/openings/service";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { OpeningCard } from "@/components/openings/OpeningCard";
import { Compass, GitBranch, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

interface OpeningDetailPageProps {
  params: {
    openingId: string;
  };
}

export function generateStaticParams() {
  const openings = getAllOpenings();
  // Prerender top 100 popular opening slugs statically
  return openings.slice(0, 100).map((op) => ({
    openingId: op.id,
  }));
}

export default function OpeningDetailPage({ params }: OpeningDetailPageProps) {
  const opening = getOpeningById(params.openingId);

  if (!opening) {
    notFound();
  }

  const parentOpening = opening.parentId ? getOpeningById(opening.parentId) : undefined;
  const childrenOpenings = (opening.childrenIds || [])
    .map((id) => getOpeningById(id))
    .filter(Boolean) as typeof opening[];

  const movesParam = encodeURIComponent(opening.moves.join(","));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/openings"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opening Encyclopedia
        </Link>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl border border-surface-border bg-surface shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold px-3 py-1 rounded-md bg-surface-border text-brand-gold border border-brand-gold/30">
              ECO {opening.eco}
            </span>
            <span className="text-xs font-semibold text-gray-300 bg-surface-muted px-3 py-1 rounded-md border border-surface-border">
              {opening.categoryName}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {opening.name}
          </h1>

          {parentOpening && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <GitBranch className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Parent Line:</span>
              <Link
                href={`/openings/${parentOpening.id}`}
                className="text-brand-accent hover:underline font-semibold"
              >
                {parentOpening.name}
              </Link>
            </div>
          )}
        </div>

        {/* Explore CTA */}
        <Link
          href={`/explorer?moves=${movesParam}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-hover transition-all shadow-md shadow-brand/20 shrink-0"
        >
          <Compass className="w-5 h-5" />
          Explore Position Interactively
        </Link>
      </div>

      {/* Main Grid: Mini Board + Move Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Board Preview (Lg: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-20 lg:self-start">
          <ChessBoard
            fen={opening.fen}
            isInteractive={false}
            className="w-full"
          />
          <span className="text-xs font-mono text-gray-400">
            Target Position after {opening.moves.length} moves
          </span>
        </div>

        {/* Moves & Metadata (Lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-surface-border bg-surface space-y-4">
            <h2 className="text-base font-mono font-bold uppercase tracking-wider text-gray-200">
              Standard Move Sequence (SAN)
            </h2>

            <div className="p-4 rounded-xl bg-surface-muted border border-surface-border font-mono text-sm sm:text-base font-bold text-brand-accent leading-relaxed">
              {opening.moves.map((m, idx) => (
                <span key={idx} className="mr-2">
                  {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ""}
                  {m}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border text-xs">
              <div>
                <span className="text-gray-400 font-mono block mb-1">ECO Classification</span>
                <span className="font-bold text-brand-gold">{opening.eco}</span>
              </div>
              <div>
                <span className="text-gray-400 font-mono block mb-1">Move Depth</span>
                <span className="font-bold text-foreground">{opening.moves.length} plies</span>
              </div>
            </div>
          </div>

          {/* Child Variations Grid */}
          {childrenOpenings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-brand-accent" />
                Continuations & Variations ({childrenOpenings.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {childrenOpenings.map((child) => (
                  <OpeningCard key={child.id} opening={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
