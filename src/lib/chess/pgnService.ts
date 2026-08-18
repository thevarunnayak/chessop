"use client";

import { Chess } from "chess.js";
import { Collection, CollectionItem } from "@/types/collection";
import { getCollections, saveCollections, addItemToCollections } from "@/lib/openings/collectionsService";
import { ChessGameEngine } from "./engine";

export function exportCollectionToPGN(collection: Collection): string {
  let pgnOutput = "";

  collection.items.forEach((item, idx) => {
    pgnOutput += `[Event "${collection.name} - Line ${idx + 1}"]\n`;
    pgnOutput += `[Site "ChessOp Repertoire Explorer"]\n`;
    pgnOutput += `[Date "${new Date().toISOString().split("T")[0]}"]\n`;
    pgnOutput += `[ECO "${item.eco || "A00"}"]\n`;
    pgnOutput += `[Opening "${item.name}"]\n`;
    if (item.fen) {
      pgnOutput += `[FEN "${item.fen}"]\n`;
    }
    pgnOutput += `[Result "*"]\n\n`;

    if (item.moves && item.moves.length > 0) {
      // Format moves into numbered PGN notation (e.g. 1. e4 e5 2. Nf3 Nc6)
      let formattedMoves = "";
      for (let i = 0; i < item.moves.length; i++) {
        if (i % 2 === 0) {
          formattedMoves += `${Math.floor(i / 2) + 1}. ${item.moves[i]} `;
        } else {
          formattedMoves += `${item.moves[i]} `;
        }
      }
      pgnOutput += `${formattedMoves.trim()} *\n\n`;
    } else {
      pgnOutput += `*\n\n`;
    }
  });

  return pgnOutput;
}

export function downloadFile(content: string, filename: string, contentType: string = "text/plain") {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllToJSONBackup() {
  const collections = getCollections();
  const backupData = {
    app: "ChessOp",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    collections,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().split("T")[0];
  downloadFile(jsonString, `chessop_repertoire_backup_${dateStr}.json`, "application/json");
}

export function importPgnTextToCollection(pgnText: string, collectionId: string): { importedCount: number } {
  if (!pgnText.trim()) return { importedCount: 0 };

  // Split multi-game PGN string by double linebreaks before Event header
  const pgnBlocks = pgnText
    .split(/\[Event\s+/g)
    .filter(Boolean)
    .map((block) => `[Event ` + block);

  let count = 0;

  for (const block of pgnBlocks) {
    try {
      const chess = new Chess();
      chess.loadPgn(block);

      const history = chess.history({ verbose: true });
      const moves = history.map((m) => m.san);
      if (moves.length === 0) continue;

      const fen = chess.fen();
      const headers = chess.header();

      const itemData: Omit<CollectionItem, "id" | "addedAt"> = {
        name: headers["Opening"] || headers["Event"] || `Imported Line (${moves.slice(0, 3).join(" ")})`,
        eco: headers["ECO"] || "A00",
        fen,
        moves,
        note: headers["Comment"] || `Imported from PGN on ${new Date().toLocaleDateString()}`,
      };

      addItemToCollections([collectionId], itemData);
      count++;
    } catch {
      // Continue importing remaining valid blocks
    }
  }

  return { importedCount: count };
}

export function restoreJSONBackup(jsonText: string): boolean {
  try {
    const data = JSON.parse(jsonText);
    if (!data.collections || !Array.isArray(data.collections)) {
      return false;
    }

    saveCollections(data.collections);
    return true;
  } catch {
    return false;
  }
}
