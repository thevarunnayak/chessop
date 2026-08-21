"use client";

import { Chess, Square } from "chess.js";

export interface PvLine {
  cp?: number;
  mate?: number;
  bestMoveSan?: string;
  uciMoves: string[];
  pvSan: string[];
}

export interface EngineEvalResult {
  fen: string;
  depth: number;
  pvs: PvLine[];
  isCloud: boolean;
}

/**
 * Converts a single UCI move (e.g. "b8c6", "e1g1", "e1h1", "e7e8q") to SAN notation for a given position.
 */
export function uciToSan(fen: string, uci: string): string {
  if (!fen || !uci || uci.length < 2) return uci;

  try {
    const chess = new Chess(fen);
    if (uci.length >= 4) {
      let from = uci.slice(0, 2);
      let to = uci.slice(2, 4);
      const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;

      // Normalize Chess960 UCI castling format (e.g., Lichess "e1h1" -> "e1g1", "e8h8" -> "e8g8")
      const piece = chess.get(from as Square);
      if (piece && piece.type === "k") {
        if (from === "e1" && to === "h1") to = "g1";
        else if (from === "e8" && to === "h8") to = "g8";
        else if (from === "e1" && to === "a1") to = "c1";
        else if (from === "e8" && to === "a8") to = "c8";
      }

      try {
        const moveRes = chess.move({ from, to, promotion });
        if (moveRes) return moveRes.san;
      } catch {}
    }

    // Try direct string move (if move was already in SAN or standard format)
    try {
      const moveRes = chess.move(uci);
      if (moveRes) return moveRes.san;
    } catch {}

    return uci;
  } catch {
    return uci;
  }
}

/**
 * Converts a sequence of UCI moves to an array of SAN move strings for a given position.
 */
export function uciToSanLine(fen: string, uciMoves: string[]): string[] {
  try {
    const chess = new Chess(fen);
    const sanMoves: string[] = [];

    for (const uci of uciMoves) {
      if (!uci || uci.length < 2) continue;

      let moveRes = null;

      if (uci.length >= 4) {
        let from = uci.slice(0, 2);
        let to = uci.slice(2, 4);
        const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;

        // Handle Chess960 castling notation from Lichess/Stockfish
        const piece = chess.get(from as Square);
        if (piece && piece.type === "k") {
          if (from === "e1" && to === "h1") to = "g1";
          else if (from === "e8" && to === "h8") to = "g8";
          else if (from === "e1" && to === "a1") to = "c1";
          else if (from === "e8" && to === "a8") to = "c8";
        }

        try {
          moveRes = chess.move({ from, to, promotion });
        } catch {
          moveRes = null;
        }
      }

      if (!moveRes) {
        try {
          moveRes = chess.move(uci);
        } catch {
          moveRes = null;
        }
      }

      if (moveRes) {
        sanMoves.push(moveRes.san);
      } else {
        // If conversion fails mid-line, attempt standalone uciToSan fallback
        const fallbackSan = uciToSan(chess.fen(), uci);
        if (fallbackSan && fallbackSan !== uci) {
          sanMoves.push(fallbackSan);
        } else {
          break;
        }
      }
    }

    return sanMoves;
  } catch {
    return [];
  }
}

export async function fetchEngineEvaluation(fen: string, multiPvCount: number = 3): Promise<EngineEvalResult | null> {
  try {
    const encodedFen = encodeURIComponent(fen);
    const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodedFen}&multiPv=${multiPvCount}`);

    if (!res.ok) {
      return fallbackMultiPvEval(fen);
    }

    const data = await res.json();
    if (!data.pvs || data.pvs.length === 0) {
      return fallbackMultiPvEval(fen);
    }

    const parsedPvs: PvLine[] = data.pvs.slice(0, multiPvCount).map((pv: any) => {
      const uciMoves: string[] = pv.moves ? pv.moves.split(/\s+/).filter(Boolean) : [];
      const pvSan = uciToSanLine(fen, uciMoves.slice(0, 8));
      const firstSan = pvSan[0] || (uciMoves[0] ? uciToSan(fen, uciMoves[0]) : "");

      return {
        cp: pv.cp,
        mate: pv.mate,
        bestMoveSan: firstSan,
        uciMoves: uciMoves.slice(0, 8),
        pvSan,
      };
    });

    return {
      fen: data.fen || fen,
      depth: data.depth || 30,
      pvs: parsedPvs,
      isCloud: true,
    };
  } catch {
    return fallbackMultiPvEval(fen);
  }
}

function fallbackMultiPvEval(fen: string): EngineEvalResult {
  // Material-based evaluation fallback when offline
  const pieces: Record<string, number> = {
    p: 1, P: -1,
    n: 3, N: -3,
    b: 3, B: -3,
    r: 5, R: -5,
    q: 9, Q: -9,
  };

  const boardPart = fen.split(/\s+/)[0] || "";
  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (const char of boardPart) {
    if (pieces[char]) {
      if (char === char.toUpperCase()) whiteMaterial += Math.abs(pieces[char]);
      else blackMaterial += Math.abs(pieces[char]);
    }
  }

  const diff = whiteMaterial - blackMaterial;

  return {
    fen,
    depth: 12,
    pvs: [
      {
        cp: diff * 100,
        bestMoveSan: "N/A",
        uciMoves: [],
        pvSan: [],
      },
    ],
    isCloud: false,
  };
}
