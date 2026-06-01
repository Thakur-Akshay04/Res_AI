import { Loader2, CheckCircle, Sparkles } from 'lucide-react';

const StreamingProgress = ({ progress, tokens }) => {
  const steps = [
    'Analyzing job description...',
    'Rewriting bullets...',
    'Scoring ATS...',
    'Generation complete!',
  ];

  const currentStepIndex = steps.findIndex(s =>
    progress?.toLowerCase().includes(s.split('...')[0].toLowerCase().slice(0, 10))
  );

  return (
    <div className="neu-card p-5 animate-fade-in">
      <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-neu-primary animate-pulse" />
        AI Generation in Progress
      </h4>
      <div className="space-y-2 mb-4">
        {steps.map((step, i) => {
          const isActive = progress?.toLowerCase().includes(step.split('...')[0].toLowerCase().slice(0, 10));
          const isDone = currentStepIndex > i || progress === 'Generation complete!';
          const isCurrent = isActive && !isDone;

          return (
            <div key={i} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle className="w-4 h-4 text-neu-success flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-neu-primary animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-neu-bg-dark flex-shrink-0" />
              )}
              <span className={`text-xs ${
                isDone ? 'text-neu-success font-medium' :
                isCurrent ? 'text-neu-primary font-medium' :
                'text-neu-text-muted'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      {tokens && (
        <div className="neu-inset p-3 rounded-xl max-h-32 overflow-y-auto scrollbar-custom">
          <p className="text-xs text-neu-text-light font-mono whitespace-pre-wrap break-words">
            {tokens.slice(-300)}
            <span className="inline-block w-1.5 h-3.5 bg-neu-primary ml-0.5 animate-pulse rounded-sm" />
          </p>
        </div>
      )}
    </div>
  );
};

export default StreamingProgress;
