import { Chess, Square, Move } from "chess.js";
import { ChessMoveRecord } from "@/types/chess";

/**
 * Normalizes a FEN string to a canonical key for position lookup and transposition matching.
 * Standard FEN has 6 fields: <pieces> <active_color> <castling> <en_passant> <halfmove_clock> <fullmove_number>
 * We keep fields 0-3 and strip halfmove clock + fullmove number so transpositions match accurately regardless of move counts.
 */
export function normalizeFen(fen: string): string {
  if (!fen) return "";
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) return fen;
  return parts.slice(0, 4).join(" ");
}

export class ChessGameEngine {
  private game: Chess;
  private historyStack: ChessMoveRecord[] = [];

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  public getFen(): string {
    return this.game.fen();
  }

  public getCanonicalFen(): string {
    return normalizeFen(this.game.fen());
  }

  public getTurn(): "w" | "b" {
    return this.game.turn();
  }

  public isCheck(): boolean {
    return this.game.inCheck();
  }

  public isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  public isDraw(): boolean {
    return this.game.isDraw();
  }

  public isGameOver(): boolean {
    return this.game.isGameOver();
  }

  public reset(): void {
    this.game.reset();
    this.historyStack = [];
  }

  public loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      this.historyStack = [];
      return true;
    } catch {
      return false;
    }
  }

  public loadPgn(pgn: string): boolean {
    try {
      this.game.loadPgn(pgn);
      const moves = this.game.history({ verbose: true });
      this.historyStack = moves.map((m, idx) => ({
        san: m.san,
        uci: m.from + m.to + (m.promotion || ""),
        from: m.from,
        to: m.to,
        piece: m.piece,
        captured: m.captured,
        promotion: m.promotion,
        fen: m.after,
        moveIndex: idx,
      }));
      return true;
    } catch {
      return false;
    }
  }

  public getLegalMoves(square?: Square): Move[] {
    return this.game.moves({ square, verbose: true });
  }

  public makeMove(move: string | { from: string; to: string; promotion?: string }): ChessMoveRecord | null {
    try {
      const result = this.game.move(move);
      if (!result) return null;

      const record: ChessMoveRecord = {
        san: result.san,
        uci: result.from + result.to + (result.promotion || ""),
        from: result.from,
        to: result.to,
        piece: result.piece,
        captured: result.captured,
        promotion: result.promotion,
        fen: result.after,
        moveIndex: this.historyStack.length,
      };

      this.historyStack.push(record);
      return record;
    } catch {
      return null;
    }
  }

  public undoMove(): ChessMoveRecord | null {
    const result = this.game.undo();
    if (!result) return null;
    return this.historyStack.pop() || null;
  }

  public getHistory(): ChessMoveRecord[] {
    return [...this.historyStack];
  }

  public getSanHistory(): string[] {
    return this.historyStack.map((m) => m.san);
  }

  public getPgn(): string {
    return this.game.pgn();
  }
}
