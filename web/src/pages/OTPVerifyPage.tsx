import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export default function OTPVerifyPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const verifyOTP = useAuthStore((s) => s.verifyOTP);
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email || '';

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;
        setError('');
        setLoading(true);
        try {
            const isProfileComplete = await verifyOTP(email, code);
            navigate(isProfileComplete ? '/dashboard' : '/setup');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-surface relative">
            <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }} />

            <motion.div
                className="glass-strong rounded-3xl p-8 md:p-12 w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <span className="text-4xl mb-2 block">🔐</span>
                    <h1 className="text-3xl font-bold mb-2">Verify Code</h1>
                    <p className="text-text-muted text-sm">
                        Enter the 6-digit code sent to <br />
                        <span className="text-primary-light font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-3 justify-center">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-surface-3 border border-primary/20 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm text-center">
                            {error}
                        </motion.p>
                    )}

                    <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                        {loading ? '⏳ Verifying...' : '✅ Verify & Continue'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
