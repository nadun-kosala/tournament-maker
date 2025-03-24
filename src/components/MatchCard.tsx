import React, { useState, useEffect } from 'react';
import { Trophy, Star, ArrowUp } from 'lucide-react';
import { Match, Team, UserProfile } from '../types';
import { supabase } from '@/lib/supabase';

interface MatchCardProps {
  match: Match;
  onSubmitScores: (matchId: string, scores: [number, number]) => void;
  tournamentStatus?: string;
}

function MatchCard({ match, onSubmitScores, tournamentStatus = 'pending' }: MatchCardProps) {
  const [scores, setScores] = useState<[number | null, number | null]>([null, null]);
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: UserProfile[] }>({});
  const [realtimeMatch, setRealtimeMatch] = useState<Match>(match);

  useEffect(() => {
    loadTeamMembers();

    // Only set up real-time subscription if tournament is not completed
    if (tournamentStatus !== 'completed') {
      const matchSubscription = supabase
        .channel(`match_${match.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `id=eq.${match.id}`
          },
          async (payload) => {
            // Fetch updated match data with team details
            const { data: updatedMatch } = await supabase
              .from('matches')
              .select(`
                *,
                team1:teams!matches_team1_id_fkey(*),
                team2:teams!matches_team2_id_fkey(*)
              `)
              .eq('id', match.id)
              .single();

            if (updatedMatch) {
              const formattedMatch = {
                ...updatedMatch,
                teams: [updatedMatch.team1, updatedMatch.team2],
                scores: [updatedMatch.team1_score, updatedMatch.team2_score],
                isCompleted: updatedMatch.is_completed,
                winner: updatedMatch.winner_id,
                pointDifference: updatedMatch.point_difference,
                matchNumber: updatedMatch.match_number,
                round: updatedMatch.round
              };
              setRealtimeMatch(formattedMatch);
            }
          }
        )
        .subscribe();

      return () => {
        matchSubscription.unsubscribe();
      };
    }
  }, [match.id, tournamentStatus]);

  useEffect(() => {
    setRealtimeMatch(match);
  }, [match]);

  const loadTeamMembers = async () => {
    const members: { [key: string]: UserProfile[] } = {};
    
    for (const team of match.teams) {
      if (team) {
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .in('id', team.members);
        
        if (users) {
          members[team.id] = users;
        }
      }
    }
    
    setTeamMembers(members);
  };

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

  const isReadyToSubmit = scores[0] !== null && scores[1] !== null && !realtimeMatch.isCompleted;

  return (
    <div className={`w-80 bg-white border ${realtimeMatch.round === 'final' ? 'border-indigo-200 ring-1 ring-indigo-500' : 'border-gray-200'} rounded-lg shadow-sm`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-500">
            {realtimeMatch.round === 'final' ? (
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <Trophy className="w-4 h-4" />
                Final Match
              </span>
            ) : (
              `Match ${realtimeMatch.matchNumber}`
            )}
          </div>
          {realtimeMatch.isCompleted && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Star className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {realtimeMatch.teams.map((team, index) => (
          <div
            key={team?.id || index}
            className={`p-3 ${index === 0 ? 'mb-2' : ''} rounded-lg border
              ${realtimeMatch.isCompleted 
                ? realtimeMatch.winner === team?.id
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
                : 'bg-white border-gray-200'}`}
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                {team ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{team.name}</span>
                      {realtimeMatch.isCompleted && realtimeMatch.winner === team.id && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <ArrowUp className="w-3 h-3" />
                          +{realtimeMatch.pointDifference} pts
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {teamMembers[team.id]?.map(user => user.full_name).join(', ')}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">TBD</div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {realtimeMatch.isCompleted ? (
                  <div className="font-semibold text-lg text-gray-800">
                    {realtimeMatch.scores[index]}
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={scores[index] === null ? '' : scores[index]}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
                    placeholder="Score"
                    disabled={!team || realtimeMatch.isCompleted}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {!realtimeMatch.isCompleted && (
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