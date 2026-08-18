"use client";

import { useState } from "react";
import { BoardOrientation, BoardTheme } from "@/types/chess";
import { soundManager } from "@/lib/chess/sound";
import { Sliders, ArrowUpDown, Eye, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BoardSettingsProps {
  orientation: BoardOrientation;
  theme: BoardTheme;
  showCoordinates: boolean;
  onOrientationChange: (orientation: BoardOrientation) => void;
  onThemeChange: (theme: BoardTheme) => void;
  onCoordinatesToggle: (show: boolean) => void;
  className?: string;
}

const THEME_OPTIONS: { id: BoardTheme; name: string; previewDark: string; previewLight: string }[] = [
  { id: "tournament", name: "Tournament", previewDark: "#769656", previewLight: "#eeeed2" },
  { id: "classic", name: "Classic Wood", previewDark: "#b58863", previewLight: "#f0d9b5" },
  { id: "midnight", name: "Midnight Charcoal", previewDark: "#2d3748", previewLight: "#718096" },
  { id: "emerald", name: "Emerald Green", previewDark: "#1e532d", previewLight: "#7ee787" },
];

export function BoardSettings({
  orientation,
  theme,
  showCoordinates,
  onOrientationChange,
  onThemeChange,
  onCoordinatesToggle,
  className,
}: BoardSettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.getEnabled());
  return (
    <div className={cn("p-4 rounded-xl border border-surface-border bg-surface space-y-4", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
        <Sliders className="w-4 h-4 text-brand-gold" />
        <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300">
          Board Customization
        </h4>
      </div>

      {/* Board Theme Selection */}
      <div>
        <label className="text-xs text-gray-400 font-medium block mb-2">
          Board Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={cn(
                "flex items-center gap-2.5 p-2 rounded-lg border text-xs text-left transition-all",
                theme === t.id
                  ? "border-brand-accent bg-surface-hover font-semibold text-white"
                  : "border-surface-border bg-surface-muted text-gray-400 hover:text-gray-200 hover:bg-surface-hover"
              )}
            >
              <div className="flex h-5 w-5 rounded overflow-hidden border border-black/20 shrink-0">
                <div className="w-1/2 h-full" style={{ backgroundColor: t.previewLight }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: t.previewDark }} />
              </div>
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orientation, Coordinates & Sound */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border">
        <button
          onClick={() => onOrientationChange(orientation === "white" ? "black" : "white")}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-surface-border bg-surface-muted hover:bg-surface-hover text-xs font-medium text-gray-200 transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-brand-accent" />
          <span>Flip</span>
        </button>

        <button
          onClick={() => onCoordinatesToggle(!showCoordinates)}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-medium transition-colors",
            showCoordinates
              ? "border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
              : "border-surface-border bg-surface-muted text-gray-400 hover:text-gray-200"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Coords</span>
        </button>

        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            soundManager.setEnabled(next);
          }}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-medium transition-colors",
            soundEnabled
              ? "border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
              : "border-surface-border bg-surface-muted text-gray-400 hover:text-gray-200"
          )}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sound</span>
        </button>
      </div>
    </div>
  );
}
