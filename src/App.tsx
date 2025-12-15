import { useState, useRef, useEffect } from 'react';
import type { ResumeData, AISettings, ResumeVersion } from './types';
import { DEFAULT_SETTINGS, generateId } from './types';
import { generateBaseResume, generateTailoredResume, extractATSKeywords } from './services/aiService';
import { ResumeTemplate } from './components/ResumeTemplate';
import { SettingsModal } from './components/SettingsModal';
import { VersionHistory } from './components/VersionHistory';
import { ChangesView } from './components/ChangesView';
import './App.css';

// LocalStorage keys
const STORAGE_KEYS = {
  RESUME_DATA: 'resume_builder_user_data',
  SETTINGS: 'resume_builder_settings',
  VERSIONS: 'resume_builder_versions',
};

function App() {
  const [resumeInput, setResumeInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [atsKeywords, setAtsKeywords] = useState<string[]>([]);
  const [atsEnabled, setAtsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ResumeVersion | null>(null);
  const [showChanges, setShowChanges] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.RESUME_DATA);
    if (savedData) {
      setResumeInput(savedData);
    }
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    }
    const savedVersions = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    if (savedVersions) {
      try {
        setVersions(JSON.parse(savedVersions));
      } catch (e) {
        console.error('Failed to parse saved versions');
      }
    }
  }, []);

  // Save resume data when it changes
  useEffect(() => {
    if (resumeInput) {
      localStorage.setItem(STORAGE_KEYS.RESUME_DATA, resumeInput);
    }
  }, [resumeInput]);

  // Save versions when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
  }, [versions]);

  // Save settings when they change
  const handleSaveSettings = (newSettings: AISettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  };

  const validateSettings = (): boolean => {
    if (settings.provider === 'google' && !settings.googleApiKey) {
      setError('Please configure your Google AI API key in Settings');
      return false;
    }
    if (settings.provider === 'cerebras' && !settings.cerebrasApiKey) {
      setError('Please configure your Cerebras API key in Settings');
      return false;
    }
    if (settings.provider === 'mistral' && !settings.mistralApiKey) {
      setError('Please configure your Mistral API key in Settings');
      return false;
    }
    return true;
  };

  const saveVersion = (
    data: ResumeData,
    type: 'base' | 'tailored',
    companyName?: string,
    jobTitle?: string,
    changes?: string[],
    keywords?: string[]
  ) => {
    const name = type === 'tailored' && companyName
      ? `${companyName} - ${jobTitle || 'Position'}`
      : `Base Resume`;

    const version: ResumeVersion = {
      id: generateId(),
      name,
      timestamp: Date.now(),
      data,
      type,
      companyName,
      jobTitle,
      atsKeywords: keywords,
      changes,
    };

    setVersions((prev) => [version, ...prev.slice(0, 19)]); // Keep last 20
    setCurrentVersion(version);
  };

  const handleGenerateResume = async () => {
    if (!resumeInput.trim()) {
      setError('Please enter your resume information');
      return;
    }

    if (!validateSettings()) return;

    setError('');
    setIsLoading(true);
    setLoadingMessage('Analyzing your resume data...');

    try {
      const resume = await generateBaseResume(resumeInput, settings);
      setGeneratedResume(resume);
      setAtsKeywords([]);
      saveVersion(resume, 'base');
      setActiveTab('preview');
      setShowChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateTailoredResume = async () => {
    if (!resumeInput.trim()) {
      setError('Please enter your resume information');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description to tailor your resume');
      return;
    }

    if (!validateSettings()) return;

    setError('');
    setIsLoading(true);
    setLoadingMessage('Tailoring your resume for the job...');

    try {
      const result = await generateTailoredResume(resumeInput, jobDescription, settings);
      setGeneratedResume(result.resume);

      let keywords: string[] = [];
      if (atsEnabled) {
        setLoadingMessage('Extracting ATS keywords...');
        keywords = await extractATSKeywords(jobDescription, settings);
        setAtsKeywords(keywords);
      } else {
        setAtsKeywords([]);
      }

      saveVersion(
        result.resume,
        'tailored',
        result.companyName,
        result.jobTitle,
        result.changes,
        keywords
      );

      setActiveTab('preview');
      if (result.changes && result.changes.length > 0) {
        setShowChanges(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tailored resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSelectVersion = (version: ResumeVersion) => {
    setGeneratedResume(version.data);
    setCurrentVersion(version);
    setAtsKeywords(version.atsKeywords || []);
    setActiveTab('preview');
    setShowHistory(false);
    if (version.changes && version.changes.length > 0) {
      setShowChanges(true);
    } else {
      setShowChanges(false);
    }
  };

  const handleDeleteVersion = (id: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
    if (currentVersion?.id === id) {
      setCurrentVersion(null);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleClearData = () => {
    if (confirm('Clear all saved resume data?')) {
      setResumeInput('');
      localStorage.removeItem(STORAGE_KEYS.RESUME_DATA);
    }
  };

  const getProviderLabel = () => {
    switch (settings.provider) {
      case 'google': return 'Google AI';
      case 'cerebras': return 'Cerebras';
      case 'mistral': return 'Mistral AI';
    }
  };

  return (
    <div className="app">
      {/* Floating Header */}
      <header className="app-header no-print">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Resume Builder</span>
          </div>
        </div>
        <div className="header-right">
          <button
            className={`icon-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title="Version History"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            {versions.length > 0 && <span className="badge-count">{versions.length}</span>}
          </button>
          <div className="provider-badge" onClick={() => setShowSettings(true)}>
            <span className="badge-dot"></span>
            <span>{getProviderLabel()}</span>
          </div>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Tab Navigation (Mobile) */}
      <div className="tab-nav no-print">
        <button
          className={`tab-btn ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Input
        </button>
        <button
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
          disabled={!generatedResume}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
          </svg>
          Preview
        </button>
      </div>

      <main className="main-content">
        {/* Version History Sidebar */}
        <div className={`history-sidebar no-print ${showHistory ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Version History</h3>
            <button className="close-btn-small" onClick={() => setShowHistory(false)}>×</button>
          </div>
          <VersionHistory
            versions={versions}
            currentVersionId={currentVersion?.id || null}
            onSelectVersion={handleSelectVersion}
            onDeleteVersion={handleDeleteVersion}
          />
        </div>

        {/* Input Panel */}
        <div className={`panel input-panel no-print ${activeTab === 'input' ? 'active' : ''}`}>
          <div className="panel-inner">
            {/* Resume Data Card */}
            <div className="card">
              <div className="card-header">
                <h3>Your Resume Data</h3>
                {resumeInput && (
                  <button className="text-btn" onClick={handleClearData}>Clear</button>
                )}
              </div>
              <textarea
                value={resumeInput}
                onChange={(e) => setResumeInput(e.target.value)}
                placeholder="Paste all your resume details here...&#10;&#10;Include: contact info, work experience, skills, education, projects, certifications, etc."
                rows={10}
              />
              <div className="card-footer">
                <span className="saved-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  Auto-saved
                </span>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="card">
              <div className="card-header">
                <h3>Job Description</h3>
                <span className="badge">Optional</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to tailor your resume for this specific role..."
                rows={6}
              />

              {/* ATS Toggle */}
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={atsEnabled}
                  onChange={(e) => setAtsEnabled(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <div className="toggle-text">
                  <span>ATS Optimization</span>
                  <span className="toggle-hint">Add hidden keywords for ATS scanners</span>
                </div>
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={handleGenerateResume}
                disabled={isLoading}
              >
                {isLoading && !jobDescription ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
                    </svg>
                    Generate Resume
                  </>
                )}
              </button>
              <button
                className="btn-outline"
                onClick={handleGenerateTailoredResume}
                disabled={isLoading || !jobDescription.trim()}
              >
                {isLoading && jobDescription ? (
                  <>
                    <span className="spinner-small"></span>
                    Tailoring...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    Tailor for Job
                  </>
                )}
              </button>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="loading-card">
                <div className="loading-animation">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
                <span>{loadingMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`panel preview-panel ${activeTab === 'preview' ? 'active' : ''}`}>
          {generatedResume ? (
            <>
              <div className="preview-toolbar no-print">
                <div className="toolbar-left">
                  <h3>{currentVersion?.name || 'Resume Preview'}</h3>
                  {currentVersion && (currentVersion.changes?.length || currentVersion.atsKeywords?.length) && (
                    <button
                      className={`changes-btn ${showChanges ? 'active' : ''}`}
                      onClick={() => setShowChanges(!showChanges)}
                    >
                      <span className="changes-icon">✦</span>
                      {currentVersion.changes?.length || 0} changes
                      {currentVersion.atsKeywords?.length ? ` + ${currentVersion.atsKeywords.length} keywords` : ''}
                    </button>
                  )}
                </div>
                <button className="btn-download" onClick={handleDownloadPDF}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download PDF
                </button>
              </div>

              {/* Changes Panel */}
              {showChanges && currentVersion && (currentVersion.changes?.length || currentVersion.atsKeywords?.length) && (
                <ChangesView
                  version={currentVersion}
                  onClose={() => setShowChanges(false)}
                />
              )}

              <div className="resume-wrapper" ref={resumeRef}>
                <ResumeTemplate
                  data={generatedResume}
                  atsKeywords={atsEnabled || currentVersion?.atsKeywords?.length ? (currentVersion?.atsKeywords || atsKeywords) : undefined}
                />
              </div>
            </>
          ) : (
            <div className="empty-preview no-print">
              <div className="empty-icon">◈</div>
              <h3>No Resume Yet</h3>
              <p>Enter your resume data and click Generate to see your resume here</p>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
