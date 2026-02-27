import { useState, useRef, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, ArrowRight, X, Search } from 'lucide-react';
import { getLevelInfo } from '../utils/leveling';
import clsx from 'clsx';

export default function UserSwitcher() {
    const { profiles, activeProfileId, selectProfile } = useStore();
    const activeProfile = profiles.find(p => p.id === activeProfileId);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loginProfile, setLoginProfile] = useState(null);
    const [loginPin, setLoginPin] = useState('');
    const [loginError, setLoginError] = useState(false);

    const dropdownRef = useRef(null);
    const pinInputRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setLoginProfile(null);
                setLoginPin('');
                setLoginError(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const otherProfiles = profiles.filter(p => p.id !== activeProfileId);

    const filteredProfiles = useMemo(() => {
        if (!searchQuery.trim()) return otherProfiles;
        const query = searchQuery.toLowerCase();
        return otherProfiles.filter(p => p.name.toLowerCase().includes(query));
    }, [otherProfiles, searchQuery]);

    const handleSelectClick = (profile) => {
        if (!profile.pin) {
            selectProfile(profile.id);
            setIsOpen(false);
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

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginProfile.pin === loginPin) {
            setLoginError(false);
            selectProfile(loginProfile.id);
            setIsOpen(false);
            setLoginProfile(null);
        } else {
            setLoginError(true);
            setLoginPin('');
            if (pinInputRef.current) pinInputRef.current.focus();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (isOpen) {
                        setLoginProfile(null);
                        setSearchQuery('');
                    }
                }}
                className="flex items-center gap-2 p-2 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors shadow-sm"
            >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-game-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-inner">
                    {activeProfile?.name?.[0]?.toUpperCase() || <Users size={16} />}
                </div>
                <Users size={18} className="text-slate-400 mr-1" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-[calc(100%+0.5rem)] w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    >
                        <div className="p-3 bg-slate-900 border-b border-slate-700 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                                    {loginProfile ? 'Enter PIN' : 'Switch Player'}
                                </span>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
                                    <X size={16} />
                                </button>
                            </div>

                            {!loginProfile && otherProfiles.length > 0 && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                        <Search size={14} className="text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-game-primary focus:ring-1 focus:ring-game-primary transition-colors"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                            <AnimatePresence>
                                {loginProfile ? (
                                    <motion.form
                                        key="pin-form"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onSubmit={handleLoginSubmit}
                                        className="col-start-1 row-start-1 p-4 flex flex-col items-center gap-4 w-full"
                                    >
                                        <div className="flex items-center gap-3 w-full border-b border-slate-700 pb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-game-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                                {loginProfile.name[0].toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white text-lg">{loginProfile.name}</span>
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
                                            className={clsx(
                                                "w-full bg-slate-900 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-game-primary text-center py-2 rounded-xl tracking-[0.2em] transition-all",
                                                loginError ? "ring-2 ring-game-error border-game-error bg-red-900/20" : "border border-slate-700"
                                            )}
                                        />
                                        {loginError && <span className="text-xs text-game-error font-bold">Incorrect PIN</span>}

                                        <div className="flex gap-2 w-full mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setLoginProfile(null)}
                                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-bold transition flex justify-center items-center"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loginPin.length !== 4}
                                                className="flex-1 py-2 bg-game-primary hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition flex justify-center items-center gap-2"
                                            >
                                                <Lock size={14} /> Unlock
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="user-list"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, filter: "blur(4px)" }}
                                        className="col-start-1 row-start-1 flex flex-col w-full"
                                    >
                                        {filteredProfiles.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-500 font-bold">
                                                No profiles found.
                                            </div>
                                        )}
                                        {filteredProfiles.map(profile => (
                                            <button
                                                key={profile.id}
                                                onClick={() => handleSelectClick(profile)}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-700 transition w-full text-left border-b border-slate-700/50 last:border-0"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-game-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner relative">
                                                    {profile.name[0].toUpperCase()}
                                                    {profile.pin && (
                                                        <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5">
                                                            <Lock size={10} className="text-game-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white leading-tight">{profile.name}</div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wide flex flex-col mt-0.5">
                                                        <span>Lv {getLevelInfo(profile).level}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={16} className="text-slate-600" />
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => selectProfile(null)}
                                            className="p-3 w-full text-center text-sm font-bold text-game-primary hover:bg-game-primary/10 transition mt-1 bg-slate-900 border-t border-slate-700"
                                        >
                                            Manage Profiles
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
