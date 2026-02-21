import { useStore } from '../store/useStore';
import { Play, History, Users, Settings2, Sparkles, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const PRESETS = {
    beginner: { maxNumber: 10, tasksPerRound: 5, timeLimit: 0, allowedOperations: ['+', '-'], label: 'Beginner', icon: Sparkles, color: 'text-green-400' },
    intermediate: { maxNumber: 20, tasksPerRound: 10, timeLimit: 0, allowedOperations: ['+', '-', '*'], label: 'Intermediate', icon: Brain, color: 'text-blue-400' },
    advanced: { maxNumber: 100, tasksPerRound: 15, timeLimit: 10, allowedOperations: ['+', '-', '*', '/'], label: 'Advanced', icon: Zap, color: 'text-purple-400' },
    custom: { label: 'Custom', icon: Settings2, color: 'text-white' }
};

export default function ConfigPanel() {
    const settings = useStore(state => state.getSettings());
    const activeProfile = useStore(state => state.getActiveProfile());
    const { updateSettings, startGame, setGameState, selectProfile } = useStore();

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
            className="flex flex-col items-center w-full max-w-md mx-auto h-full space-y-6 p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(5rem,env(safe-area-inset-bottom))]"
        >
            <div className="w-full flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
                        Hi, {activeProfile?.name || 'Player'}!
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Let's Math!</p>
                </div>
                <button
                    onClick={() => selectProfile(null)}
                    className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                    <Users size={20} />
                </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
                {Object.entries(PRESETS).map(([key, config]) => {
                    const isActive = settings.difficultyPreset === key;
                    const Icon = config.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => handlePresetSelect(key)}
                            className={clsx(
                                "p-4 rounded-2xl border-2 transition-all text-left space-y-2 flex flex-col items-start",
                                isActive
                                    ? "bg-game-card border-game-accent shadow-lg shadow-indigo-900/20"
                                    : "bg-slate-800/50 border-transparent hover:bg-slate-800 text-slate-400 grayscale hover:grayscale-0"
                            )}
                        >
                            <div className={clsx("p-2 rounded-lg bg-slate-900/50", config.color)}>
                                <Icon size={20} />
                            </div>
                            <span className={clsx("text-sm font-bold", isActive ? "text-white" : "text-slate-400")}>
                                {config.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Custom/Detailed Settings Area */}
            <div className="w-full flex-1 overflow-y-auto min-h-0 bg-game-card p-6 rounded-3xl border border-white/5 space-y-6">

                {/* Operations Toggles */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Operations</label>
                    <div className="flex gap-2">
                        {['+', '-', '*', '/'].map(op => {
                            const active = settings.allowedOperations?.includes(op);
                            return (
                                <button
                                    key={op}
                                    onClick={() => toggleOperation(op)}
                                    className={clsx(
                                        "flex-1 h-12 rounded-xl text-2xl font-black transition-all border-b-4 active:border-b-0 active:translate-y-1",
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
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-400 uppercase">Number Limit</label>
                            <span className="text-xl font-black text-game-success">{settings.maxNumber}</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="100" step="5"
                            disabled={settings.difficultyPreset !== 'custom'}
                            value={settings.maxNumber}
                            onChange={(e) => updateSettings({ maxNumber: parseInt(e.target.value), difficultyPreset: 'custom' })}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-game-success disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-400 uppercase">Questions</label>
                            <span className="text-xl font-black text-game-primary">{settings.tasksPerRound}</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="50" step="5"
                            disabled={settings.difficultyPreset !== 'custom'}
                            value={settings.tasksPerRound}
                            onChange={(e) => updateSettings({ tasksPerRound: parseInt(e.target.value), difficultyPreset: 'custom' })}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-game-primary disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-400 uppercase">Timer (sec)</label>
                            <span className="text-xl font-black text-game-error">
                                {settings.timeLimit === 0 ? '∞' : settings.timeLimit}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0" max="60" step="5"
                            disabled={settings.difficultyPreset !== 'custom'}
                            value={settings.timeLimit}
                            onChange={(e) => updateSettings({ timeLimit: parseInt(e.target.value), difficultyPreset: 'custom' })}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-game-error disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState('history')}
                    className="flex-1 py-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                >
                    <History size={24} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    className="flex-[3] py-4 bg-gradient-to-r from-game-success to-emerald-500 rounded-2xl text-xl font-black text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                    <Play size={28} fill="currentColor" />
                    PLAY
                </motion.button>
            </div>
        </motion.div>
    );
}
