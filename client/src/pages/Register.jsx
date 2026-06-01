import { SignUp } from '@clerk/react';
import { Link } from 'react-router-dom';
import { Brain, FileText, Code, Target, Eye, GraduationCap, Download } from 'lucide-react';
import useThemeStore from '@/stores/themeStore';
import { getClerkAppearance } from '@/lib/clerkTheme';

const features = [
  { icon: Brain, title: 'AI-Powered Bullet Tailoring', desc: 'Paste the target job description and stream optimized bullet point suggestions in real-time.' },
  { icon: Code, title: 'Coding Profiles Integration', desc: 'Add total problems solved, LeetCode, GFG, and Codeforces stats seamlessly to your resume.' },
  { icon: Target, title: 'Real-Time ATS Keyword Match', desc: 'See your ATS score out of 100 instantly, with highlighted matching and missing keywords.' },
  { icon: GraduationCap, title: 'Fresher & Experienced Layouts', desc: 'Seamlessly switch sections and layouts designed specifically for your experience tier.' },
  { icon: Eye, title: 'Interactive Click-to-Edit Sync', desc: 'Click any bullet or section directly on the live PDF preview to edit that specific field.' },
  { icon: Download, title: 'Single-Page ATS-Friendly Export', desc: 'Download clean, professional executive-level layouts optimized for modern ATS filters.' },
];

const Register = () => {
  const { theme } = useThemeStore();
  const appearance = getClerkAppearance(theme);

  return (
    <div className="h-screen bg-neu-bg flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center px-6 py-4 relative overflow-hidden overflow-y-auto">
        <div className={`w-full max-w-lg animate-slide-up relative z-10 border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-white via-[#fff7ed] to-[#fffbeb] border-amber-500/20 hover:border-amber-500/35 shadow-[0_8px_30px_rgba(245,158,11,0.05)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.12)]'
            : 'bg-gradient-to-br from-[#241205] via-[#0c0602] to-[#000000] border-amber-500/20 hover:border-amber-500/40 shadow-exec-lg hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)]'
        }`}>
          <Link to="/" className="flex items-center gap-3 mb-5 group hover:opacity-80 transition-opacity" id="nav-logo">
            <div className="w-9 h-12 rounded-xl bg-neu-primary/10 flex items-center justify-center text-neu-primary">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-neu-text">ResuAI</span>
          </Link>

          <div className="mb-4 text-center">
            <div className="exec-label mb-2 flex items-center justify-center gap-2">
              <Brain className="w-3 h-3" /> Create Account
            </div>
            <h1 className="font-bold text-2xl tracking-tight">Get started for free</h1>
          </div>

          <SignUp
            routing="hash"
            appearance={appearance}
            signInUrl="/login"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>

      <div className="hidden lg:flex flex-col w-[450px] flex-shrink-0 border-l border-neu-border p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit group hover:opacity-80 transition-opacity" id="nav-logo">
            <div className="w-9 h-12 rounded-xl bg-neu-primary/10 flex items-center justify-center text-neu-primary">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-neu-text">ResuAI</span>
          </Link>
        </div>

        <div className="relative z-10 mt-6 flex-1 flex flex-col min-h-0">
          <h2 className="font-bold text-xl mb-4 tracking-tight">
            Everything you need to<br />
            <span className="text-gradient">land the interview</span>
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-0">
            {features.map((f, i) => (
              <div key={i} className="flex gap-3 px-4 py-3 rounded-lg border border-neu-border bg-neu-bg-raise/40 hover:-translate-y-0.5 hover:border-neu-primary/30 transition-all duration-200">
                <div className="w-8 h-8 rounded-lg bg-neu-primary/10 flex items-center justify-center flex-shrink-0 text-neu-primary">
                  <f.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-neu-text truncate">{f.title}</h4>
                  <p className="text-[11px] text-neu-text-muted mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-neu-text-muted tracking-wide relative z-10 mt-auto pt-4 border-t border-neu-border/50">
          ResuAI — Built specifically for developers, engineers, and product professionals.
        </p>
      </div>
    </div>
  );
};

export default Register;