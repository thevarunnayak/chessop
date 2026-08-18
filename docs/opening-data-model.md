# Opening Data Model

## Data Interfaces

```typescript
export type EcoCategory = "A" | "B" | "C" | "D" | "E";

export interface Opening {
  id: string;               // Slugified unique identifier (e.g. "sicilian-defense-najdorf")
  eco: string;              // Standard ECO code (e.g. "B90")
  name: string;             // Display name (e.g. "Sicilian Defense: Najdorf Variation")
  category: EcoCategory;    // ECO volume category
  categoryName: string;     // Volume category descriptive name
  fen: string;              // Canonical position FEN
  moves: string[];          // SAN move sequence
  uci: string[];            // UCI move sequence
  parentId?: string;        // ID of parent opening line
  childrenIds: string[];    // IDs of direct child variation lines
  aliases?: string[];       // Known alternative names
}

export interface PositionNode {
  fen: string;              // Normalized FEN key
  openingIds: string[];     // Array of matching opening IDs (transpositions)
  continuations: MoveContinuation[]; // Next moves leading to known positions
  moveDepth: number;        // Half-move ply depth
}

export interface MoveContinuation {
  san: string;
  uci: string;
  toFen: string;
  openingId?: string;
  openingName?: string;
  eco?: string;
}
```
