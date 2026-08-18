# Responsive Design Guidelines

## Breakpoints & Viewports
Tested across:
- **Mobile Extra Small (320px - 375px)**: Compact board, bottom sheet for variations/info.
- **Mobile Standard (390px - 430px)**: Touch targets >= 44px, full-width board, bottom navigation.
- **Tablet (768px - 1024px)**: 2-column layout (Board left, Info/Variations right).
- **Desktop (1280px - 1920px+)**: 3-column dashboard (Board, Variations & Tree, Info & Transpositions).

## Mobile Interaction Principles
1. **Zero Horizontal Overflow**: `overflow-x: hidden` enforced on body; chessboard container scales dynamically with viewport width.
2. **Touch-Friendly Controls**: Board navigation controls (`◀ ▶ ↻`) sized at minimum 48px height.
3. **Bottom Sheets & Tabs**: Mobile view uses slide-up drawers/tabs for move lists and variation trees to keep the board front and center.
