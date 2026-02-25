import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Trophy, Star } from 'lucide-react';
import UserSwitcher from './UserSwitcher';
import { getLevelInfo } from '../utils/leveling';
export default function SummaryScreen() {
    const { setGameState, startGame } = useStore();
    const history = useStore(state => {
        const profile = state.profiles.find(p => p.id === state.activeProfileId);
        return profile ? profile.history : [];
    });
    const lastRound = history[history.length - 1];

    if (!lastRound) return null;

    const accuracy = Math.round((lastRound.correct / lastRound.total) * 100);
    const isGreatSuccess = accuracy >= 80;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 p-6 text-center pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] relative"
        >
            {/* Quick User Switcher on absolute top right */}
            <div className="absolute top-[max(1.5rem,env(safe-area-inset-top))] right-4 z-50">
                <UserSwitcher />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-300">Round Complete!</h2>
                <h1 className="text-6xl font-black text-white drop-shadow-xl tracking-tight">
                    {lastRound.correct} <span className="text-3xl text-slate-500">/</span> {lastRound.total}
                </h1>
            </div>

            <div className="w-full bg-game-card rounded-3xl p-6 md:p-8 space-y-6 border border-white/5 shadow-2xl">
                {/* Level Progress Section */}
                {(() => {
                    const profile = useStore(state => state.getActiveProfile());
                    if (!profile) return null;
                    const { level, pointsNeeded } = getLevelInfo(profile);
                    const pointsEarned = lastRound.correct;

                    return (
                        <div className="py-4 border-b border-white/10 flex flex-col items-center justify-center gap-2 mb-2">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Star className="fill-purple-500" size={24} />
                                <span className="text-2xl font-black">Level {level}</span>
                            </div>

                            <div className="flex flex-col items-center gap-1 mt-1">
                                <span className="text-game-success font-bold text-lg">+{pointsEarned} Points Earned!</span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{pointsNeeded} pts to next level</span>
                            </div>
                        </div>
                    );
                })()}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-slate-400 font-medium text-xs uppercase tracking-wide">Accuracy</p>
                        <div className="text-3xl font-black text-game-accent">{accuracy}%</div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-slate-400 font-medium text-xs uppercase tracking-wide">Avg Speed</p>
                        <div className="text-3xl font-black text-game-warning text-yellow-500">
                            {lastRound.avgTime.toFixed(1)}s
                        </div>
                    </div>
                </div>
            </div>

            {isGreatSuccess && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 text-game-success font-black text-2xl"
                >
                    <Trophy size={32} fill="currentColor" />
                    <span>AMAZING JOB!</span>
                </motion.div>
            )}

            <div className="flex flex-col w-full space-y-3">
                <button
                    onClick={startGame}
                    className="w-full py-5 bg-game-primary rounded-2xl text-2xl font-bold text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
                >
                    <RotateCcw size={28} />
                    Play Again
                </button>

                <button
                    onClick={() => setGameState('history')}
                    className="w-full py-4 bg-slate-800 rounded-2xl text-lg font-bold text-white hover:bg-slate-700 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Trophy size={24} />
                    See Results
                </button>

                <button
                    onClick={() => setGameState('idle')}
                    className="w-full py-3 bg-transparent border border-white/5 rounded-2xl text-base font-bold text-slate-500 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Home size={20} />
                    Back to Menu
                </button>
            </div>

        </motion.div>
    );
}
