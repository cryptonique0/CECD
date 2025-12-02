import React, { useState } from "react";

interface PredictiveAnalytics {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  prediction: string;
  confidence: number;
  factors: string[];
}

const AIPrediction: React.FC = () => {
  const [analytics, setAnalytics] = useState<PredictiveAnalytics>({
    riskLevel: "Medium",
    prediction: "Increased rainfall may cause flooding in low-lying areas within 48-72 hours",
    confidence: 78,
    factors: [
      "Historical flood patterns in region",
      "Weather forecast data",
      "Current soil saturation levels",
      "Proximity to water bodies",
    ],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runPrediction = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const predictions = [
        {
          riskLevel: "High" as const,
          prediction: "Potential earthquake activity detected in fault zones",
          confidence: 65,
          factors: ["Seismic sensor data", "Tectonic plate movements", "Historical earthquake patterns"],
        },
        {
          riskLevel: "Low" as const,
          prediction: "Weather conditions stable for next 7 days",
          confidence: 92,
          factors: ["Meteorological data", "Seasonal patterns", "Climate models"],
        },
        {
          riskLevel: "Critical" as const,
          prediction: "Wildfire risk extremely high due to dry conditions",
          confidence: 88,
          factors: ["Temperature trends", "Humidity levels", "Wind patterns", "Vegetation dryness"],
        },
      ];
      
      setAnalytics(predictions[Math.floor(Math.random() * predictions.length)]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-400";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "Low":
        return "bg-green-100 text-green-800 border-green-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-400";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">AI Incident Prediction</h3>
        <button
          onClick={runPrediction}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {isAnalyzing ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Analyzing patterns and data...</p>
        </div>
      ) : (
        <>
          {/* Risk Level */}
          <div className={`p-4 rounded-lg border-2 ${getRiskColor(analytics.riskLevel)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Risk Level</span>
              <span className="text-2xl font-bold">{analytics.riskLevel}</span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  analytics.riskLevel === "Critical"
                    ? "bg-red-600"
                    : analytics.riskLevel === "High"
                    ? "bg-orange-600"
                    : analytics.riskLevel === "Medium"
                    ? "bg-yellow-600"
                    : "bg-green-600"
                }`}
                style={{
                  width: `${
                    analytics.riskLevel === "Critical"
                      ? 100
                      : analytics.riskLevel === "High"
                      ? 75
                      : analytics.riskLevel === "Medium"
                      ? 50
                      : 25
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Prediction */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">Prediction:</p>
            <p className="text-blue-800">{analytics.prediction}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-blue-600">Confidence:</span>
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${analytics.confidence}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-blue-800">{analytics.confidence}%</span>
            </div>
          </div>

          {/* Contributing Factors */}
          <div>
            <h4 className="font-semibold mb-3">Contributing Factors:</h4>
            <div className="space-y-2">
              {analytics.factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-purple-600 mt-0.5">📊</span>
                  <span className="text-sm text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Predictions are based on AI analysis of historical data and current conditions.
              Always follow official emergency guidelines.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIPrediction;
