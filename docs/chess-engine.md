# Chess Engine & Board Integration

## Chess Logic: `chess.js`
- Handles game state validation, move parsing, SAN/UCI generation, and check detection.
- `chess.js` is kept decoupled from UI rendering logic.
- A wrapper helper module (`src/lib/chess/engine.ts`) provides clean utilities for:
  - Validating user moves
  - Applying SAN or LAN moves
  - Normalizing FEN position keys
  - Formatting game history for notation rendering

## Board Component Isolation
- Board UI is encapsulated in `src/components/chess/ChessBoard.tsx`.
- Interfaces cleanly with `react-chessboard` (MIT licensed).
- Supports drag-and-drop, tap-to-move, board flipping, customizable themes (Classic, Midnight, Tournament, Emerald), square highlights, and move arrows.
- Wrapped in a responsive parent container to guarantee correct square ratio without layout shifting.
