import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, Trash2 } from 'lucide-react';

export default function ProfileSelector() {
    const { profiles, createProfile, selectProfile, deleteProfile } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (newName.trim()) {
            createProfile(newName.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 space-y-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-game-primary drop-shadow-lg">Who is playing?</h1>
                <p className="text-slate-400">Select your profile to start</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <AnimatePresence>
                    {profiles.map(profile => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative"
                        >
                            <button
                                onClick={() => selectProfile(profile.id)}
                                className="w-full p-4 bg-game-card hover:bg-slate-700 border border-white/5 hover:border-game-primary/50 rounded-2xl flex items-center gap-4 transition-all shadow-lg active:scale-98"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-game-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
                                    {profile.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
                                    <div className="flex gap-3 text-xs font-bold uppercase tracking-wide opacity-80">
                                        <span className="text-purple-300">
                                            Level {Math.floor((profile.totalSolved || 0) / 50) + 1}
                                        </span>
                                        <span className="text-orange-300">
                                            🔥 {profile.streak || 0} Streak
                                        </span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) {
                                        deleteProfile(profile.id);
                                    }
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-700 hover:text-game-error transition-colors"
                            >
                                <Trash2 size={24} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isCreating ? (
                    <motion.form
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleCreate}
                        className="p-4 bg-slate-800/50 rounded-2xl border border-dashed border-slate-600"
                    >
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter Name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-500 focus:outline-none text-center mb-4"
                            maxLength={12}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newName.trim()}
                                className="flex-1 py-2 rounded-xl bg-game-success text-game-dark font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold hover:border-game-primary/50 hover:text-game-primary hover:bg-game-primary/5 transition-all flex items-center justify-center gap-2"
                    >
                        <UserPlus size={24} />
                        Create New Profile
                    </button>
                )}
            </div>
        </div>
    );
}
