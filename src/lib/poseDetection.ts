"use client";

import { PoseLandmark } from "@/types/dance";

// Note: MediaPipe will be loaded dynamically in the browser
declare global {
  interface Window {
    Pose: unknown;
    Camera: unknown;
    drawConnectors: unknown;
    drawLandmarks: unknown;
    POSE_CONNECTIONS: unknown;
  }
}

export class PoseDetector {
  private pose: any = null;
  private camera: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private isDetecting: boolean = false;
  private onResultsCallback: ((landmarks: PoseLandmark[]) => void) | null =
    null;

  async loadMediaPipe(): Promise<void> {
    // Dynamically load MediaPipe scripts
    if (!window.Pose) {
      await this.loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/pose@latest/pose.js"
      );
      await this.loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@latest/camera_utils.js"
      );
      await this.loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@latest/drawing_utils.js"
      );
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async initialize(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onResultsCallback: (landmarks: PoseLandmark[]) => void
  ): Promise<void> {
    await this.loadMediaPipe();

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.canvasCtx = canvasElement.getContext("2d");
    this.onResultsCallback = onResultsCallback;

    // Configure MediaPipe Pose
    // @ts-expect-error - MediaPipe loaded dynamically
    this.pose = new window.Pose({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.pose.onResults(this.onResults.bind(this));

    // Configure camera
    // @ts-expect-error - MediaPipe camera loaded dynamically
    this.camera = new window.Camera(this.videoElement, {
      onFrame: async () => {
        if (this.isDetecting && this.pose) {
          await this.pose.send({ image: this.videoElement });
        }
      },
      width: 640,
      height: 480,
      facingMode: "user",
    });
  }

  private onResults(results: any): void {
    if (!this.canvasCtx || !this.canvasElement) return;

    // Clear canvas
    this.canvasCtx.save();
    this.canvasCtx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Draw video image
    this.canvasCtx.drawImage(
      results.image,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    if (results.poseLandmarks) {
      // Draw pose connections
      if (window.drawConnectors && window.POSE_CONNECTIONS) {
        // @ts-expect-error - MediaPipe drawing utils loaded dynamically
        window.drawConnectors(
          this.canvasCtx,
          results.poseLandmarks,
          window.POSE_CONNECTIONS,
          { color: "#00FF00", lineWidth: 4 }
        );
      }

      // Draw landmarks
      if (window.drawLandmarks) {
        // @ts-expect-error - MediaPipe drawing utils loaded dynamically
        window.drawLandmarks(this.canvasCtx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }

      // Callback for dance analysis
      if (this.onResultsCallback) {
        this.onResultsCallback(results.poseLandmarks);
      }
    }

    this.canvasCtx.restore();
  }

  async start(): Promise<void> {
    if (!this.camera) {
      throw new Error("Camera not initialized");
    }

    this.isDetecting = true;
    await this.camera.start();
  }

  stop(): void {
    this.isDetecting = false;
    if (this.camera) {
      this.camera.stop();
    }
  }

  isRunning(): boolean {
    return this.isDetecting;
  }
}
