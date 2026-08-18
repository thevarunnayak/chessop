# Chess Opening Explorer — Implementation Plan

This project is built phase-by-phase according to the specifications in the Product & Engineering Prompt.

## Core Stack
- **Framework**: Next.js (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Chess Engine**: `chess.js` (BSD-2-Clause)
- **Board UI**: `react-chessboard` (MIT) isolated in `ChessBoard.tsx` component
- **Dataset**: Lichess `chess-openings` (CC0 Public Domain) A00–E99
- **Data Model**: Normalized FEN position graph with transposition detection

## Documentation Directory (`docs/`)
- `docs/architecture.md`: Software architecture, data flow, state management
- `docs/data-sources.md`: Dataset attribution, licensing, raw format, normalization
- `docs/opening-data-model.md`: Normalized interfaces for Openings, Positions, Transitions
- `docs/chess-engine.md`: chess.js integration, board abstraction, move notation
- `docs/responsive-design.md`: Breakpoints, layout strategies, mobile navigation, touch guidelines
- `docs/testing.md`: Vitest unit tests, Playwright E2E tests, validation strategy
- `docs/roadmap.md`: Core MVP scope and future enhancements
- `docs/phase-history.md`: Record of completed phases, decisions, and known issues
