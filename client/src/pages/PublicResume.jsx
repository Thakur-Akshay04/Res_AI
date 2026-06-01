import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, ExternalLink, Mail, Phone, Link2, Globe, Code,
  MapPin, GraduationCap, Briefcase, FolderCode, Award, Trophy,
  Users, Code2, Wrench, Sparkles, Link as LinkIcon
} from 'lucide-react';
import api from '@/lib/axios';

const Section = ({ icon: Icon, title, color, children }) => (
  <div className="animate-slide-up">
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <h2 className="font-display font-bold text-sm uppercase tracking-wider text-neu-text">
        {title}
      </h2>
    </div>
    <div className="exec-divider mb-4" />
    {children}
  </div>
);

const PublicResume = () => {
  const { slug } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-resume', slug],
    queryFn: () => api.get(`/resumes/public/${slug}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neu-bg p-8 flex items-center justify-center animate-pulse">
        <div className="max-w-[800px] w-full bg-white dark:bg-zinc-950 border border-white/[0.05] rounded-xl p-8 space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 bg-white/[0.08] w-48 rounded" />
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="h-3 bg-white/[0.04] w-24 rounded" />
              <div className="h-3 bg-white/[0.04] w-32 rounded" />
              <div className="h-3 bg-white/[0.04] w-28 rounded" />
            </div>
          </div>
          <div className="h-[1px] bg-white/[0.05] w-full" />
          <div className="space-y-3">
            <div className="h-4 bg-white/[0.08] w-24 rounded" />
            <div className="space-y-1.5">
              <div className="h-3 bg-white/[0.04] w-full rounded" />
              <div className="h-3 bg-white/[0.04] w-[96%] rounded" />
              <div className="h-3 bg-white/[0.04] w-[90%] rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-white/[0.08] w-32 rounded" />
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-white/[0.06] w-40 rounded" />
                  <div className="h-3 bg-white/[0.04] w-24 rounded" />
                </div>
                <div className="space-y-1 pl-3">
                  <div className="h-2.5 bg-white/[0.04] w-full rounded" />
                  <div className="h-2.5 bg-white/[0.04] w-[95%] rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-white/[0.08] w-20 rounded" />
            <div className="flex gap-2 flex-wrap">
              <div className="h-6 bg-white/[0.06] w-16 rounded-full" />
              <div className="h-6 bg-white/[0.06] w-20 rounded-full" />
              <div className="h-6 bg-white/[0.06] w-24 rounded-full" />
              <div className="h-6 bg-white/[0.06] w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-neu-bg flex items-center justify-center">
        <div className="neu-card p-12 text-center max-w-md mx-4">
          <div className="neu-circle w-20 h-20 mx-auto mb-6 rounded-full">
            <FileText className="w-8 h-8 text-neu-text-muted" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2">Resume Not Found</h1>
          <p className="text-neu-text-light mb-6">
            This resume may have been made private or the link is invalid.
          </p>
          <Link to="/" className="neu-btn-primary inline-flex items-center gap-2">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { personalInfo, version, jobTitle, companyName, profileType } = data;
  const content = version?.content || {};

  const hasItems = (arr) => arr && arr.length > 0;

  const contactItems = [
    personalInfo?.email && { icon: Mail, text: personalInfo.email, href: `mailto:${personalInfo.email}` },
    personalInfo?.phone && { icon: Phone, text: personalInfo.phone, href: `tel:${personalInfo.phone}` },
    personalInfo?.linkedin && { icon: Link2, text: 'LinkedIn', href: personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}` },
    personalInfo?.website && { icon: Globe, text: 'Portfolio', href: personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}` },
    personalInfo?.github && { icon: Code, text: 'GitHub', href: personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}` },
    personalInfo?.address && { icon: MapPin, text: personalInfo.address },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-neu-bg py-6 sm:py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="neu-card p-0 overflow-hidden animate-slide-up">
          <div className="relative bg-neutral-900 text-white p-8 sm:p-10">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

            <div className="relative z-10">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl mb-2 text-white">
                {personalInfo?.name || 'Professional Resume'}
              </h1>
              {(jobTitle || companyName) && (
                <p className="text-white/80 text-base mb-4 font-medium">
                  {jobTitle}{companyName ? ` at ${companyName}` : ''}
                </p>
              )}

              {contactItems.length > 0 && (
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
                  {contactItems.map((item, i) => {
                    const Wrapper = item.href ? 'a' : 'span';
                    return (
                      <Wrapper
                        key={i}
                        {...(item.href ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors"
                      >
                        <item.icon className="w-3.5 h-3.5 opacity-75" />
                        {item.text}
                      </Wrapper>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {content.summary && (
          <div className="neu-card">
            <Section icon={Sparkles} title="Professional Summary" color="bg-neutral-800 dark:bg-neutral-700">
              <p className="text-sm text-neu-text-light italic leading-relaxed">
                {content.summary}
              </p>
            </Section>
          </div>
        )}

        {hasItems(content.education) && (
          <div className="neu-card">
            <Section icon={GraduationCap} title="Education" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="space-y-4">
                {content.education.map((edu, i) => (
                  <div key={i} className="neu-flat p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-neu-text">{edu.institution}</h3>
                        <p className="text-sm text-neu-text-light">
                          {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {edu.graduationYear && (
                          <span className="text-xs text-neu-text-muted">{edu.graduationYear}</span>
                        )}
                        {edu.gpa && (
                          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {hasItems(content.experience) && (
          <div className="neu-card">
            <Section icon={Briefcase} title="Experience" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="space-y-5">
                {content.experience.map((exp, i) => (
                  <div key={i} className="neu-flat p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-sm text-neu-text">{exp.company}</h3>
                        <p className="text-sm text-neu-text-light italic">{exp.role}</p>
                      </div>
                      {exp.duration && (
                        <span className="text-xs text-neu-text-muted shrink-0">{exp.duration}</span>
                      )}
                    </div>
                    {hasItems(exp.bullets) && (
                      <ul className="list-disc pl-5 space-y-1.5 mt-3">
                        {exp.bullets.filter(b => b?.trim()).map((b, j) => (
                          <li key={j} className="text-sm text-neu-text-light leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {hasItems(content.projects) && (
          <div className="neu-card">
            <Section icon={FolderCode} title="Projects" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="space-y-5">
                {content.projects.map((proj, i) => (
                  <div key={i} className="neu-flat p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-sm text-neu-text">{proj.title}</h3>
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:underline transition-colors shrink-0"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Link
                        </a>
                      )}
                    </div>

                    {proj.description && (
                      <p className="text-sm text-neu-text-light mb-2">{proj.description}</p>
                    )}

                    {hasItems(proj.bullets) && (
                      <ul className="list-disc pl-5 space-y-1.5 mb-3">
                        {proj.bullets.filter(b => b?.trim()).map((b, j) => (
                          <li key={j} className="text-sm text-neu-text-light leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    )}

                    {hasItems(proj.techStack) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.techStack.filter(t => t?.trim()).map((tech, j) => (
                          <span key={j} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {(hasItems(content.skills) || hasItems(content.skillCategories)) && (
          <div className="neu-card">
            <Section icon={Wrench} title="Skills" color="bg-neutral-800 dark:bg-neutral-700">
              {hasItems(content.skillCategories) ? (
                <div className="space-y-4">
                  {content.skillCategories.map((cat, i) => (
                    <div key={i}>
                      {cat.category && (
                        <h4 className="text-xs font-semibold text-neu-text-muted uppercase tracking-wider mb-2">
                          {cat.category}
                        </h4>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {cat.items?.filter(s => s?.trim()).map((skill, j) => (
                          <span key={j} className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {hasItems(content.skills) && (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {content.skills.filter(s => s?.trim()).map((s, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-neu-text-light border border-neu-border">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {content.skills.filter(s => s?.trim()).map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}

        {hasItems(content.certifications) && (
          <div className="neu-card">
            <Section icon={Award} title="Certifications" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="space-y-3">
                {content.certifications.map((cert, i) => (
                  <div key={i} className="neu-flat p-4 rounded-xl flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-sm text-neu-text">{cert.name}</h3>
                      {cert.issuer && (
                        <p className="text-xs text-neu-text-light mt-0.5">Issued by {cert.issuer}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      {cert.year && (
                        <span className="text-xs text-neu-text-muted">{cert.year}</span>
                      )}
                      {cert.status && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          cert.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {cert.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {hasItems(content.achievements) && (
          <div className="neu-card">
            <Section icon={Trophy} title="Achievements" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="space-y-3">
                {content.achievements.map((ach, i) => (
                  <div key={i} className="neu-flat p-4 rounded-xl">
                    <h3 className="font-bold text-sm text-neu-text">{ach.title}</h3>
                    {ach.description && (
                      <p className="text-sm text-neu-text-light mt-1 leading-relaxed">{ach.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {hasItems(content.activities) && (
          <div className="neu-card">
            <Section icon={Users} title="Extracurricular Activities" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="space-y-3">
                {content.activities.map((act, i) => (
                  <div key={i} className="neu-flat p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-sm text-neu-text">{act.title}</h3>
                      {act.role && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium shrink-0">{act.role}</span>
                      )}
                    </div>
                    {act.description && (
                      <p className="text-sm text-neu-text-light mt-1 leading-relaxed">{act.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {content.codingProfile && (
          content.codingProfile.totalProblems ||
          content.codingProfile.leetcode ||
          content.codingProfile.gfg ||
          content.codingProfile.codeforces
        ) && (
          <div className="neu-card">
            <Section icon={Code2} title="Coding Profile" color="bg-neutral-800 dark:bg-neutral-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {content.codingProfile.totalProblems && (
                  <div className="neu-flat p-3 rounded-xl text-center">
                    <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{content.codingProfile.totalProblems}</p>
                    <p className="text-[10px] text-neu-text-muted uppercase tracking-wider">Total Problems</p>
                  </div>
                )}
                {content.codingProfile.leetcode && (
                  <div className="neu-flat p-3 rounded-xl text-center">
                    <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{content.codingProfile.leetcode}</p>
                    <p className="text-[10px] text-neu-text-muted uppercase tracking-wider">LeetCode</p>
                  </div>
                )}
                {content.codingProfile.gfg && (
                  <div className="neu-flat p-3 rounded-xl text-center">
                    <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{content.codingProfile.gfg}</p>
                    <p className="text-[10px] text-neu-text-muted uppercase tracking-wider">GFG</p>
                  </div>
                )}
                {content.codingProfile.codeforces && (
                  <div className="neu-flat p-3 rounded-xl text-center">
                    <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{content.codingProfile.codeforces}</p>
                    <p className="text-[10px] text-neu-text-muted uppercase tracking-wider">Codeforces</p>
                  </div>
                )}
              </div>
            </Section>
          </div>
        )}

        <div className="text-center py-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-neu-text-muted">
            <FileText className="w-4 h-4 text-neu-text-muted" />
            Powered by <span className="font-bold text-neu-text">ResuAI</span>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-neu-primary hover:underline">
            Create your own AI resume
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicResume;
