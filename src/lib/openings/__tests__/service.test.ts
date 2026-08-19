import { describe, it, expect } from "vitest";
import {
  getOpeningById,
  getPositionNode,
  searchOpenings,
  getOpeningsByCategory,
  getOpeningsByEco,
  getTranspositions,
} from "../service";
import { buildOpeningGraph } from "../graphService";

describe("Opening Data Service", () => {
  it("should fetch opening by slug ID", () => {
    const opening = getOpeningById("sicilian-defense");
    expect(opening).toBeDefined();
    expect(opening?.name).toBe("Sicilian Defense");
    expect(opening?.eco).toBe("B20");
  });

  it("should look up position node by FEN", () => {
    // Starting position FEN
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const node = getPositionNode(fen);
    expect(node).toBeDefined();
    expect(node?.continuations.length).toBeGreaterThan(0);
  });

  it("should search openings by query", () => {
    const results = searchOpenings("Sicilian");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("Sicilian");

    const ecoResults = searchOpenings("B90");
    expect(ecoResults.length).toBeGreaterThan(0);
  });

  it("should filter openings by ECO category", () => {
    const catB = getOpeningsByCategory("B");
    expect(catB.length).toBeGreaterThan(0);
    expect(catB.every((o) => o.category === "B")).toBe(true);
  });

  it("should filter openings by ECO code prefix", () => {
    const b20s = getOpeningsByEco("B20");
    expect(b20s.length).toBeGreaterThan(0);
  });

  it("should calculate stage-wise horizontal spacing of 429px per depth level in theory graph", () => {
    const graph = buildOpeningGraph("ALL", "", 3);
    const depth1Node = graph.nodes.find((n) => n.depth === 1);
    const depth2Node = graph.nodes.find((n) => n.depth === 2);
    expect(depth1Node).toBeDefined();
    expect(depth2Node).toBeDefined();
    expect(depth1Node?.x).toBe(429);
    expect(depth2Node?.x).toBe(858);
  });
});
