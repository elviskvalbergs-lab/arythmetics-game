import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateProblem } from '../utils/GameEngine';
import { safeUUID } from '../utils/uuid';

const DEFAULT_SETTINGS = {
    maxNumber: 10,
    tasksPerRound: 10,
    timeLimit: 0,
    allowedOperations: ['+', '-'],
    difficultyPreset: 'custom', // 'beginner', 'intermediate', 'advanced', 'custom'
};

export const useStore = create(
    persist(
        (set, get) => ({
            // Profiles
            profiles: [],
            activeProfileId: null,

            // Actions
            createProfile: (name, pin) => {
                const newProfile = {
                    id: safeUUID(),
                    name,
                    pin: pin || '', // store 4 digit pin, empty if none
                    settings: { ...DEFAULT_SETTINGS },
                    history: [],
                    streak: 0,
                    lastPlayedDate: null,
                    totalSolved: 0,
                    totalCorrect: 0,
                };
                set(state => ({
                    profiles: [...state.profiles, newProfile],
                    activeProfileId: newProfile.id,
                    gameState: 'idle'
                }));
            },

            // selectProfile only sets the ID, the UI will verify the PIN before calling this
            selectProfile: (id) => set({ activeProfileId: id, gameState: 'idle' }),

            deleteProfile: (id) => {
                set(state => {
                    const newProfiles = state.profiles.filter(p => p.id !== id);
                    const newActiveId = state.activeProfileId === id ? null : state.activeProfileId;
                    return { profiles: newProfiles, activeProfileId: newActiveId };
                });
            },

            // Helpers to get *active* data (Internal use mostly)
            getActiveProfile: () => {
                const { profiles, activeProfileId } = get();
                return profiles.find(p => p.id === activeProfileId);
            },

            // Settings (Proxied to active profile)
            getSettings: () => {
                const profile = get().getActiveProfile();
                return profile ? profile.settings : DEFAULT_SETTINGS;
            },

            updateSettings: (newSettings) =>
                set(state => {
                    if (!state.activeProfileId) return state;
                    return {
                        profiles: state.profiles.map(p =>
                            p.id === state.activeProfileId
                                ? { ...p, settings: { ...p.settings, ...newSettings } }
                                : p
                        )
                    };
                }),

            // History (Proxied to active profile)
            getHistory: () => {
                const profile = get().getActiveProfile();
                return profile ? profile.history : [];
            },

            addToHistory: (roundStats) =>
                set(state => {
                    if (!state.activeProfileId) return state;
                    return {
                        profiles: state.profiles.map(p =>
                            p.id === state.activeProfileId
                                ? { ...p, history: [...p.history, roundStats] }
                                : p
                        )
                    };
                }),

            clearHistory: () =>
                set(state => {
                    if (!state.activeProfileId) return state;
                    return {
                        profiles: state.profiles.map(p =>
                            p.id === state.activeProfileId
                                ? { ...p, history: [] }
                                : p
                        )
                    };
                }),

            // Game State (Global is fine, or reset on profile switch)
            gameState: 'idle',
            setGameState: (state) => set({ gameState: state }),

            currentRound: {
                problems: [],
                currentIndex: 0,
                startTime: null,
            },

            startGame: () => {
                const settings = get().getSettings();
                const firstProblem = generateProblem(settings);
                set({
                    gameState: 'playing',
                    currentRound: {
                        problems: [firstProblem],
                        currentIndex: 0,
                        startTime: Date.now(),
                    }
                });
            },

            submitAnswer: (userAnswer) => {
                const { currentRound } = get();
                const settings = get().getSettings();
                const currentProblem = currentRound.problems[currentRound.currentIndex];
                const isCorrect = parseInt(userAnswer) === currentProblem.answer;
                const endTime = Date.now();
                const timeTaken = (endTime - currentProblem.startTime) / 1000;

                const updatedProblem = {
                    ...currentProblem,
                    userAnswer: parseInt(userAnswer),
                    isCorrect,
                    timeTaken,
                };

                const updatedProblems = [...currentRound.problems];
                updatedProblems[currentRound.currentIndex] = updatedProblem;

                if (currentRound.currentIndex + 1 >= settings.tasksPerRound) {
                    // Round Over
                    const correctCount = updatedProblems.filter(p => p.isCorrect).length;
                    const totalTime = updatedProblems.reduce((acc, p) => acc + p.timeTaken, 0);

                    const roundStats = {
                        id: safeUUID(),
                        timestamp: Date.now(),
                        total: settings.tasksPerRound,
                        correct: correctCount,
                        avgTime: totalTime / settings.tasksPerRound,
                        settings: { ...settings },
                        problems: updatedProblems // Now saving persistent detailed history!
                    };

                    get().addToHistory(roundStats);

                    // Update Streak and Total Solved
                    set(state => {
                        const today = new Date().toDateString();
                        const profile = state.profiles.find(p => p.id === state.activeProfileId);
                        if (!profile) return {};

                        let newStreak = profile.streak || 0;
                        const lastDate = profile.lastPlayedDate ? new Date(profile.lastPlayedDate).toDateString() : null;

                        // Check if streak continues
                        if (lastDate !== today) {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);

                            if (lastDate === yesterday.toDateString()) {
                                newStreak += 1;
                            } else {
                                newStreak = 1; // Reset or Start new
                            }
                        }

                        // Update profile stats
                        return {
                            profiles: state.profiles.map(p =>
                                p.id === state.activeProfileId
                                    ? {
                                        ...p,
                                        streak: newStreak,
                                        lastPlayedDate: Date.now(),
                                        totalSolved: (p.totalSolved || 0) + settings.tasksPerRound,
                                        totalCorrect: (p.totalCorrect || 0) + correctCount
                                    }
                                    : p
                            )
                        };
                    });

                    set((state) => ({
                        currentRound: { ...state.currentRound, problems: updatedProblems },
                        gameState: 'summary'
                    }));
                } else {
                    // Next Problem
                    const nextProblem = generateProblem(settings);
                    set({
                        currentRound: {
                            problems: [...updatedProblems, nextProblem],
                            currentIndex: currentRound.currentIndex + 1,
                            startTime: currentRound.startTime
                        }
                    });
                }
            },

            resetGame: () => set({ gameState: 'idle', currentRound: { problems: [], currentIndex: 0, startTime: null } })
        }),
        {
            name: 'arithmetic-game-db', // Key used in DB
            storage: {
                getItem: async (name) => {
                    const { remoteStorage } = await import('../api/storage');
                    return remoteStorage.getItem(name);
                },
                setItem: async (name, value) => {
                    const { remoteStorage } = await import('../api/storage');
                    return remoteStorage.setItem(name, value);
                },
                removeItem: () => { }
            },
            partialize: (state) => ({ profiles: state.profiles }),
        }
    )
);
