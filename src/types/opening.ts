export type EcoCategory = "A" | "B" | "C" | "D" | "E";

export interface Opening {
  id: string;               // Unique slug (e.g. "sicilian-defense-najdorf-variation")
  eco: string;              // ECO Code (e.g. "B90")
  name: string;             // Display Name (e.g. "Sicilian Defense: Najdorf Variation")
  category: EcoCategory;    // Volume category ("A" | "B" | "C" | "D" | "E")
  categoryName: string;     // Category title (e.g. "Semi-Open Games")
  fen: string;              // Canonical FEN key
  moves: string[];          // SAN move sequence: ["e4", "c5", ...]
  uci: string[];            // UCI move sequence: ["e2e4", "c7c5", ...]
  parentId?: string;        // Parent opening ID
  childrenIds: string[];    // Direct child variation IDs
  aliases?: string[];       // Known alternative names
}

export interface MoveContinuation {
  san: string;              // e.g. "Nf3"
  uci: string;              // e.g. "g1f3"
  toFen: string;            // Resulting normalized FEN key
  openingId?: string;       // Matched opening ID if any
  openingName?: string;     // Matched opening name if any
  eco?: string;             // ECO code if matched
}

export interface PositionNode {
  fen: string;              // Normalized FEN key
  openingIds: string[];     // Array of matching opening IDs (supports transpositions)
  continuations: MoveContinuation[]; // Available continuations
  moveDepth: number;        // Ply depth
}

export interface SearchRecord {
  id: string;
  name: string;
  eco: string;
  movesSan: string;
  category: EcoCategory;
}

export interface EcoCategoryInfo {
  category: EcoCategory;
  name: string;
  description: string;
  ecoRanges: string;
}
