export type BoardOrientation = "white" | "black";

export type BoardTheme = "classic" | "midnight" | "tournament" | "emerald";

export interface CustomSquareStyles {
  [square: string]: Record<string, string | number>;
}

export interface ChessMoveRecord {
  san: string;              // e.g. "e4"
  uci: string;              // e.g. "e2e4"
  from: string;             // e.g. "e2"
  to: string;               // e.g. "e4"
  piece: string;            // e.g. "p"
  captured?: string;        // e.g. "p"
  promotion?: string;       // e.g. "q"
  fen: string;              // Resulting position FEN
  moveIndex: number;        // Ply index starting at 0
}

export interface BoardSettingsState {
  orientation: BoardOrientation;
  theme: BoardTheme;
  showCoordinates: boolean;
  autoFlipOnMove: boolean;
}
