import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'Guest'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        setLoading(true);
        const names = formData.name.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || '';
        try {
            await api.post('/auth/register', {
                first_name: firstName,
                last_name: lastName,
                email: formData.email,
                mobile: formData.phone || null,
                password: formData.password
            });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="logo-icon glass"><UserPlus size={24} color="var(--accent-primary)" /></div>
                    <h1>Create Account</h1>
                    <p>Join the OpenClaw Agent Network</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-row">
                        <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <Phone size={18} className="input-icon" />
                        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <select name="role" value={formData.role} onChange={handleChange} className="glass">
                            <option value="Admin">Admin</option>
                            <option value="Developer">Developer</option>
                            <option value="Reviewer">Reviewer</option>
                            <option value="Guest">Guest</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Sign Up'}
                    </button>
                </form>
                <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
            <style>{`
        .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
        .auth-card { width: 100%; max-width: 480px; padding: 40px; border-radius: var(--radius-lg); text-align: center; }
        .logo-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border-radius: var(--radius-md); }
        .auth-form { display: flex; flex-direction: column; gap: 15px; }
        .input-group { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--text-muted); }
        .input-group input, .input-group select { width: 100%; padding: 12px 12px 12px 45px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); transition: var(--transition); }
        .input-group select { padding-left: 15px; appearance: none; }
        .auth-btn { background: var(--accent-primary); color: white; padding: 14px; border-radius: var(--radius-md); font-weight: 600; margin-top: 10px; }
        .auth-btn:hover { background: var(--accent-secondary); transform: translateY(-2px); }
        .auth-footer { margin-top: 25px; font-size: 14px; color: var(--text-secondary); }
        .auth-footer a { color: var(--accent-primary); font-weight: 600; }
      `}</style>
        </div>
    );
};

export default Register;
