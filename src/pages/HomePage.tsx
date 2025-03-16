import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, MapPin, User as UserIcon } from 'lucide-react';
import TeamInput from '../components/TeamInput';
import { Team } from '../types';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport, ToastClose } from '../components/Toast';

interface HomePageProps {
  user: User;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  created_at: string;
  venue: string;
}

const VENUES = [
  'Ambalangoda Urban Council Badminton Court',
  'Badminton Stadium Dharmasoka College',
  'Kandegoda Badminton Court',
  'Batapola Badminton Court'
];

function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentName, setTournamentName] = useState('');
  const [venue, setVenue] = useState(VENUES[0]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [toast, setToast] = useState<{ title: string; description: string; variant: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  const showToast = (title: string, description: string, variant: 'success' | 'error') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const loadTournaments = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTournaments(data);
  };

  const handleCreateTournament = async () => {
    if (!tournamentName.trim()) {
      showToast('Error', 'Please enter a tournament name', 'error');
      return;
    }

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({
        name: tournamentName,
        created_by: user.id,
        venue: venue
      })
      .select()
      .single();

    if (error) {
      showToast('Error', error.message, 'error');
    } else if (tournament) {
      navigate(`/tournament/${tournament.id}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user.user_metadata?.full_name || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <ToastProvider>
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <div className="flex items-center justify-center flex-1">
                <Trophy className="w-12 h-12 text-indigo-600" />
              </div>
              <div className="flex items-center gap-4 flex-1 justify-end">
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tournament Brackets Maker</h1>
            <p className="text-gray-600">Create and manage tournaments!</p>
          </header>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Create New Tournament</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Enter tournament name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {VENUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateTournament}
                  disabled={!tournamentName.trim()}
                  className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Tournament
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">All Tournaments</h2>
              <div className="space-y-4">
                {tournaments.map(tournament => (
                  <div
                    key={tournament.id}
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">{tournament.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        tournament.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : tournament.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{tournament.venue}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(tournament.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast className={`${
            toast.variant === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="grid gap-1">
              <ToastTitle className={`${
                toast.variant === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {toast.title}
              </ToastTitle>
              <ToastDescription className={`${
                toast.variant === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {toast.description}
              </ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}

export default HomePage;