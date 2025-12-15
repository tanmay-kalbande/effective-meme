import { useState } from 'react';
import type { AISettings, AIProvider } from '../types';
import { GOOGLE_MODELS, CEREBRAS_MODELS, MISTRAL_MODELS } from '../types';

interface SettingsModalProps {
    settings: AISettings;
    onSave: (settings: AISettings) => void;
    onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
    const [localSettings, setLocalSettings] = useState<AISettings>(settings);
    const [activeTab, setActiveTab] = useState<AIProvider>(settings.provider);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>AI Settings</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Provider Tabs */}
                    <div className="provider-tabs">
                        <button
                            type="button"
                            className={`tab ${activeTab === 'google' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('google');
                                setLocalSettings({ ...localSettings, provider: 'google' });
                            }}
                        >
                            Google AI
                        </button>
                        <button
                            type="button"
                            className={`tab ${activeTab === 'cerebras' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('cerebras');
                                setLocalSettings({ ...localSettings, provider: 'cerebras' });
                            }}
                        >
                            Cerebras
                        </button>
                        <button
                            type="button"
                            className={`tab ${activeTab === 'mistral' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('mistral');
                                setLocalSettings({ ...localSettings, provider: 'mistral' });
                            }}
                        >
                            Mistral AI
                        </button>
                    </div>

                    {/* Google Settings */}
                    {activeTab === 'google' && (
                        <div className="provider-settings">
                            <div className="form-group">
                                <label>API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.googleApiKey}
                                    onChange={(e) =>
                                        setLocalSettings({ ...localSettings, googleApiKey: e.target.value })
                                    }
                                    placeholder="Enter your Google AI Studio API key"
                                />
                                <span className="hint">Get from: ai.google.dev</span>
                            </div>

                            <div className="form-group">
                                <label>Model</label>
                                <select
                                    value={localSettings.googleModel}
                                    onChange={(e) =>
                                        setLocalSettings({ ...localSettings, googleModel: e.target.value })
                                    }
                                >
                                    {GOOGLE_MODELS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Cerebras Settings */}
                    {activeTab === 'cerebras' && (
                        <div className="provider-settings">
                            <div className="form-group">
                                <label>API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.cerebrasApiKey}
                                    onChange={(e) =>
                                        setLocalSettings({ ...localSettings, cerebrasApiKey: e.target.value })
                                    }
                                    placeholder="Enter your Cerebras API key"
                                />
                                <span className="hint">Get from: cloud.cerebras.ai</span>
                            </div>

                            <div className="form-group">
                                <label>Model</label>
                                <select
                                    value={localSettings.cerebrasModel}
                                    onChange={(e) =>
                                        setLocalSettings({ ...localSettings, cerebrasModel: e.target.value })
                                    }
                                >
                                    {CEREBRAS_MODELS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Mistral Settings */}
                    {activeTab === 'mistral' && (
                        <div className="provider-settings">
                            <div className="form-group">
                                <label>API Key</label>
                                <input
                                    type="password"
                                    value={localSettings.mistralApiKey}
                                    onChange={(e) =>
                                        setLocalSettings({ ...localSettings, mistralApiKey: e.target.value })
                                    }
                                    placeholder="Enter your Mistral API key"
                                />
                                <span className="hint">Get from: console.mistral.ai</span>
                            </div>

                            <div className="form-group">
                                <label>Model</label>
                                <select
                                    value={localSettings.mistralModel}
                                    onChange={(e) =>
                                        setLocalSettings({ ...localSettings, mistralModel: e.target.value })
                                    }
                                >
                                    {MISTRAL_MODELS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
