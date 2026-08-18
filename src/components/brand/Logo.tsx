"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  className?: string;
  variant?: "transparent" | "solid";
}

const SIZE_MAP = {
  xs: { iconSize: 24, icon: "w-6 h-6", text: "text-xs", sub: "text-[7px]" },
  sm: { iconSize: 32, icon: "w-8 h-8", text: "text-sm", sub: "text-[8px]" },
  md: { iconSize: 40, icon: "w-10 h-10", text: "text-base", sub: "text-[10px]" },
  lg: { iconSize: 56, icon: "w-14 h-14", text: "text-2xl", sub: "text-xs" },
  xl: { iconSize: 80, icon: "w-20 h-20", text: "text-3xl", sub: "text-sm" },
  hero: { iconSize: 120, icon: "w-28 h-28 sm:w-32 sm:h-32", text: "text-5xl", sub: "text-base" },
};

export function Logo({
  size = "md",
  showText = true,
  className,
  variant = "transparent",
}: LogoProps) {
  const sizes = SIZE_MAP[size];
  const imageSrc = variant === "solid" ? "/brand/logo.png" : "/brand/logo-transparent.png";

  return (
    <div className={cn("inline-flex items-center gap-3 select-none group cursor-pointer", className)}>
      {/* Royal Knight Crest Emblem */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300",
          sizes.icon
        )}
      >
        <Image
          src={imageSrc}
          alt="ChessOp Crest Emblem"
          width={sizes.iconSize * 2}
          height={sizes.iconSize * 2}
          className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(212,160,23,0.35)] transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_4px_16px_rgba(212,160,23,0.55)]"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-sans font-black tracking-tight text-foreground group-hover:text-white transition-colors flex items-center gap-0.5",
              sizes.text
            )}
          >
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              ChessOp
            </span>
            <span className="text-amber-400 font-mono">.</span>
          </span>
          <span
            className={cn(
              "font-mono tracking-widest text-gray-400 uppercase font-bold -mt-0.5",
              sizes.sub
            )}
          >
            Opening Explorer
          </span>
        </div>
      )}
    </div>
  );
}
