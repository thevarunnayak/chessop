"use client";

import { useState, useMemo, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import Link from "next/link";
import { buildOpeningGraph, GraphNode } from "@/lib/openings/graphService";
import { getTranspositions, getOpeningById } from "@/lib/openings/service";
import { ChessGameEngine } from "@/lib/chess/engine";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveControls } from "@/components/chess/MoveControls";
import { BoardOrientation } from "@/types/chess";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { cn } from "@/lib/utils/cn";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Filter,
  ArrowRight,
  GitBranch,
  Layers,
  Sparkles,
  X,
  Compass,
} from "lucide-react";

interface OpeningTheoryGraphProps {
  initialSearch?: string;
  className?: string;
}

import { t } from "@/lib/i18n";

const DEPTH_OPTIONS: SelectOption<string>[] = [
  { value: "5", label: t("graph.movesCount", { count: 5 }) },
  { value: "8", label: t("graph.movesCount", { count: 8 }) },
  { value: "10", label: t("graph.movesCount", { count: 10 }) },
  { value: "12", label: t("graph.movesCount", { count: 12 }) },
  { value: "15", label: t("graph.movesCount", { count: 15 }) },
  { value: "20", label: t("graph.movesCount", { count: 20 }) },
];

export function OpeningTheoryGraph({ initialSearch = "", className }: OpeningTheoryGraphProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxDepth, setMaxDepth] = useState(5);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [drawerMoveIndex, setDrawerMoveIndex] = useState<number>(0);
  const [drawerOrientation, setDrawerOrientation] = useState<BoardOrientation>("white");

  useEffect(() => {
    if (selectedNode) {
      setDrawerMoveIndex(selectedNode.moves.length);
    }
  }, [selectedNode]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Pan & Zoom SVG canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 80, y: 320 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate graph dataset
  const graphData = useMemo(() => {
    return buildOpeningGraph(activeCategory, searchQuery, maxDepth);
  }, [activeCategory, searchQuery, maxDepth]);

  // Calculate FEN array for all steps of the selected node's line
  const drawerFens = useMemo(() => {
    if (!selectedNode) return [];
    const engine = new ChessGameEngine();
    const fens: string[] = [engine.getFen()];
    for (const m of selectedNode.moves) {
      engine.makeMove(m);
      fens.push(engine.getFen());
    }
    return fens;
  }, [selectedNode]);

  // Compute selected node board position & transpositions
  const selectedNodeDetails = useMemo(() => {
    if (!selectedNode) return null;

    const engine = new ChessGameEngine();
    selectedNode.moves.forEach((m) => engine.makeMove(m));
    const fen = engine.getFen();

    const opening = selectedNode.openingId ? getOpeningById(selectedNode.openingId) : undefined;
    const transpositions = getTranspositions(fen, selectedNode.openingId);

    return {
      fen,
      opening,
      transpositions,
      movesSan: selectedNode.moves.join(" "),
    };
  }, [selectedNode]);

  const activeDrawerFen = drawerFens[drawerMoveIndex] ?? selectedNodeDetails?.fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  // Helper to keep canvas within sensible drag boundaries
  function clampPan(newPan: { x: number; y: number }, currentZoom: number) {
    const minX = -6000 * currentZoom;
    const maxX = 1500 * currentZoom;
    const minY = -4500 * currentZoom;
    const maxY = 4500 * currentZoom;

    return {
      x: Math.max(minX, Math.min(maxX, newPan.x)),
      y: Math.max(minY, Math.min(maxY, newPan.y)),
    };
  }

  // Pan & Zoom handlers
  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const rawPan = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    setPan(clampPan(rawPan, zoom));
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (isDragging && e.touches.length === 1) {
      const rawPan = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      };
      setPan(clampPan(rawPan, zoom));
    }
  }

  // Attach non-passive wheel listener to allow e.preventDefault() during canvas zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setZoom((prev) => Math.min(2.5, Math.max(0.2, prev * zoomFactor)));
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  function resetView() {
    setZoom(0.6);
    setPan({ x: 80, y: 320 });
  }

  return (
    <div className={cn("flex flex-col h-[calc(100vh-5rem)] bg-background overflow-hidden relative select-none", className)}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-surface-border bg-surface z-20 shadow-md">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["ALL", "A", "B", "C", "D", "E"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0",
                activeCategory === cat
                  ? "bg-brand-accent text-black border-brand-accent shadow-md shadow-brand-accent/20"
                  : "bg-surface-muted text-gray-300 border-surface-border hover:bg-surface-hover hover:text-white"
              )}
            >
              {cat === "ALL" ? t("graph.allOpenings") : t("graph.volume", { volume: cat })}
            </button>
          ))}
        </div>

        {/* Search & Depth Controls */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("graph.searchPlaceholder")}
              className="pl-9 pr-3 py-1.5 bg-surface-muted border border-surface-border rounded-lg text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-brand-accent w-48 sm:w-64"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Custom Depth Dropdown */}
          <div className="hidden sm:flex items-center gap-2 border-l border-surface-border pl-3">
            <span className="text-xs font-mono text-gray-400">{t("graph.depth")}</span>
            <CustomSelect
              value={String(maxDepth)}
              options={DEPTH_OPTIONS}
              onChange={(val) => setMaxDepth(Number(val))}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Main Graph SVG Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#090d14]">
        {/* Canvas Control Floating Buttons */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-surface/90 backdrop-blur border border-surface-border p-1.5 rounded-xl shadow-xl">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))}
            className="p-2 hover:bg-surface-hover rounded-lg text-gray-300 hover:text-white transition-colors"
            title={t("graph.zoomIn")}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z / 1.2))}
            className="p-2 hover:bg-surface-hover rounded-lg text-gray-300 hover:text-white transition-colors"
            title={t("graph.zoomOut")}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={resetView} className="p-2 hover:bg-surface-hover rounded-lg text-gray-300 hover:text-white transition-colors" title={t("graph.resetCamera")}>
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 bg-surface/90 backdrop-blur border border-surface-border px-3.5 py-2 rounded-xl text-xs font-mono shadow-xl text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-accent" />
            <span>{t("graph.legendMainLine")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,160,23,0.8)]" />
            <span>{t("graph.legendSelected")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-400" />
            <span>{t("graph.legendTransposition")}</span>
          </div>
        </div>

        <svg
          ref={svgRef}
          className="w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3fb950" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="transpositionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d29922" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render Edges */}
            {graphData.edges.map((edge) => {
              const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
              const targetNode = graphData.nodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isTransEdge = edge.isTransposition;
              const dx = targetNode.x - sourceNode.x;
              const dy = targetNode.y - sourceNode.y;

              let pathD = "";
              if (isTransEdge) {
                // Curved arc for transpositions
                const curveOffset = Math.sign(dy || 1) * 60;
                pathD = `M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2 + curveOffset} ${(sourceNode.y + targetNode.y) / 2 - curveOffset}, ${targetNode.x} ${targetNode.y}`;
              } else {
                const cx1 = sourceNode.x + dx * 0.5;
                const cy1 = sourceNode.y;
                const cx2 = sourceNode.x + dx * 0.5;
                const cy2 = targetNode.y;
                pathD = `M ${sourceNode.x} ${sourceNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x} ${targetNode.y}`;
              }

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isTransEdge ? "url(#transpositionGradient)" : "url(#edgeGradient)"}
                    strokeWidth={isTransEdge ? 2.5 : 2}
                    strokeDasharray={isTransEdge ? "6 4" : undefined}
                    strokeLinecap="round"
                    className={cn(
                      "transition-all duration-300",
                      isTransEdge ? "opacity-90 hover:opacity-100 animate-pulse" : "opacity-60 hover:opacity-100 hover:stroke-brand-accent"
                    )}
                  />
                  {/* Edge SAN Label */}
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 - 6}
                    fill={isTransEdge ? "#f59e0b" : "#9ca3af"}
                    fontSize={isTransEdge ? 9 : 10}
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none font-bold"
                  >
                    {edge.san}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {graphData.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isRoot = node.id === "root";

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Node Outer Glow */}
                  {isSelected && (
                    <circle r={24} fill="#d29922" fillOpacity={0.25} filter="url(#glow)" className="animate-pulse" />
                  )}

                  {/* Node Main Circle */}
                  <circle
                    r={isRoot ? 18 : 14}
                    fill={isSelected ? "#d29922" : isRoot ? "#38bdf8" : "#1f293d"}
                    stroke={isSelected ? "#f59e0b" : isRoot ? "#0284c7" : "#38bdf8"}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-110 group-hover:stroke-brand-gold"
                  />

                  {/* ECO Code Tag above node */}
                  {!isRoot && (
                    <rect
                      x={-18}
                      y={-28}
                      width={36}
                      height={13}
                      rx={3}
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth={1}
                    />
                  )}

                  {!isRoot && (
                    <text
                      x={0}
                      y={-19}
                      fill="#38bdf8"
                      fontSize={8}
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.eco}
                    </text>
                  )}

                  {/* Move SAN label inside node */}
                  <text
                    x={0}
                    y={4}
                    fill={isSelected ? "#000000" : "#ffffff"}
                    fontSize={isRoot ? 9 : 10}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {isRoot ? "START" : node.san}
                  </text>

                  {/* Opening Title Label to the right of leaf nodes */}
                  {node.openingName && (
                    <text
                      x={22}
                      y={4}
                      fill={isSelected ? "#f59e0b" : "#94a3b8"}
                      fontSize={11}
                      fontFamily="sans-serif"
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="pointer-events-none transition-colors group-hover:fill-white"
                    >
                      {node.openingName}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && selectedNodeDetails && (
        <div className="absolute right-4 top-20 bottom-6 w-80 sm:w-96 bg-surface/95 backdrop-blur border border-surface-border rounded-2xl shadow-2xl z-30 overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
          {/* Sticky Header */}
          <div className="p-4 border-b border-surface-border bg-surface flex items-start justify-between gap-3 shrink-0">
            <div>
              <span className="px-2 py-0.5 rounded bg-brand-accent/20 border border-brand-accent/40 text-brand-accent font-mono text-xs font-bold">
                ECO {selectedNode.eco}
              </span>
              <h3 className="text-base font-bold text-foreground mt-1.5 leading-snug">
                {selectedNode.openingName || `Position (${selectedNode.san})`}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-surface-hover transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Middle Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Interactive Board Preview & Move Controls */}
            <div className="flex flex-col items-center gap-3">
              <ChessBoard
                fen={activeDrawerFen}
                orientation={drawerOrientation}
                isInteractive={false}
                showCoordinates={false}
                hasBackground={false}
                className="max-w-[230px] rounded-lg"
              />
              <MoveControls
                onFirst={() => setDrawerMoveIndex(0)}
                onPrevious={() => setDrawerMoveIndex((idx) => Math.max(0, idx - 1))}
                onNext={() => setDrawerMoveIndex((idx) => Math.min(selectedNode.moves.length, idx + 1))}
                onLast={() => setDrawerMoveIndex(selectedNode.moves.length)}
                onReset={() => setDrawerMoveIndex(selectedNode.moves.length)}
                onFlip={() => setDrawerOrientation((o) => (o === "white" ? "black" : "white"))}
                canPrevious={drawerMoveIndex > 0}
                canNext={drawerMoveIndex < selectedNode.moves.length}
              />
            </div>

            {/* Move Sequence */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold tracking-wider">{t("graph.moveLine")}</span>
              <div className="p-2.5 rounded-lg border border-surface-border bg-surface-muted font-mono text-xs text-brand-gold break-words">
                {selectedNodeDetails.movesSan || t("graph.startPosition")}
              </div>
            </div>

            {/* Transpositions Section */}
            {selectedNodeDetails.transpositions.length > 0 && (
              <div className="space-y-2 border-t border-surface-border pt-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-gold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("graph.transpositionsCount", { count: selectedNodeDetails.transpositions.length })}</span>
                </div>
                <div className="space-y-1.5">
                  {selectedNodeDetails.transpositions.map((trans) => (
                    <Link
                      key={trans.id}
                      href={`/explorer?moves=${encodeURIComponent(trans.moves.join(","))}`}
                      className="block p-2 rounded-lg border border-surface-border bg-surface-muted hover:bg-surface-hover hover:border-brand-gold/50 transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-gray-200">
                        <span className="text-brand-accent">{trans.eco}</span>
                        <span className="text-[10px] text-gray-400">{trans.moves.length} {t("common.moves")}</span>
                      </div>
                      <div className="text-gray-300 font-sans mt-0.5 truncate">{trans.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="p-4 border-t border-surface-border bg-surface shrink-0">
            <Link
              href={`/explorer?moves=${encodeURIComponent(selectedNode.moves.join(","))}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-black font-bold text-xs transition-colors shadow-lg shadow-brand-accent/20"
            >
              <Compass className="w-4 h-4" />
              <span>{t("explorer.exploreInBoard")}</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
