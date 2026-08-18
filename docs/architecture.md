# Architecture Documentation

## Overview
Chess Opening Explorer is a client-first Next.js (App Router) application. Opening data is pre-compiled into optimized JSON graphs and bundled/cached locally, providing sub-100ms move interactions without relying on external API latency for opening lookup.

## Data Flow
```text
Raw Lichess Openings (TSV/JSON)
         │
         ▼
scripts/process-openings.ts (Preprocessing)
         │
         ├───────────────────────┬───────────────────────┐
         ▼                       ▼                       ▼
data/openings.json     data/positions.json      data/eco-index.json
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     Opening Data Service (Client/Build)
                                 │
                                 ▼
                  React Context / Explorer State
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   ChessBoard Component    Variation Panel          Move List & Tree
```

## Core Modules
1. **Chess Engine (`src/lib/chess/`)**: Wraps `chess.js` for legal move validation, SAN/UCI conversions, FEN normalization, and PGN parsing.
2. **Data Layer (`src/lib/openings/`)**: Serves pre-built opening nodes, position-to-opening indexes, parent/child relationships, and transposition resolution.
3. **Explorer State (`src/lib/explorer/`)**: React hook/context managing current board position, move history stack, active orientation, selected board theme, and URL parameter synchronization.
4. **UI Components (`src/components/`)**: Isolated React components for the chessboard, variations panel, tree visualization, global search modal, and responsive mobile bottom sheet.
