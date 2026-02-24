import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Download, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { agentService } from '../services/agentService';

const Logs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const data = await agentService.getLogs();
                setLogs(data);
            } catch (error) {
                toast.error('Failed to load logs');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || log.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        toast.success('Logs exported to CSV successfully');
    };

    const handleRangeChange = () => {
        toast.info('Date range filter active: Last 24 Hours');
    };

    return (
        <div className="logs-view animate-fade-in">
            <div className="logs-toolbar">
                <div className="toolbar-left">
                    <h1>Audit Traceability</h1>
                    <p>Complete execution history and policy enforcement records.</p>
                </div>
                <div className="toolbar-right">
                    <button className="tool-btn glass clickable" onClick={handleExport}><Download size={18} /> Export</button>
                    <button className="tool-btn primary clickable" onClick={handleRangeChange}><Calendar size={18} /> Range</button>
                </div>
            </div>

            <div className="logs-filters glass">
                <div className="search-box">
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search logs by action or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button
                        className={`filter-btn clickable ${statusFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('All')}
                    >All</button>
                    <button
                        className={`filter-btn clickable ${statusFilter === 'Success' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Success')}
                    >Success</button>
                    <button
                        className={`filter-btn clickable ${statusFilter === 'Blocked' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Blocked')}
                    >Blocked</button>
                    <Filter size={18} color="var(--text-muted)" />
                </div>
            </div>

            <div className="logs-table-card glass">
                {isLoading ? (
                    <div className="loading-state">Loading Audit Trail...</div>
                ) : (
                    <>
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                    <th>Target</th>
                                    <th>Time</th>
                                    <th>Result</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="log-id">#{log.id.toString().slice(-6)}</td>
                                        <td>
                                            <span className={`status-pill ${log.status.toLowerCase()}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="log-action">{log.action}</td>
                                        <td className="log-user">
                                            {log.target || 'N/A'}
                                        </td>
                                        <td className="log-time">{log.timestamp || log.time}</td>
                                        <td>
                                            <span className={`impact-dot ${log.status === 'success' ? 'low' : 'high'}`}></span>
                                            {log.reason || 'Completed'}
                                        </td>
                                        <td className="log-link"><ExternalLink size={14} /></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No logs found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="table-pagination">
                            <p>Showing {filteredLogs.length} logs</p>
                            <div className="pagination-btns">
                                <button disabled>Prev</button>
                                <button className="active">1</button>
                                <button>Next</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        .logs-view { display: flex; flex-direction: column; gap: 20px; }
        .logs-toolbar { display: flex; justify-content: space-between; align-items: center; }
        .logs-toolbar h1 { font-size: 28px; margin-bottom: 4px; }
        .logs-toolbar p { color: var(--text-secondary); }
        .toolbar-right { display: flex; gap: 12px; }
        
        .tool-btn { border: none; outline: none; display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.3s; }
        .tool-btn.primary { background: var(--accent-primary); color: white; }
        .tool-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        
        .logs-filters { padding: 15px 24px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .search-box { display: flex; align-items: center; gap: 12px; flex: 1; }
        .search-box input { background: transparent; border: none; color: var(--text-primary); width: 100%; font-size: 14px; outline: none; }
        
        .filter-group { display: flex; align-items: center; gap: 10px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: var(--text-secondary); border: 1px solid transparent; background: transparent; cursor: pointer; transition: 0.3s; }
        .filter-btn.active { background: var(--accent-primary); color: white; }
        .filter-btn:not(.active):hover { background: rgba(255, 255, 255, 0.05); }

        .logs-table-card { border-radius: var(--radius-lg); overflow: hidden; min-height: 400px; }
        .loading-state { display: flex; align-items: center; justify-content: center; height: 400px; color: var(--text-muted); font-weight: 600; }
        .logs-table { width: 100%; border-collapse: collapse; }
        .logs-table th { text-align: left; padding: 16px 24px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .logs-table td { padding: 16px 24px; border-bottom: 1px solid var(--glass-border); font-size: 14px; }
        .logs-table tr:hover { background: rgba(255, 255, 255, 0.01); }

        .log-id { font-family: 'Fira Code', monospace; color: var(--accent-primary); font-weight: 600; }
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-pill.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-pill.blocked { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        
        .log-user { color: var(--text-secondary); }
        
        .impact-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
        .impact-dot.low { background: var(--success); }
        .impact-dot.high { background: var(--error); }

        .table-pagination { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-muted); }
        .pagination-btns { display: flex; gap: 8px; }
        .pagination-btns button { padding: 6px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); cursor: pointer; transition: 0.3s; }
        .pagination-btns button:hover:not(:disabled) { border-color: var(--accent-primary); }
        .pagination-btns button.active { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
        .log-link { color: var(--text-muted); cursor: pointer; }
        .log-link:hover { color: var(--accent-primary); }
      `}</style>
        </div>
    );
};

export default Logs;
