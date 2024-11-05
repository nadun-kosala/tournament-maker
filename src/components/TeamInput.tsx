import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Team } from '../types';

interface TeamInputProps {
  onAddTeam: (team: Team) => void;
}

function TeamInput({ onAddTeam }: TeamInputProps) {
  const [teamName, setTeamName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberInput.trim()) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() && members.length > 0) {
      onAddTeam({
        id: crypto.randomUUID(),
        name: teamName.trim(),
        members,
        score: 0
      });
      setTeamName('');
      setMembers([]);
    }
  };

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
        />
      </div>

      <div>
        <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-1">
          Team Members
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="members"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add team member"
          />
          <button
            type="button"
            onClick={handleAddMember}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {members.map((member, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
            >
              {member}
            </span>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={!teamName || members.length === 0}
        className={`w-full px-4 py-2 rounded-lg text-white font-medium transition
          ${!teamName || members.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        Add Team
      </button>
    </form>
  );
}

export default TeamInput;