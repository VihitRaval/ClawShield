import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Terminal as TerminalIcon,
    ShieldCheck,
    ShieldX,
    Search,
    ChevronRight,
    Code,
    Info,
    CheckCircle2,
    XCircle,
    Clock,
    History
} from 'lucide-react';
import { toast } from 'react-toastify';
import { agentService } from '../services/agentService';

const AgentConsole = () => {
    const [instruction, setInstruction] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [executionResult, setExecutionResult] = useState(null);
    const [parsedIntent, setParsedIntent] = useState(null);
    const [logs, setLogs] = useState([]);

    const consoleEndRef = useRef(null);
    const stepsEndRef = useRef(null);

    const scrollToRef = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    // Load logs on mount
    useEffect(() => {
        const fetchLogs = async () => {
            const history = await agentService.getLogs();
            setLogs(history);
        };
        fetchLogs();
    }, []);

    useEffect(() => {
        scrollToRef(consoleEndRef);
    }, [logs]);

    useEffect(() => {
        scrollToRef(stepsEndRef);
    }, [currentStep, executionResult]);

    const handleExecute = async (e) => {
        e.preventDefault();
        if (!instruction.trim()) return;

        setIsExecuting(true);
        setCurrentStep(1);
        setExecutionResult(null);
        setParsedIntent(null);

        try {
            // Step 1: Parsing (Wait for simulation)
            await new Promise(r => setTimeout(r, 1000));

            const response = await agentService.executeInstruction(instruction);

            setParsedIntent(response.intent);
            setCurrentStep(2);

            // Step 2: Policy (Wait for simulation)
            await new Promise(r => setTimeout(r, 1200));
            setCurrentStep(3);

            // Step 3: Final Result (Wait for simulation)
            await new Promise(r => setTimeout(r, 800));

            setExecutionResult(response.result);
            setCurrentStep(4);

            // Save to logs and persist
            const logEntry = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                action: response.intent.action,
                target: response.intent.target,
                status: response.result.status,
                reason: response.result.status === 'success' ? 'Authorized' : 'Policy Block'
            };

            await agentService.saveLog(logEntry);
            setLogs(prev => [logEntry, ...prev]);

            if (response.result.status === 'success') {
                toast.success('Agent action authorized and completed');
            } else {
                toast.error('Operation blocked by security layer');
            }
        } catch (error) {
            toast.error('Execution failed');
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="console-view animate-fade-in">
            <div className="console-grid">
                {/* Left Column: Input and Intent */}
                <div className="console-left">
                    <div className="section-card glass">
                        <div className="card-header">
                            <TerminalIcon size={18} color="var(--accent-primary)" />
                            <h3>Agent Intent</h3>
                        </div>
                        <form onSubmit={handleExecute} className="intent-input-area">
                            <textarea
                                placeholder="Enter instruction for agent (e.g., 'Clean temp folder' or 'Modify auth module')..."
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                disabled={isExecuting}
                                className="glass"
                            />
                            <button
                                type="submit"
                                className={`execute-btn ${isExecuting ? 'loading' : ''}`}
                                disabled={isExecuting || !instruction.trim()}
                            >
                                {isExecuting ? 'Executing...' : (
                                    <>
                                        <span>Submit Instruction</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="section-card glass">
                        <div className="card-header">
                            <Code size={18} color="var(--accent-primary)" />
                            <h3>Parsed Intent (JSON)</h3>
                        </div>
                        <div className="json-container glass">
                            {parsedIntent ? (
                                <pre>{JSON.stringify(parsedIntent, null, 2)}</pre>
                            ) : (
                                <div className="empty-state">
                                    <Clock size={40} className="faint" />
                                    <p>Awaiting instruction parsing...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Reasoning and Result */}
                <div className="console-right">
                    <div className="section-card glass reasoning-panel">
                        <div className="card-header">
                            <Search size={18} color="var(--accent-primary)" />
                            <h3>Reasoning & Execution</h3>
                        </div>
                        <div className="steps-container">
                            {/* Step 1: Parsing */}
                            <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-icon">
                                    {currentStep > 1 ? <CheckCircle2 size={20} /> : <div className="dot"></div>}
                                </div>
                                <div className="step-content">
                                    <h4>Intent Analysis</h4>
                                    <p>Processing natural language into structured commands...</p>
                                </div>
                            </div>

                            {/* Step 2: Policy */}
                            <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                                <div className="step-icon">
                                    {currentStep > 2 ? <CheckCircle2 size={20} /> : <div className="dot"></div>}
                                </div>
                                <div className="step-content">
                                    <h4>Policy Enforcement Layer</h4>
                                    <p>Validating action against system security policies...</p>
                                    {currentStep >= 2 && parsedIntent && (
                                        <div className="policy-badge glass">
                                            {parsedIntent.scope === 'allowed' ? (
                                                <span className="success"><ShieldCheck size={14} /> Scope: Allowed</span>
                                            ) : (
                                                <span className="error"><ShieldX size={14} /> Scope: Restricted</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Execution Result */}
                            {currentStep >= 4 && executionResult && (
                                <div className="execution-result-area animate-fade-in">
                                    <div className={`result-card ${executionResult.status}`}>
                                        <div className="result-header">
                                            {executionResult.status === 'success' ? <CheckCircle2 /> : <XCircle />}
                                            <h4>Execution {executionResult.status === 'success' ? 'Successful' : 'Blocked'}</h4>
                                        </div>
                                        <p className="result-msg">{executionResult.message}</p>
                                        {executionResult.rule && (
                                            <div className="violation-rule glass">
                                                <Info size={14} />
                                                <span>{executionResult.rule}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div ref={stepsEndRef} />
                        </div>
                    </div>

                    <div className="section-card glass logs-panel">
                        <div className="card-header">
                            <History size={18} color="var(--accent-primary)" />
                            <h3>Recent Actions</h3>
                        </div>
                        <div className="log-table-container">
                            {logs && logs.length > 0 ? (
                                <table className="log-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Action</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.timestamp}</td>
                                                <td>{log.action} {log.target?.split('/').pop()}</td>
                                                <td>
                                                    <span className={`status-tag ${log.status}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <p>No execution logs yet.</p>
                                </div>
                            )}
                            <div ref={consoleEndRef} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .console-view { height: calc(100vh - 100px); overflow: hidden; display: flex; flex-direction: column; }
        .console-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; height: 100%; min-height: 0; }
        @media (max-width: 1024px) { .console-grid { grid-template-columns: 1fr; overflow-y: auto; } }
        
        .console-left, .console-right { display: flex; flex-direction: column; gap: 20px; height: 100%; min-height: 0; }
        .section-card { padding: 24px; border-radius: var(--radius-lg); display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-sm); }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; flex-shrink: 0; }
        .card-header h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }

        .intent-input-area { display: flex; flex-direction: column; gap: 15px; }
        textarea { width: 100%; height: 100px; padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-primary); resize: none; font-size: 14px; line-height: 1.5; }
        textarea:focus { border-color: var(--accent-primary); background: rgba(255, 255, 255, 0.05); outline: none; }

        .execute-btn { background: var(--accent-primary); color: white; padding: 14px; border-radius: var(--radius-md); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; border: none; cursor: pointer; }
        .execute-btn:hover:not(:disabled) { background: var(--accent-secondary); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .execute-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .json-container { background: #011627; padding: 15px; border-radius: var(--radius-md); color: #82aaff; font-family: 'Fira Code', monospace; font-size: 12px; overflow: auto; flex: 1; border: 1px solid rgba(255, 255, 255, 0.05); }
        .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 12px; padding: 20px; }
        .faint { opacity: 0.15; }

        .reasoning-panel { flex: 1.5; }
        .steps-container { flex: 1; overflow-y: auto; padding-right: 10px; position: relative; display: flex; flex-direction: column; gap: 20px; }
        .steps-container::before { content: ""; position: absolute; left: 15px; top: 15px; bottom: 15px; width: 2px; background: var(--border-color); z-index: 0; opacity: 0.5; }
        
        .step-item { display: flex; gap: 20px; position: relative; z-index: 1; opacity: 0.3; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .step-item.active { opacity: 1; }
        .step-item.completed { opacity: 0.8; }
        
        .step-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-primary); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0; transition: 0.3s; }
        .step-item.active .step-icon { border-color: var(--accent-primary); color: var(--accent-primary); box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); transform: scale(1.1); }
        .step-item.completed .step-icon { background: var(--success); border-color: var(--success); color: white; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); }

        .step-content { padding-top: 4px; flex: 1; }
        .step-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary); }
        .step-content p { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
        
        .policy-badge { margin-top: 12px; display: inline-flex; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); backdrop-filter: blur(4px); }
        .policy-badge span { display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .policy-badge .success { color: var(--success); }
        .policy-badge .error { color: var(--error); }

        .execution-result-area { margin-top: 10px; padding: 4px 0 20px 0; }
        .result-card { padding: 24px; border-radius: var(--radius-lg); position: relative; overflow: hidden; animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid var(--border-color); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .result-card.success { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02)); border-color: rgba(16, 185, 129, 0.2); }
        .result-card.blocked { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02)); border-color: rgba(239, 68, 68, 0.2); }
        
        .result-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 16px; font-weight: 800; color: var(--text-primary); }
        .result-msg { font-size: 14px; margin-bottom: 16px; line-height: 1.6; color: var(--text-secondary); }
        .violation-rule { padding: 14px; border-radius: var(--radius-md); font-size: 12px; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 12px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.05); }

        .logs-panel { flex: 1; min-height: 0; }
        .log-table-container { flex: 1; overflow-y: auto; scrollbar-width: thin; }
        .log-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
        .log-table th { text-align: left; padding: 16px 12px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; position: sticky; top: 0; background: var(--bg-primary); z-index: 10; }
        .log-table td { padding: 16px 12px; border-bottom: 1px solid var(--glass-border); vertical-align: middle; }
        .status-tag { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-tag.success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .status-tag.blocked { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
      `}</style>
        </div>
    );
};

export default AgentConsole;
