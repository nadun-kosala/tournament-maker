import { Team, Match } from '../types';

export function generateRoundRobinMatches(teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchCounter = 1;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: crypto.randomUUID(),
        teams: [teams[i], teams[j]],
        scores: [null, null],
        isCompleted: false,
        round: 'regular',
        matchNumber: matchCounter++
      });
    }
  }

  return matches;
}

export function calculateTeamStats(matches: Match[]): Team[] {
  const teamStats = new Map<string, Team>();

  // Initialize team stats
  matches.forEach(match => {
    match.teams.forEach(team => {
      if (team && !teamStats.has(team.id)) {
        teamStats.set(team.id, {
          ...team,
          points: 0,
          wins: 0,
          matchesPlayed: 0,
          leadPoints: 0
        });
      }
    });
  });

  // Calculate stats from completed matches
  matches.filter(m => m.isCompleted && m.round === 'regular').forEach(match => {
    const [teamA, teamB] = match.teams;
    const [scoreA, scoreB] = match.scores;

    if (teamA && teamB && scoreA !== null && scoreB !== null) {
      const statsA = teamStats.get(teamA.id)!;
      const statsB = teamStats.get(teamB.id)!;

      statsA.matchesPlayed++;
      statsB.matchesPlayed++;
      
      statsA.points += scoreA;
      statsB.points += scoreB;

      // Calculate point difference and update wins/leadPoints
      const pointDifference = Math.abs(scoreA - scoreB);
      if (scoreA > scoreB) {
        statsA.wins++;
        statsA.leadPoints += pointDifference;
        match.pointDifference = pointDifference;
        match.winner = teamA.id;
      } else if (scoreB > scoreA) {
        statsB.wins++;
        statsB.leadPoints += pointDifference;
        match.pointDifference = pointDifference;
        match.winner = teamB.id;
      }

      teamStats.set(teamA.id, statsA);
      teamStats.set(teamB.id, statsB);
    }
  });

  return Array.from(teamStats.values());
}

export function getTopTeams(teams: Team[], count: number = 2): Team[] {
  return [...teams].sort((a, b) => {
    // Sort primarily by wins
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    // If wins are equal, sort by lead points
    if (b.leadPoints !== a.leadPoints) {
      return b.leadPoints - a.leadPoints;
    }
    // If lead points are equal, sort by total points
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // If everything is equal, sort by matches played (fewer is better)
    return a.matchesPlayed - b.matchesPlayed;
  }).slice(0, count);
}

export function generateFinalMatch(topTeams: Team[]): Match {
  return {
    id: crypto.randomUUID(),
    teams: [topTeams[0] || null, topTeams[1] || null],
    scores: [null, null],
    isCompleted: false,
    round: 'final',
    matchNumber: 1
  };
}