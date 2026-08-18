"use client";

import { Chess } from "chess.js";

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
      const pvSan = uciToSanLine(fen, uciMoves.slice(0, 6));

      return {
        cp: pv.cp,
        mate: pv.mate,
        bestMoveSan: pvSan[0] || uciMoves[0],
        uciMoves: uciMoves.slice(0, 6),
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

function uciToSanLine(fen: string, uciMoves: string[]): string[] {
  try {
    const chess = new Chess(fen);
    const sanMoves: string[] = [];

    for (const uci of uciMoves) {
      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;

      const moveRes = chess.move({ from, to, promotion });
      if (moveRes) {
        sanMoves.push(moveRes.san);
      } else {
        break;
      }
    }

    return sanMoves;
  } catch {
    return [];
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
