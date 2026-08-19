import { getAllOpenings, getPositionNode } from "./service";
import { ChessGameEngine, normalizeFen } from "@/lib/chess/engine";
import { Opening } from "@/types/opening";

export interface GraphNode {
  id: string;
  label: string;
  san: string;
  moves: string[];
  fen: string;
  eco: string;
  category: string;
  openingId?: string;
  openingName?: string;
  depth: number;
  isTransposition: boolean;
  transpositionCount: number;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  san: string;
  isTransposition: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildOpeningGraph(filterCategory?: string, searchQuery?: string, maxDepth: number = 8): GraphData {
  const openings = getAllOpenings();
  const nodesMap = new Map<string, GraphNode>();
  const edgesMap = new Map<string, GraphEdge>();
  const fenToNodeIdsMap = new Map<string, string[]>();

  // Root starting position node
  const rootId = "root";
  const rootFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  nodesMap.set(rootId, {
    id: rootId,
    label: "Start Position",
    san: "Start",
    moves: [],
    fen: rootFen,
    eco: "A00",
    category: "A",
    openingId: "start-position",
    openingName: "Starting Position",
    depth: 0,
    isTransposition: false,
    transpositionCount: 0,
    x: 0,
    y: 0,
  });

  fenToNodeIdsMap.set(normalizeFen(rootFen), [rootId]);

  // Filter openings if category or query specified
  let targetOpenings = openings;
  if (filterCategory && filterCategory !== "ALL") {
    targetOpenings = targetOpenings.filter((o) => o.category === filterCategory || o.moves[0] === filterCategory.toLowerCase());
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    targetOpenings = targetOpenings.filter(
      (o) => o.name.toLowerCase().includes(q) || o.eco.toLowerCase().includes(q) || o.moves.join(" ").toLowerCase().includes(q)
    );
  }

  // Cap number of openings to 150 for rich transposition resolution with high performance
  const selectedOpenings = targetOpenings.slice(0, 150);

  selectedOpenings.forEach((op) => {
    const movesToProcess = op.moves.slice(0, maxDepth);
    let parentId = rootId;
    let currentPath: string[] = [];

    const engine = new ChessGameEngine();

    movesToProcess.forEach((move, idx) => {
      currentPath.push(move);
      engine.makeMove(move);
      const currentFen = engine.getFen();
      const canonicalFen = normalizeFen(currentFen);

      const depth = idx + 1;
      const nodeId = `node-${currentPath.join("-")}`;

      if (!nodesMap.has(nodeId)) {
        const newNode: GraphNode = {
          id: nodeId,
          label: move,
          san: move,
          moves: [...currentPath],
          fen: currentFen,
          eco: op.eco,
          category: op.category,
          openingId: op.id,
          openingName: op.name,
          depth,
          isTransposition: false,
          transpositionCount: 0,
          x: 0,
          y: 0,
        };
        nodesMap.set(nodeId, newNode);

        if (!fenToNodeIdsMap.has(canonicalFen)) {
          fenToNodeIdsMap.set(canonicalFen, []);
        }
        fenToNodeIdsMap.get(canonicalFen)!.push(nodeId);
      }

      const edgeId = `edge-${parentId}->${nodeId}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, {
          id: edgeId,
          source: parentId,
          target: nodeId,
          san: move,
          isTransposition: false,
        });
      }

      parentId = nodeId;
    });
  });

  // Calculate transposition edges between nodes sharing the same canonical FEN
  fenToNodeIdsMap.forEach((nodeIds) => {
    if (nodeIds.length > 1) {
      // Mark nodes as transpositions
      nodeIds.forEach((id) => {
        const node = nodesMap.get(id);
        if (node) {
          node.isTransposition = true;
          node.transpositionCount = nodeIds.length - 1;
        }
      });

      // Connect transposition nodes across different branches
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const idA = nodeIds[i];
          const idB = nodeIds[j];

          // Ensure nodes belong to different parent branches
          if (idA.split("-").length !== idB.split("-").length || idA !== idB) {
            const transEdgeId = `trans-${idA}<->${idB}`;

            if (!edgesMap.has(transEdgeId)) {
              edgesMap.set(transEdgeId, {
                id: transEdgeId,
                source: idA,
                target: idB,
                san: "⇄ Transposition",
                isTransposition: true,
              });
            }
          }
        }
      }
    }
  });

  // Calculate layout coordinates (x = depth * spacing, y = index based)
  const nodesByDepth: Record<number, GraphNode[]> = {};
  nodesMap.forEach((node) => {
    if (!nodesByDepth[node.depth]) nodesByDepth[node.depth] = [];
    nodesByDepth[node.depth].push(node);
  });

  const X_SPACING = 429;
  const Y_SPACING = 78;

  Object.entries(nodesByDepth).forEach(([dStr, nodeList]) => {
    const d = parseInt(dStr, 10);
    const totalHeight = (nodeList.length - 1) * Y_SPACING;
    const startY = -totalHeight / 2;

    nodeList.forEach((node, idx) => {
      node.x = d * X_SPACING;
      node.y = startY + idx * Y_SPACING;
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges: Array.from(edgesMap.values()),
  };
}
