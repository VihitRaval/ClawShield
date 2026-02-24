import React from 'react';
import { Shield, Lock, Unlock, FileCode, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PolicyRules = () => {
    const navigate = useNavigate();
    const policies = [
        {
            id: 'POL-001',
            name: 'Directory Access Control',
            description: 'Restrict agent access to sensitive system directories.',
            rules: [
                { target: '/project/src', action: 'Read/Write', status: 'Allowed' },
                { target: '/project/temp', action: 'All', status: 'Allowed' },
                { target: '/project/config', action: 'Write', status: 'Restricted' },
                { target: '/usr/local/bin', action: 'Execute', status: 'Blocked' },
            ]
        },
        {
            id: 'POL-002',
            name: 'Command Execution Policy',
            description: 'Filter high-risk terminal commands before execution.',
            rules: [
                { target: 'npm install', action: 'Execute', status: 'Allowed' },
                { target: 'rm -rf', action: 'Execute', status: 'Blocked' },
                { target: 'sudo', action: 'Execute', status: 'Blocked' },
                { target: 'git push', action: 'Execute', status: 'Restricted' },
            ]
        }
    ];

    return (
        <div className="policy-view animate-fade-in">
            <div className="policy-header">
                <h1>Policy Enforcement Model</h1>
                <p>Current active governance rules for OpenClaw Autonomous Agent.</p>
            </div>

            <div className="policy-grid">
                {policies.map(policy => (
                    <div key={policy.id} className="policy-group glass">
                        <div className="group-header">
                            <div className="group-title">
                                <Shield size={20} color="var(--accent-primary)" />
                                <div>
                                    <h3>{policy.name}</h3>
                                    <span>{policy.id}</span>
                                </div>
                            </div>
                            <p className="group-desc">{policy.description}</p>
                        </div>

                        <div className="rules-list">
                            {policy.rules.map((rule, i) => (
                                <div key={i} className="rule-item glass">
                                    <div className="rule-info">
                                        <FileCode size={16} color="var(--text-muted)" />
                                        <span className="rule-target">{rule.target}</span>
                                    </div>
                                    <div className="rule-action">
                                        <span>{rule.action}</span>
                                    </div>
                                    <div className={`rule-status ${rule.status.toLowerCase()}`}>
                                        {rule.status === 'Allowed' ? <CheckCircle size={14} /> :
                                            rule.status === 'Blocked' ? <XCircle size={14} /> : <Lock size={14} />}
                                        <span>{rule.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="policy-summary glass">
                    <h3>Enforcement Summary</h3>
                    <div className="summary-stats">
                        <div className="sum-stat">
                            <span className="val">124</span>
                            <span className="lbl">Active Rules</span>
                        </div>
                        <div className="sum-stat">
                            <span className="val">12</span>
                            <span className="lbl">Blocked Scopes</span>
                        </div>
                        <div className="sum-stat">
                            <span className="val">8</span>
                            <span className="lbl">Admin Overrides</span>
                        </div>
                    </div>
                    <button className="pro-btn" onClick={() => navigate('/policies/request')}>Request Policy Change</button>
                </div>
            </div>

            <style>{`
        .policy-view { display: flex; flex-direction: column; gap: 30px; }
        .policy-header h1 { font-size: 28px; margin-bottom: 8px; }
        .policy-header p { color: var(--text-secondary); }

        .policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 1024px) { .policy-grid { grid-template-columns: 1fr; } }

        .policy-group { padding: 24px; border-radius: var(--radius-lg); }
        .group-header { margin-bottom: 24px; }
        .group-title { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
        .group-title h3 { font-size: 18px; font-weight: 700; }
        .group-title span { font-size: 11px; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; color: var(--text-muted); }
        .group-desc { font-size: 14px; color: var(--text-secondary); }

        .rules-list { display: flex; flex-direction: column; gap: 12px; }
        .rule-item { padding: 15px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; }
        
        .rule-info { display: flex; align-items: center; gap: 12px; flex: 1.5; }
        .rule-target { font-family: 'Fira Code', monospace; font-size: 13px; font-weight: 500; }
        
        .rule-action { flex: 1; text-align: center; }
        .rule-action span { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }

        .rule-status { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 8px; font-size: 13px; font-weight: 600; }
        .rule-status.allowed { color: var(--success); }
        .rule-status.blocked { color: var(--error); }
        .rule-status.restricted { color: var(--warning); }

        .policy-summary { padding: 24px; border-radius: var(--radius-lg); grid-column: span 1; }
        .summary-stats { display: flex; justify-content: space-between; margin: 25px 0; }
        .sum-stat { display: flex; flex-direction: column; gap: 4px; }
        .sum-stat .val { font-size: 24px; font-weight: 700; color: var(--accent-primary); }
        .sum-stat .lbl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
        
        .pro-btn { width: 100%; padding: 14px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-weight: 600; color: var(--text-primary); }
        .pro-btn:hover { background: var(--glass); border-color: var(--accent-primary); }
      `}</style>
        </div>
    );
};

export default PolicyRules;
