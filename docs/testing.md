# Testing Strategy

## Unit & Integration Testing (Vitest)
- **Chess Engine Helpers**: Verify move validation, SAN generation, and FEN parsing.
- **Data Normalization & Graph Lookup**: Test FEN lookup, parent/child variation node matching, and transposition detection.
- **Search Engine**: Test search ranking (exact match, prefix match, alias match, move sequence match).

## Automated E2E & Layout Verification
- Next.js build verification (`npm run build`).
- TypeScript type checking (`npx tsc --noEmit`).
- ESLint checks (`npm run lint`).
