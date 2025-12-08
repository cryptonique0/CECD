import React, { useState } from 'react';
import { Award, Star, Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

const GamificationSystem: React.FC = () => {
  const [achievements] = useState<Achievement[]>([
    { id: '1', title: 'First Response', description: 'Respond to your first incident', icon: '🚀', unlocked: true, progress: 100 },
    { id: '2', title: 'Team Player', description: 'Collaborate on 5 incidents', icon: '👥', unlocked: true, progress: 100 },
    { id: '3', title: 'Lifesaver', description: 'Help resolve 10 critical incidents', icon: '💚', unlocked: false, progress: 60 },
    { id: '4', title: 'Speed Runner', description: 'Respond within 2 minutes', icon: '⚡', unlocked: true, progress: 100 },
    { id: '5', title: 'Community Champion', description: 'Train 20 other volunteers', icon: '🏆', unlocked: false, progress: 35 },
  ]);

  const [userLevel] = useState(8);
  const [totalPoints] = useState(2450);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Trophy className="text-yellow-600" />
        Achievements & Gamification
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90">Current Level</p>
          <p className="text-4xl font-bold">{userLevel}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90">Total Points</p>
          <p className="text-4xl font-bold">{totalPoints}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90">Points to Next Level</p>
          <p className="text-4xl font-bold">550</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Award className="text-orange-600" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-lg shadow p-4 border-l-4 ${
                achievement.unlocked
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        achievement.unlocked ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{achievement.progress}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Star className="text-yellow-600" />
          Leaderboard
        </h3>
        <div className="space-y-2">
          {[
            { rank: 1, name: 'Sarah Johnson', points: 5420 },
            { rank: 2, name: 'Mike Chen', points: 4890 },
            { rank: 3, name: 'You', points: 2450 },
            { rank: 4, name: 'Lisa Martinez', points: 1980 },
          ].map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-yellow-600">#{entry.rank}</span>
                <span className="font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-gray-700">{entry.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamificationSystem;
