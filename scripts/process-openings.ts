import fs from "fs";
import path from "path";
import https from "https";
import { Chess } from "chess.js";
import { Opening, PositionNode, MoveContinuation, EcoCategory, SearchRecord } from "../src/types/opening";

const CATEGORY_NAMES: Record<EcoCategory, string> = {
  A: "Flank Openings & Irregular Moves",
  B: "Semi-Open Games (Sicilian, French, Caro-Kann)",
  C: "Open Games & French Defense",
  D: "Closed Games & Semi-Closed (Queen's Gambit)",
  E: "Indian Defenses (King's Indian, Nimzo-Indian)",
};

function normalizeFen(fen: string): string {
  if (!fen) return "";
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) return fen;
  return parts.slice(0, 4).join(" ");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchOrReadTsv(volume: EcoCategory): Promise<string> {
  const localPath = path.join(__dirname, "../data/raw", `${volume.toLowerCase()}.tsv`);
  if (fs.existsSync(localPath)) {
    console.log(`Reading cached local raw file: ${volume.toLowerCase()}.tsv`);
    return fs.readFileSync(localPath, "utf-8");
  }

  const url = `https://raw.githubusercontent.com/lichess-org/chess-openings/master/${volume.toLowerCase()}.tsv`;
  console.log(`Downloading ${volume.toLowerCase()}.tsv from ${url}...`);

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const rawDir = path.join(__dirname, "../data/raw");
          if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
          fs.writeFileSync(localPath, data);
          resolve(data);
        });
      })
      .on("error", reject);
  });
}

// Fallback minimal curated dataset if network download fails in sandbox
const FALLBACK_RAW_LINES = [
  "A00\tUncommon Opening\t1. g3\tg2g3\trnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR b KQkq g3",
  "A04\tRéti Opening\t1. Nf3\tg1f3\trnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -",
  "A10\tEnglish Opening\t1. c4\tc2c4\trnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPPP/RNBQKBNR b KQkq c3",
  "B00\tKing's Pawn Game\t1. e4\te2e4\trnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3",
  "B10\tCaro-Kann Defense\t1. e4 c6\te2e4 c7c6\trnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
  "B20\tSicilian Defense\t1. e4 c5\te2e4 c7c5\trnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6",
  "B90\tSicilian Defense: Najdorf Variation\t1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6\te2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6\trnbqk2r/1p2bppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -",
  "C00\tFrench Defense\t1. e4 e6\te2e4 e7e6\trnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
  "C60\tRuy Lopez\t1. e4 e5 2. Nf3 Nc6 3. Bb5\te2e4 e7e5 g1f3 b8c6 f1b5\tr1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -",
  "D00\tQueen's Pawn Game\t1. d4\td2d4\trnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3",
  "D06\tQueen's Gambit\t1. d4 d5 2. c4\td2d4 d7d5 c2c4\trnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3",
  "E60\tKing's Indian Defense\t1. d4 Nf6 2. c4 g6\td2d4 g8f6 c2c4 g7g6\trnbqk2r/ppppppbp/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -",
];

async function main() {
  console.log("Starting Chess Opening Dataset Preprocessing Pipeline...");

  const rawLines: { volume: EcoCategory; line: string }[] = [];

  for (const vol of ["A", "B", "C", "D", "E"] as EcoCategory[]) {
    try {
      const content = await fetchOrReadTsv(vol);
      const lines = content.split("\n").filter((l) => l.trim().length > 0);
      // Skip header line if present
      const dataLines = lines[0].startsWith("eco") ? lines.slice(1) : lines;
      for (const line of dataLines) {
        rawLines.push({ volume: vol, line });
      }
    } catch (err) {
      console.warn(`Failed downloading volume ${vol}, using fallback data. Error: ${(err as Error).message}`);
    }
  }

  if (rawLines.length === 0) {
    console.log("Using embedded fallback dataset...");
    for (const line of FALLBACK_RAW_LINES) {
      const vol = line.charAt(0) as EcoCategory;
      rawLines.push({ volume: vol, line });
    }
  }

  console.log(`Parsed ${rawLines.length} raw opening entries.`);

  const openingsMap = new Map<string, Opening>();
  const positionNodesMap = new Map<string, PositionNode>();
  const searchRecords: SearchRecord[] = [];

  // Track slug counts to prevent duplicate IDs
  const slugCounts = new Map<string, number>();

  for (const { volume, line } of rawLines) {
    const parts = line.split("\t");
    if (parts.length < 3) continue;

    const eco = parts[0].trim();
    const name = parts[1].trim();
    const pgn = parts[2].trim();
    const uciStr = parts[3] ? parts[3].trim() : "";

    let baseSlug = slugify(name);
    let id = baseSlug;
    if (slugCounts.has(baseSlug)) {
      const count = slugCounts.get(baseSlug)! + 1;
      slugCounts.set(baseSlug, count);
      id = `${baseSlug}-${count}`;
    } else {
      slugCounts.set(baseSlug, 1);
    }

    // Play through move sequence using chess.js
    const chess = new Chess();
    const movesSan: string[] = [];
    const movesUci: string[] = [];
    const fenHistory: string[] = [normalizeFen(chess.fen())];

    const movesRaw = pgn.replace(/\d+\.\s*/g, "").trim().split(/\s+/).filter(Boolean);

    let isValidSequence = true;
    for (const mSan of movesRaw) {
      try {
        const res = chess.move(mSan);
        if (!res) {
          isValidSequence = false;
          break;
        }
        movesSan.push(res.san);
        movesUci.push(res.from + res.to + (res.promotion || ""));
        fenHistory.push(normalizeFen(chess.fen()));
      } catch {
        isValidSequence = false;
        break;
      }
    }

    if (!isValidSequence || movesSan.length === 0) continue;

    const finalFen = fenHistory[fenHistory.length - 1];

    const opening: Opening = {
      id,
      eco,
      name,
      category: volume,
      categoryName: CATEGORY_NAMES[volume] || "Chess Openings",
      fen: finalFen,
      moves: movesSan,
      uci: movesUci.length > 0 ? movesUci : uciStr.split(/\s+/).filter(Boolean),
      childrenIds: [],
    };

    openingsMap.set(id, opening);

    // Build Search Record
    searchRecords.push({
      id,
      name,
      eco,
      movesSan: movesSan.join(" "),
      category: volume,
    });

    // Populate Position Graph Nodes
    for (let i = 0; i < fenHistory.length; i++) {
      const currentFen = fenHistory[i];
      let posNode = positionNodesMap.get(currentFen);
      if (!posNode) {
        posNode = {
          fen: currentFen,
          openingIds: [],
          continuations: [],
          moveDepth: i,
        };
        positionNodesMap.set(currentFen, posNode);
      }

      // If this position is the target position of this opening line, add opening ID
      if (i === fenHistory.length - 1) {
        if (!posNode.openingIds.includes(id)) {
          posNode.openingIds.push(id);
        }
      }

      // If there is a next move in this line, record continuation
      if (i < movesSan.length) {
        const san = movesSan[i];
        const uci = movesUci[i];
        const nextFen = fenHistory[i + 1];

        const existingCont = posNode.continuations.find((c) => c.san === san);
        if (!existingCont) {
          posNode.continuations.push({
            san,
            uci,
            toFen: nextFen,
            openingId: i === movesSan.length - 1 ? id : undefined,
            openingName: i === movesSan.length - 1 ? name : undefined,
            eco: i === movesSan.length - 1 ? eco : undefined,
          });
        }
      }
    }
  }

  // Parent-child variation linking
  const allOpenings = Array.from(openingsMap.values());
  for (const op of allOpenings) {
    // Find parent line (longest prefix move list)
    let parentCandidate: Opening | undefined = undefined;
    for (const other of allOpenings) {
      if (other.id === op.id) continue;
      if (other.moves.length < op.moves.length) {
        const isPrefix = other.moves.every((m, idx) => op.moves[idx] === m);
        if (isPrefix) {
          if (!parentCandidate || other.moves.length > parentCandidate.moves.length) {
            parentCandidate = other;
          }
        }
      }
    }

    if (parentCandidate) {
      op.parentId = parentCandidate.id;
      if (!parentCandidate.childrenIds.includes(op.id)) {
        parentCandidate.childrenIds.push(op.id);
      }
    }
  }

  console.log(`Processed ${openingsMap.size} valid openings.`);
  console.log(`Generated ${positionNodesMap.size} position graph nodes.`);

  // Write output data JSON files
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(
    path.join(dataDir, "openings.json"),
    JSON.stringify(Object.fromEntries(openingsMap), null, 2)
  );

  fs.writeFileSync(
    path.join(dataDir, "positions.json"),
    JSON.stringify(Object.fromEntries(positionNodesMap), null, 2)
  );

  fs.writeFileSync(
    path.join(dataDir, "search-index.json"),
    JSON.stringify(searchRecords, null, 2)
  );

  console.log("Successfully written openings.json, positions.json, and search-index.json!");
}

main().catch((err) => {
  console.error("Error in preprocessing script:", err);
  process.exit(1);
});
