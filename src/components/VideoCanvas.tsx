"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface VideoCanvasProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export interface VideoCanvasRef {
  getVideo: () => HTMLVideoElement | null;
  getCanvas: () => HTMLCanvasElement | null;
}

const VideoCanvas = forwardRef<VideoCanvasRef, VideoCanvasProps>(
  ({ onVideoReady, onCanvasReady }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getVideo: () => videoRef.current,
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      if (videoRef.current && onVideoReady) {
        onVideoReady(videoRef.current);
      }
    }, [onVideoReady]);

    useEffect(() => {
      if (canvasRef.current && onCanvasReady) {
        onCanvasReady(canvasRef.current);
      }
    }, [onCanvasReady]);

    return (
      <div className="relative flex justify-center mb-5">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-[640px] h-[480px] border-3 border-white rounded-lg"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none w-full max-w-[640px] h-[480px] border-3 border-white rounded-lg"
        />
      </div>
    );
  }
);

VideoCanvas.displayName = "VideoCanvas";

export default VideoCanvas;
