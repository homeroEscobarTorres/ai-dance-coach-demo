// Advanced dance analysis with adaptive thresholds and ML-like features
export interface UserProfile {
  id: string;
  name: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  personalThresholds: {
    hipMovementSensitivity: number;
    postureStrictness: number;
    rhythmTolerance: number;
  };
  learningData: {
    averageScores: number[];
    improvementRate: number;
    commonMistakes: string[];
  };
}

export interface AdvancedDancePattern {
  name: string;
  keyPoints: number[];
  expectedPattern: string;
  difficulty: number;
  rhythmSignature: {
    beatsPerMinute: number;
    accentBeats: number[];
    timing: number[];
  };
  criticalMovements: {
    phase: string;
    landmarks: number[];
    expectedMovement: {
      direction: [number, number, number];
      magnitude: number;
      duration: number;
    };
  }[];
}

export interface MovementQuality {
  fluidity: number;
  precision: number;
  rhythm: number;
  expression: number;
  technique: number;
}

export interface DetailedFeedback {
  score: number;
  breakdown: MovementQuality;
  specificAdvice: {
    category: "technique" | "rhythm" | "posture" | "style";
    message: string;
    priority: "high" | "medium" | "low";
    suggestedExercise?: string;
  }[];
  progressTracking: {
    improvement: number;
    consistency: number;
    trendsLastSession: string[];
  };
}
