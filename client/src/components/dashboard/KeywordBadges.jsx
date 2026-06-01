import { Check, X } from 'lucide-react';

const KeywordBadges = ({ matched = [], missing = [] }) => {
  if (matched.length === 0 && missing.length === 0) return null;

  return (
    <div className="space-y-3">
      {matched.length > 0 && (
        <div>
          <h4 className="font-bold text-xs text-neu-text-light mb-2 flex items-center gap-1.5">
            <Check className="w-3 h-3 text-neu-success" />
            Matched Keywords ({matched.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {matched.map((kw, i) => (
              <span key={i} className="neu-badge-success text-[11px]">
                <Check className="w-2.5 h-2.5 mr-1" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <h4 className="font-bold text-xs text-neu-text-light mb-2 flex items-center gap-1.5">
            <X className="w-3 h-3 text-neu-danger" />
            Missing Keywords ({missing.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missing.map((kw, i) => (
              <span key={i} className="neu-badge-danger text-[11px]">
                <X className="w-2.5 h-2.5 mr-1" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordBadges;
