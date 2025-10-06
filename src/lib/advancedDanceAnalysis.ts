import {
  AdvancedDancePattern,
  DetailedFeedback,
  MovementQuality,
  UserProfile,
} from "@/types/advancedDance";
import { DanceMove, PoseLandmark } from "@/types/dance";

export class AdvancedDanceAnalyzer {
  private poseHistory: PoseLandmark[][] = [];
  private velocityHistory: number[][] = [];
  private accelerationHistory: number[][] = [];
  private scoreHistory: number[] = [];
  private readonly maxHistoryLength: number = 90; // 3 seconds at 30 FPS
  private userProfile: UserProfile | null = null;

  // Advanced pattern library
  private readonly advancedPatterns: Record<DanceMove, AdvancedDancePattern> = {
    "basic-step": {
      name: "Passo Base Bachata",
      keyPoints: [23, 24, 25, 26, 27, 28], // Hips, knees, ankles
      expectedPattern: "side-to-side",
      difficulty: 1,
      rhythmSignature: {
        beatsPerMinute: 120,
        accentBeats: [1, 5], // Bachata timing
        timing: [1, 0.5, 0.5, 1, 0.5, 0.5, 1, 1],
      },
      criticalMovements: [
        {
          phase: "weight-transfer-left",
          landmarks: [23, 24, 25, 26],
          expectedMovement: {
            direction: [-0.1, 0, 0],
            magnitude: 0.05,
            duration: 0.5,
          },
        },
        {
          phase: "weight-transfer-right",
          landmarks: [23, 24, 25, 26],
          expectedMovement: {
            direction: [0.1, 0, 0],
            magnitude: 0.05,
            duration: 0.5,
          },
        },
      ],
    },
    "side-step": {
      name: "Passo Laterale",
      keyPoints: [23, 24, 25, 26, 27, 28],
      expectedPattern: "lateral-movement",
      difficulty: 2,
      rhythmSignature: {
        beatsPerMinute: 130,
        accentBeats: [1, 3, 5, 7],
        timing: [1, 1, 1, 1, 1, 1, 1, 1],
      },
      criticalMovements: [
        {
          phase: "side-step-left",
          landmarks: [23, 24, 25, 26],
          expectedMovement: {
            direction: [-0.15, 0, 0],
            magnitude: 0.08,
            duration: 0.75,
          },
        },
      ],
    },
  };

  constructor(userProfile?: UserProfile) {
    this.userProfile = userProfile || this.createDefaultProfile();
  }

  private createDefaultProfile(): UserProfile {
    return {
      id: "default",
      name: "Nuovo Ballerino",
      skillLevel: "beginner",
      personalThresholds: {
        hipMovementSensitivity: 0.02,
        postureStrictness: 0.05,
        rhythmTolerance: 0.15,
      },
      learningData: {
        averageScores: [],
        improvementRate: 0,
        commonMistakes: [],
      },
    };
  }

  analyzePoseAdvanced(
    landmarks: PoseLandmark[],
    selectedMove: DanceMove
  ): DetailedFeedback | null {
    // Add current pose to history
    this.poseHistory.push(landmarks);

    // Calculate velocity and acceleration
    this.updateKinematics();

    // Keep only the last N frames
    if (this.poseHistory.length > this.maxHistoryLength) {
      this.poseHistory.shift();
      this.velocityHistory.shift();
      this.accelerationHistory.shift();
    }

    // Only analyze if we have enough data
    if (this.poseHistory.length < 30) return null;

    const pattern = this.advancedPatterns[selectedMove];
    if (!pattern) return null;

    // Multi-dimensional analysis
    const movementQuality = this.analyzeMovementQuality(pattern);
    const rhythmAnalysis = this.analyzeAdvancedRhythm(pattern);
    const postureQuality = this.analyzeAdvancedPosture(landmarks);
    const fluidityScore = this.analyzeMovementFluidity();
    const expressionScore = this.analyzeExpression();

    // Adaptive scoring based on user profile
    const finalScore = this.calculateAdaptiveScore(
      movementQuality,
      rhythmAnalysis,
      postureQuality,
      fluidityScore,
      expressionScore
    );

    // Generate detailed feedback
    const feedback = this.generateDetailedFeedback(
      finalScore,
      movementQuality,
      rhythmAnalysis,
      postureQuality,
      fluidityScore,
      expressionScore
    );

    // Update learning data
    this.updateLearningData(finalScore);

    return feedback;
  }

  private updateKinematics(): void {
    if (this.poseHistory.length < 2) return;

    const current = this.poseHistory[this.poseHistory.length - 1];
    const previous = this.poseHistory[this.poseHistory.length - 2];

    const velocity: number[] = [];
    const keyJoints = [11, 12, 23, 24, 25, 26]; // Key joints for dance analysis

    keyJoints.forEach((joint) => {
      const dx = current[joint].x - previous[joint].x;
      const dy = current[joint].y - previous[joint].y;
      const dz = current[joint].z - previous[joint].z;
      velocity.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
    });

    this.velocityHistory.push(velocity);

    // Calculate acceleration if we have velocity history
    if (this.velocityHistory.length >= 2) {
      const currentVel = this.velocityHistory[this.velocityHistory.length - 1];
      const prevVel = this.velocityHistory[this.velocityHistory.length - 2];

      const acceleration = currentVel.map((vel, idx) => vel - prevVel[idx]);
      this.accelerationHistory.push(acceleration);
    }
  }

  private analyzeMovementQuality(
    pattern: AdvancedDancePattern
  ): MovementQuality {
    const recent = this.poseHistory.slice(-30); // Last second
    let precision = 0;
    let technique = 0;

    // Analyze each critical movement in the pattern
    pattern.criticalMovements.forEach((movement) => {
      const movementScore = this.evaluateCriticalMovement(movement, recent);
      precision += movementScore.precision;
      technique += movementScore.technique;
    });

    precision = Math.min(100, precision / pattern.criticalMovements.length);
    technique = Math.min(100, technique / pattern.criticalMovements.length);

    return {
      fluidity: this.analyzeMovementFluidity(),
      precision,
      rhythm: this.analyzeAdvancedRhythm(pattern),
      expression: this.analyzeExpression(),
      technique,
    };
  }

  private evaluateCriticalMovement(
    movement: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    poses: PoseLandmark[][]
  ): { precision: number; technique: number } {
    if (poses.length < 10) return { precision: 0, technique: 0 };

    const start = poses[0];
    const end = poses[poses.length - 1];

    // Calculate actual movement
    const actualMovement = movement.landmarks.map((joint: number) => ({
      x: end[joint].x - start[joint].x,
      y: end[joint].y - start[joint].y,
      z: end[joint].z - start[joint].z,
    }));

    // Compare with expected movement
    const expected = movement.expectedMovement;
    let precision = 0;
    let technique = 0;

    actualMovement.forEach((actual) => {
      const magnitude = Math.sqrt(
        actual.x * actual.x + actual.y * actual.y + actual.z * actual.z
      );
      const expectedMagnitude = expected.magnitude;

      // Precision: how close to expected magnitude
      const magnitudeError = Math.abs(magnitude - expectedMagnitude);
      precision += Math.max(0, 100 - magnitudeError * 1000); // Scale error

      // Technique: direction accuracy
      const directionX = Math.abs(actual.x - expected.direction[0]);
      const directionError = directionX;
      technique += Math.max(0, 100 - directionError * 500);
    });

    return {
      precision: precision / actualMovement.length,
      technique: technique / actualMovement.length,
    };
  }

  private analyzeAdvancedRhythm(pattern: AdvancedDancePattern): number {
    if (this.velocityHistory.length < 60) return 0; // Need 2 seconds of data

    // Analyze velocity patterns for rhythm detection
    const avgVelocities = this.velocityHistory.map(
      (frame) => frame.reduce((sum, vel) => sum + vel, 0) / frame.length
    );

    // Simple beat detection using velocity peaks
    const peaks = this.detectBeats(avgVelocities);
    const expectedBPM = pattern.rhythmSignature.beatsPerMinute;
    const actualBPM = this.calculateBPM(peaks);

    // Score based on BPM accuracy
    const bpmError = Math.abs(actualBPM - expectedBPM) / expectedBPM;
    const rhythmScore = Math.max(0, 100 - bpmError * 100);

    return Math.min(100, rhythmScore);
  }

  private detectBeats(velocities: number[]): number[] {
    const peaks: number[] = [];
    const threshold = this.calculateDynamicThreshold(velocities);

    for (let i = 1; i < velocities.length - 1; i++) {
      if (
        velocities[i] > velocities[i - 1] &&
        velocities[i] > velocities[i + 1] &&
        velocities[i] > threshold
      ) {
        peaks.push(i);
      }
    }

    return peaks;
  }

  private calculateDynamicThreshold(velocities: number[]): number {
    const mean =
      velocities.reduce((sum, vel) => sum + vel, 0) / velocities.length;
    const variance =
      velocities.reduce((sum, vel) => sum + Math.pow(vel - mean, 2), 0) /
      velocities.length;
    const stdDev = Math.sqrt(variance);

    // Adaptive threshold based on user profile
    const sensitivity =
      this.userProfile?.personalThresholds.rhythmTolerance || 0.15;
    return mean + stdDev * (1 + sensitivity);
  }

  private calculateBPM(peaks: number[]): number {
    if (peaks.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }

    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const framesPerSecond = 30; // Assuming 30 FPS
    const beatsPerFrame = 1 / avgInterval;
    const beatsPerSecond = beatsPerFrame * framesPerSecond;

    return beatsPerSecond * 60; // Convert to BPM
  }

  private analyzeAdvancedPosture(landmarks: PoseLandmark[]): number {
    let score = 0;
    const strictness =
      this.userProfile?.personalThresholds.postureStrictness || 0.05;

    // Shoulder alignment (enhanced)
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderScore = Math.max(0, 100 - (shoulderDiff / strictness) * 100);
    score += shoulderScore * 0.25;

    // Hip alignment
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const hipDiff = Math.abs(leftHip.y - rightHip.y);
    const hipScore = Math.max(0, 100 - (hipDiff / strictness) * 100);
    score += hipScore * 0.25;

    // Spine alignment (nose to hip center)
    const nose = landmarks[0];
    const midHip = {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2,
    };
    const spineAlignment = Math.abs(nose.x - midHip.x);
    const spineScore = Math.max(
      0,
      100 - (spineAlignment / (strictness * 2)) * 100
    );
    score += spineScore * 0.3;

    // Knee alignment
    if (landmarks[25] && landmarks[26]) {
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      const kneeDiff = Math.abs(leftKnee.y - rightKnee.y);
      const kneeScore = Math.max(0, 100 - (kneeDiff / strictness) * 100);
      score += kneeScore * 0.2;
    }

    return Math.min(100, score);
  }

  private analyzeMovementFluidity(): number {
    if (this.accelerationHistory.length < 20) return 0;

    // Analyze acceleration smoothness
    const recentAccelerations = this.accelerationHistory.slice(-20);
    let totalJerk = 0;
    let frameCount = 0;

    recentAccelerations.forEach((frame) => {
      frame.forEach((accel) => {
        totalJerk += Math.abs(accel);
        frameCount++;
      });
    });

    const avgJerk = totalJerk / frameCount;

    // Lower jerk = higher fluidity
    const fluidityScore = Math.max(0, 100 - avgJerk * 1000);
    return Math.min(100, fluidityScore);
  }

  private analyzeExpression(): number {
    // Simplified expression analysis based on movement variety
    if (this.poseHistory.length < 30) return 50; // Default neutral score

    const recent = this.poseHistory.slice(-30);
    let varietyScore = 0;

    // Analyze arm positions variety
    const armPositions = recent.map((pose) => ({
      leftArm: Math.atan2(pose[15].y - pose[13].y, pose[15].x - pose[13].x),
      rightArm: Math.atan2(pose[16].y - pose[14].y, pose[16].x - pose[14].x),
    }));

    // Calculate variance in arm positions
    const leftArmAngles = armPositions.map((pos) => pos.leftArm);
    const rightArmAngles = armPositions.map((pos) => pos.rightArm);

    const leftVariance = this.calculateVariance(leftArmAngles);
    const rightVariance = this.calculateVariance(rightArmAngles);

    varietyScore = Math.min(100, (leftVariance + rightVariance) * 50);

    return varietyScore;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return variance;
  }

  private calculateAdaptiveScore(
    movement: MovementQuality,
    rhythm: number,
    posture: number,
    fluidity: number,
    expression: number
  ): number {
    // Adaptive weights based on skill level
    const skillLevel = this.userProfile?.skillLevel || "beginner";
    let weights = {
      technique: 0.3,
      rhythm: 0.25,
      posture: 0.25,
      fluidity: 0.15,
      expression: 0.05,
    };

    switch (skillLevel) {
      case "beginner":
        weights = {
          technique: 0.4,
          rhythm: 0.2,
          posture: 0.3,
          fluidity: 0.1,
          expression: 0,
        };
        break;
      case "intermediate":
        weights = {
          technique: 0.3,
          rhythm: 0.3,
          posture: 0.2,
          fluidity: 0.15,
          expression: 0.05,
        };
        break;
      case "advanced":
        weights = {
          technique: 0.25,
          rhythm: 0.25,
          posture: 0.15,
          fluidity: 0.2,
          expression: 0.15,
        };
        break;
    }

    const score =
      movement.technique * weights.technique +
      rhythm * weights.rhythm +
      posture * weights.posture +
      fluidity * weights.fluidity +
      expression * weights.expression;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private generateDetailedFeedback(
    score: number,
    movement: MovementQuality,
    rhythm: number,
    posture: number,
    fluidity: number,
    expression: number
  ): DetailedFeedback {
    const breakdown: MovementQuality = {
      fluidity,
      precision: movement.precision,
      rhythm,
      expression,
      technique: movement.technique,
    };

    const specificAdvice = [];

    // Generate specific advice based on weakest areas
    if (movement.technique < 70) {
      specificAdvice.push({
        category: "technique" as const,
        message:
          "Concentrati sui movimenti di base. Mantieni i passi più precisi.",
        priority: "high" as const,
        suggestedExercise: "Pratica i passi lentamente davanti allo specchio",
      });
    }

    if (rhythm < 60) {
      specificAdvice.push({
        category: "rhythm" as const,
        message: "Ascolta attentamente la musica e cerca di seguire il tempo.",
        priority: "high" as const,
        suggestedExercise: "Pratica contando i tempi: 1-2-3-4-5-6-7-8",
      });
    }

    if (posture < 75) {
      specificAdvice.push({
        category: "posture" as const,
        message: "Mantieni la schiena dritta e le spalle rilassate.",
        priority: "medium" as const,
        suggestedExercise:
          "Esercizi di postura: immagina un filo che ti tira verso l'alto",
      });
    }

    if (fluidity < 65) {
      specificAdvice.push({
        category: "style" as const,
        message: "Rendi i movimenti più fluidi e naturali.",
        priority: "medium" as const,
        suggestedExercise: "Pratica movimenti lenti e continui senza fermarti",
      });
    }

    // Calculate progress
    this.scoreHistory.push(score);
    const recentScores = this.scoreHistory.slice(-10);
    const improvement =
      recentScores.length > 1
        ? recentScores[recentScores.length - 1] - recentScores[0]
        : 0;

    const consistency = this.calculateConsistency(recentScores);

    return {
      score,
      breakdown,
      specificAdvice,
      progressTracking: {
        improvement,
        consistency,
        trendsLastSession: this.analyzeTrends(recentScores),
      },
    };
  }

  private calculateConsistency(scores: number[]): number {
    if (scores.length < 3) return 0;

    const variance = this.calculateVariance(scores);
    const consistency = Math.max(0, 100 - variance);
    return Math.min(100, consistency);
  }

  private analyzeTrends(scores: number[]): string[] {
    const trends = [];

    if (scores.length < 5) return ["Continua a praticare per vedere i trend"];

    const recent = scores.slice(-5);
    const older = scores.slice(-10, -5);

    const recentAvg =
      recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, score) => sum + score, 0) / older.length
        : recentAvg;

    if (recentAvg > olderAvg + 5) {
      trends.push("📈 In miglioramento costante!");
    } else if (recentAvg < olderAvg - 5) {
      trends.push("📉 Attenzione: prestazioni in calo");
    } else {
      trends.push("➡️ Prestazioni stabili");
    }

    return trends;
  }

  private updateLearningData(score: number): void {
    if (!this.userProfile) return;

    this.userProfile.learningData.averageScores.push(score);

    // Keep only last 100 scores
    if (this.userProfile.learningData.averageScores.length > 100) {
      this.userProfile.learningData.averageScores.shift();
    }

    // Update improvement rate
    const scores = this.userProfile.learningData.averageScores;
    if (scores.length > 10) {
      const recent = scores.slice(-10);
      const older = scores.slice(-20, -10);
      const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
      const olderAvg =
        older.length > 0
          ? older.reduce((sum, s) => sum + s, 0) / older.length
          : recentAvg;
      this.userProfile.learningData.improvementRate = recentAvg - olderAvg;
    }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  updateUserProfile(profile: Partial<UserProfile>): void {
    if (this.userProfile) {
      this.userProfile = { ...this.userProfile, ...profile };
    }
  }

  reset(): void {
    this.poseHistory = [];
    this.velocityHistory = [];
    this.accelerationHistory = [];
    this.scoreHistory = [];
  }
}
