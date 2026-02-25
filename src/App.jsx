import { useStore } from './store/useStore';
import ConfigPanel from './components/ConfigPanel';
import GameScreen from './components/GameScreen';
import SummaryScreen from './components/SummaryScreen';
import Scoreboard from './components/Scoreboard';
import ProfileSelector from './components/ProfileSelector';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { gameState, activeProfileId } = useStore();

  // If no profile is selected, force show the selector
  // We can treat 'idle' state as ConfigPanel ONLY if activeProfileId exists.

  const showProfileSelector = !activeProfileId && gameState !== 'admin_login' && gameState !== 'admin_dashboard';

  return (
    <div className="w-screen h-[100dvh] bg-game-dark flex items-center justify-center overflow-hidden font-sans text-white selection:bg-game-accent selection:text-game-dark">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
        <div className="w-full h-full max-w-lg bg-slate-900/50 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode='wait'>

            {showProfileSelector && (
              <motion.div key="profiles" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}>
                <ProfileSelector />
              </motion.div>
            )}

            {!showProfileSelector && gameState === 'idle' && (
              <motion.div key="config" className="w-full h-full overflow-y-auto" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                <ConfigPanel />
              </motion.div>
            )}

            {!showProfileSelector && gameState === 'playing' && (
              <motion.div key="game" className="w-full h-full" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                <GameScreen />
              </motion.div>
            )}

            {!showProfileSelector && gameState === 'summary' && (
              <motion.div key="summary" className="w-full h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                <SummaryScreen />
              </motion.div>
            )}

            {!showProfileSelector && gameState === 'history' && (
              <motion.div key="history" className="w-full h-full" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <Scoreboard />
              </motion.div>
            )}

            {gameState === 'admin_login' && (
              <motion.div key="admin_login" className="w-full h-full" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
                <AdminLogin />
              </motion.div>
            )}

            {gameState === 'admin_dashboard' && (
              <motion.div key="admin_dashboard" className="w-full h-full" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
                <AdminDashboard />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </GoogleOAuthProvider>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-game-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-game-accent/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}

export default App;
