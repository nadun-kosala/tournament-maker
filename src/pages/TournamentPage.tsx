import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Target, MapPin, FileText, User as UserIcon, Trash2 } from 'lucide-react';
import TeamInput from '../components/TeamInput';
import Bracket from '../components/Bracket';
import TeamStats from '../components/TeamStats';
import { Team, Match, UserProfile } from '../types';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  generateRoundRobinMatches,
  calculateTeamStats,
  getTopTeams,
  generateFinalMatch,
} from '../utils/bracketUtils';
import FinalMatchCard from '../components/FinalMatchCard';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface TournamentPageProps {
  user: User;
}

function TournamentPage({ user }: TournamentPageProps) {
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [finalMatch, setFinalMatch] = useState<Match | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalTeam, setFinalTeam] = useState<Team | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: UserProfile[] }>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

  useEffect(() => {
    if (teams.length > 0) {
      loadTeamMembers();
    }
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
  };

  const loadTournament = async () => {
    if (!tournamentId) return;

    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentData) {
      setTournament(tournamentData);
      setIsCreator(tournamentData.created_by === user.id);

      // Load teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: true });
      
      if (teamsData) setTeams(teamsData);

      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(*),
          team2:teams!matches_team2_id_fkey(*)
        `)
        .eq('tournament_id', tournamentId)
        .order('match_number', { ascending: true });

      if (matchesData) {
        const formattedMatches = matchesData.map(match => ({
          ...match,
          teams: [match.team1, match.team2],
          scores: [match.team1_score, match.team2_score],
          isCompleted: match.is_completed,
          winner: match.winner_id,
          pointDifference: match.point_difference,
          matchNumber: match.match_number,
          round: match.round
        }));

        const regularMatches = formattedMatches.filter(m => m.round === 'regular');
        const finalMatchData = formattedMatches.find(m => m.round === 'final');

        setMatches(regularMatches);
        if (finalMatchData) {
          setFinalMatch(finalMatchData);
          if (finalMatchData.winner_id) {
            const winningTeam = finalMatchData.teams.find(t => t.id === finalMatchData.winner_id);
            if (winningTeam) setFinalTeam(winningTeam);
          }
        }
      }
    }
  };

  const handleAddTeam = async (team: Team) => {
    if (!tournamentId || !isCreator) return;

    const { data: newTeam } = await supabase
      .from('teams')
      .insert({
        tournament_id: tournamentId,
        name: team.name,
        members: team.members,
        points: 0,
        wins: 0,
        matches_played: 0,
        lead_points: 0
      })
      .select()
      .single();

    if (newTeam) {
      setTeams([...teams, newTeam]);
    }
  };

  const handleRemoveTeam = async (id: string) => {
    if (!isCreator) return;
    await supabase.from('teams').delete().eq('id', id);
    setTeams(teams.filter(team => team.id !== id));
    setMatches([]);
    setFinalMatch(null);
  };

  const handleGenerateMatches = async () => {
    if (!tournamentId || !isCreator) return;

    setIsProcessing(true);
    const generatedMatches = generateRoundRobinMatches(teams);

    const { data: newMatches } = await supabase
      .from('matches')
      .insert(
        generatedMatches.map((match, index) => ({
          tournament_id: tournamentId,
          team1_id: match.teams[0]?.id,
          team2_id: match.teams[1]?.id,
          match_number: index + 1,
          round: match.round
        }))
      )
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(*),
        team2:teams!matches_team2_id_fkey(*)
      `);

    if (newMatches) {
      const formattedMatches = newMatches.map(match => ({
        ...match,
        teams: [match.team1, match.team2],
        scores: [match.team1_score, match.team2_score],
        isCompleted: match.is_completed,
        winner: match.winner_id,
        pointDifference: match.point_difference,
        matchNumber: match.match_number,
        round: match.round
      }));
      setMatches(formattedMatches);
    }

    setIsProcessing(false);
  };

  const updateTeamStats = async (updatedMatches: Match[]) => {
    const stats = calculateTeamStats(updatedMatches);
    
    for (const team of stats) {
      await supabase
        .from('teams')
        .update({
          points: team.points,
          wins: team.wins,
          matches_played: team.matchesPlayed,
          lead_points: team.leadPoints
        })
        .eq('id', team.id);
    }

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true });
    
    if (teamsData) setTeams(teamsData);
  };

  const handleSubmitScores = async (matchId: string, scores: [number, number]) => {
    if (!tournamentId) return;

    const match = matches.find(m => m.id === matchId) || finalMatch;
    if (!match) return;

    const [score1, score2] = scores;
    const winner = score1 > score2 ? match.teams[0] : match.teams[1];
    const pointDifference = Math.abs(score1 - score2);

    await supabase
      .from('matches')
      .update({
        team1_score: score1,
        team2_score: score2,
        winner_id: winner?.id,
        is_completed: true,
        point_difference: pointDifference
      })
      .eq('id', matchId);

    if (match.round === 'final') {
      await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', tournamentId);
    }

    // Reload match data to ensure we have the latest state
    await loadTournament();

    if (match.round === 'regular') {
      const updatedMatches = matches.map(m =>
        m.id === matchId
          ? {
              ...m,
              scores: scores,
              isCompleted: true,
              winner: winner?.id,
              pointDifference
            }
          : m
      );
      setMatches(updatedMatches);

      await updateTeamStats(updatedMatches);

      const allRegularMatchesCompleted = updatedMatches.every(m => m.isCompleted);

      if (allRegularMatchesCompleted && !finalMatch) {
        const topTeams = getTopTeams(teams, 2);
        const newFinalMatch = generateFinalMatch(topTeams);

        const { data: createdFinalMatch } = await supabase
          .from('matches')
          .insert({
            tournament_id: tournamentId,
            team1_id: newFinalMatch.teams[0]?.id,
            team2_id: newFinalMatch.teams[1]?.id,
            match_number: 1,
            round: 'final'
          })
          .select(`
            *,
            team1:teams!matches_team1_id_fkey(*),
            team2:teams!matches_team2_id_fkey(*)
          `)
          .single();

        if (createdFinalMatch) {
          const formattedFinalMatch = {
            ...createdFinalMatch,
            teams: [createdFinalMatch.team1, createdFinalMatch.team2],
            scores: [createdFinalMatch.team1_score, createdFinalMatch.team2_score],
            isCompleted: createdFinalMatch.is_completed,
            winner: createdFinalMatch.winner_id,
            pointDifference: createdFinalMatch.point_difference,
            matchNumber: createdFinalMatch.match_number,
            round: createdFinalMatch.round
          };
          setFinalMatch(formattedFinalMatch);
        }
      }
    } else if (match.round === 'final') {
      setFinalTeam(winner || null);
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournamentId || !isCreator) return;

    try {
      await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      navigate('/');
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!tournament) return null;

  const isCompleted = tournament.status === 'completed';
  const displayName = user.user_metadata?.full_name || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Tournaments
            </button>
            <div className="flex items-center justify-center flex-1">
              <Trophy className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="flex items-center gap-4 text-right">
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{tournament.name}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{tournament.venue}</span>
            </div>
            <span>•</span>
            <span className="font-medium">Status: {tournament.status}</span>
            {isCreator && (
              <>
                <span>•</span>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Tournament</span>
                </button>
              </>
            )}
          </div>
        </header>

        {isCompleted && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              {showSummary ? 'Show Matches' : 'Show Tournament Summary'}
            </button>
          </div>
        )}

        {isCompleted && showSummary ? (
          <FinalMatchCard 
            finalMatch={finalMatch} 
            finalTeam={finalTeam} 
            matches={matches} 
            teams={teams}
            tournament={tournament}
          />
        ) : (
          <div className="grid lg:grid-cols-[350px,1fr] gap-8">
            <div className="space-y-6">
              {matches.length === 0 && isCreator && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">Teams</h2>
                  </div>

                  <TeamInput onAddTeam={handleAddTeam} />

                  <div className="mt-6 space-y-3">
                    {teams.map(team => (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-800">{team.name}</h3>
                          <p className="text-sm text-gray-500">
                            {teamMembers[team.id]?.map(user => user.full_name).join(', ')}
                          </p>
                        </div>
                        <button onClick={() => handleRemoveTeam(team.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Target className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateMatches}
                    disabled={teams.length < 2 || isProcessing || matches.length > 0}
                    className={`mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition ${
                      teams.length < 2 || matches.length > 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      'Generate Matches'
                    )}
                  </button>
                </div>
              )}

              {matches.length > 0 && (
                <TeamStats 
                  teams={teams} 
                  tournamentStatus={tournament.status}
                  tournamentId={tournament.id}
                />
              )}
            </div>

            <div className="space-y-8">
              <Bracket
                matches={matches.map(match => ({
                  ...match,
                  tournamentStatus: tournament.status
                }))}
                finalMatch={finalMatch ? {
                  ...finalMatch,
                  tournamentStatus: tournament.status
                } : null}
                onSubmitScores={handleSubmitScores}
              />
            </div>
          </div>
        )}

        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Delete Tournament</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this tournament? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteTournament} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default TournamentPage;