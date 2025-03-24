import React, { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { supabase } from "@/lib/supabase";

interface PDFProps {
  finalMatch?: any;
  finalTeam: any;
  matches: any;
  teams: any;
  tournament: any;
}

export const PDF = ({
  finalMatch,
  finalTeam,
  matches,
  teams,
  tournament
}: PDFProps) => {
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: UserProfile[] }>({});

  useEffect(() => {
    loadTeamMembers();
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + '';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full">
      {/* Date Section */}
      <p className="text-gray-600 text-sm text-right mb-4">
        Date: {formatDate(new Date())}
      </p>
      <div className="mt-5">
        <h1 className="text-[25px] font-bold text-gray-800 bg-cyan-400 p-2 rounded-lg">
          Tournament Summary
        </h1>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-800">Tournament Details</h2>
        <div className="mt-2 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700"><strong>Name:</strong> {tournament.name}</p>
          <p className="text-gray-700"><strong>Venue:</strong> {tournament.venue}</p>
          <p className="text-gray-700"><strong>Status:</strong> {tournament.status}</p>
          <p className="text-gray-700"><strong>Date:</strong> {formatDate(new Date(tournament.created_at))}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
          Teams
        </h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {teams.map((team: any, index: number) => (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <p className="text-lg font-bold text-blue-700 mb-2">
                Team: {team.name}
              </p>
              <ul className="list-disc list-inside text-gray-700">
                {teamMembers[team.id]?.map((member: UserProfile) => (
                  <li key={member.id} className="text-sm font-medium">
                    {member.full_name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 mt-5 pt-2">
        <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
          Final Match
        </h3>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <p className="text-gray-700 font-medium my-2">
            Teams:
            <span className="font-semibold"> {finalMatch.teams[0].name} </span>
            vs
            <span className="font-semibold"> {finalMatch.teams[1].name}</span>
          </p>
          <p className="text-gray-700 font-medium my-2">
            Winner:
            <span className="font-bold text-green-600"> Team {finalTeam.name}</span>
          </p>
          <p className="text-gray-700 font-medium my-2">
            Total Points:
            <span className="font-bold text-blue-600"> {finalTeam.lead_points}+</span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
          Regular Matches
        </h3>
        <div className="mt-4 space-y-6">
          {matches.map((match: any) => (
            <div key={match.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                Match {match.matchNumber}
              </h4>
              <p className="text-gray-700 font-medium my-2">
                Teams:
                <span className="font-semibold"> {match.teams[0].name} </span>
                vs
                <span className="font-semibold"> {match.teams[1].name}</span>
              </p>
              <p className="text-gray-700 font-medium my-2">
                Scores:
                <span className="font-semibold"> {match.scores[0]} </span>
                -
                <span className="font-semibold"> {match.scores[1]}</span>
              </p>
              <p className="text-gray-700 font-medium my-2">
                Winner:
                <span className="font-bold text-green-600">
                  Team {match.teams.find((team: any) => team.id === match.winner)?.name}
                </span>
              </p>
              <p className="text-gray-700 font-medium my-2">
                Point For Winning Team:
                <span className="font-bold text-blue-600"> {match.pointDifference}+</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};