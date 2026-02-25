import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { getLevelInfo } from '../utils/leveling';

export default function AdminDashboard() {
    const { profiles, setGameState, isAdmin } = useStore();

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-game-error font-bold mb-4">Unauthorized Access</p>
                <button onClick={() => setGameState('idle')} className="btn-primary">Return Home</button>
            </div>
        );
    }

    // Aggregate Stats
    const totalProfiles = profiles.length;
    let globalTotalQuestions = 0;
    let globalTotalCorrect = 0;
    let globalTotalTime = 0;
    let globalTotalRounds = 0;

    profiles.forEach(p => {
        p.history?.forEach(round => {
            globalTotalQuestions += round.total || 0;
            globalTotalCorrect += round.correct || 0;
            globalTotalRounds += 1;
            globalTotalTime += (round.avgTime || 0) * (round.total || 0);
        });
    });

    const globalAccuracy = globalTotalQuestions > 0 ? ((globalTotalCorrect / globalTotalQuestions) * 100).toFixed(1) : 0;
    const globalAvgSpeed = globalTotalQuestions > 0 ? (globalTotalTime / globalTotalQuestions).toFixed(1) : 0;

    // Leaderboard Data
    const leaderboard = [...profiles].sort((a, b) => {
        const aPoints = getLevelInfo(a).points;
        const bPoints = getLevelInfo(b).points;
        if (bPoints !== aPoints) return bPoints - aPoints; // Most points first
        return (b.streak || 0) - (a.streak || 0); // Tie breaker: Streak
    });

    return (
        <div className="flex flex-col w-full h-full bg-game-dark">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 pt-[max(1rem,env(safe-area-inset-top))]">
                <button
                    onClick={() => setGameState('idle')}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-black tracking-widest uppercase text-white hidden sm:block">Admin Dashboard</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-[max(2rem,env(safe-area-inset-bottom))]">

                {/* Overview Cards */}
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Global Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                        <Users className="text-blue-400 mb-2" size={24} />
                        <span className="text-3xl font-black text-white">{totalProfiles}</span>
                        <span className="text-xs text-slate-400 uppercase font-bold">Total Players</span>
                    </div>
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                        <CheckCircle2 className="text-emerald-400 mb-2" size={24} />
                        <span className="text-3xl font-black text-white">{globalAccuracy}%</span>
                        <span className="text-xs text-slate-400 uppercase font-bold">Avg Accuracy</span>
                    </div>
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                        <Trophy className="text-orange-400 mb-2" size={24} />
                        <span className="text-3xl font-black text-white">{globalTotalRounds}</span>
                        <span className="text-xs text-slate-400 uppercase font-bold">Rounds Played</span>
                    </div>
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                        <Clock className="text-purple-400 mb-2" size={24} />
                        <span className="text-3xl font-black text-white">{globalAvgSpeed}s</span>
                        <span className="text-xs text-slate-400 uppercase font-bold">Avg Speed / Q</span>
                    </div>
                </div>

                {/* Leaderboard Detail */}
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mt-8">Player Leaderboard</h2>

                <div className="space-y-3">
                    {leaderboard.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No players yet.</p>
                    ) : (
                        leaderboard.map((player, index) => {
                            const { level, points } = getLevelInfo(player);
                            // Calculate player specific stats
                            let pQs = 0, pCorrect = 0;
                            player.history?.forEach(r => {
                                pQs += (r.total || 0);
                                pCorrect += (r.correct || 0);
                            });
                            const pAccuracy = pQs > 0 ? ((pCorrect / pQs) * 100).toFixed(0) : 0;

                            return (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-game-card rounded-2xl p-4 border border-white/5 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-xl font-black border border-slate-600 shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white truncate">{player.name}</h3>
                                            <span className="text-game-accent font-bold">Lv {level}</span>
                                        </div>
                                        <div className="flex text-xs text-slate-400 font-bold uppercase justify-between mt-1">
                                            <span>{points} pts / {player.streak || 0}🔥</span>
                                            <span>{pAccuracy}% Acc</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

            </div>
        </div>
    );
}
