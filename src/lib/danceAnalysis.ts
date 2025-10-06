import {
  DanceAnalysis,
  DanceMove,
  DancePattern,
  HipMovement,
  MovementAnalysis,
  PoseLandmark,
  PostureAnalysis,
  RhythmAnalysis,
} from "@/types/dance";

export class DanceAnalyzer {
  private poseHistory: PoseLandmark[][] = [];
  private readonly maxHistoryLength: number = 30; // ~1 second at 30 FPS
  private currentScore: number = 0;
  private readonly referencePatterns: Record<DanceMove, DancePattern> = {
    "basic-step": {
      name: "Passo Base Bachata",
      keyPoints: [23, 24, 25, 26], // Anche e caviglie
      expectedPattern: "side-to-side",
    },
    "side-step": {
      name: "Passo Laterale",
      keyPoints: [23, 24, 25, 26],
      expectedPattern: "lateral-movement",
    },
  };

  analyzePose(
    landmarks: PoseLandmark[],
    selectedMove: DanceMove
  ): DanceAnalysis | null {
    // Add current pose to history
    this.poseHistory.push(landmarks);

    // Keep only the last N frames
    if (this.poseHistory.length > this.maxHistoryLength) {
      this.poseHistory.shift();
    }

    // Only analyze if we have enough data
    if (this.poseHistory.length < 10) return null;

    // Calculate score based on selected movement
    const pattern = this.referencePatterns[selectedMove];
    if (!pattern) return null;

    const analysis = this.analyzeMovement(pattern);

    return {
      score: analysis.score,
      feedback: analysis.feedback,
      posture: this.analyzePosture(landmarks),
      rhythm: this.analyzeRhythm(),
    };
  }

  private analyzeMovement(pattern: DancePattern): MovementAnalysis {
    const currentPose = this.poseHistory[this.poseHistory.length - 1];
    const previousPose = this.poseHistory[0];

    if (!currentPose || !previousPose) {
      return { score: 0, feedback: [] };
    }

    let score = 0;
    const feedback: string[] = [];

    // Analyze hip movement
    const hipMovement = this.calculateHipMovement(currentPose, previousPose);

    if (pattern.expectedPattern === "side-to-side") {
      // For basic step: lateral hip movement
      if (Math.abs(hipMovement.horizontal) > 0.02) {
        score += 40;
        feedback.push("✅ Buon movimento laterale delle anche");
      } else {
        feedback.push("⚠️ Aumenta il movimento laterale delle anche");
      }

      // Vertical stability
      if (Math.abs(hipMovement.vertical) < 0.01) {
        score += 30;
        feedback.push("✅ Buona stabilità verticale");
      } else {
        feedback.push("⚠️ Mantieni il busto più stabile");
      }
    }

    // Analyze general posture
    const posture = this.analyzePosture(currentPose);
    score += posture.score;
    feedback.push(...posture.feedback);

    return { score: Math.min(100, score), feedback };
  }

  private calculateHipMovement(
    current: PoseLandmark[],
    previous: PoseLandmark[]
  ): HipMovement {
    const currentHip = {
      x: (current[23].x + current[24].x) / 2,
      y: (current[23].y + current[24].y) / 2,
    };

    const previousHip = {
      x: (previous[23].x + previous[24].x) / 2,
      y: (previous[23].y + previous[24].y) / 2,
    };

    return {
      horizontal: currentHip.x - previousHip.x,
      vertical: currentHip.y - previousHip.y,
    };
  }

  private analyzePosture(landmarks: PoseLandmark[]): PostureAnalysis {
    let score = 0;
    const feedback: string[] = [];

    // Check shoulder alignment
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);

    if (shoulderDiff < 0.05) {
      score += 15;
      feedback.push("✅ Spalle ben allineate");
    } else {
      feedback.push("⚠️ Raddrizza le spalle");
    }

    // Check torso position
    const nose = landmarks[0];
    const midHip = {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2,
    };

    const bustAlignment = Math.abs(nose.x - midHip.x);
    if (bustAlignment < 0.1) {
      score += 15;
      feedback.push("✅ Busto ben centrato");
    } else {
      feedback.push("⚠️ Mantieni il busto centrato");
    }

    return { score, feedback };
  }

  private analyzeRhythm(): RhythmAnalysis {
    // Simplified rhythm analysis based on movement speed
    if (this.poseHistory.length < 10) {
      return { onBeat: false, tempo: 0 };
    }

    const movements: number[] = [];
    for (let i = 1; i < this.poseHistory.length; i++) {
      const movement = this.calculateMovementSpeed(
        this.poseHistory[i - 1],
        this.poseHistory[i]
      );
      movements.push(movement);
    }

    const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length;

    return {
      onBeat: avgMovement > 0.01 && avgMovement < 0.05, // Controlled movement
      tempo: avgMovement * 1000, // Normalized speed
    };
  }

  private calculateMovementSpeed(
    pose1: PoseLandmark[],
    pose2: PoseLandmark[]
  ): number {
    let totalMovement = 0;
    const keyJoints = [11, 12, 23, 24]; // Shoulders and hips

    keyJoints.forEach((joint) => {
      const dx = pose2[joint].x - pose1[joint].x;
      const dy = pose2[joint].y - pose1[joint].y;
      totalMovement += Math.sqrt(dx * dx + dy * dy);
    });

    return totalMovement / keyJoints.length;
  }

  reset(): void {
    this.poseHistory = [];
    this.currentScore = 0;
  }
}
