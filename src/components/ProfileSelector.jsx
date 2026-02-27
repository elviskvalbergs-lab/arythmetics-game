import { useState, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, Trash2, Lock, ArrowLeft, ShieldAlert, Search } from 'lucide-react';
import { getLevelInfo } from '../utils/leveling';

export default function ProfileSelector() {
    const { profiles, createProfile, selectProfile, deleteProfile, setGameState } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [loginProfile, setLoginProfile] = useState(null); // The profile the user wants to log into
    const [loginPin, setLoginPin] = useState('');
    const [loginError, setLoginError] = useState(false);

    const pinInputRef = useRef(null);

    const filteredProfiles = useMemo(() => {
        if (!searchQuery.trim()) return profiles;
        const query = searchQuery.toLowerCase();
        return profiles.filter(p => p.name.toLowerCase().includes(query));
    }, [profiles, searchQuery]);

    const handleCreate = (e) => {
        e.preventDefault();
        if (newName.trim() && newPin.trim().length === 4) {
            createProfile(newName.trim(), newPin.trim());
        }
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginProfile.pin === loginPin) {
            setLoginError(false);
            selectProfile(loginProfile.id);
        } else {
            setLoginError(true);
            setLoginPin('');
            if (pinInputRef.current) pinInputRef.current.focus();
        }
    };

    const handleSelectProfileClick = (profile) => {
        if (!profile.pin) {
            // Legacy profiles without PINs can login directly
            selectProfile(profile.id);
        } else {
            flushSync(() => {
                setLoginProfile(profile);
                setLoginPin('');
                setLoginError(false);
            });
            if (pinInputRef.current) {
                pinInputRef.current.focus();
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-start w-full h-[100dvh] p-4 sm:p-6 space-y-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto">
            <div className="text-center space-y-1 shrink-0 mt-4">
                <h1 className="text-3xl font-black text-game-primary drop-shadow-lg">
                    {loginProfile ? 'Enter PIN' : isCreating ? 'New Player' : 'Who is playing?'}
                </h1>
                <p className="text-slate-400 text-sm">
                    {loginProfile ? `Welcome back, ${loginProfile.name}` : isCreating ? 'Set up your profile' : 'Select your profile to start'}
                </p>
            </div>

            <div className="w-full max-w-sm grid grid-cols-1">
                <AnimatePresence>
                    {loginProfile ? (
                        <motion.form
                            key="login-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleLoginSubmit}
                            className="col-start-1 row-start-1 p-6 bg-game-card rounded-3xl border border-white/5 space-y-6 shadow-xl flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-game-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-inner mb-2">
                                {loginProfile.name[0].toUpperCase()}
                            </div>

                            <input
                                ref={pinInputRef}
                                type="tel"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={4}
                                placeholder="****"
                                value={loginPin}
                                onChange={(e) => {
                                    setLoginPin(e.target.value.replace(/[^0-9]/g, ''));
                                    setLoginError(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && loginPin.length === 4) {
                                        handleLoginSubmit(e);
                                    }
                                }}
                                className={`w-40 bg-slate-900/50 text-4xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-game-primary text-center py-3 rounded-2xl tracking-[0.2em] transition-all ${loginError ? 'ring-2 ring-game-error border-game-error bg-red-900/20' : 'border border-slate-700'}`}
                            />

                            {loginError && <p className="text-game-error text-sm font-bold animate-pulse">Incorrect PIN</p>}

                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    type="button"
                                    onClick={() => setLoginProfile(null)}
                                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors flex items-center justify-center hover:text-white"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loginPin.length !== 4}
                                    className="flex-1 py-3 rounded-xl bg-game-primary text-white font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center gap-2"
                                >
                                    <Lock size={18} />
                                    Unlock
                                </button>
                            </div>
                        </motion.form>

                    ) : isCreating ? (
                        <motion.form
                            key="create-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleCreate}
                            className="col-start-1 row-start-1 p-6 bg-game-card rounded-3xl border border-white/5 space-y-4 shadow-xl"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Player Name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full mt-1 bg-slate-900/50 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-game-primary px-4 py-3 rounded-xl border border-slate-700"
                                        maxLength={12}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">4-Digit PIN</label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        placeholder="****"
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newName.trim() && newPin.length === 4) {
                                                handleCreate(e);
                                            }
                                        }}
                                        className="w-full mt-1 bg-slate-900/50 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-game-primary px-4 py-3 rounded-xl border border-slate-700 tracking-[0.2em]"
                                        maxLength={4}
                                    />
                                    <p className="text-xs text-slate-500 mt-2 ml-1">Pin is required so siblings don't mess up your score!</p>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreating(false); setNewName(''); setNewPin(''); }}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newName.trim() || newPin.length !== 4}
                                    className="flex-1 py-3 rounded-xl bg-game-success text-game-dark font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, filter: "blur(4px)" }}
                            className="col-start-1 row-start-1 space-y-4 w-full flex flex-col"
                        >
                            <div className="flex flex-col gap-3 sticky top-0 z-10 bg-slate-900/90 pb-2 backdrop-blur-sm -mx-2 px-2 pt-2">
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full py-3 border border-game-primary/30 bg-game-primary/10 rounded-xl text-game-primary font-bold hover:bg-game-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <UserPlus size={20} />
                                    Create New Profile
                                </button>

                                {profiles.length > 0 && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={16} className="text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search profiles..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-game-primary focus:ring-1 focus:ring-game-primary transition-colors"
                                        />
                                    </div>
                                )}
                            </div>

                            <motion.div
                                key="userList"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                            >
                                {filteredProfiles.length === 0 ? (
                                    <div className="col-span-1 border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center text-slate-500">
                                        No profiles found.
                                    </div>
                                ) : (
                                    filteredProfiles.map(profile => (
                                        <motion.div
                                            key={profile.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative flex items-center h-full"
                                        >
                                            <button
                                                onClick={() => handleSelectProfileClick(profile)}
                                                className="w-full h-full text-left bg-slate-800 rounded-xl p-2 sm:p-3 transition-all border border-white/5 hover:border-game-primary/50 flex items-center gap-2 sm:gap-3 group shadow-sm"
                                            >
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-game-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-inner relative shrink-0">
                                                    {profile.name[0].toUpperCase()}
                                                    {profile.pin && (
                                                        <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-slate-800">
                                                            <Lock size={10} className="text-game-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <h3 className="text-sm sm:text-base font-bold text-white mb-0.5 truncate leading-tight">{profile.name}</h3>
                                                    {(() => {
                                                        const { level } = getLevelInfo(profile);
                                                        return (
                                                            <div className="flex gap-1.5 sm:gap-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wide opacity-80 truncate">
                                                                <span className="text-purple-300">Level {level}</span>
                                                                <span className="text-slate-500">•</span>
                                                                <span className="text-orange-300">🔥 {profile.streak || 0}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Admin Stealth Button */}
            {!isCreating && (
                <button
                    onClick={() => setGameState('admin_login')}
                    className="absolute bottom-4 right-4 p-3 text-slate-700 hover:text-game-primary rounded-full hover:bg-slate-800 transition-all opacity-50 hover:opacity-100"
                    title="Admin Access"
                >
                    <ShieldAlert size={20} />
                </button>
            )}
        </div>
    );
}
