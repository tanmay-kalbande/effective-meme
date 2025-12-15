import { useState } from 'react';
import type { AISettings, AIProvider } from '../types';

interface SettingsModalProps {
    settings: AISettings;
    onSave: (settings: AISettings) => void;
    onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
    const [localSettings, setLocalSettings] = useState<AISettings>(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>AI Provider</label>
                        <select
                            value={localSettings.provider}
                            onChange={(e) =>
                                setLocalSettings({ ...localSettings, provider: e.target.value as AIProvider })
                            }
                        >
                            <option value="google">Google AI (Gemma 3 27B)</option>
                            <option value="cerebras">Cerebras (Qwen 3 32B)</option>
                        </select>
                    </div>

                    <div className="form-divider"></div>

                    <div className="form-group">
                        <label>Google AI API Key</label>
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
                        <label>Google Model</label>
                        <select
                            value={localSettings.googleModel}
                            onChange={(e) =>
                                setLocalSettings({ ...localSettings, googleModel: e.target.value })
                            }
                        >
                            <option value="gemma-3-27b-it">Gemma 3 27B</option>
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        </select>
                    </div>

                    <div className="form-divider"></div>

                    <div className="form-group">
                        <label>Cerebras API Key</label>
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
                        <label>Cerebras Model</label>
                        <select
                            value={localSettings.cerebrasModel}
                            onChange={(e) =>
                                setLocalSettings({ ...localSettings, cerebrasModel: e.target.value })
                            }
                        >
                            <option value="qwen-3-32b">Qwen 3 32B</option>
                            <option value="llama-4-scout-17b-16e-instruct">Llama 4 Scout 17B</option>
                            <option value="llama3.1-8b">Llama 3.1 8B</option>
                        </select>
                    </div>

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
