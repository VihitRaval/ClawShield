import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    Terminal,
    ShieldAlert,
    History,
    User,
    LogOut,
    Sun,
    Moon,
    Menu,
    X,
    Zap
} from 'lucide-react';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Agent Console', path: '/console', icon: <Terminal size={20} /> },
        { name: 'Policy Rules', path: '/policies', icon: <ShieldAlert size={20} /> },
        { name: 'Logs', path: '/logs', icon: <History size={20} /> },
    ];

    return (
        <div className={`layout-wrapper ${theme}`}>
            {/* Sidebar */}
            <aside className={`sidebar glass ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Zap size={24} color="var(--accent-primary)" fill="var(--accent-primary)" />
                        <span>OpenClaw</span>
                    </div>
                    <button className="mobile-only" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                <header className="topbar glass">
                    <div className="topbar-left">
                        <button className="toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <Menu size={22} />
                        </button>
                        <h2 className="page-title">Autonomous Agent System</h2>
                    </div>

                    <div className="topbar-right">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <div
                            className="user-profile clickable"
                            onClick={() => navigate('/profile')}
                            title="View Profile"
                        >
                            <div className="user-avatar glass">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="page-container">
                    <Outlet />
                </div>
            </main>

            <style>{`
        .layout-wrapper { display: flex; min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); }
        .sidebar { width: 260px; height: 100vh; position: fixed; left: 0; top: 0; display: flex; flex-direction: column; transition: var(--transition); z-index: 100; border-right: 1px solid var(--border-color); }
        .sidebar.closed { transform: translateX(-100%); width: 0; }
        .sidebar-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
        .sidebar-nav { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 5px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-md); color: var(--text-secondary); transition: var(--transition); }
        .nav-item:hover { background: var(--glass); color: var(--text-primary); }
        .nav-item.active { background: var(--accent-primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        .sidebar-footer { padding: 20px; border-top: 1px solid var(--border-color); }
        .logout-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; color: var(--error); border-radius: var(--radius-md); }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.1); }
        .main-content { flex: 1; margin-left: 260px; transition: var(--transition); min-width: 0; }
        .main-content.shifted { margin-left: 260px; }
        @media (max-width: 768px) { 
          .main-content { margin-left: 0 !important; }
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
        }
        .topbar { height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid var(--border-color); sticky: top; }
        .topbar-left, .topbar-right { display: flex; align-items: center; gap: 20px; }
        .toggle-btn, .theme-toggle { color: var(--text-secondary); }
        .user-profile.clickable { cursor: pointer; transition: var(--transition); padding: 4px 8px; border-radius: var(--radius-md); }
        .user-profile.clickable:hover { background: var(--glass); transform: translateY(-1px); }
        .user-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700; color: var(--accent-primary); background: var(--glass); }
        .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
        .page-title { font-size: 18px; font-weight: 600; }
      `}</style>
        </div>
    );
};

export default DashboardLayout;
