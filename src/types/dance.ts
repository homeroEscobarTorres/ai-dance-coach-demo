// Types for MediaPipe and Dance Analysis
export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface DanceAnalysis {
  score: number;
  feedback: string[];
  posture: PostureAnalysis;
  rhythm: RhythmAnalysis;
}

export interface PostureAnalysis {
  score: number;
  feedback: string[];
}

export interface RhythmAnalysis {
  onBeat: boolean;
  tempo: number;
}

export interface DancePattern {
  name: string;
  keyPoints: number[];
  expectedPattern: string;
}

export interface MovementAnalysis {
  score: number;
  feedback: string[];
}

export interface HipMovement {
  horizontal: number;
  vertical: number;
}

export type DanceMove = "basic-step" | "side-step";

export interface DanceCoachState {
  isRunning: boolean;
  currentScore: number;
  selectedMove: DanceMove;
  analysis: DanceAnalysis | null;
  error: string | null;
}
