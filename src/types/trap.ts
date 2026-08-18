import { BoardOrientation } from "./chess";

export interface TrapStep {
  moveSan: string;
  annotation?: string;
  explanation: string;
  isCriticalStep?: boolean;
}

export interface OpeningTrap {
  id: string;
  name: string;
  openingName: string;
  eco: string;
  side: BoardOrientation;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  punishmentExplanation: string;
  moves: string[];
  steps: TrapStep[];
}
