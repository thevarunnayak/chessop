import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <Logo size="lg" />
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-foreground">404 - Page Not Found</h1>
        <p className="text-sm font-mono text-gray-400 max-w-md mx-auto">
          The opening position or page you are looking for does not exist in our database.
        </p>
      </div>
      <Link
        href="/explorer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-mono font-bold hover:bg-brand/90 transition-colors shadow-lg"
      >
        <Compass className="w-4 h-4" />
        <span>Return to Opening Explorer</span>
      </Link>
    </div>
  );
}
