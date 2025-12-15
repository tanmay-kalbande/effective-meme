import type { ResumeVersion } from '../types';

interface ChangesViewProps {
    version: ResumeVersion;
    onClose: () => void;
}

export function ChangesView({ version, onClose }: ChangesViewProps) {
    const { changes, companyName, atsKeywords } = version;

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
