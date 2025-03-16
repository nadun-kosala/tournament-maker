import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Team, UserProfile } from '../types';
import { supabase } from '@/lib/supabase';

interface TeamInputProps {
  onAddTeam: (team: Team) => void;
}

function TeamInput({ onAddTeam }: TeamInputProps) {
  const [teamName, setTeamName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      
      if (users) {
        setAvailableUsers(users);
      }
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      const user = availableUsers.find(u => u.id === selectedUserId);
      if (user && !selectedUsers.some(u => u.id === user.id)) {
        setSelectedUsers(prev => [...prev, user]);
        setSelectedUserId('');
      }
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() && selectedUsers.length > 0) {
      const newTeam: Team = {
        id: crypto.randomUUID(),
        name: teamName.trim(),
        members: selectedUsers.map(user => user.id),
        points: 0,
        wins: 0,
        matchesPlayed: 0,
        leadPoints: 0
      };

      onAddTeam(newTeam);
      setTeamName('');
      setSelectedUsers([]);
    }
  };

  const isFormValid = teamName.trim().length > 0 && selectedUsers.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={loadUsers}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
          Team Name
        </label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter team name"
          required
        />
      </div>

      <div>
        <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-1">
          Team Members
        </label>
        <div className="flex gap-2">
          <select
            id="members"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a player</option>
            {availableUsers
              .filter(user => !selectedUsers.some(selected => selected.id === user.id))
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))
            }
          </select>
          <button
            type="button"
            onClick={handleAddMember}
            disabled={!selectedUserId}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full"
            >
              <span className="text-sm">{user.full_name}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(user.id)}
                className="p-1 hover:text-indigo-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full px-4 py-2 rounded-lg text-white font-medium transition
          ${!isFormValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        Add Team
      </button>
    </form>
  );
}

export default TeamInput;