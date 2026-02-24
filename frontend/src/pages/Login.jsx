import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Github, Chrome } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        identifier: email,
        password: password
      });
      login(response.data.user, response.data.access_token);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="logo-icon glass">
            <LogIn size={24} color="var(--accent-primary)" />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to access OpenClaw Console</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-utils">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="social-auth">
          <button className="social-btn glass"><Chrome size={20} /></button>
          <button className="social-btn glass"><Github size={20} /></button>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>

      <style>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent),
                      radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border-radius: var(--radius-md);
        }

        .auth-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 30px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
        }

        .input-group input {
          width: 100%;
          padding: 14px 14px 14px 45px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: var(--transition);
        }

        .input-group input:focus {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .auth-utils {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin: 4px 0;
        }

        .auth-utils a {
          color: var(--accent-primary);
        }

        .auth-btn {
          background: var(--accent-primary);
          color: white;
          padding: 14px;
          border-radius: var(--radius-md);
          font-weight: 600;
          margin-top: 10px;
        }

        .auth-btn:hover {
          background: var(--accent-secondary);
          transform: translateY(-2px);
        }

        .auth-divider {
          margin: 25px 0;
          position: relative;
          color: var(--text-muted);
          font-size: 12px;
        }

        .auth-divider::before, .auth-divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: var(--border-color);
        }

        .auth-divider::before { left: 0; }
        .auth-divider::after { right: 0; }

        .social-auth {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .social-btn {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        .social-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.05);
        }

        .auth-footer {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--accent-primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Login;
