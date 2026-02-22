import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

export default function GameScreen() {
    // Use getters
    const settings = useStore(state => state.getSettings());
    const { currentRound, submitAnswer } = useStore();

    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

    const currentProblem = currentRound.problems[currentRound.currentIndex];

    const handleInput = (num) => {
        if (feedback || input.length >= 6) return;
        setInput(prev => prev + num);
    };

    const handleDelete = () => {
        if (feedback) return;
        setInput(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (!input || feedback) return;

        const isCorrect = parseInt(input) === currentProblem.answer;
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        // Slight delay to show feedback before moving on
        setTimeout(() => {
            submitAnswer(input);
            setInput('');
            setFeedback(null);
        }, 1000);
    };

    // Timer Logic
    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(settings.timeLimit > 0 ? settings.timeLimit : null);

    // Reset timer when problem changes
    useEffect(() => {
        if (settings.timeLimit > 0) {
            setTimeLeft(settings.timeLimit);
        } else {
            setTimeLeft(null);
        }
    }, [currentProblem, settings.timeLimit]);

    useEffect(() => {
        if (timeLeft === null || feedback) return;

        if (timeLeft <= 0) {
            setFeedback('incorrect');
            setTimeout(() => {
                submitAnswer('-1');
                setInput('');
                setFeedback(null);
                if (settings.timeLimit > 0) setTimeLeft(settings.timeLimit);
            }, 1000);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, feedback, submitAnswer, settings]);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-[100dvh] p-4 relative pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">

            {/* Progress Bar */}
            <div className="w-full absolute top-0 pt-[max(1.5rem,env(safe-area-inset-top))] px-6 z-10">
                <div className="flex flex-col gap-2 pt-4">
                    {/* Question Progress */}
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-game-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentRound.currentIndex) / settings.tasksPerRound) * 100}%` }}
                        />
                    </div>

                    {/* Timer Progress */}
                    {settings.timeLimit > 0 && timeLeft !== null && (
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-game-error"
                                initial={{ width: '100%' }}
                                animate={{ width: `${(timeLeft / settings.timeLimit) * 100}%` }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-2 text-slate-400 font-bold text-sm">
                    <span>Question {currentRound.currentIndex + 1} of {settings.tasksPerRound}</span>
                    {settings.timeLimit > 0 && (
                        <span className={clsx(timeLeft <= 3 ? "text-game-error animate-pulse" : "text-white")}>
                            {timeLeft}s
                        </span>
                    )}
                </div>
            </div>

            {/* Problem Display */}
            <div className="flex-1 flex flex-col items-center justify-center w-full my-4 md:my-8 pt-[4rem]">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentProblem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center w-full"
                    >
                        {/* Dynamic font sizing */}
                        <div className={clsx(
                            "flex items-center justify-center gap-2 md:gap-6 font-black leading-none text-white tracking-widest drop-shadow-2xl transition-all duration-300",
                            (currentProblem.x.toString().length + currentProblem.y.toString().length) > 4
                                ? "text-[10vw] md:text-[4rem]"
                                : "text-[15vw] md:text-[5rem]"
                        )}>
                            <span>{currentProblem.x}</span>
                            <span className="text-game-accent">{currentProblem.operator}</span>
                            <span>{currentProblem.y}</span>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-4 md:mt-8">
                            <span className="text-[12vw] md:text-[4rem] font-black text-slate-500">=</span>
                            <div className={clsx(
                                "h-[16vw] md:h-24 min-w-[100px] md:min-w-[120px] px-4 md:px-6 rounded-2xl flex items-center justify-center text-[10vw] md:text-[4rem] font-black transition-colors duration-200 border-4",
                                feedback === 'correct' ? "bg-game-success/20 border-game-success text-game-success" :
                                    feedback === 'incorrect' ? "bg-game-error/20 border-game-error text-game-error" :
                                        "bg-slate-800 border-slate-700 text-white"
                            )}>
                                {input}
                                {!input && !feedback && <span className="w-4 h-4 bg-slate-600 rounded-full animate-pulse" />}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Feedback Overlay Animation */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        {feedback === 'correct' ? (
                            <Check size={150} className="text-game-success drop-shadow-[0_0_50px_rgba(74,222,128,0.5)]" strokeWidth={4} />
                        ) : (
                            <X size={150} className="text-game-error drop-shadow-[0_0_50px_rgba(248,113,113,0.5)]" strokeWidth={4} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keypad */}
            {/* Added padding bottom safe env for home indicator */}
            <div className="w-full grid grid-cols-3 gap-2 md:gap-3 mb-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleInput(num.toString())}
                        className="h-14 md:h-16 bg-slate-800 rounded-xl text-3xl font-bold text-white shadow-md active:bg-slate-700 active:scale-95 transition-all outline-none touch-manipulation"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleDelete}
                    className="h-14 md:h-16 bg-slate-800/50 rounded-xl text-xl font-bold text-slate-400 active:bg-slate-700 active:scale-95 transition-all flex items-center justify-center outline-none touch-manipulation"
                >
                    DEL
                </button>
                <button
                    onClick={() => handleInput('0')}
                    className="h-14 md:h-16 bg-slate-800 rounded-xl text-3xl font-bold text-white shadow-md active:bg-slate-700 active:scale-95 transition-all outline-none touch-manipulation"
                >
                    0
                </button>
                <button
                    onClick={handleSubmit}
                    className="h-14 md:h-16 bg-game-primary rounded-xl text-xl font-bold text-white shadow-lg shadow-indigo-900/20 active:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center outline-none touch-manipulation"
                >
                    OK
                </button>
            </div>

        </div>
    );
}
