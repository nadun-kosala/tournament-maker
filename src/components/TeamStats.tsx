import React, { useState, useEffect } from 'react';
import { Team, UserProfile } from '../types';
import { Trophy, Target, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TeamStatsProps {
  teams: Team[];
  tournamentStatus?: string;
  tournamentId?: string;
}

function TeamStats({ teams, tournamentStatus = 'pending', tournamentId }: TeamStatsProps) {
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: UserProfile[] }>({});
  const [loading, setLoading] = useState(true);
  const [realtimeTeams, setRealtimeTeams] = useState<Team[]>(teams);

  useEffect(() => {
    loadTeamMembers();

    if (tournamentStatus !== 'completed') {
      const teamsSubscription = supabase
        .channel('teams_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'teams',
            filter: `tournament_id=eq.${tournamentId}`
          },
          async (payload) => {
            const { data: updatedTeams } = await supabase
              .from('teams')
              .select('*')
              .eq('tournament_id', tournamentId)
              .order('created_at', { ascending: true });
            
            if (updatedTeams) {
              setRealtimeTeams(updatedTeams);
            }
          }
        )
        .subscribe();

      return () => {
        teamsSubscription.unsubscribe();
      };
    }
  }, [tournamentStatus]);

  useEffect(() => {
    setRealtimeTeams(teams);
  }, [teams]);

  const loadTeamMembers = async () => {
    const members: { [key: string]: UserProfile[] } = {};
    
    for (const team of teams) {
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .in('id', team.members);
      
      if (users) {
        members[team.id] = users;
      }
    }
    
    setTeamMembers(members);
    setLoading(false);
  };

  const sortedTeams = [...realtimeTeams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.lead_points !== a.lead_points) return b.lead_points - a.lead_points;
    return b.points - a.points;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Team Rankings</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

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
                    +{team.lead_points}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {team.points} pts
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Players: {teamMembers[team.id]?.map(user => user.full_name).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamStats;