import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Trophy, Clock, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getLevelInfo } from '../utils/leveling';
import { isToday, isThisWeek, isThisMonth, isThisYear } from '../utils/dates';

export default function AdminDashboard() {
    const { profiles, setGameState, isAdmin, deleteProfile } = useStore();
    const [filter, setFilter] = useState('today');

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

    // Graph Data Aggregation
    const graphData = useMemo(() => {
        // Collect all games from all profiles
        let allGames = [];
        profiles.forEach(p => {
            if (p.history) {
                p.history.forEach(game => {
                    allGames.push({ ...game, profileId: p.id });
                });
            }
        });

        // Filter by time
        const filtered = allGames.filter(game => {
            const date = new Date(game.timestamp);
            if (filter === 'today') return isToday(date);
            if (filter === 'week') return isThisWeek(date);
            if (filter === 'month') return isThisMonth(date);
            if (filter === 'year') return isThisYear(date);
            return true;
        });

        // Sort chronologically
        filtered.sort((a, b) => a.timestamp - b.timestamp);

        // Group by time bucket
        const grouped = {};
        filtered.forEach(game => {
            const date = new Date(game.timestamp);
            let key;
            if (filter === 'today') key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Group by minute/hour
            else if (filter === 'week' || filter === 'month') key = date.toLocaleDateString([], { month: 'short', day: 'numeric' }); // Group by day
            else key = date.toLocaleDateString([], { year: 'numeric', month: 'short' }); // Group by month

            if (!grouped[key]) {
                grouped[key] = { name: key, games: 0, activeUsers: new Set() };
            }
            grouped[key].games += 1;
            grouped[key].activeUsers.add(game.profileId);
        });

        return Object.values(grouped).map(bucket => ({
            name: bucket.name,
            games: bucket.games,
            activeUsers: bucket.activeUsers.size
        }));
    }, [profiles, filter]);

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

                {/* Filter Tabs */}
                <div className="flex p-1 bg-slate-800 rounded-xl mb-4">
                    {['Today', 'Week', 'Month', 'Year'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === f.toLowerCase()
                                ? 'bg-game-primary text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Graph */}
                <div className="w-full bg-slate-800/30 border border-white/5 rounded-2xl p-4 h-48 sm:h-64 flex flex-col items-center justify-center">
                    {graphData.length === 0 ? (
                        <div className="text-center text-slate-500 flex flex-col items-center gap-2">
                            <Clock size={32} className="opacity-50" />
                            <span className="text-sm font-bold">No activity in this period.</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    cursor={{ stroke: '#475569' }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="games" name="Games Played" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Overview Cards */}
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mt-8">Global Overview</h2>
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
                                        <div className="flex text-[10px] text-slate-500 font-bold uppercase justify-between mt-1 pt-1 border-t border-white/5">
                                            <span>{player.history?.length || 0} Games Played</span>
                                            <span>
                                                {player.history?.length > 0
                                                    ? new Date(Math.max(...player.history.map(r => r.timestamp))).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : 'Never Played'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete profile "${player.name}"? This cannot be undone.`)) {
                                                deleteProfile(player.id);
                                            }
                                        }}
                                        className="p-2 text-slate-600 hover:text-game-error bg-slate-800 hover:bg-red-900/20 rounded-xl transition-all ml-2 shrink-0"
                                        title="Delete Player"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            )
                        })
                    )}
                </div>

            </div>
        </div>
    );
}
