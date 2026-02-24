import React, { useState } from 'react';
import { Shield, Send, AlertTriangle, CheckCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RequestPolicy = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        priority: 'Medium',
        category: 'Access Control',
        description: '',
        changes: [
            { type: 'Allow', scope: '', reasoning: '' }
        ]
    });

    const categories = ['Access Control', 'Execution Policy', 'Network Security', 'File System', 'API Access'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const handleAddChange = () => {
        setFormData({
            ...formData,
            changes: [...formData.changes, { type: 'Allow', scope: '', reasoning: '' }]
        });
    };

    const handleRemoveChange = (index) => {
        const newChanges = formData.changes.filter((_, i) => i !== index);
        setFormData({ ...formData, changes: newChanges });
    };

    const handleChangeUpdate = (index, field, value) => {
        const newChanges = [...formData.changes];
        newChanges[index][field] = value;
        setFormData({ ...formData, changes: newChanges });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            toast.success('Policy change request submitted successfully!');
            navigate('/policies');
        }, 1500);
    };

    return (
        <div className="request-policy-view animate-fade-in">
            <div className="page-header">
                <button className="back-btn glass" onClick={() => navigate('/policies')}>
                    <ArrowLeft size={18} />
                    <span>Back to Policies</span>
                </button>
                <div className="header-title">
                    <h1>Request Policy Change</h1>
                    <p>Propose modifications to existing governance rules or create new ones.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-grid">
                    <div className="form-main">
                        <div className="section-card glass">
                            <div className="card-header">
                                <Shield size={18} color="var(--accent-primary)" />
                                <h3>General Information</h3>
                            </div>
                            <div className="field-group">
                                <label>Request Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Expand access to /project/logs for debugging"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="glass"
                                />
                            </div>
                            <div className="field-row">
                                <div className="field-group">
                                    <label>Policy Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="glass"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>Priority level</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="glass"
                                    >
                                        {priorities.map(prio => <option key={prio} value={prio}>{prio}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Change Description & Justification</label>
                                <textarea
                                    placeholder="Provide a detailed explanation of why this change is needed..."
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="glass"
                                ></textarea>
                            </div>
                        </div>

                        <div className="section-card glass">
                            <div className="card-header">
                                <Plus size={18} color="var(--accent-primary)" />
                                <h3>Proposed Rule Changes</h3>
                            </div>
                            <div className="changes-list">
                                {formData.changes.map((change, index) => (
                                    <div key={index} className="change-item glass">
                                        <div className="change-header">
                                            <span>Rule #{index + 1}</span>
                                            {formData.changes.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveChange(index)} className="remove-btn">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="change-fields">
                                            <div className="field-group">
                                                <label>Action Type</label>
                                                <select
                                                    value={change.type}
                                                    onChange={(e) => handleChangeUpdate(index, 'type', e.target.value)}
                                                    className="glass"
                                                >
                                                    <option value="Allow">Allow</option>
                                                    <option value="Block">Block</option>
                                                    <option value="Restrict">Restrict (Ask Always)</option>
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label>Target Scope / Command</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., /app/data/*"
                                                    required
                                                    value={change.scope}
                                                    onChange={(e) => handleChangeUpdate(index, 'scope', e.target.value)}
                                                    className="glass"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddChange} className="add-rule-btn glass">
                                    <Plus size={16} />
                                    <span>Add Another Rule</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-sidebar">
                        <div className="section-card glass info-card">
                            <div className="card-header">
                                <AlertTriangle size={18} color="var(--warning)" />
                                <h3>Governance Note</h3>
                            </div>
                            <p>Policy changes require approval from at least one System Administrator. Most requests are reviewed within 2-4 hours.</p>
                            <div className="info-list">
                                <div className="info-item">
                                    <CheckCircle size={14} color="var(--success)" />
                                    <span>Ensures system integrity</span>
                                </div>
                                <div className="info-item">
                                    <CheckCircle size={14} color="var(--success)" />
                                    <span>Audit logged for security</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${submitting ? 'loading' : ''}`}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Submit Request</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <style>{`
                .request-policy-view { display: flex; flex-direction: column; gap: 30px; }
                
                .page-header { display: flex; flex-direction: column; gap: 20px; }
                .back-btn { display: flex; align-items: center; gap: 8px; width: fit-content; padding: 8px 16px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); }
                .back-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
                
                .header-title h1 { font-size: 28px; margin-bottom: 8px; }
                .header-title p { color: var(--text-secondary); }

                .form-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
                @media (max-width: 1024px) { .form-grid { grid-template-columns: 1fr; } }
                
                .form-main { display: flex; flex-direction: column; gap: 24px; }
                .form-sidebar { display: flex; flex-direction: column; gap: 24px; }

                .section-card { padding: 24px; border-radius: var(--radius-lg); }
                .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
                .card-header h3 { font-size: 16px; font-weight: 600; }

                .field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                .field-group:last-child { margin-bottom: 0; }
                .field-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
                .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                
                input, select, textarea { 
                    padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); 
                    color: var(--text-primary); font-size: 14px; background: transparent; width: 100%;
                }
                input:focus, select:focus, textarea:focus { border-color: var(--accent-primary); outline: none; background: rgba(255, 255, 255, 0.05); }
                
                select option { background: var(--bg-secondary); }

                .change-item { padding: 20px; border-radius: var(--radius-md); margin-bottom: 16px; position: relative; }
                .change-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 12px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; }
                .change-fields { display: grid; grid-template-columns: 200px 1fr; gap: 16px; }
                
                .remove-btn { background: none; border: none; color: var(--error); cursor: pointer; opacity: 0.6; transition: 0.2s; }
                .remove-btn:hover { opacity: 1; transform: scale(1.1); }

                .add-rule-btn { width: 100%; padding: 12px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
                .add-rule-btn:hover { border-style: solid; border-color: var(--accent-primary); color: var(--accent-primary); }

                .info-card { background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); }
                .info-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px; }
                .info-list { display: flex; flex-direction: column; gap: 10px; }
                .info-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; }

                .submit-btn { 
                    width: 100%; padding: 16px; border-radius: var(--radius-lg); background: var(--accent-primary); 
                    color: white; border: none; font-weight: 700; font-size: 16px; cursor: pointer; 
                    display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.3s;
                    box-shadow: 0 10px 20px -10px var(--accent-primary);
                }
                .submit-btn:hover:not(:disabled) { background: var(--accent-secondary); transform: translateY(-3px); box-shadow: 0 15px 30px -10px var(--accent-primary); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default RequestPolicy;
