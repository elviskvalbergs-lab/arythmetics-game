import { useStore } from '../store/useStore';
import { Play, History, Settings2, Sparkles, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import UserSwitcher from './UserSwitcher';
import { getLevelInfo } from '../utils/leveling';

const PRESETS = {
    beginner: { maxNumber: 10, tasksPerRound: 5, timeLimit: 0, allowedOperations: ['+', '-'], label: 'Beginner', icon: Sparkles, color: 'text-green-400' },
    intermediate: { maxNumber: 20, tasksPerRound: 10, timeLimit: 0, allowedOperations: ['+', '-', '*'], label: 'Intermediate', icon: Brain, color: 'text-blue-400' },
    advanced: { maxNumber: 100, tasksPerRound: 15, timeLimit: 10, allowedOperations: ['+', '-', '*', '/'], label: 'Advanced', icon: Zap, color: 'text-purple-400' },
    custom: { label: 'Custom', icon: Settings2, color: 'text-white' }
};

export default function ConfigPanel() {
    const settings = useStore(state => state.getSettings());
    const activeProfile = useStore(state => state.getActiveProfile());
    const { updateSettings, startGame, setGameState } = useStore();

    const handlePresetSelect = (key) => {
        if (key === 'custom') {
            updateSettings({ difficultyPreset: 'custom' });
        } else {
            const p = PRESETS[key];
            updateSettings({
                difficultyPreset: key,
                maxNumber: p.maxNumber,
                tasksPerRound: p.tasksPerRound,
                timeLimit: p.timeLimit,
                allowedOperations: p.allowedOperations
            });
        }
    };

    const toggleOperation = (op) => {
        const current = settings.allowedOperations || ['+', '-'];
        const isIncluded = current.includes(op);
        let newOps;
        if (isIncluded) {
            newOps = current.filter(o => o !== op);
            if (newOps.length === 0) newOps = ['+']; // Prevent empty
        } else {
            newOps = [...current, op];
        }
        updateSettings({ allowedOperations: newOps, difficultyPreset: 'custom' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md mx-auto h-[100dvh] space-y-3 md:space-y-4 p-4 md:p-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
            <div className="w-full flex justify-between items-start mb-1">
                <div className="flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg tracking-tight truncate mr-2">
                        Hi, {activeProfile?.name || 'Player'}!
                    </h1>
                    {activeProfile && (
                        <span className="text-sm font-bold text-game-accent uppercase tracking-wider">Level {getLevelInfo(activeProfile).level}</span>
                    )}
                </div>
                <UserSwitcher />
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
                {Object.entries(PRESETS).map(([key, config]) => {
                    const isActive = settings.difficultyPreset === key;
                    const Icon = config.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => handlePresetSelect(key)}
                            className={clsx(
                                "p-2.5 rounded-xl border-2 transition-all text-left flex items-center gap-2",
                                isActive
                                    ? "bg-game-card border-game-accent shadow-md shadow-indigo-900/20"
                                    : "bg-slate-800/50 border-transparent hover:bg-slate-800 text-slate-400 grayscale hover:grayscale-0"
                            )}
                        >
                            <div className={clsx("p-1.5 rounded-lg bg-slate-900/50 shrink-0", config.color)}>
                                <Icon size={16} />
                            </div>
                            <span className={clsx("text-sm font-bold truncate", isActive ? "text-white" : "text-slate-400")}>
                                {config.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Custom/Detailed Settings Area */}
            <div className="w-full flex-1 min-h-0 bg-game-card p-4 md:p-5 rounded-3xl border border-white/5 flex flex-col justify-evenly">

                {/* Operations Toggles */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Operations</label>
                    <div className="flex gap-2">
                        {['+', '-', '*', '/'].map(op => {
                            const active = settings.allowedOperations?.includes(op);
                            return (
                                <button
                                    key={op}
                                    onClick={() => toggleOperation(op)}
                                    className={clsx(
                                        "flex-1 h-10 rounded-xl text-xl font-black transition-all border-b-4 active:border-b-0 active:translate-y-1",
                                        active
                                            ? "bg-slate-700 text-white border-slate-900"
                                            : "bg-slate-800 text-slate-500 border-slate-900/50 opacity-50"
                                    )}
                                >
                                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3.5 mt-2">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Number Limit</label>
                            <span className="text-lg font-black text-game-success leading-none">{settings.maxNumber}</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="100" step="5"
                            disabled={settings.difficultyPreset !== 'custom'}
                            value={settings.maxNumber}
                            onChange={(e) => updateSettings({ maxNumber: parseInt(e.target.value), difficultyPreset: 'custom' })}
                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-game-success disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Questions</label>
                            <span className="text-lg font-black text-game-primary leading-none">{settings.tasksPerRound}</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="50" step="5"
                            value={settings.tasksPerRound}
                            onChange={(e) => updateSettings({ tasksPerRound: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-game-primary disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Timer (sec)</label>
                            <span className="text-lg font-black text-game-error leading-none">
                                {settings.timeLimit === 0 ? '∞' : settings.timeLimit}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0" max="60" step="5"
                            value={settings.timeLimit}
                            onChange={(e) => updateSettings({ timeLimit: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-game-error disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full mt-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState('history')}
                    className="flex-shrink-0 px-4 md:px-5 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors flex flex-col items-center justify-center gap-1"
                >
                    <History size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Scores</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    className="flex-1 py-4 bg-gradient-to-r from-game-success to-emerald-500 rounded-2xl text-xl font-black text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                    <Play size={24} fill="currentColor" />
                    PLAY
                </motion.button>
            </div>
        </motion.div>
    );
}
