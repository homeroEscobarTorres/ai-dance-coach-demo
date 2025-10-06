"use client";

import { DanceMove } from "@/types/dance";

interface ControlsProps {
  isRunning: boolean;
  selectedMove: DanceMove;
  useAdvancedMode: boolean;
  onStart: () => void;
  onStop: () => void;
  onMoveChange: (move: DanceMove) => void;
  onAdvancedModeToggle: (advanced: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isRunning,
  selectedMove,
  useAdvancedMode,
  onStart,
  onStop,
  onMoveChange,
  onAdvancedModeToggle,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-5">
      <button
        onClick={onStart}
        disabled={isRunning}
        className="px-6 py-3 border-0 rounded-full bg-red-500 text-white font-bold cursor-pointer transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        Avvia Webcam
      </button>

      <button
        onClick={onStop}
        disabled={!isRunning}
        className="px-6 py-3 border-0 rounded-full bg-red-500 text-white font-bold cursor-pointer transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        Ferma
      </button>

      <select
        value={selectedMove}
        onChange={(e) => onMoveChange(e.target.value as DanceMove)}
        className="px-3 py-3 border-0 rounded-2xl bg-white text-gray-800 min-w-[200px]"
      >
        <option value="basic-step">Passo Base</option>
        <option value="side-step">Passo Laterale</option>
      </select>

      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
        <span className="text-white text-sm">AI Avanzato:</span>
        <button
          onClick={() => onAdvancedModeToggle(!useAdvancedMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useAdvancedMode ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              useAdvancedMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default Controls;
