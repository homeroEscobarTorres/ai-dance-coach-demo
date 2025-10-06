"use client";

import { DanceAnalysis } from "@/types/dance";

interface FeedbackPanelProps {
  analysis: DanceAnalysis | null;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ analysis }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-400"; // Verde
    if (score >= 60) return "text-yellow-400"; // Giallo
    if (score >= 40) return "text-orange-400"; // Arancione
    return "text-red-400"; // Rosso
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return "bg-green-500/20"; // Verde
    if (score >= 60) return "bg-yellow-500/20"; // Giallo
    if (score >= 40) return "bg-orange-500/20"; // Arancione
    return "bg-red-500/20"; // Rosso
  };

  return (
    <div className="bg-white/10 p-5 rounded-2xl text-center backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-4 text-white">Feedback AI</h3>

      <div
        className={`text-2xl my-4 p-3 rounded-lg ${
          analysis ? getScoreBackground(analysis.score) : "bg-gray-500/20"
        }`}
      >
        <span
          className={analysis ? getScoreColor(analysis.score) : "text-gray-400"}
        >
          Score: {analysis ? Math.round(analysis.score) : "--"}/100
        </span>
      </div>

      <div className="space-y-2">
        {analysis?.feedback && analysis.feedback.length > 0 ? (
          analysis.feedback.map((feedback, index) => (
            <div
              key={index}
              className="p-2 bg-white/10 rounded-lg text-sm text-white"
            >
              {feedback}
            </div>
          ))
        ) : (
          <div className="text-gray-300 text-sm">
            Inizia a ballare per ricevere feedback!
          </div>
        )}
      </div>

      {analysis?.rhythm && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Ritmo</h4>
          <div className="flex justify-center items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                analysis.rhythm.onBeat
                  ? "bg-green-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-gray-200">
              {analysis.rhythm.onBeat ? "A tempo" : "Fuori tempo"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
