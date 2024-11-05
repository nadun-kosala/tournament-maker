import React, { useState } from 'react';
import { Match, Team } from '../types';
import { Trophy, Star } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSubmitScores: (matchId: string, scores: [number, number]) => void;
}

function MatchCard({ match, onSubmitScores }: MatchCardProps) {
  const [scores, setScores] = useState<[number | null, number | null]>([null, null]);

  const handleScoreChange = (index: number, value: string) => {
    const newScore = value === '' ? null : Math.max(0, parseInt(value) || 0);
    const newScores = [...scores] as [number | null, number | null];
    newScores[index] = newScore;
    setScores(newScores);
  };

  const handleSubmit = () => {
    if (scores[0] !== null && scores[1] !== null) {
      onSubmitScores(match.id, [scores[0], scores[1]]);
    }
  };

  const isReadyToSubmit = scores[0] !== null && scores[1] !== null && !match.isCompleted;

  return (
    <div className={`w-80 bg-white border ${match.round === 'final' ? 'border-indigo-200 ring-1 ring-indigo-500' : 'border-gray-200'} rounded-lg shadow-sm`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-500">
            {match.round === 'final' ? (
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <Trophy className="w-4 h-4" />
                Final Match
              </span>
            ) : (
              `Match ${match.matchNumber}`
            )}
          </div>
          {match.isCompleted && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Star className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {match.teams.map((team, index) => (
          <div
            key={team?.id || index}
            className={`p-3 ${index === 0 ? 'mb-2' : ''} rounded-lg border
              ${match.isCompleted 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-gray-200'}`}
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                {team ? (
                  <>
                    <div className="font-medium text-gray-800">{team.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {team.members.join(', ')}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">TBD</div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {match.isCompleted ? (
                  <div className="font-semibold text-lg text-gray-800">
                    {match.scores[index]}
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={scores[index] === null ? '' : scores[index]}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
                    placeholder="Score"
                    disabled={!team || match.isCompleted}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {!match.isCompleted && (
          <button
            onClick={handleSubmit}
            disabled={!isReadyToSubmit}
            className={`mt-4 w-full px-4 py-2 rounded-lg text-white font-medium transition
              ${!isReadyToSubmit
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            Submit Scores
          </button>
        )}
      </div>
    </div>
  );
}

export default MatchCard;