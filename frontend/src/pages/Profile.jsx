import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Shield,
    Key,
    Settings,
    Bell,
    Globe,
    Smartphone,
    Save,
    Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        twoFactor: true,
        notifications: true,
        language: 'English'
    });

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                const data = await userService.getProfile();
                setFormData(data);
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        try {
            await userService.updateProfile(formData);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to save profile');
        }
    };

    const toggleNotifications = () => {
        const newVal = !formData.notifications;
        setFormData(prev => ({ ...prev, notifications: newVal }));
        userService.updateProfile({ ...formData, notifications: newVal });
        toast.info(`Notifications ${newVal ? 'enabled' : 'disabled'}`);
    };

    const cycleLanguage = () => {
        const languages = ['English', 'Spanish', 'French', 'German'];
        const currentIndex = languages.indexOf(formData.language);
        const nextIndex = (currentIndex + 1) % languages.length;
        const newLang = languages[nextIndex];
        setFormData(prev => ({ ...prev, language: newLang }));
        userService.updateProfile({ ...formData, language: newLang });
        toast.info(`Language changed to ${newLang}`);
    };

    const showSessionInfo = () => {
        toast.info('Active Sessions: 3 (Chrome on Windows, Safari on iPhone, Mobile App)');
    };

    const handleManageKeys = () => {
        toast.success('API Key Management Access Granted');
    };

    if (isLoading) return <div className="loading-profile">Loading Profile...</div>;

    return (
        <div className="profile-view animate-fade-in">
            <div className="profile-header">
                <div className="profile-cover glass"></div>
                <div className="profile-avatar-section">
                    <div className="profile-avatar glass">
                        {formData.name.charAt(0)}
                        <button className="avatar-edit-btn glass">
                            <Camera size={14} />
                        </button>
                    </div>
                    <div className="profile-title">
                        <h1>{formData.name}</h1>
                        <p>{formData.role}</p>
                    </div>
                    <div className="profile-actions">
                        {isEditing ? (
                            <button className="save-btn" onClick={handleSave}>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </button>
                        ) : (
                            <button className="edit-btn glass" onClick={() => setIsEditing(true)}>
                                <Settings size={18} />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-col-main">
                    <div className="section-card glass">
                        <div className="card-header">
                            <User size={18} color="var(--accent-primary)" />
                            <h3>Personal Information</h3>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="glass"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={16} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="glass"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Role / Designation</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    disabled={true}
                                    className="glass disabled"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="section-card glass">
                        <div className="card-header">
                            <Shield size={18} color="var(--accent-primary)" />
                            <h3>Security & Access</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item">
                                <div className="settings-info">
                                    <h4>Two-Factor Authentication</h4>
                                    <p>Add an extra layer of security to your account.</p>
                                </div>
                                <div className={`toggle-switch ${formData.twoFactor ? 'on' : ''}`} onClick={() => isEditing && setFormData({ ...formData, twoFactor: !formData.twoFactor })}>
                                    <div className="switch-knob"></div>
                                </div>
                            </div>
                            <div className="settings-item clickable" onClick={handleManageKeys}>
                                <div className="settings-info">
                                    <h4>API Key Management</h4>
                                    <p>Manage your access tokens for external integrations.</p>
                                </div>
                                <button className="text-btn">Manage Keys</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-col-side">
                    <div className="section-card glass">
                        <div className="card-header">
                            <Settings size={18} color="var(--accent-primary)" />
                            <h3>Preferences</h3>
                        </div>
                        <div className="preferences-list">
                            <div className="preference-item clickable" onClick={toggleNotifications}>
                                <div className="pref-icon glass"><Bell size={16} /></div>
                                <div className="pref-content">
                                    <label>Notifications</label>
                                    <p>{formData.notifications ? 'Enabled' : 'Disabled'}</p>
                                </div>
                            </div>
                            <div className="preference-item clickable" onClick={cycleLanguage}>
                                <div className="pref-icon glass"><Globe size={16} /></div>
                                <div className="pref-content">
                                    <label>Language</label>
                                    <p>{formData.language}</p>
                                </div>
                            </div>
                            <div className="preference-item clickable" onClick={showSessionInfo}>
                                <div className="pref-icon glass"><Smartphone size={16} /></div>
                                <div className="pref-content">
                                    <label>Session Info</label>
                                    <p>3 active sessions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-card glass">
                        <div className="card-header">
                            <Key size={18} color="var(--accent-primary)" />
                            <h3>Active API Keys</h3>
                        </div>
                        <div className="api-keys-list">
                            <div className="api-key-item glass">
                                <code>pk_live_****************7a3b</code>
                                <span className="tag success">Active</span>
                            </div>
                            <div className="api-key-item glass">
                                <code>sk_test_****************4e29</code>
                                <span className="tag warning">Test</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-view { display: flex; flex-direction: column; gap: 24px; }
                .loading-profile { display: flex; align-items: center; justify-content: center; height: 400px; color: var(--text-muted); font-weight: 600; }
                
                .profile-header { position: relative; margin-bottom: 60px; }
                .profile-cover { height: 160px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); opacity: 0.6; }
                
                .profile-avatar-section { position: absolute; bottom: -40px; left: 30px; display: flex; align-items: flex-end; gap: 24px; width: calc(100% - 60px); }
                .profile-avatar { width: 120px; height: 120px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; color: var(--accent-primary); background: var(--bg-primary); border: 4px solid var(--bg-primary); position: relative; box-shadow: var(--shadow-lg); }
                .avatar-edit-btn { position: absolute; bottom: -8px; right: -8px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; }
                
                .profile-title { flex: 1; padding-bottom: 10px; }
                .profile-title h1 { font-size: 24px; margin-bottom: 4px; }
                .profile-title p { color: var(--text-secondary); font-size: 14px; }
                
                .profile-actions { display: flex; gap: 12px; padding-bottom: 15px; }
                .edit-btn, .save-btn { border: none; outline: none; display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; transition: var(--transition); cursor: pointer; }
                .edit-btn:hover { background: var(--glass-heavy); }
                .save-btn { background: var(--accent-primary); color: white; }
                .save-btn:hover { background: var(--accent-secondary); transform: translateY(-2px); }

                .profile-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
                @media (max-width: 1024px) { .profile-grid { grid-template-columns: 1fr; } }
                
                .profile-col-main, .profile-col-side { display: flex; flex-direction: column; gap: 24px; }
                
                .section-card { padding: 24px; border-radius: var(--radius-lg); }
                .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
                .card-header h3 { font-size: 16px; font-weight: 600; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
                
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
                .form-group input { padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 14px; background: transparent; }
                .form-group input:focus:not(:disabled) { border-color: var(--accent-primary); outline: none; background: rgba(255, 255, 255, 0.05); }
                .form-group input:disabled { opacity: 0.6; cursor: not-allowed; }
                .input-with-icon { position: relative; }
                .input-with-icon svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .input-with-icon input { padding-left: 40px; width: 100%; }

                .settings-list { display: flex; flex-direction: column; gap: 20px; }
                .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: var(--radius-md); background: var(--glass); }
                .settings-info h4 { font-size: 14px; margin-bottom: 4px; }
                .settings-info p { font-size: 12px; color: var(--text-muted); }
                
                .toggle-switch { width: 44px; height: 24px; background: var(--text-muted); border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s; }
                .toggle-switch.on { background: var(--accent-primary); }
                .switch-knob { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; }
                .toggle-switch.on .switch-knob { left: 23px; }

                .preferences-list { display: flex; flex-direction: column; gap: 16px; }
                .preference-item { display: flex; align-items: center; gap: 16px; }
                .pref-icon { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--accent-primary); }
                .pref-content label { display: block; font-size: 13px; font-weight: 600; }
                .pref-content p { font-size: 12px; color: var(--text-muted); }

                .api-keys-list { display: flex; flex-direction: column; gap: 12px; }
                .api-key-item { padding: 12px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; }
                .api-key-item code { font-family: monospace; font-size: 11px; color: var(--text-muted); }
                .tag { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
                .tag.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .tag.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .text-btn { color: var(--accent-primary); font-size: 13px; font-weight: 600; cursor: pointer; background: none; border: none; }
                
                .clickable { cursor: pointer; transition: var(--transition); }
                .preference-item.clickable:hover { transform: translateX(5px); }
                .preference-item.clickable:hover .pref-icon { background: var(--glass-heavy); color: var(--accent-secondary); }
                .settings-item.clickable:hover { background: var(--glass-heavy); }
            `}</style>
        </div>
    );
};

export default Profile;
