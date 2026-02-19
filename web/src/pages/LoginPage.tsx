import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email);
            navigate('/verify', { state: { email } });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-surface relative">
            {/* Background glow */}
            <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />

            <motion.div
                className="card-raised rounded-2xl p-8 md:p-12 w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <span className="text-4xl mb-2 block">💜</span>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
                    <p className="text-text-muted">Sign in with your college email</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-text-muted mb-2">College Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@college.edu"
                            className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text placeholder-text-muted/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm">
                            {error}
                        </motion.p>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                        {loading ? '⏳ Sending OTP...' : '📧 Send Verification Code'}
                    </button>
                </form>

                <p className="text-center text-text-muted/60 text-sm mt-6">
                    By signing in, you agree to our Terms and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
