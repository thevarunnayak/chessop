# Data Sources & Licensing

## Opening Database
- **Primary Source**: [Lichess Chess Openings](https://github.com/lichess-org/chess-openings)
- **License**: CC0 1.0 Universal (Public Domain)
- **Files**: `a.tsv`, `b.tsv`, `c.tsv`, `d.tsv`, `e.tsv` corresponding to ECO categories A, B, C, D, E.
- **Record Fields**:
  - `eco`: Standard ECO classification code (e.g. `B90`).
  - `name`: Human readable opening and variation name (e.g. `Sicilian Defense: Najdorf Variation`).
  - `pgn`: Move sequence in Standard Algebraic Notation (SAN).
  - `uci`: Move sequence in UCI coordinate notation.
  - `epd`: Position EPD / FEN notation.

## Preprocessing Pipeline
`scripts/process-openings.ts` processes raw opening records to build a normalized position graph:
1. Validates move sequences using `chess.js`.
2. Normalizes FEN strings to ensure transposition matching (strip move clocks when hashing position keys).
3. Connects parent and child opening variations.
4. Detects position transpositions (positions reachable via different move paths).
5. Generates optimized client data files: `openings.json`, `positions.json`, `eco-index.json`, `search-index.json`.
