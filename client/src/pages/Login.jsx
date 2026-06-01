import { SignIn } from '@clerk/react';
import { Link } from 'react-router-dom';
import { Brain, FileText } from 'lucide-react';
import useThemeStore from '@/stores/themeStore';
import { getClerkAppearance } from '@/lib/clerkTheme';

const Login = () => {
  const { theme } = useThemeStore();
  const appearance = getClerkAppearance(theme);

  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[480px] mx-4 animate-scale-in">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-neu-bg-panel border-2 border-neu-border text-neu-text-light hover:border-neu-primary/70 hover:bg-neu-primary/10 hover:text-neu-primary transition-all duration-200 mb-6 shadow-sm"
          id="login-back-btn"
        >
          ←
        </Link>

        <div className={`border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1.5 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-white via-[#fff7ed] to-[#fffbeb] border-amber-500/20 hover:border-amber-500/35 shadow-[0_8px_30px_rgba(245,158,11,0.05)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.12)]'
            : 'bg-gradient-to-br from-[#241205] via-[#0c0602] to-[#000000] border-amber-500/20 hover:border-amber-500/40 shadow-exec-lg hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)]'
        }`}>
          <Link to="/" className="flex items-center gap-3 mb-6 group hover:opacity-80 transition-opacity" id="nav-logo">
            <div className="w-9 h-12 rounded-xl bg-neu-primary/10 flex items-center justify-center text-neu-primary">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-neu-text">ResuAI</span>
          </Link>

          <div className="mb-6">
            <h1 className="font-bold text-2xl tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-neu-text-muted text-sm">Sign in to continue building your resume</p>
          </div>

          <SignIn
            routing="hash"
            appearance={appearance}
            signUpUrl="/register"
            fallbackRedirectUrl="/dashboard"
          />
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-neu-text-muted">
          <Brain className="w-3 h-3 animate-pulse-soft" />
          <span className="text-[10px] tracking-widest uppercase">Secure Authentication via Clerk</span>
        </div>
      </div>
    </div>
  );
};

export default Login;