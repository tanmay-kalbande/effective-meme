import type { ResumeData } from '../types';

interface ResumeTemplateProps {
    data: ResumeData;
    atsKeywords?: string[];
}

export function ResumeTemplate({ data, atsKeywords }: ResumeTemplateProps) {
    return (
        <div className="resume-container">
            <div className="header">
                <h1>{data.fullName?.toUpperCase() || 'YOUR NAME'}</h1>
                <div className="title">{data.title || 'Your Title'}</div>
                <div className="contact-info">
                    {data.email && <span>📧 {data.email}</span>}
                    {data.phone && <span>📱 {data.phone}</span>}
                    {data.linkedin && (
                        <span>
                            <a href={data.linkedin} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                            </a>
                        </span>
                    )}
                    {data.github && (
                        <span>
                            <a href={data.github} target="_blank" rel="noopener noreferrer">
                                GitHub
                            </a>
                        </span>
                    )}
                    {data.portfolio && (
                        <span>
                            <a href={data.portfolio} target="_blank" rel="noopener noreferrer">
                                Portfolio
                            </a>
                        </span>
                    )}
                    {data.location && <span>📍 {data.location}</span>}
                </div>
            </div>

            <div className="content">
                {data.summary && (
                    <div className="section">
                        <h2 className="section-title">Professional Summary</h2>
                        <p className="summary">{data.summary}</p>
                    </div>
                )}

                {data.experiences && data.experiences.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Professional Experience</h2>
                        {data.experiences.map((exp, index) => (
                            <div key={index} className="experience-item">
                                <div className="experience-header">
                                    <div>
                                        <div className="job-title">{exp.jobTitle}</div>
                                        <div className="company">{exp.company}</div>
                                    </div>
                                    <div className="duration">{exp.duration}</div>
                                </div>
                                {exp.duties && exp.duties.length > 0 && (
                                    <ul className="duties">
                                        {exp.duties.map((duty, i) => (
                                            <li key={i}>{duty}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {data.skills && (
                    <div className="section">
                        <h2 className="section-title">Technical Skills</h2>
                        <div className="skills-grid">
                            {data.skills.languages && (
                                <div className="skill-category">
                                    <strong>Languages:</strong> {data.skills.languages}
                                </div>
                            )}
                            {data.skills.databases && (
                                <div className="skill-category">
                                    <strong>Databases:</strong> {data.skills.databases}
                                </div>
                            )}
                            {data.skills.mlAi && (
                                <div className="skill-category">
                                    <strong>ML/AI:</strong> {data.skills.mlAi}
                                </div>
                            )}
                            {data.skills.visualization && (
                                <div className="skill-category">
                                    <strong>Visualization:</strong> {data.skills.visualization}
                                </div>
                            )}
                            {data.skills.frameworks && (
                                <div className="skill-category">
                                    <strong>Frameworks:</strong> {data.skills.frameworks}
                                </div>
                            )}
                            {data.skills.bigData && (
                                <div className="skill-category">
                                    <strong>Big Data:</strong> {data.skills.bigData}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {data.projects && data.projects.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Key Projects</h2>
                        {data.projects.map((project, index) => (
                            <div key={index} className="project-item">
                                <span className="project-title">{project.title}</span>
                                {project.description}
                            </div>
                        ))}
                    </div>
                )}

                {data.certifications && data.certifications.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Certifications</h2>
                        <div className="certifications-list">
                            {data.certifications.map((cert, index) => (
                                <div key={index} className="cert-item">
                                    • {cert}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ATS Hidden Keywords */}
            {atsKeywords && atsKeywords.length > 0 && (
                <div
                    style={{
                        color: 'white',
                        fontSize: '1px',
                        lineHeight: 0,
                        opacity: 0,
                        position: 'absolute',
                        left: '-9999px',
                    }}
                    aria-hidden="true"
                >
                    {atsKeywords.join(' ')}
                </div>
            )}
        </div>
    );
}
