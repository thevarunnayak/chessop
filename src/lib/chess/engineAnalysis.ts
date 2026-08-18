"use client";

export interface EngineEvalResult {
  fen: string;
  depth: number;
  cp?: number;         // Centipawns (+24 = +0.24)
  mate?: number;       // Mate in N moves
  bestMoveSan?: string; // Best move in SAN
  pvSan: string[];     // Principal Variation line in SAN moves
  isCloud: boolean;
}

export async function fetchEngineEvaluation(fen: string, movesHistory: string[] = []): Promise<EngineEvalResult | null> {
  try {
    const encodedFen = encodeURIComponent(fen);
    const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodedFen}`);

    if (!res.ok) {
      return fallbackEval(fen);
    }

    const data = await res.json();
    if (!data.pvs || data.pvs.length === 0) {
      return fallbackEval(fen);
    }

    const primaryPv = data.pvs[0];
    const uciMoves: string[] = primaryPv.moves ? primaryPv.moves.split(/\s+/).filter(Boolean) : [];

    return {
      fen: data.fen || fen,
      depth: data.depth || 30,
      cp: primaryPv.cp,
      mate: primaryPv.mate,
      bestMoveSan: uciMoves[0] || undefined,
      pvSan: uciMoves.slice(0, 5),
      isCloud: true,
    };
  } catch {
    return fallbackEval(fen);
  }
}

function fallbackEval(fen: string): EngineEvalResult {
  // Fallback material count evaluation if offline
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
    cp: diff * 100,
    pvSan: [],
    isCloud: false,
  };
}
