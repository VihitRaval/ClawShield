import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', {
                identifier: identifier
            });
            setShowOtp(true);
            toast.info('Password reset OTP sent to your email.');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP. Invalid email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords don't match");
        }
        setLoading(true);
        const code = otp.join('');
        try {
            await api.post('/auth/reset-password', {
                identifier: identifier,
                code: code,
                new_password: newPassword
            });
            toast.success('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid OTP or failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (showOtp) {
        return (
            <div className="auth-container">
                <div className="auth-card glass">
                    <div className="auth-header">
                        <div className="logo-icon glass"><ShieldCheck size={24} color="var(--success)" /></div>
                        <h1>Reset Password</h1>
                        <p>Enter the 6-digit code sent to {identifier}</p>
                    </div>
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="otp-inputs">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    className="otp-field glass"
                                    required
                                />
                            ))}
                        </div>
                        <div className="input-group" style={{ marginTop: '20px' }}>
                            <Lock size={18} className="input-icon" />
                            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginTop: '15px' }}>
                            <Lock size={18} className="input-icon" />
                            <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '25px' }}>
                            {loading ? 'Resetting...' : 'Set New Password'}
                        </button>
                    </form>
                </div>
                <style>{`
                  .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent), radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent); }
                  .auth-card { width: 100%; max-width: 420px; padding: 40px; border-radius: var(--radius-lg); text-align: center; }
                  .logo-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border-radius: var(--radius-md); }
                  .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 10px 0; }
                  .otp-field { width: 45px; height: 55px; font-size: 24px; text-align: center; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-primary); }
                  .otp-field:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
                  .input-group { position: relative; display: flex; align-items: center; }
                  .input-icon { position: absolute; left: 14px; color: var(--text-muted); }
                  .input-group input { width: 100%; padding: 14px 14px 14px 45px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); transition: var(--transition); }
                  .input-group input:focus { border-color: var(--accent-primary); background: rgba(255, 255, 255, 0.05); }
                  .auth-btn { width: 100%; background: var(--accent-primary); color: white; padding: 14px; border-radius: var(--radius-md); font-weight: 600; }
                  .auth-btn:hover { background: var(--accent-secondary); transform: translateY(-2px); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="logo-icon glass"><KeyRound size={24} color="var(--accent-primary)" /></div>
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive a reset code</p>
                </div>
                <form onSubmit={handleRequestOtp} className="auth-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input type="email" placeholder="Email Address" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '20px' }}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
                <p className="auth-footer" style={{ marginTop: '25px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Remembered your password? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign In</Link>
                </p>
            </div>
            <style>{`
              .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent), radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent); }
              .auth-card { width: 100%; max-width: 420px; padding: 40px; border-radius: var(--radius-lg); text-align: center; }
              .logo-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border-radius: var(--radius-md); }
              .input-group { position: relative; display: flex; align-items: center; }
              .input-icon { position: absolute; left: 14px; color: var(--text-muted); }
              .input-group input { width: 100%; padding: 14px 14px 14px 45px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); transition: var(--transition); }
              .input-group input:focus { border-color: var(--accent-primary); background: rgba(255, 255, 255, 0.05); }
              .auth-btn { width: 100%; background: var(--accent-primary); color: white; padding: 14px; border-radius: var(--radius-md); font-weight: 600; }
              .auth-btn:hover { background: var(--accent-secondary); transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
