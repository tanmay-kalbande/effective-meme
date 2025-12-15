interface ChangesViewProps {
    changes: string[];
    companyName?: string;
    onClose: () => void;
}

export function ChangesView({ changes, companyName, onClose }: ChangesViewProps) {
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
            <div className="changes-list">
                {changes.map((change, index) => (
                    <div key={index} className="change-row">
                        <span className="change-number">{index + 1}</span>
                        <span className="change-text">{change}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
