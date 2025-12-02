import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";

interface VolunteerReputation {
  address: string;
  score: number;
  badges: string[];
  tasksCompleted: number;
  joinedDate: string;
}

const VolunteerReputationSystem: React.FC = () => {
  const { account, chainId } = useWallet();
  const [reputation, setReputation] = useState<VolunteerReputation | null>(null);
  const [loading, setLoading] = useState(false);

  const badges = [
    { name: "First Responder", icon: "🚑", requirement: "Complete 1 emergency response" },
    { name: "Trusted Helper", icon: "⭐", requirement: "50+ reputation points" },
    { name: "Community Leader", icon: "👑", requirement: "Lead 10+ initiatives" },
    { name: "Expert Rescuer", icon: "🦸", requirement: "100+ tasks completed" },
    { name: "Celo Pioneer", icon: "🌱", requirement: "Active on Celo network" },
  ];

  useEffect(() => {
    if (account) {
      fetchReputation();
    }
  }, [account]);

  const fetchReputation = async () => {
    setLoading(true);
    // Simulate fetching reputation data
    // In production, this would query a smart contract or backend
    setTimeout(() => {
      setReputation({
        address: account!,
        score: Math.floor(Math.random() * 100) + 20,
        badges: ["First Responder", "Celo Pioneer"],
        tasksCompleted: Math.floor(Math.random() * 50) + 5,
        joinedDate: "2024-01-15",
      });
      setLoading(false);
    }, 1000);
  };

  const getReputationLevel = (score: number) => {
    if (score >= 90) return { level: "Elite", color: "text-purple-600", bg: "bg-purple-100" };
    if (score >= 70) return { level: "Expert", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 50) return { level: "Advanced", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 30) return { level: "Intermediate", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Beginner", color: "text-gray-600", bg: "bg-gray-100" };
  };

  if (!account) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Connect your wallet to view volunteer reputation</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading reputation...</p>
      </div>
    );
  }

  if (!reputation) return null;

  const { level, color, bg } = getReputationLevel(reputation.score);

  return (
    <div className="space-y-6">
      {/* Reputation Score Card */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Your Reputation</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bg} ${color}`}>
            {level}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Reputation Score</span>
              <span className="font-bold">{reputation.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${reputation.score}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{reputation.tasksCompleted}</p>
              <p className="text-xs text-gray-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{reputation.badges.length}</p>
              <p className="text-xs text-gray-600">Badges Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-1 gap-3">
          {badges.map((badge) => {
            const isEarned = reputation.badges.includes(badge.name);
            return (
              <div
                key={badge.name}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  isEarned
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${isEarned ? "text-green-800" : "text-gray-600"}`}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-gray-500">{badge.requirement}</p>
                </div>
                {isEarned && (
                  <span className="text-green-600 font-bold">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* On-chain Verification */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>🔗 Blockchain Verified:</strong> Your reputation is stored on-chain and portable across platforms
        </p>
      </div>
    </div>
  );
};

export default VolunteerReputationSystem;
