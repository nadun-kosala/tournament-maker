import React from 'react';
import { Team } from '../types';
import { Trophy, Target, Award, TrendingUp } from 'lucide-react';

interface TeamStatsProps {
  teams: Team[];
}

function TeamStats({ teams }: TeamStatsProps) {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.leadPoints !== a.leadPoints) return b.leadPoints - a.leadPoints;
    return b.points - a.points;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold">Team Rankings</h2>
      </div>

      <div className="space-y-4">
        {sortedTeams.map((team, index) => (
          <div 
            key={team.id}
            className={`p-4 rounded-lg border ${
              index < 2 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {index < 2 && <Award className="w-5 h-5 text-indigo-600" />}
                <h3 className="font-medium text-gray-800">{team.name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    {team.wins} wins
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-indigo-600">
                    +{team.leadPoints}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {team.points} pts
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">{team.members.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamStats;