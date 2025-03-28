import React from 'react';
import { Match } from '../types';
import MatchCard from './MatchCard';

interface BracketProps {
  matches: Match[];
  finalMatch: Match | null;
  onSubmitScores: (matchId: string, scores: [number, number]) => void;
}

function Bracket({ matches, finalMatch, onSubmitScores }: BracketProps) {
  const regularMatches = matches
    .filter(m => m.round === 'regular')
    .sort((a, b) => a.matchNumber - b.matchNumber);
  
  return (
    <div className="space-y-8">
      {finalMatch && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold mb-4">Final Match</h2>
          <MatchCard 
            match={finalMatch}
            onSubmitScores={onSubmitScores}
            tournamentStatus={finalMatch.tournamentStatus}
          />
        </div>
      )}

      {regularMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Regular Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {regularMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSubmitScores={onSubmitScores}
                tournamentStatus={match.tournamentStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Bracket;