import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OpeningSearchModal } from "@/components/search/OpeningSearchModal";

export const viewport: Viewport = {
  themeColor: "#0b1019",
};

export const metadata: Metadata = {
  title: "ChessOp — Interactive Chess Opening Explorer & Graph",
  description:
    "Explore over 3,500+ chess openings, ECO codes, continuations, and transpositions move-by-move with an interactive opening tree graph.",
  metadataBase: new URL("https://chessop.app"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chessop.app",
    siteName: "ChessOp Explorer",
    title: "ChessOp — Interactive Chess Opening Explorer & Graph",
    description:
      "Explore over 3,500+ chess openings, ECO codes, continuations, and transpositions move-by-move with an interactive opening tree graph.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChessOp Explorer — Interactive Chess Opening Encyclopedia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChessOp — Interactive Chess Opening Explorer & Graph",
    description:
      "Explore over 3,500+ chess openings, ECO codes, continuations, and transpositions move-by-move with an interactive opening tree graph.",
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-brand-accent/20 selection:text-brand-accent"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <OpeningSearchModal />
      </body>
    </html>
  );
}
