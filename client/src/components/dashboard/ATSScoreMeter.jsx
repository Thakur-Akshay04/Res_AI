const ATSScoreMeter = ({ score = 0 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: 'var(--neu-success)', text: 'text-neu-success', label: 'Excellent', bg: 'bg-emerald-50 text-neu-success' };
    if (s >= 60) return { stroke: 'var(--neu-warning)', text: 'text-neu-warning', label: 'Good', bg: 'bg-amber-50 text-neu-warning' };
    if (s >= 40) return { stroke: 'var(--neu-warning)', text: 'text-orange-500', label: 'Fair', bg: 'bg-orange-50 text-orange-600' };
    return { stroke: 'var(--neu-danger)', text: 'text-neu-danger', label: 'Needs Work', bg: 'bg-red-50 text-neu-danger' };
  };

  const color = getColor(score);

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="110" height="110" className="transform -rotate-90">
          <circle
            cx="55" cy="55" r={radius}
            stroke="var(--neu-border)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="55" cy="55" r={radius}
            stroke="var(--neu-border-light)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
          <circle
            cx="55" cy="55" r={radius}
            stroke={color.stroke}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="ats-gauge-circle"
            style={{ '--score-offset': offset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-extrabold text-2xl ${color.text}`}>
            {score}
          </span>
          <span className="text-[10px] text-neu-text-muted font-medium">/ 100</span>
        </div>
      </div>

      <div>
        <h4 className="font-display font-bold text-sm mb-1">ATS Score</h4>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color.text} ${color.bg}`}>
          {color.label}
        </div>
        <p className="text-xs text-neu-text-muted mt-2 max-w-[200px]">
          {score >= 80
            ? 'Your resume is well-optimized for ATS systems.'
            : score >= 60
            ? 'Good match but can be improved with more keywords.'
            : 'Consider adding more relevant keywords from the JD.'}
        </p>
      </div>
    </div>
  );
};

export default ATSScoreMeter;
