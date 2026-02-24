import React, { useState, useEffect } from 'react';
import {
    Activity,
    ShieldCheck,
    Terminal,
    AlertTriangle,
    TrendingUp,
    Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { agentService } from '../services/agentService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [barData, setBarData] = useState([40, 70, 45, 90, 65, 80, 55, 95, 75, 60]);
    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const data = await agentService.getStats();
                const mappedStats = [
                    { label: 'Total Executions', value: data.totalExecutions.toLocaleString(), icon: <Terminal />, color: 'var(--accent-primary)', path: '/console' },
                    { label: 'Policy Blocks', value: data.policyBlocks, icon: <ShieldCheck />, color: '#10b981', path: '/policies' },
                    { label: 'System Health', value: data.systemHealth, icon: <Activity />, color: '#6366f1', action: () => toast.info('System Health: All nodes operational') },
                    { label: 'Active Agents', value: data.activeAgents, icon: <Cpu />, color: '#f59e0b', path: '/console' },
                ];
                setStats(mappedStats);
            } catch (error) {
                toast.error('Failed to load dashboard statistics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        const interval = setInterval(() => {
            setBarData(prev => prev.map(val => Math.min(100, Math.max(10, val + (Math.random() * 20 - 10)))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleIncidentClick = (incident) => {
        toast.info(`Reviewing incident: ${incident.msg}`);
        navigate('/logs');
    };

    if (isLoading) return <div className="loading-state">Initializing Dashboard...</div>;

    return (
        <div className="dashboard-view animate-fade-in">
            <div className="welcome-banner glass">
                <div className="banner-content">
                    <h1>System Overview</h1>
                    <p>Welcome back, Admin. OpenClaw Agent is monitoring all operations.</p>
                </div>
                <div className="banner-stats">
                    <div className="stat-pill glass clickable" onClick={() => toast.success('All systems are running at peak performance')}>
                        <span className="dot pulse success"></span>
                        Operational
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="stat-card glass clickable"
                        onClick={() => stat.path ? navigate(stat.path) : stat.action()}
                    >
                        <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                        <TrendingUp size={16} color="var(--success)" className="trend" />
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="grid-item glass large">
                    <div className="card-header">
                        <div className="header-info">
                            <h3>Execution Activity</h3>
                            <p className="subtitle">Real-time processing throughput (ops/sec)</p>
                        </div>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="dot primary"></span> Successful</span>
                        </div>
                    </div>
                    <div className="activity-chart-placeholder">
                        <div className="bars">
                            {barData.map((h, i) => (
                                <div key={i} className="bar-wrapper" style={{ height: `${h}%` }}>
                                    <div className="bar">
                                        <div className="bar-tooltip glass">{Math.round(h * 15.4)} ops</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-x-axis">
                            <span>12:00</span>
                            <span>12:15</span>
                            <span>12:30</span>
                            <span>12:45</span>
                            <span>13:00</span>
                        </div>
                    </div>
                </div>

                <div className="grid-item glass small">
                    <div className="card-header">
                        <h3>Security incidents</h3>
                    </div>
                    <div className="incident-list">
                        {[
                            { msg: 'Unauthorized API access attempt', time: '2 mins ago', type: 'error' },
                            { msg: 'Restricted directory scan blocked', time: '15 mins ago', type: 'error' },
                            { msg: 'Suspicious agent behavior detected', time: '42 mins ago', type: 'warning' },
                        ].map((incident, i) => (
                            <div key={i} className="incident-item clickable" onClick={() => handleIncidentClick(incident)}>
                                <div className={`incident-icon glass ${incident.type}`}>
                                    <AlertTriangle size={18} />
                                </div>
                                <div className="incident-detail">
                                    <p className="incident-msg">{incident.msg}</p>
                                    <span className="incident-time">{incident.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .dashboard-view { display: flex; flex-direction: column; gap: 24px; }
        .loading-state { display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted); font-weight: 600; }
        .welcome-banner { padding: 30px; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent); }
        .banner-content h1 { font-size: 28px; margin-bottom: 8px; }
        .banner-content p { color: var(--text-secondary); }
        .stat-pill { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.success { background: var(--success); }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        .stat-card { border: 1px solid transparent; outline: none; padding: 24px; border-radius: var(--radius-lg); position: relative; overflow: hidden; display: flex; align-items: center; gap: 20px; }
        .stat-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .stat-info p { font-size: 14px; color: var(--text-secondary); }
        .trend { position: absolute; top: 20px; right: 20px; }

        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }
        .grid-item { padding: 24px; border-radius: var(--radius-lg); }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .header-info h3 { font-size: 18px; margin-bottom: 4px; }
        .subtitle { font-size: 12px; color: var(--text-muted); }
        
        .chart-legend { display: flex; gap: 12px; font-size: 12px; }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-item .dot { width: 6px; height: 6px; }
        .legend-item .dot.primary { background: var(--accent-primary); }

        .activity-chart-placeholder { height: 260px; display: flex; flex-direction: column; padding: 20px 0 0 0; }
        .bars { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; height: 100%; gap: 8px; }
        .bar-wrapper { width: 8%; height: 100%; display: flex; align-items: flex-end; position: relative; }
        .bar { width: 100%; background: linear-gradient(to top, var(--accent-primary), var(--accent-secondary)); border-radius: 4px 4px 0 0; opacity: 0.8; transition: height 1s ease-in-out, transform 0.2s; position: relative; height: 100%; }
        .bar:hover { opacity: 1; transform: scaleX(1.1); }
        
        .bar-tooltip { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; opacity: 0; transition: 0.2s; pointer-events: none; z-index: 10; border: 1px solid var(--border-color); }
        .bar-wrapper:hover .bar-tooltip { opacity: 1; top: -40px; }

        .chart-x-axis { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-muted); }

        .incident-list { display: flex; flex-direction: column; gap: 16px; }
        .incident-item { border: none; outline: none; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: var(--radius-md); transition: var(--transition); background: transparent; cursor: pointer; }
        .incident-item:hover { background: var(--glass); }
        .incident-icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .incident-icon.error { color: var(--error); background: rgba(239, 68, 68, 0.1); }
        .incident-icon.warning { color: var(--warning); background: rgba(245, 158, 11, 0.1); }
        .incident-msg { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
        .incident-time { font-size: 11px; color: var(--text-muted); }

        .clickable { cursor: pointer; transition: var(--transition); }
        .clickable:hover { transform: translateY(-3px); }
        .stat-card.clickable:hover { border-color: var(--accent-primary); box-shadow: 0 10px 25px -10px rgba(99, 102, 241, 0.3); }
        .incident-item.clickable:hover { background: var(--glass-heavy); }
        .stat-pill.clickable:hover { background: var(--glass-heavy); }
      `}</style>
        </div>
    );
};

export default Dashboard;
