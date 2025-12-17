import type { ResumeVersion } from '../types';

interface ChangesViewProps {
    version: ResumeVersion;
    onClose: () => void;
}

export function ChangesView({ version, onClose }: ChangesViewProps) {
    const { changes, companyName, atsKeywords, alignmentScore, alignmentDetails } = version;

    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'; // green
        if (score >= 60) return '#eab308'; // yellow
        if (score >= 40) return '#f97316'; // orange
        return '#ef4444'; // red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent Match';
        if (score >= 70) return 'Strong Match';
        if (score >= 50) return 'Moderate Match';
        return 'Needs Improvement';
    };

    return (
        <div className="changes-panel">
            <div className="changes-header">
                <h3>
                    <span className="changes-icon">✦</span>
                    AI Changes
                    {companyName && <span className="changes-company">for {companyName}</span>}
                </h3>
                <button className="close-btn-small" onClick={onClose}>×</button>
            </div>

            {/* Alignment Score */}
            {alignmentScore !== undefined && alignmentScore > 0 && (
                <div className="changes-section alignment-section">
                    <div className="alignment-header">
                        <div className="alignment-score-display">
                            <div
                                className="score-circle"
                                style={{
                                    borderColor: getScoreColor(alignmentScore),
                                    color: getScoreColor(alignmentScore)
                                }}
                            >
                                <span className="score-value">{alignmentScore}</span>
                                <span className="score-percent">%</span>
                            </div>
                            <div className="score-info">
                                <div className="score-label" style={{ color: getScoreColor(alignmentScore) }}>
                                    {getScoreLabel(alignmentScore)}
                                </div>
                                <div className="score-subtitle">Job Alignment</div>
                            </div>
                        </div>
                    </div>

                    {alignmentDetails && (
                        <div className="alignment-details">
                            {alignmentDetails.matchingPoints.length > 0 && (
                                <div className="alignment-points matching">
                                    <div className="points-label">✓ Matching Skills</div>
                                    {alignmentDetails.matchingPoints.map((point, i) => (
                                        <div key={i} className="point-item matching">{point}</div>
                                    ))}
                                </div>
                            )}
                            {alignmentDetails.missingPoints.length > 0 && (
                                <div className="alignment-points missing">
                                    <div className="points-label">⚡ Areas to Strengthen</div>
                                    {alignmentDetails.missingPoints.map((point, i) => (
                                        <div key={i} className="point-item missing">{point}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Changes List */}
            {changes && changes.length > 0 && (
                <div className="changes-section">
                    <div className="section-label">Modifications Made</div>
                    <div className="changes-list">
                        {changes.map((change, index) => (
                            <div key={index} className="change-row">
                                <span className="change-number">{index + 1}</span>
                                <span className="change-text">{change}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ATS Keywords */}
            {atsKeywords && atsKeywords.length > 0 && (
                <div className="changes-section">
                    <div className="section-label">
                        ATS Keywords Added ({atsKeywords.length})
                    </div>
                    <div className="keywords-grid">
                        {atsKeywords.map((keyword, index) => (
                            <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
