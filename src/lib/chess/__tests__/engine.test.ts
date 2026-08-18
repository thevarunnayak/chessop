import { describe, it, expect, beforeEach } from "vitest";
import { ChessGameEngine, normalizeFen } from "../engine";

describe("ChessGameEngine & FEN Utilities", () => {
  let engine: ChessGameEngine;

  beforeEach(() => {
    engine = new ChessGameEngine();
  });

  it("should initialize to standard starting position FEN", () => {
    expect(engine.getFen()).toContain("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    expect(engine.getTurn()).toBe("w");
  });

  it("should normalize FEN correctly for transposition matching", () => {
    const rawFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    const normalized = normalizeFen(rawFen);
    expect(normalized).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3");
  });

  it("should execute legal moves and record history stack", () => {
    const move1 = engine.makeMove({ from: "e2", to: "e4" });
    expect(move1).not.toBeNull();
    expect(move1?.san).toBe("e4");
    expect(engine.getTurn()).toBe("b");

    const move2 = engine.makeMove({ from: "c7", to: "c5" }); // Sicilian Defense
    expect(move2?.san).toBe("c5");
    expect(engine.getSanHistory()).toEqual(["e4", "c5"]);
  });

  it("should reject illegal moves", () => {
    const move = engine.makeMove({ from: "e2", to: "e5" }); // Invalid initial pawn jump
    expect(move).toBeNull();
  });

  it("should load valid PGN string", () => {
    const pgn = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6";
    const success = engine.loadPgn(pgn);
    expect(success).toBe(true);
    expect(engine.getSanHistory()).toEqual(["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6"]);
  });
});
