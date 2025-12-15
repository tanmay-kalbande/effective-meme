import { useState, useRef } from 'react';
import type { ResumeData, AISettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { generateBaseResume, generateTailoredResume, extractATSKeywords } from './services/aiService';
import { ResumeTemplate } from './components/ResumeTemplate';
import { SettingsModal } from './components/SettingsModal';
import './App.css';

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
  const resumeRef = useRef<HTMLDivElement>(null);

  const validateSettings = (): boolean => {
    if (settings.provider === 'google' && !settings.googleApiKey) {
      setError('Please configure your Google AI API key in Settings');
      return false;
    }
    if (settings.provider === 'cerebras' && !settings.cerebrasApiKey) {
      setError('Please configure your Cerebras API key in Settings');
      return false;
    }
    return true;
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
      const resume = await generateTailoredResume(resumeInput, jobDescription, settings);
      setGeneratedResume(resume);

      if (atsEnabled) {
        setLoadingMessage('Extracting ATS keywords...');
        const keywords = await extractATSKeywords(jobDescription, settings);
        setAtsKeywords(keywords);
      } else {
        setAtsKeywords([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tailored resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header no-print">
        <div className="header-content">
          <h1>Resume Builder</h1>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
        </div>
        <p className="subtitle">AI-powered resume generation and tailoring</p>
      </header>

      <main className="main-content">
        {/* Input Section */}
        <div className="input-section no-print">
          {/* Resume Data Input */}
          <div className="input-group">
            <label htmlFor="resume-input">Your Resume Information</label>
            <textarea
              id="resume-input"
              value={resumeInput}
              onChange={(e) => setResumeInput(e.target.value)}
              placeholder="Paste all your resume details here (experience, skills, education, projects, certifications, contact info, etc.)"
              rows={12}
            />
          </div>

          {/* Job Description Input */}
          <div className="input-group">
            <label htmlFor="jd-input">Job Description (Optional - for AI Tailoring)</label>
            <textarea
              id="jd-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to tailor your resume for this specific role"
              rows={8}
            />
          </div>

          {/* ATS Toggle */}
          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={atsEnabled}
                onChange={(e) => setAtsEnabled(e.target.checked)}
              />
              <span className="toggle-switch"></span>
              <span>Enable ATS Keyword Optimization (Hidden White Text)</span>
            </label>
            <p className="hint">Adds relevant keywords from JD in white text to help pass ATS scanners</p>
          </div>

          {/* Error Display */}
          {error && <div className="error-message">{error}</div>}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handleGenerateResume}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Resume'}
            </button>
            <button
              className="btn-secondary"
              onClick={handleGenerateTailoredResume}
              disabled={isLoading || !jobDescription.trim()}
            >
              {isLoading ? 'Tailoring...' : 'Generate Tailored Resume'}
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>{loadingMessage}</span>
            </div>
          )}
        </div>

        {/* Resume Preview Section */}
        {generatedResume && (
          <div className="preview-section">
            <div className="preview-header no-print">
              <h2>Resume Preview</h2>
              <button className="btn-download" onClick={handleDownloadPDF}>
                Download PDF
              </button>
            </div>
            <div className="resume-wrapper" ref={resumeRef}>
              <ResumeTemplate data={generatedResume} atsKeywords={atsEnabled ? atsKeywords : undefined} />
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
