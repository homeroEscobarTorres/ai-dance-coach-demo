"use client";

import { DetailedFeedback } from "@/types/advancedDance";

interface AdvancedFeedbackPanelProps {
  feedback: DetailedFeedback | null;
}

const AdvancedFeedbackPanel: React.FC<AdvancedFeedbackPanelProps> = ({
  feedback,
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-lime-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    if (score >= 40) return "text-red-400";
    return "text-red-500";
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 90) return "bg-emerald-500/20";
    if (score >= 80) return "bg-green-500/20";
    if (score >= 70) return "bg-lime-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    if (score >= 50) return "bg-orange-500/20";
    if (score >= 40) return "bg-red-400/20";
    return "bg-red-500/20";
  };

  const getPriorityColor = (priority: "high" | "medium" | "low"): string => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-500/10 text-red-200";
      case "medium":
        return "border-yellow-500 bg-yellow-500/10 text-yellow-200";
      case "low":
        return "border-green-500 bg-green-500/10 text-green-200";
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case "technique":
        return "⚡";
      case "rhythm":
        return "🎵";
      case "posture":
        return "🧘";
      case "style":
        return "💃";
      default:
        return "💡";
    }
  };

  if (!feedback) {
    return (
      <div className="bg-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
        <h3 className="text-xl font-semibold mb-4 text-white">
          AI Dance Coach Avanzato
        </h3>
        <div className="text-gray-300 text-sm">
          🤖 Inizializzazione sistema di analisi avanzata...
          <br />
          Inizia a ballare per ricevere feedback dettagliato!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm space-y-6">
      <h3 className="text-xl font-semibold text-white text-center">
        🤖 AI Dance Coach Pro
      </h3>

      {/* Overall Score */}
      <div
        className={`text-3xl font-bold p-4 rounded-lg text-center ${getScoreBackground(
          feedback.score
        )}`}
      >
        <span className={getScoreColor(feedback.score)}>
          {feedback.score}/100
        </span>
        <div className="text-sm text-gray-300 mt-1">
          {feedback.score >= 90
            ? "🏆 Eccezionale!"
            : feedback.score >= 80
            ? "⭐ Ottimo!"
            : feedback.score >= 70
            ? "👍 Buono!"
            : feedback.score >= 60
            ? "📈 In miglioramento"
            : feedback.score >= 50
            ? "💪 Continua così"
            : "🎯 Serve più pratica"}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-300 mb-1">Tecnica</div>
          <div
            className={`font-bold ${getScoreColor(
              feedback.breakdown.technique
            )}`}
          >
            {Math.round(feedback.breakdown.technique)}%
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-300 mb-1">Ritmo</div>
          <div
            className={`font-bold ${getScoreColor(feedback.breakdown.rhythm)}`}
          >
            {Math.round(feedback.breakdown.rhythm)}%
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-300 mb-1">Fluidità</div>
          <div
            className={`font-bold ${getScoreColor(
              feedback.breakdown.fluidity
            )}`}
          >
            {Math.round(feedback.breakdown.fluidity)}%
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-300 mb-1">Precisione</div>
          <div
            className={`font-bold ${getScoreColor(
              feedback.breakdown.precision
            )}`}
          >
            {Math.round(feedback.breakdown.precision)}%
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-300 mb-1">Espressione</div>
          <div
            className={`font-bold ${getScoreColor(
              feedback.breakdown.expression
            )}`}
          >
            {Math.round(feedback.breakdown.expression)}%
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-300 mb-1">Consistenza</div>
          <div
            className={`font-bold ${getScoreColor(
              feedback.progressTracking.consistency
            )}`}
          >
            {Math.round(feedback.progressTracking.consistency)}%
          </div>
        </div>
      </div>

      {/* Specific Advice */}
      {feedback.specificAdvice.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white mb-2">
            💡 Consigli Personalizzati
          </h4>
          {feedback.specificAdvice.map((advice, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(
                advice.priority
              )}`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">
                  {getCategoryIcon(advice.category)}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {advice.category.toUpperCase()}: {advice.message}
                  </div>
                  {advice.suggestedExercise && (
                    <div className="text-xs opacity-75">
                      💪 Esercizio: {advice.suggestedExercise}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Tracking */}
      <div className="bg-white/5 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-3">📊 Progresso</h4>

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-300">Miglioramento:</span>
          <span
            className={`text-sm font-bold ${
              feedback.progressTracking.improvement > 0
                ? "text-green-400"
                : feedback.progressTracking.improvement < 0
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {feedback.progressTracking.improvement > 0 ? "+" : ""}
            {Math.round(feedback.progressTracking.improvement)}
          </span>
        </div>

        {feedback.progressTracking.trendsLastSession.map((trend, index) => (
          <div key={index} className="text-xs text-gray-300 mb-1">
            {trend}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="flex justify-center space-x-4 text-xs text-gray-300">
        <div className="text-center">
          <div className="font-bold text-white">AI</div>
          <div>Analisi ML</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-white">33</div>
          <div>Punti Corpo</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-white">5D</div>
          <div>Metriche</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-white">90fps</div>
          <div>Analisi</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeedbackPanel;
