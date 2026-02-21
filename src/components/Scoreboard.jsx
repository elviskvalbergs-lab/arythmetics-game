import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, ChevronDown, ChevronUp, AlertCircle, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, isSameDay, isSameWeek, isSameMonth, subDays, isSameYear } from 'date-fns'; // Wait, I removed date-fns. I should restore it or implement custom helpers. Let's do custom helpers to keep deps low.

// --- Helper Date Functions ---
const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

const isThisWeek = (date) => {
    const today = new Date();
    const firstDay = getStartOfWeek(today);
    return date >= firstDay;
};

const isThisMonth = (date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isThisYear = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear();
};
// -----------------------------

export default function Scoreboard() {
    const history = useStore(state => state.getHistory());
    const { setGameState, clearHistory } = useStore();
    const [expandedGameId, setExpandedGameId] = useState(null);
    const [filter, setFilter] = useState('today'); // 'today', 'week', 'month', 'year'

    const toggleExpand = (id) => {
        setExpandedGameId(expandedGameId === id ? null : id);
    };

    const formatDate = (ts) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter History
    const filteredHistory = useMemo(() => {
        const now = new Date();
        return history.filter(game => {
            const date = new Date(game.timestamp);
            if (filter === 'today') return isToday(date);
            if (filter === 'week') return isThisWeek(date);
            if (filter === 'month') return isThisMonth(date);
            if (filter === 'year') return isThisYear(date);
            return true;
        });
    }, [history, filter]);

    // Graph Data
    const graphData = useMemo(() => {
        // Reverse because history is usually stored latest-first in UI list, but graph reads better chronological
        // My store adds to end, so history[0] is oldest.
        // Let's assume history is chronological (old -> new).
        return filteredHistory.map((game, index) => ({
            name: index + 1,
            score: (game.correct / game.total) * 100,
            date: game.timestamp
        }));
    }, [filteredHistory]);


    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col w-full max-w-md mx-auto h-full p-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
            {/* Header / Stats */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setGameState('idle')}
                    className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-white">Your Progress</h1>
                </div>
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to delete all history?')) {
                            clearHistory();
                        }
                    }}
                    className="p-3 bg-slate-800 rounded-xl text-slate-600 hover:bg-game-error hover:text-white transition-colors"
                >
                    <Trash2 size={24} />
                </button>
            </div>

            {/* Gamification Stats Card */}
            <div className="w-full bg-slate-800/50 rounded-2xl p-4 flex justify-around items-center mb-6 border border-white/5">
                <div className="text-center">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Streak</div>
                    <div className="text-2xl font-black text-orange-400 flex items-center gap-1 justify-center">
                        <span className="text-orange-500">🔥</span>
                        {useStore(state => state.getActiveProfile()?.streak || 0)}
                    </div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Level</div>
                    <div className="text-2xl font-black text-purple-400 flex items-center gap-1 justify-center">
                        <span className="text-purple-500">⭐</span>
                        {Math.floor((useStore(state => state.getActiveProfile()?.totalSolved || 0) / 50) + 1)}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
                {['Today', 'Week', 'Month', 'Year'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f.toLowerCase())}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${filter === f.toLowerCase()
                            ? 'bg-game-card text-white shadow'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            {graphData.length > 1 ? (
                <div className="h-48 w-full mb-6 bg-game-card rounded-2xl p-4 border border-white/5 shadow-inner">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Accuracy Trend</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graphData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            {/* <XAxis dataKey="name" hide /> */}
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                formatter={(value) => [`${Math.round(value)}%`, 'Accuracy']}
                                labelFormatter={() => ''}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#38bdf8"
                                strokeWidth={3}
                                dot={{ fill: '#38bdf8', strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, fill: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-48 w-full mb-6 bg-game-card rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-white/5 border-dashed">
                    <Calendar size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Play more games to see the graph!</p>
                </div>
            )}

            {/* History List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 pb-4">
                {[...filteredHistory].reverse().map((game) => {
                    const incorrectProblems = game.problems?.filter(p => !p.isCorrect) || [];
                    const isExpanded = expandedGameId === game.id;

                    return (
                        <div key={game.id} className="bg-game-card rounded-2xl border border-white/5 overflow-hidden transition-all">
                            <div
                                onClick={() => toggleExpand(game.id)}
                                className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-700/50"
                            >
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        {new Date(game.timestamp).toLocaleDateString()} • {formatDate(game.timestamp)}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-2xl font-black ${game.correct === game.total ? 'text-game-success' : 'text-white'}`}>
                                            {game.correct}
                                        </span>
                                        <span className="text-slate-500 font-bold">/</span>
                                        <span className="text-slate-500 font-bold">{game.total}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Speed
                                        </div>
                                        <div className="text-lg font-bold text-game-accent">
                                            {game.avgTime.toFixed(1)}s
                                        </div>
                                    </div>
                                    {incorrectProblems.length > 0 ? (
                                        isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />
                                    ) : (
                                        <div className="w-6" />
                                    )}
                                </div>
                            </div>

                            {/* Detailed Incorrect Answers */}
                            <AnimatePresence>
                                {isExpanded && incorrectProblems.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="bg-slate-900/50 border-t border-white/5"
                                    >
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2 text-game-error text-xs font-bold uppercase tracking-wider">
                                                <AlertCircle size={14} />
                                                Review Mistakes
                                            </div>
                                            {incorrectProblems.map((p, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm font-medium">
                                                    <span className="text-slate-300">
                                                        {p.x} {p.operator} {p.y} = <span className="text-white font-bold">{p.answer}</span>
                                                    </span>
                                                    <span className="text-game-error font-bold flex items-center gap-1">
                                                        {p.userAnswer === -1 ? (
                                                            <>
                                                                <AlertCircle size={14} />
                                                                Timeout
                                                            </>
                                                        ) : (
                                                            `You said: ${p.userAnswer}`
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {filteredHistory.length === 0 && (
                    <div className="text-center text-slate-500 mt-10">
                        <p>No games in this period.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
