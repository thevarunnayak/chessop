"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Layers, Folder, Info, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/explorer", label: "Explorer", icon: Compass },
  { href: "/openings", label: "Openings", icon: BookOpen },
  { href: "/eco", label: "ECO Code", icon: Layers },
  { href: "/collections", label: "Collections", icon: Folder },
  { href: "/about", label: "About", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a href="/">
          <Logo size="md" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-surface text-brand-accent border border-surface-border font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-surface-hover"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-surface-hover border border-surface-border"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-surface px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  isActive
                    ? "bg-surface-hover text-brand-accent border border-brand-accent/30"
                    : "text-gray-300 hover:bg-surface-hover"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
