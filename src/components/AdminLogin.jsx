import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin() {
    const { setAdmin, setGameState } = useStore();
    const [error, setError] = useState('');

    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userEmail = decoded.email;

            // Allow multiple emails comma-separated from env
            const allowedEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

            if (allowedEmails.includes(userEmail.toLowerCase()) || allowedEmails.length === 0) {
                // For development, if VITE_ADMIN_EMAILS is empty, we could allow it, but better to enforce it:
                if (allowedEmails.length === 0 || !allowedEmails[0]) {
                    setError('Server missing VITE_ADMIN_EMAILS configuration.');
                    return;
                }

                setAdmin(true);
                setGameState('admin_dashboard');
            } else {
                setError(`Access Denied: ${userEmail} is not authorized.`);
            }
        } catch (err) {
            setError('Failed to decode login token.');
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-game-card w-full max-w-sm p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center gap-6"
            >
                <div className="w-16 h-16 bg-red-900/30 text-game-error rounded-full flex items-center justify-center mb-2">
                    <ShieldAlert size={32} />
                </div>

                <h2 className="text-2xl font-black text-white text-center">Admin Access</h2>
                <p className="text-sm text-slate-400 text-center mb-2">
                    Please sign in with an authorized Google account to view analytics.
                </p>

                {error && (
                    <div className="w-full bg-red-900/40 border border-game-error text-game-error text-xs font-bold p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="w-full flex justify-center py-2">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div className="w-full border-t border-slate-700 pt-4 mt-2">
                    <button
                        onClick={() => setGameState('idle')}
                        className="w-full py-3 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
