import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, ArrowRight, X } from 'lucide-react';
import clsx from 'clsx';

export default function UserSwitcher() {
    const { profiles, activeProfileId, selectProfile } = useStore();
    const activeProfile = profiles.find(p => p.id === activeProfileId);

    const [isOpen, setIsOpen] = useState(false);
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
                    if (isOpen) setLoginProfile(null);
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
                        <div className="p-3 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                                {loginProfile ? 'Enter PIN' : 'Switch Player'}
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto grid grid-cols-1 overflow-x-hidden">
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
                                            className={clsx(
                                                "w-full bg-slate-900 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-game-primary text-center py-2 rounded-xl tracking-widest transition-all",
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
                                        {otherProfiles.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-500 font-bold">
                                                No other profiles found.
                                            </div>
                                        )}
                                        {otherProfiles.map(profile => (
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
                                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                                                        Lv {Math.floor((profile.totalSolved || 0) / 50) + 1}
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
