import { FileText } from 'lucide-react';

const ClickableSection = ({ sectionId, onSectionClick, children }) => (
  <div
    onClick={() => onSectionClick?.(sectionId)}
    className="group cursor-pointer"
    title="Click to edit this section"
  >
    {children}
    <div className="hidden group-hover:flex items-center justify-end mt-0.5">
      <span className="text-[9px] text-neutral-800 dark:text-neutral-200 font-medium bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded-full shadow-sm">
        ✏️ Click to edit
      </span>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ marginBottom: '6pt', marginTop: '10pt' }}>
    <div style={{
      fontSize: '16.5pt',
      fontWeight: 'bold',
      color: '#000000',
      borderBottom: '1pt solid #000000',
      paddingBottom: '1pt',
    }}>{children}</div>
  </div>
);

const TwoCol = ({ left, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
    <div style={{ flex: 1 }}>{left}</div>
    {right && <div style={{ whiteSpace: 'nowrap', marginLeft: '12pt', fontSize: '11pt' }}>{right}</div>}
  </div>
);

const ResumePreview = ({ personalInfo, jobTitle, content, isGenerating, streamTokens, onSectionClick }) => {
  const { name, email, phone, address, linkedin, website, github } = personalInfo || {};
  const {
    summary,
    education = [],
    experience = [],
    projects = [],
    certifications = [],
    achievements = [],
    activities = [],
    skills = [],
    skillCategories = [],
    codingProfile = null,
  } = content || {};

  const hasContent = content && (summary || education.length > 0 || experience.length > 0 || projects.length > 0 || skills.length > 0 || skillCategories.length > 0);

  if (!hasContent && !isGenerating) {
    return (
      <div className="neu-card p-8 min-h-[600px] flex flex-col items-center justify-center text-center">
        <div className="neu-circle w-20 h-20 mb-6">
          <FileText className="w-8 h-8 text-neu-text-muted" />
        </div>
        <h3 className="font-display font-bold text-lg text-neu-text-light mb-2">Resume Preview</h3>
        <p className="text-sm text-neu-text-muted max-w-xs">
          Fill in your details, paste a job description, and click Generate to see your AI-optimized resume here.
        </p>
      </div>
    );
  }

  if (isGenerating && !hasContent) {
    return (
      <div className="neu-card p-8 min-h-[600px] flex items-center justify-center">
        <span className="text-neu-text-muted">Generating resume...</span>
      </div>
    );
  }

  const ICON = {
    phone:    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1-.24 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.6 10.8z"/></svg>,
    email:    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
    globe:    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
    linkedin: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="black" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
    github:   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
    pin:      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="black" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  };

  const baseStyle = {
    fontFamily: 'Calibri, Arial, sans-serif',
    fontSize: '13.5pt',
    lineHeight: '1.15',
    color: '#000000',
    background: '#ffffff',
  };

  const bulletListStyle = {
    listStyleType: 'disc',
    paddingLeft: '20pt',
    margin: '3pt 0 0 0',
  };

  const liStyle = { fontSize: '13.5pt', lineHeight: '1.15', marginBottom: '2pt', color: '#000000' };
  const entryStyle = { marginBottom: '8pt' };

  return (
    <div className="bg-white overflow-hidden min-h-[600px] animate-fade-in shadow-sm" style={baseStyle} id="resume-preview">
      <div style={{ padding: '24px 16px' }}>

        <ClickableSection sectionId="section-personal" onSectionClick={onSectionClick}>
          <div style={{ textAlign: 'center', marginBottom: '10pt' }}>
            <div style={{ fontSize: '25.5pt', fontWeight: 'bold', color: '#000000', marginBottom: '4pt' }}>
              {name || 'Your Name'}
            </div>
            {(phone || email || website) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20pt', fontSize: '13pt', color: '#000', alignItems: 'center', marginBottom: '2pt' }}>
                {phone   && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.phone}{phone}</span>}
                {email   && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.email}{email}</span>}
                {website && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.globe}{website}</span>}
              </div>
            )}
            {(linkedin || github || address) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20pt', fontSize: '13pt', color: '#000', alignItems: 'center' }}>
                {linkedin && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.linkedin}{linkedin}</span>}
                {github   && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.github}{github}</span>}
                {address  && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.pin}{address}</span>}
              </div>
            )}
          </div>
        </ClickableSection>

        {summary && (
          <ClickableSection sectionId="section-summary" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Summary</SectionTitle>
              <p style={{ fontSize: '13.5pt', lineHeight: '1.15' }}>
                {summary}
                {isGenerating && <span className="inline-block w-1.5 h-3.5 bg-gray-800 ml-0.5 animate-pulse rounded-sm" />}
              </p>
            </div>
          </ClickableSection>
        )}

        {experience.length > 0 && (
          <ClickableSection sectionId="section-experience" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Work Experience</SectionTitle>
              {experience.map((exp, i) => (
                <div key={i} style={entryStyle}>
                  <TwoCol
                    left={<span style={{ fontWeight: 'bold', fontSize: '15.5pt' }}>{exp.company}{exp.website ? ` | ${exp.website}` : ''}</span>}
                    right={exp.duration}
                  />
                  <TwoCol
                    left={<span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{exp.role}{exp.techStack?.length > 0 ? ` | ${exp.techStack.join(', ')}` : ''}</span>}
                    right={exp.location || null}
                  />
                  {exp.bullets?.length > 0 && (
                    <ul style={bulletListStyle}>
                      {exp.bullets.map((b, j) => <li key={j} style={liStyle}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </ClickableSection>
        )}

        {projects.length > 0 && (
          <ClickableSection sectionId="section-projects" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Projects</SectionTitle>
              {projects.map((proj, i) => (
                <div key={i} style={entryStyle}>
                  <TwoCol
                    left={<span style={{ fontSize: '11pt' }}><strong>{proj.title}</strong>{proj.techStack?.length > 0 ? <span style={{ fontWeight: 'normal' }}> | {proj.techStack.join(', ')}</span> : ''}</span>}
                    right={[proj.github && `GitHub: ${proj.github}`, proj.link].filter(Boolean).join(' | ') || null}
                  />
                  {proj.description && <p style={{ fontSize: '11pt', lineHeight: '1.15', marginTop: '2pt' }}>{proj.description}</p>}
                  {proj.bullets?.length > 0 && (
                    <ul style={bulletListStyle}>
                      {proj.bullets.map((b, j) => <li key={j} style={liStyle}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </ClickableSection>
        )}

        {skillCategories.length > 0 && (
          <div style={{ marginBottom: '10pt' }}>
            <SectionTitle>Technical Skills</SectionTitle>
            <ul style={{ ...bulletListStyle, margin: '2pt 0 0 0' }}>
              {skillCategories.map((cat, i) => (
                <li key={i} style={{ ...liStyle, lineHeight: '1.3' }}>
                  <span style={{ fontWeight: 'bold' }}>{cat.category}:</span>{' '}
                  <span>{cat.items.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {skillCategories.length === 0 && skills.length > 0 && (
          <div style={{ marginBottom: '10pt' }}>
            <SectionTitle>Technical Skills</SectionTitle>
            <p style={{ fontSize: '11pt', lineHeight: '1.15' }}>{skills.join(', ')}</p>
          </div>
        )}

        {certifications.length > 0 && (
          <ClickableSection sectionId="section-certifications" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Certifications</SectionTitle>
              <ul style={bulletListStyle}>
                {certifications.map((cert, i) => (
                  <li key={i} style={{ ...liStyle, lineHeight: '1.3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span>
                        {cert.name}
                        {cert.issuer && ` -- ${cert.issuer}`}
                        {cert.year && ` (${cert.year})`}
                      </span>
                      {cert.status && <span style={{ marginLeft: '12pt' }}>{cert.status}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </ClickableSection>
        )}

        {codingProfile && (codingProfile.totalProblems || codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces || codingProfile.platforms?.length > 0) && (
          <ClickableSection sectionId="section-coding" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Coding Profile</SectionTitle>
              <div style={{ fontSize: '11pt', lineHeight: '1.15' }}>
                {codingProfile.totalProblems && (
                  <p style={{ marginBottom: '3pt' }}>
                    Solved more than <strong>{codingProfile.totalProblems}+</strong> problems across competitive programming platforms.
                  </p>
                )}
                {(codingProfile.platforms?.length > 0
                  ? codingProfile.platforms
                  : [
                      codingProfile.leetcode   && { name: 'LeetCode',     username: codingProfile.leetcode },
                      codingProfile.gfg        && { name: 'GeeksForGeeks', username: codingProfile.gfg },
                      codingProfile.codeforces && { name: 'Codeforces',   username: codingProfile.codeforces },
                    ].filter(Boolean)
                ).map((p, i) => (
                  <div key={i}><span style={{ fontWeight: 'bold' }}>{p.name}:</span> {p.username}</div>
                ))}
              </div>
            </div>
          </ClickableSection>
        )}

        {education.length > 0 && (
          <ClickableSection sectionId="section-education" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Education</SectionTitle>
              {education.map((edu, i) => (
                <div key={i} style={entryStyle}>
                  <TwoCol
                    left={<span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{edu.institution}</span>}
                    right={edu.graduationYear}
                  />
                  <TwoCol
                    left={<span style={{ fontSize: '11pt' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}{edu.gpa ? ` -- CGPA: ${edu.gpa}` : ''}</span>}
                    right={edu.location || null}
                  />
                </div>
              ))}
            </div>
          </ClickableSection>
        )}

        {achievements.length > 0 && (
          <ClickableSection sectionId="section-achievements" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Achievements</SectionTitle>
              <ul style={bulletListStyle}>
                {achievements.map((ach, i) => (
                  <li key={i} style={liStyle}>
                    <span style={{ fontWeight: 'bold' }}>{ach.title}</span>
                    {ach.description && ` -- ${ach.description}`}
                  </li>
                ))}
              </ul>
            </div>
          </ClickableSection>
        )}

        {activities.length > 0 && (
          <ClickableSection sectionId="section-activities" onSectionClick={onSectionClick}>
            <div style={{ marginBottom: '10pt' }}>
              <SectionTitle>Activities and Leadership</SectionTitle>
              {activities.map((act, i) => (
                <div key={i} style={entryStyle}>
                  <span style={{ fontWeight: 'bold' }}>{act.title}</span>
                  {act.role && ` -- ${act.role}`}
                  {act.description && <div style={{ fontSize: '11pt', marginTop: '1pt' }}>{act.description}</div>}
                </div>
              ))}
            </div>
          </ClickableSection>
        )}

      </div>
    </div>
  );
};

export default ResumePreview;
