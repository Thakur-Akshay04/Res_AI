import { useState } from 'react';
import {
  ChevronDown, ChevronUp, CheckCircle, AlertTriangle,
  XCircle, Info, User, FileText, Briefcase, GraduationCap,
  Code, Award, FolderCode
} from 'lucide-react';

const SECTION_META = {
  contact_info: { label: 'Contact Information', icon: User, color: 'from-zinc-500 to-zinc-700' },
  summary: { label: 'Professional Summary', icon: FileText, color: 'from-slate-600 to-slate-800' },
  experience: { label: 'Work Experience', icon: Briefcase, color: 'from-neutral-600 to-neutral-800' },
  education: { label: 'Education', icon: GraduationCap, color: 'from-zinc-600 to-zinc-800' },
  projects: { label: 'Projects', icon: FolderCode, color: 'from-slate-500 to-slate-700' },
  skills: { label: 'Skills', icon: Code, color: 'from-zinc-500 to-zinc-600' },
  certifications: { label: 'Certifications', icon: Award, color: 'from-neutral-500 to-neutral-600' },
};

const STATUS_CONFIG = {
  good: { icon: CheckCircle, label: 'Good', class: 'text-status-success bg-status-success', border: 'border-status-success' },
  warning: { icon: AlertTriangle, label: 'Warning', class: 'text-status-cyan bg-status-cyan', border: 'border-status-cyan' },
  needs_improvement: { icon: Info, label: 'Needs Work', class: 'text-status-warning bg-status-warning', border: 'border-status-warning' },
  missing: { icon: XCircle, label: 'Missing', class: 'text-status-danger bg-status-danger', border: 'border-status-danger' },
};

const SectionCard = ({ sectionKey, data }) => {
  const [open, setOpen] = useState(data.status !== 'good');
  const meta = SECTION_META[sectionKey] || { label: sectionKey, icon: FileText, color: 'from-gray-500 to-gray-600' };
  const status = STATUS_CONFIG[data.status] || STATUS_CONFIG.needs_improvement;
  const Icon = meta.icon;
  const StatusIcon = status.icon;

  return (
    <div className={`neu-card p-0 overflow-hidden border ${status.border}`} id={`section-${sectionKey}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors"
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-sm`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-display font-bold text-sm">{meta.label}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusIcon className={`w-3.5 h-3.5 ${status.class.split(' ')[0]}`} />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.class}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${
            data.score >= 80 ? 'bg-status-success text-status-success border-status-success' :
            data.score >= 60 ? 'bg-status-cyan text-status-cyan border-status-cyan' :
            data.score >= 40 ? 'bg-status-warning text-status-warning border-status-warning' :
            'bg-status-danger text-status-danger border-status-danger'
          }`}>
            {data.score}/100
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-neu-text-muted" /> : <ChevronDown className="w-4 h-4 text-neu-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 animate-slide-up border-t border-gray-100">
          {data.issues?.length > 0 && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Issues Found</h5>
              <ul className="space-y-1.5">
                {data.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neu-text-light">
                    <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.suggestions?.length > 0 && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Suggestions</h5>
              <ul className="space-y-1.5">
                {data.suggestions.map((sug, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neu-text-light">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(!data.issues?.length && !data.suggestions?.length) && (
            <p className="mt-3 text-sm text-neu-text-muted italic">No issues found — this section looks good!</p>
          )}
        </div>
      )}
    </div>
  );
};

const SectionBreakdown = ({ sections }) => {
  if (!sections) return null;

  const sectionKeys = Object.keys(SECTION_META);

  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-base flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-neutral-800 dark:bg-neutral-700 flex items-center justify-center">
          <FileText className="w-3 h-3 text-white" />
        </div>
        Section Breakdown
      </h3>
      {sectionKeys.map(key => (
        <SectionCard key={key} sectionKey={key} data={sections[key]} />
      ))}
    </div>
  );
};

export default SectionBreakdown;
