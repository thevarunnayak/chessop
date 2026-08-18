"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left select-none", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border bg-surface-muted text-xs font-mono font-bold text-gray-200 transition-all shadow-sm",
          isOpen
            ? "border-brand-accent bg-surface-hover ring-2 ring-brand-accent/20 text-white"
            : "border-surface-border hover:border-brand-accent/60 hover:bg-surface-hover hover:text-white"
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-brand-accent"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 min-w-[190px] w-full rounded-2xl border border-surface-border bg-[#131920] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left",
                  isSelected
                    ? "bg-brand-accent/20 text-brand-accent font-extrabold border border-brand-accent/40 shadow-sm"
                    : "text-gray-300 hover:bg-surface-hover hover:text-white"
                )}
              >
                <span className="truncate flex items-center gap-2.5">
                  {opt.icon}
                  {opt.label}
                </span>
                {isSelected && <Check className="w-4 h-4 text-brand-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
