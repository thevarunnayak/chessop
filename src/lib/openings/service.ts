import openingsData from "@data/openings.json";
import positionsData from "@data/positions.json";
import searchIndexData from "@data/search-index.json";
import { Opening, PositionNode, EcoCategory, SearchRecord } from "@/types/opening";
import { normalizeFen } from "@/lib/chess/engine";

const openingsMap: Record<string, Opening> = openingsData as Record<string, Opening>;
const positionsMap: Record<string, PositionNode> = positionsData as Record<string, PositionNode>;
const searchIndex: SearchRecord[] = searchIndexData as SearchRecord[];

export function getOpeningById(id: string): Opening | undefined {
  if (!id) return undefined;
  return openingsMap[id];
}

export function getPositionNode(fen: string): PositionNode | undefined {
  if (!fen) return undefined;
  const canonical = normalizeFen(fen);
  return positionsMap[canonical];
}

export function getAllOpenings(): Opening[] {
  return Object.values(openingsMap);
}

export function getOpeningsByCategory(category: EcoCategory): Opening[] {
  return Object.values(openingsMap).filter((o) => o.category === category);
}

export function getOpeningsByEco(eco: string): Opening[] {
  const upper = eco.toUpperCase().trim();
  return Object.values(openingsMap).filter((o) => o.eco.toUpperCase() === upper || o.eco.toUpperCase().startsWith(upper));
}

export function getTranspositions(fen: string, currentOpeningId?: string): Opening[] {
  const posNode = getPositionNode(fen);
  if (!posNode || !posNode.openingIds || posNode.openingIds.length <= 1) return [];

  return posNode.openingIds
    .filter((id) => id !== currentOpeningId)
    .map((id) => openingsMap[id])
    .filter(Boolean) as Opening[];
}

export function searchOpenings(query: string, limit = 20): Opening[] {
  if (!query || !query.trim()) return [];

  const q = query.toLowerCase().trim();

  // 1. Exact ECO code match
  const ecoMatches: SearchRecord[] = [];
  // 2. Exact or Prefix Name match
  const nameMatches: SearchRecord[] = [];
  // 3. Move Sequence match
  const moveMatches: SearchRecord[] = [];

  for (const item of searchIndex) {
    const itemEco = item.eco.toLowerCase();
    const itemName = item.name.toLowerCase();
    const itemMoves = item.movesSan.toLowerCase();

    if (itemEco === q || itemEco.startsWith(q)) {
      ecoMatches.push(item);
    } else if (itemName.includes(q)) {
      nameMatches.push(item);
    } else if (itemMoves.includes(q)) {
      moveMatches.push(item);
    }
  }

  const combined = [...ecoMatches, ...nameMatches, ...moveMatches];
  const uniqueIds = Array.from(new Set(combined.map((c) => c.id))).slice(0, limit);

  return uniqueIds.map((id) => openingsMap[id]).filter(Boolean) as Opening[];
}
