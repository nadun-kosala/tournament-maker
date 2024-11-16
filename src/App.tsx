import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target } from 'lucide-react';
import TeamInput from './components/TeamInput';
import Bracket from './components/Bracket';
import TeamStats from './components/TeamStats';
import { Team, Match } from './types';
import {
generateRoundRobinMatches,
calculateTeamStats,
getTopTeams,
generateFinalMatch
} from './utils/bracketUtils';
import FinalMatchCard from './components/FinalMatchCard';


function App() {
const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
        const [finalMatch, setFinalMatch] = useState<Match | null>(null);
            const [isProcessing, setIsProcessing] = useState(false);
            const [finalTeam, setFinalTeam] = useState<Team | null>(null);

                const handleAddTeam = (team: Team) => {
                setTeams([...teams, { ...team, points: 0, wins: 0, matchesPlayed: 0 }]);
                };

                const handleRemoveTeam = (id: string) => {
                setTeams(teams.filter(team => team.id !== id));
                setMatches([]);
                setFinalMatch(null);
                };

                const handleGenerateMatches = () => {
                setIsProcessing(true);
                setTimeout(() => {
                const generatedMatches = generateRoundRobinMatches(teams);
                setMatches(generatedMatches);
                setFinalMatch(null);
                setIsProcessing(false);
                }, 1000);
                };

                const handleSubmitScores = (matchId: string, scores: [number, number]) => {
                const updatedMatches = matches.map(match => {
                if (match.id === matchId) {
                return { ...match, scores, isCompleted: true };
                }
                return match;
                });
                setMatches(updatedMatches);

                const updatedTeams = calculateTeamStats(updatedMatches);
                const allRegularMatchesCompleted = updatedMatches
                .filter(m => m.round === 'regular')
                .every(m => m.isCompleted);

                if (allRegularMatchesCompleted && !finalMatch) {
                const topTeams = getTopTeams(updatedTeams, 2);
                setFinalMatch(generateFinalMatch(topTeams));
                }

                if(finalMatch){
                const s1 = scores[0];
                const s2 = scores[1];
                if(s1 > s2){
                setFinalTeam(finalMatch.teams[0])
                }else{
                setFinalTeam(finalMatch.teams[1])
                }}};

                return (
                <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div className="container mx-auto px-4 py-8">
                        <header className="text-center mb-12">
                            <div className="flex items-center justify-center mb-4">
                                <Trophy className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tournament Brackets Maker</h1>
                            <p className="text-gray-600">Create teams, play matches, and find the champion!</p>
                        </header>
                        {finalMatch && finalTeam ?
                        <FinalMatchCard finalMatch={finalMatch} finalTeam={finalTeam} /> : null
                        }

                        <div className="grid lg:grid-cols-[350px,1fr] gap-8">
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        <h2 className="text-xl font-semibold">Teams</h2>
                                    </div>

                                    <TeamInput onAddTeam={handleAddTeam} />

                                    <div className="mt-6 space-y-3">
                                        {teams.map(team => (
                                        <div key={team.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div>
                                                <h3 className="font-medium text-gray-800">{team.name}</h3>
                                                <p className="text-sm text-gray-500">{team.members.join(', ')}</p>
                                            </div>
                                            <button onClick={()=> handleRemoveTeam(team.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                <Target className="w-5 h-5" />
                                            </button>
                                        </div>
                                        ))}
                                    </div>

                                    <button onClick={handleGenerateMatches} disabled={teams.length < 2 || isProcessing
                                        || matches.length> 0}
                                        className={`mt-6 w-full flex items-center justify-center gap-2 px-4 py-2
                                        rounded-lg text-white font-medium transition
                                        ${teams.length < 2 || matches.length> 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                            >
                                            {isProcessing ? (
                                            <div
                                                className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            ) : (
                                            'Generate Matches'
                                            )}
                                    </button>
                                </div>

                                {matches.length > 0 && (
                                <TeamStats teams={calculateTeamStats(matches)} />
                                )}
                            </div>

                            <div className="space-y-8">
                                <Bracket matches={matches} finalMatch={finalMatch}
                                    onSubmitScores={handleSubmitScores} />
                            </div>
                        </div>
                        <footer className="gap-2 p-4 mt-10 opacity-50">
                            <div className="flex items-center justify-center">
                                <div className="text-sm">
                                    <span>&copy; {new Date().getFullYear()} - Developed by Nadun Kosala</span>
                                </div>
                                <div className="flex justify-start gap-2 ml-5">
                                    <a href="https://github.com/nadun-kosala" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-900">
                                        GitHub
                                    </a>
                                    <a href="https://kosala.pages.dev" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-900">
                                        Website
                                    </a>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
                );
                }

                export default App;
