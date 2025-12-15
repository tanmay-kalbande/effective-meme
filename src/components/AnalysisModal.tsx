import type { ResumeAnalysis } from '../services/analysisService';

interface AnalysisModalProps {
    analysis: ResumeAnalysis;
    onClose: () => void;
}

export function AnalysisModal({ analysis, onClose }: AnalysisModalProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'; // Green
        if (score >= 60) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content analysis-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Resume Analysis</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="analysis-body">
                    <div className="score-section">
                        <div className="score-circle" style={{ borderColor: getScoreColor(analysis.score) }}>
                            <span className="score-value" style={{ color: getScoreColor(analysis.score) }}>
                                {analysis.score}
                            </span>
                            <span className="score-label">Score</span>
                        </div>
                        <p className="analysis-summary">{analysis.summary}</p>
                    </div>

                    <div className="analysis-grid">
                        <div className="analysis-card strengths">
                            <h3>Strength</h3>
                            <ul>
                                {analysis.strengths.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="analysis-card weaknesses">
                            <h3>Weaknesses</h3>
                            <ul>
                                {analysis.weaknesses.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="improvements-section">
                        <h3>Recommended Improvements</h3>
                        <ul>
                            {analysis.improvements.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
