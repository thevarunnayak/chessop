"use client";

import { Logo } from "./Logo";
import { cn } from "@/lib/utils/cn";

interface LoadingSplashProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSplash({
  message = "Loading Chess Opening Theory...",
  className,
  fullScreen = true,
}: LoadingSplashProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-background select-none",
        fullScreen ? "fixed inset-0 z-50 min-h-screen w-screen" : "w-full py-20 rounded-2xl border border-surface-border bg-surface",
        className
      )}
    >
      {/* Glowing Pulsing Aura */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-32 h-32 rounded-full bg-brand-accent/20 blur-2xl animate-pulse" />
        <div className="absolute w-24 h-24 rounded-full bg-brand-gold/15 blur-xl animate-ping" />

        <Logo size="hero" showText={false} />
      </div>

      {/* Brand Name */}
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center justify-center gap-1">
          ChessOp<span className="text-brand-accent animate-bounce">.</span>
        </h2>
        <p className="text-xs font-mono tracking-widest text-brand-gold uppercase font-bold">
          Interactive Opening Encyclopedia
        </p>
      </div>

      {/* Animated Loading Progress Bar */}
      <div className="w-48 h-1 rounded-full bg-surface-border overflow-hidden relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-accent via-brand-gold to-brand-accent animate-gradient-x w-full" />
      </div>

      {/* Loading Message */}
      <p className="text-xs font-mono text-gray-400 animate-pulse">
        {message}
      </p>
    </div>
  );
}
