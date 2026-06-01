import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useGroqStore from '@/stores/groqStore';

const DAILY_LIMIT = 100000;
const STALE_AFTER_MS = 30000;

const formatCountdown = (ms) => {
  if (ms <= 0) return 'now';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const AITokenMeter = () => {
  const token = useAuthStore(state => state.token);
  const { groqStatus, isLoading, lastFetched, fetchGroqStatus } = useGroqStore();

  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!token) return;
    const isStale = !lastFetched || (Date.now() - lastFetched) > STALE_AFTER_MS;
    if (isStale) {
      fetchGroqStatus(token);
    }
    const id = setInterval(() => fetchGroqStatus(token), STALE_AFTER_MS);
    return () => clearInterval(id);
  }, [token, fetchGroqStatus, lastFetched]);

  const updateCountdown = useCallback(() => {
    const resetAt = groqStatus?.dailyResetAt;
    if (!resetAt) {
      setCountdown(null);
      return;
    }
    const resetTime = new Date(resetAt).getTime();
    const remaining = resetTime - Date.now();
    if (remaining <= 0) {
      setCountdown('now');
      if (remaining > -5000 && token) {
        fetchGroqStatus(token, true);
      }
    } else {
      setCountdown(formatCountdown(remaining));
    }
  }, [groqStatus?.dailyResetAt, token, fetchGroqStatus]);

  useEffect(() => {
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, [updateCountdown]);

  if (!token) return null;

  const hasData = !!groqStatus?.lastUpdated;
  const dailyLimit = groqStatus?.dailyLimit || DAILY_LIMIT;

  let remaining, limit;

  if (hasData && groqStatus.dailyRemaining !== null) {
    remaining = groqStatus.dailyRemaining;
    limit = dailyLimit;
  } else if (hasData && groqStatus.tokensRemaining !== null) {
    remaining = groqStatus.tokensRemaining;
    limit = groqStatus.tokensLimit || 12000;
  } else {
    remaining = null;
    limit = DAILY_LIMIT;
  }

  const usedPercent = remaining !== null
    ? Math.max(0, Math.min(100, (remaining / limit) * 100))
    : 0;

  const isExhausted = remaining === 0;
  const isLow = !isExhausted && remaining !== null && usedPercent < 15;
  const isUnknown = !hasData;

  const hue = isExhausted ? 0 : Math.round((usedPercent / 100) * 120);

  const formatTokens = (n) => {
    if (n === null || n === undefined) return '—';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };
  if (isExhausted) {
    return (
      <div className="group relative flex items-center justify-center">
        <div 
          className="flex items-center gap-2 px-3 py-1.5 bg-red-950/20 border border-red-500/30 rounded-full shadow-lg shadow-red-950/10 cursor-default transition-all duration-300 hover:border-red-500/50 animate-pulse"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
            <AlertTriangle className="w-3 h-3 text-red-500" />
          </div>
          <span className="text-xs font-black font-display text-red-400">
            EXHAUSTED
          </span>
        </div>

        <div className="absolute top-[110%] right-0 mt-2 w-64 p-3 bg-neu-bg-panel border border-red-500/40 rounded-neu shadow-xl text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
          <div className="font-bold mb-1 text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Daily Token Limit Reached
          </div>
          <p className="text-neu-text-light leading-snug">
            Groq's free-tier daily limit of <strong className="text-white">{(dailyLimit / 1000).toFixed(0)}k tokens</strong> has been exhausted.
            {countdown && countdown !== 'now' && (
              <span className="block mt-1">⏳ Resets in: <strong className="text-white font-mono">{countdown}</strong></span>
            )}
            {countdown === 'now' && (
              <span className="block mt-1 text-green-400 font-semibold">🔄 Refreshing — limit just reset!</span>
            )}
            {!countdown && groqStatus?.resetAt && (
              <span className="block mt-1">⏳ Resets in: <strong className="text-white">{groqStatus.resetAt}</strong></span>
            )}
          </p>
          <p className="mt-1.5 text-[10px] text-red-400 font-semibold">
            AI features will resume after the daily reset.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div
      className="group relative flex items-center justify-center"
      style={{ '--meter-hue': hue }}
    >
      <div 
        className="relative flex flex-col justify-center px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-full shadow-md shadow-black/30 cursor-default transition-all duration-300 overflow-hidden"
      >
        <div className="flex items-center gap-1.5">
          <div 
            className="flex items-center justify-center w-4 h-4 rounded-full transition-colors"
            style={{ 
              backgroundColor: `rgba(20, 20, 20, 0.4)`,
              border: `1px solid hsl(${hue}, 70%, 45%)`
            }}
          >
            <Zap 
              className="w-2.5 h-2.5" 
              style={{ 
                color: `hsl(${hue}, 85%, 55%)`,
                filter: `drop-shadow(0 0 4px hsl(${hue}, 80%, 50%))`
              }} 
            />
          </div>

          <div className="flex items-baseline gap-0.5">
            {(isLoading && !hasData) ? (
              <span className="text-[11px] font-medium text-neu-text-muted animate-pulse">Loading...</span>
            ) : isUnknown ? (
              <span className="text-[11px] font-medium text-neu-text-muted animate-pulse">Connecting...</span>
            ) : (
              <>
                <span 
                  className="text-xs font-black font-display tracking-tight"
                  style={{ color: `hsl(${hue}, 85%, 55%)` }}
                >
                  {formatTokens(remaining)}
                </span>
                <span className="text-[9px] font-bold text-neu-text-muted opacity-80">
                  tokens left
                </span>
              </>
            )}
          </div>
        </div>

        {!isUnknown && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${usedPercent}%`, 
                backgroundColor: `hsl(${hue}, 75%, 45%)`,
                boxShadow: `0 0 6px hsl(${hue}, 75%, 55%)`
              }}
            />
          </div>
        )}
      </div>

      <div className="absolute top-[110%] right-0 mt-2 w-60 p-3 bg-neu-bg-panel border border-neu-border rounded-neu shadow-xl text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 exec-highlight">
        <div className="font-bold mb-1 flex items-center gap-1.5 text-[hsl(var(--meter-hue),75%,40%)] dark:text-[hsl(var(--meter-hue),80%,45%)]">
          <Zap className="w-3 h-3" />
          Groq API Tokens
        </div>
        {!hasData ? (
          <p className="text-neu-text-light">
            {isLoading ? 'Fetching token status...' : 'Run an AI action to see live usage stats.'}
          </p>
        ) : (
          <>
            <div className="flex justify-between mb-1">
              <span className="text-neu-text-light">Remaining today</span>
              <span className="font-semibold text-[hsl(var(--meter-hue),75%,40%)] dark:text-[hsl(var(--meter-hue),80%,45%)]">
                {formatTokens(remaining)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neu-text-light">Daily limit</span>
              <span className="font-semibold">{formatTokens(limit)}</span>
            </div>
            <div className="w-full bg-neu-border dark:bg-[#2d2d2d] rounded-full h-1 mb-1">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${usedPercent}%`, backgroundColor: `hsl(${hue}, 75%, 45%)` }}
              />
            </div>
            <p className="text-[10px] text-neu-text-muted mt-1">
              ~{usedPercent.toFixed(0)}% available. Each AI action uses 2k–10k tokens.
            </p>
            {countdown && countdown !== 'now' && (
              <p className="text-[10px] text-neu-text-muted mt-0.5">
                ⏳ Daily limit resets in <span className="font-mono font-semibold text-neu-text-light">{countdown}</span>
              </p>
            )}
            {isLow && (
              <p className="mt-1.5 text-[10px] font-bold text-amber-400">
                ⚠️ Running low — use AI features sparingly.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AITokenMeter;
