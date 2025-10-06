"use client";

import { AdvancedDanceAnalyzer } from "@/lib/advancedDanceAnalysis";
import { DanceAnalyzer } from "@/lib/danceAnalysis";
import { PoseDetector } from "@/lib/poseDetection";
import { DetailedFeedback, UserProfile } from "@/types/advancedDance";
import { DanceAnalysis, DanceMove, PoseLandmark } from "@/types/dance";
import { useCallback, useRef, useState } from "react";
import AdvancedFeedbackPanel from "./AdvancedFeedbackPanel";
import Controls from "./Controls";
import FeedbackPanel from "./FeedbackPanel";
import VideoCanvas, { VideoCanvasRef } from "./VideoCanvas";

const DanceCoachApp: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMove, setSelectedMove] = useState<DanceMove>("basic-step");
  const [analysis, setAnalysis] = useState<DanceAnalysis | null>(null);
  const [advancedFeedback, setAdvancedFeedback] =
    useState<DetailedFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useAdvancedMode, setUseAdvancedMode] = useState(true);
  const [userProfile] = useState<UserProfile | null>(null);

  const videoCanvasRef = useRef<VideoCanvasRef>(null);
  const poseDetectorRef = useRef<PoseDetector | null>(null);
  const danceAnalyzerRef = useRef<DanceAnalyzer | null>(null);
  const advancedAnalyzerRef = useRef<AdvancedDanceAnalyzer | null>(null);

  const handlePoseDetected = useCallback(
    (landmarks: PoseLandmark[]) => {
      if (!isRunning) return;

      if (useAdvancedMode && advancedAnalyzerRef.current) {
        // Usa l'analizzatore avanzato
        const advancedResult = advancedAnalyzerRef.current.analyzePoseAdvanced(
          landmarks,
          selectedMove
        );
        if (advancedResult) {
          setAdvancedFeedback(advancedResult);
        }
      } else if (danceAnalyzerRef.current) {
        // Usa l'analizzatore base
        const result = danceAnalyzerRef.current.analyzePose(
          landmarks,
          selectedMove
        );
        if (result) {
          setAnalysis(result);
        }
      }
    },
    [isRunning, selectedMove, useAdvancedMode]
  );

  const handleStart = async () => {
    try {
      setError(null);

      const videoCanvas = videoCanvasRef.current;
      if (!videoCanvas) {
        throw new Error("Video canvas non disponibile");
      }

      const video = videoCanvas.getVideo();
      const canvas = videoCanvas.getCanvas();

      if (!video || !canvas) {
        throw new Error("Elementi video o canvas non disponibili");
      }

      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      video.srcObject = stream;

      // Initialize pose detector
      if (!poseDetectorRef.current) {
        poseDetectorRef.current = new PoseDetector();
      }

      await poseDetectorRef.current.initialize(
        video,
        canvas,
        handlePoseDetected
      );

      // Initialize analyzers
      if (!danceAnalyzerRef.current) {
        danceAnalyzerRef.current = new DanceAnalyzer();
      } else {
        danceAnalyzerRef.current.reset();
      }

      // Initialize advanced analyzer
      if (!advancedAnalyzerRef.current) {
        advancedAnalyzerRef.current = new AdvancedDanceAnalyzer(
          userProfile || undefined
        );
      } else {
        advancedAnalyzerRef.current.reset();
      }

      // Start detection
      await poseDetectorRef.current.start();
      setIsRunning(true);
    } catch (err) {
      console.error("Errore avvio app:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  };

  const handleStop = () => {
    setIsRunning(false);

    if (poseDetectorRef.current) {
      poseDetectorRef.current.stop();
    }

    // Stop video stream
    const videoCanvas = videoCanvasRef.current;
    if (videoCanvas) {
      const video = videoCanvas.getVideo();
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }

      // Clear canvas
      const canvas = videoCanvas.getCanvas();
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    setAnalysis(null);
    setAdvancedFeedback(null);
  };

  const handleMoveChange = (move: DanceMove) => {
    setSelectedMove(move);
    if (danceAnalyzerRef.current) {
      danceAnalyzerRef.current.reset();
    }
    if (advancedAnalyzerRef.current) {
      advancedAnalyzerRef.current.reset();
    }
    setAnalysis(null);
    setAdvancedFeedback(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 text-white">
      <div className="max-w-6xl mx-auto p-5">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3">🕺 AI Dance Coach</h1>
          <p className="text-xl opacity-90">
            Impara la bachata e salsa con l&apos;intelligenza artificiale
          </p>
        </header>

        <main>
          <VideoCanvas ref={videoCanvasRef} />

          <Controls
            isRunning={isRunning}
            selectedMove={selectedMove}
            useAdvancedMode={useAdvancedMode}
            onStart={handleStart}
            onStop={handleStop}
            onMoveChange={handleMoveChange}
            onAdvancedModeToggle={setUseAdvancedMode}
          />

          {error && (
            <div className="mb-5 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
              <p className="text-red-200">❌ {error}</p>
            </div>
          )}

          {useAdvancedMode ? (
            <AdvancedFeedbackPanel feedback={advancedFeedback} />
          ) : (
            <FeedbackPanel analysis={analysis} />
          )}
        </main>
      </div>
    </div>
  );
};

export default DanceCoachApp;
