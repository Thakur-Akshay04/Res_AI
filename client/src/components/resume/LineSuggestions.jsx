import { useState } from 'react';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';

const SECTION_COLORS = {
  experience: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  summary: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  education: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  skills: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  projects: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  certifications: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  contact_info: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
  general: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700',
};

const LineSuggestionCard = ({ suggestion }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.improved);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = suggestion.improved;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sectionColor = SECTION_COLORS[suggestion.section] || SECTION_COLORS.general;

  return (
    <div className="neu-card p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sectionColor}`}>
          {suggestion.section.replace('_', ' ')}
        </span>
        <span className="text-xs text-neu-text-muted">—</span>
        <span className="text-xs font-medium text-neu-primary">{suggestion.reason}</span>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-full" />
        <div className="pl-4 py-2 bg-red-50/50 dark:bg-red-500/10 rounded-r-lg">
          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Original</span>
          <p className="text-sm text-red-800 dark:text-red-200 mt-0.5 leading-relaxed">{suggestion.original}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowRight className="w-4 h-4 text-neu-text-muted rotate-90" />
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-full" />
        <div className="pl-4 py-2 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-r-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Improved</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-md text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all active:scale-95"
            >
              {copied ? (
                <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy</>
              )}
            </button>
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-0.5 leading-relaxed">{suggestion.improved}</p>
        </div>
      </div>
    </div>
  );
};

const LineSuggestions = ({ suggestions }) => {
  if (!suggestions?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-base flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-neutral-800 dark:bg-neutral-700 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        Line-by-Line Suggestions
        <span className="text-xs font-normal text-neu-text-muted ml-1">({suggestions.length})</span>
      </h3>
      {suggestions.map((sug, idx) => (
        <LineSuggestionCard key={idx} suggestion={sug} />
      ))}
    </div>
  );
};

export default LineSuggestions;
