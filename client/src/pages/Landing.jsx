import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, ArrowRight, Target, Download,
  PenTool, CheckCircle, Search, Sparkles, Layout,
  Code, Briefcase, Database, Brain
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import useAuthStore from '@/stores/authStore';

const AppPreviewBlock = () => {
  const [activeTab, setActiveTab] = useState('experience');

  return (
    <div className="group/preview w-full border border-neu-border bg-neu-bg rounded-xl overflow-hidden shadow-exec flex flex-col hover:border-neu-primary/60 hover:-translate-y-1 hover:shadow-glow-md transition-all duration-300">
      <div className="bg-neu-bg-panel border-b border-neu-border px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400/80 hover:scale-110 transition-transform" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400/80 hover:scale-110 transition-transform" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400/80 hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-[9px] sm:text-[10px] text-neu-text-muted font-mono ml-1 sm:ml-2 group-hover/preview:text-neu-text-light transition-colors duration-300">resuai_workspace_v1.0</span>
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Live Preview Sync</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row p-4 sm:p-5 gap-4 sm:gap-5 w-full min-h-[340px] bg-neu-bg-panel/40 relative">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neu-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-neu-primary" /> Builder Form
            </span>
            <div className="flex items-center gap-1 bg-neu-bg-dark border border-neu-border/50 rounded-lg p-0.5 shadow-inner">
              {['info', 'experience', 'skills'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold capitalize transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-neu-bg-panel text-neu-primary shadow-sm border border-neu-border/30'
                      : 'text-neu-text-muted hover:text-neu-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 border border-neu-border bg-neu-bg-dark/80 rounded-lg p-3 sm:p-4 flex flex-col gap-3 hover:border-neu-border-light transition-all duration-300">
            {activeTab === 'info' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div>
                  <div className="text-[9px] font-bold text-neu-text-muted uppercase mb-1">Full Name</div>
                  <div className="h-8 bg-neu-bg-panel border border-neu-border/60 rounded px-2.5 flex items-center text-xs text-neu-text-light font-medium">
                    Alex Pereira
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-neu-text-muted uppercase mb-1">Target Title</div>
                  <div className="h-8 bg-neu-bg-panel border border-neu-border/60 rounded px-2.5 flex items-center text-xs text-neu-text-light font-medium">
                   Full Stack Developer
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-neu-text-muted uppercase mb-1">Contacts</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-7 bg-neu-bg-panel border border-neu-border/60 rounded px-2 flex items-center text-[10px] text-neu-text-light truncate">poatan.dev</div>
                    <div className="h-7 bg-neu-bg-panel border border-neu-border/60 rounded px-2 flex items-center text-[10px] text-neu-text-light truncate">github.com/poatan</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="flex flex-col gap-3 animate-fade-in h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-neu-text-muted uppercase">Bullet Point Optimizer</span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-mono font-bold">Groq-Streaming</span>
                  </div>
                  <div className="relative border border-neu-border bg-neu-bg-panel rounded p-2.5 flex flex-col gap-2 hover:border-neu-primary/40 transition-colors">
                    <div className="text-[10px] text-neu-text-light italic leading-relaxed">
"Improved application response times by optimizing database queries and backend APIs, ensuring smooth performance."</div>
                    <div className="h-px bg-neu-border/40" />
                    <div className="text-[10px] text-emerald-400 font-medium leading-relaxed flex items-start gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Optimized bullet and matched 3 key skills for ATS scan automatically.</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {['✓ Node.js APIs', '✓ Query Optimization', '✓ MongoDB Indexing'].map((tag, i) => (
                    <span key={i} className="text-[8px] sm:text-[9px] bg-neu-primary-glow/10 text-neu-primary border border-neu-primary/20 px-1.5 py-0.5 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="flex flex-col gap-2.5 animate-fade-in">
                <div>
                  <div className="text-[9px] font-bold text-neu-text-muted uppercase mb-1.5">Languages & Frameworks</div>
                  <div className="flex flex-wrap gap-1">
                    {['React.js', 'Next.js', 'Node.js', 'Express', 'TailwindCSS', 'TypeScript'].map((tag) => (
                      <span key={tag} className="text-[9px] bg-neu-bg-panel border border-neu-border/80 px-2 py-0.5 rounded text-neu-text-light hover:text-neu-text hover:border-neu-primary/40 cursor-default transition-all duration-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-neu-text-muted uppercase mb-1.5">Competitive Programming</div>
                  <div className="flex items-center gap-2 p-2 bg-neu-bg-panel border border-neu-border/60 rounded">
                    <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-[9px] font-mono">LC</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-neu-text truncate">LeetCode Scraper Connected</div>
                      <div className="text-[8px] text-neu-text-muted truncate">User: poatan_10| Solved: 540 | Top 4%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center relative">
          <div className="w-px h-full bg-gradient-to-b from-neu-border via-neu-primary/20 to-neu-border" />
          <div className="absolute w-7 h-7 rounded-full bg-neu-bg-dark border border-neu-primary/30 flex items-center justify-center text-neu-primary shadow-exec-glow group-hover/preview:scale-105 group-hover/preview:bg-neu-primary group-hover/preview:text-black group-hover/preview:border-neu-primary transition-all duration-300">
            <Layout className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 group/pdf">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neu-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neu-primary" /> PDF Output
            </span>
            <span className="text-[9px] text-neu-text-muted font-mono flex items-center gap-1 bg-neu-bg-dark/40 border border-neu-border/30 px-1.5 py-0.5 rounded">
              Default.pdf
            </span>
          </div>

          <div className="flex-1 border border-neu-border/80 bg-white dark:bg-zinc-950 rounded-lg p-4 flex flex-col gap-3 relative shadow-sm overflow-hidden hover:border-neu-primary/40 hover:shadow-glow-sm transition-all duration-300">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="h-3 bg-zinc-850 dark:bg-zinc-200 w-24 rounded" />
              <div className="flex gap-1.5 justify-center mt-1">
                <div className="h-1.5 bg-zinc-400 dark:bg-zinc-600 w-8 rounded-sm" />
                <div className="h-1.5 bg-zinc-400 dark:bg-zinc-600 w-12 rounded-sm" />
                <div className="h-1.5 bg-zinc-400 dark:bg-zinc-600 w-10 rounded-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 bg-zinc-800 dark:bg-zinc-300 w-14 rounded" />
                <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-800" />
              </div>

              <div className="flex justify-between w-full mt-0.5">
                <div className="h-2 bg-zinc-700 dark:bg-zinc-400 w-28 rounded-sm" />
                <div className="h-1.5 bg-zinc-400 dark:bg-zinc-600 w-12 rounded-sm" />
              </div>
              <div className="h-1.5 bg-zinc-500 dark:bg-zinc-500 w-20 rounded-sm" />

              <div className="flex flex-col gap-1.5 pl-2 mt-1">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <div className="h-1.5 bg-zinc-400 dark:bg-zinc-600 w-5/6 rounded-sm" />
                </div>
                
                <div className="flex gap-1.5 items-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1 py-0.5 rounded group/active-line transition-all duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200" />
                  <div className="h-1.5 bg-neutral-800 dark:bg-neutral-400 w-[92%] rounded-sm" />
                </div>

                <div className="flex gap-1.5 items-center">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <div className="h-1.5 bg-zinc-400 dark:bg-zinc-600 w-4/5 rounded-sm" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center gap-2">
                <div className="h-2 bg-zinc-800 dark:bg-zinc-300 w-10 rounded" />
                <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-800" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 rounded-full w-10" />
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 rounded-full w-14" />
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 rounded-full w-12" />
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2 rounded-full w-8" />
              </div>
            </div>

            <div className="absolute bottom-3 right-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-2 py-1 rounded shadow flex items-center gap-1.5 hover:scale-105 transition-transform duration-200">
              <div className="w-2.5 h-2.5 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-[9px] font-bold font-mono text-emerald-400">98% Match</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const { token } = useAuthStore();

  return (
    <div className="min-h-screen bg-neu-bg text-neu-text font-sans selection:bg-neu-primary/20">
      <nav className="border-b border-neu-border bg-neu-bg/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity" id="nav-logo">
            <div className="w-8 h-10 sm:w-9 sm:h-12 rounded-xl bg-neu-primary/10 flex items-center justify-center text-neu-primary">
              <FileText className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight">
              ResuAI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['How it Works', 'Features', 'Templates'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-neu-text-light hover:text-neu-text transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <ThemeToggle />
            <Link to="/login" className="border border-neu-border bg-neu-bg-panel hover:bg-neu-primary/10 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-neu-text-light hover:text-neu-primary transition-all duration-200" id="nav-login-btn">
              Log In
            </Link>
            <Link to="/register" className="bg-neu-text text-neu-bg rounded text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm hover:shadow active:scale-95 hover:opacity-90 transition-all duration-200" id="nav-register-btn">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-slide-up max-w-xl">
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6">
              Resumes engineered to land the interview.
            </h1>

            <p className="text-neu-text-light text-sm sm:text-lg leading-relaxed mb-8 sm:mb-10">
              Fill in your experience and paste a job description. The AI rewrites your bullet points to match what the employer is asking for, scores your resume against ATS filters, and exports a clean PDF — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 sm:mb-14 w-full">
              <Link to="/register" className="group w-full sm:w-auto bg-neu-primary text-neu-bg-panel rounded-lg text-sm font-medium px-6 py-3 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-neu-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transform transition-all duration-200" id="hero-cta-btn">
                Create a Resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="w-full mt-10 lg:mt-0 animate-fade-in relative lg:pl-8">
            <AppPreviewBlock />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-neu-border">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-bold text-3xl tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-neu-text-light text-lg">
            Three steps. Your experience in, a job-ready resume out.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {[
            {
              icon: FileText,
              title: '1. Add your experience',
              desc: 'Enter your education, work history, projects, skills, and certifications. Paste the job description you\'re targeting — the AI uses it to tailor everything.',
            },
            {
              icon: PenTool,
              title: '2. Generate & edit',
              desc: 'Hit generate and watch the AI rewrite your bullets in real-time via streaming. Click any section on the live preview to jump back and edit it directly.',
            },
            {
              icon: Download,
              title: '3. Score, save & export',
              desc: 'Run an ATS audit to see your score out of 100 with matched and missing keywords. Save versions, share a public link, or download a clean PDF.',
            },
          ].map((item, idx) => (
            <div key={item.title} className="flex flex-col pt-6 group text-center items-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-neu-bg-panel border border-neu-border flex items-center justify-center mb-6 shadow-sm group-hover:border-neu-primary/40 group-hover:shadow-md transition-all duration-300">
                <item.icon className="w-6 h-6 text-neu-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-xl text-neu-text mb-3">{item.title}</h3>
              <p className="text-neu-text-light text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-neu-border">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="font-bold text-3xl tracking-tight mb-6">
              What's actually inside
            </h2>
            <p className="text-neu-text-light mb-8 max-w-md">
              No vague promises. Here's what you get when you create a resume with ResuAI.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: Sparkles, text: 'AI bullet rewriting via Groq streaming — watch your experience get rewritten for each job, token by token, in real time' },
                { icon: Search, text: 'ATS audit that scores your resume out of 100, lists matched keywords, flags missing ones, and gives line-by-line suggestions' },
                { icon: Target, text: 'Click any section on the live preview and the builder scrolls you right to that field — no hunting through forms' },
                { icon: Layout, text: 'Version history, public sharing links, and one-click PDF export with a clean, ATS-safe layout' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 bg-neu-bg-panel rounded-xl px-5 py-4 border border-neu-border hover:border-neu-primary/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300">
                  <f.icon className="w-5 h-5 text-neu-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-sm text-neu-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="templates">
            <h2 className="font-bold text-3xl tracking-tight mb-8">
               Clean PDF Templates
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {['Modern', 'Executive', 'Minimal', 'Classic'].map((tpl, i) => (
                <div key={tpl} className="relative border border-neu-border rounded-xl p-1 bg-neu-bg-panel group cursor-default hover:border-neu-primary/40 hover:shadow-md transition-all duration-300 overflow-hidden">
                  {i !== 0 && (
                    <div className="absolute inset-0 z-10 bg-neu-bg-panel/80 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-neu-bg border border-neu-border px-3 py-1 rounded text-xs font-medium text-neu-text-light shadow-sm">
                        Coming soon
                      </span>
                    </div>
                  )}

                  <div className="border border-neu-border/50 bg-[#ffffff] rounded-lg h-32 p-3 opacity-60 group-hover:opacity-100 flex flex-col transition-opacity duration-300 overflow-hidden relative">
                    {i === 0 ? (
                      <div className="w-full flex gap-[1px] flex-col items-center">
                        <div className="h-2 bg-zinc-800 w-1/3 mb-1 rounded-sm mt-1" />
                        <div className="flex gap-1.5 justify-center mb-1">
                          <div className="h-0.5 bg-zinc-400 w-4 rounded-sm" />
                          <div className="h-0.5 bg-zinc-400 w-6 rounded-sm" />
                          <div className="h-0.5 bg-zinc-400 w-4 rounded-sm" />
                        </div>
                        <div className="flex gap-1.5 justify-center mb-2">
                          <div className="h-0.5 bg-zinc-400 w-5 rounded-sm" />
                          <div className="h-0.5 bg-zinc-400 w-4 rounded-sm" />
                        </div>

                        <div className="w-full text-left">
                          <div className="h-1 bg-zinc-700 w-12 rounded-sm" />
                          <div className="h-[1px] w-full bg-zinc-400 my-0.5" />
                          <div className="h-0.5 bg-zinc-400 w-full rounded-sm my-[1px]" />
                          <div className="h-0.5 bg-zinc-400 w-4/5 rounded-sm mb-1.5" />
                        </div>
                        
                        <div className="w-full text-left">
                          <div className="h-1 bg-zinc-700 w-16 rounded-sm" />
                          <div className="h-[1px] w-full bg-zinc-400 my-0.5" />
                          
                          <div className="flex justify-between w-full my-0.5">
                            <div className="h-1 bg-zinc-700 w-10 rounded-sm" />
                            <div className="h-0.5 bg-zinc-400 w-8 rounded-sm" />
                          </div>
                          <div className="h-0.5 bg-zinc-600 w-20 rounded-sm mb-1" />
                          
                          <div className="flex gap-1 items-center pl-1 mb-[1px]">
                            <div className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
                            <div className="h-0.5 bg-zinc-400 w-full rounded-sm" />
                          </div>
                          <div className="flex gap-1 items-center pl-1 mb-[1px]">
                            <div className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
                            <div className="h-0.5 bg-zinc-400 w-4/5 rounded-sm" />
                          </div>
                          <div className="flex gap-1 items-center pl-1 mb-1.5">
                            <div className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
                            <div className="h-0.5 bg-zinc-400 w-5/6 rounded-sm" />
                          </div>
                        </div>

                        <div className="w-full text-left mt-[-2px]">
                          <div className="h-1 bg-zinc-700 w-10 rounded-sm" />
                          <div className="h-[1px] w-full bg-zinc-400 my-0.5" />
                          <div className="flex justify-between w-full my-0.5">
                            <div className="h-0.5 bg-zinc-700 w-24 rounded-sm" />
                            <div className="h-0.5 bg-zinc-400 w-6 rounded-sm" />
                          </div>
                          <div className="flex gap-1 items-center pl-1 mb-[1px]">
                            <div className="h-0.5 w-0.5 rounded-full bg-zinc-600" />
                            <div className="h-0.5 bg-zinc-400 w-[95%] rounded-sm" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-1.5 bg-neu-text-muted/60 w-1/2 mb-1 rounded-full" />
                        <div className="h-0.5 w-full bg-neu-border mb-1" />
                        <div className="h-1 bg-neu-text-muted/30 rounded-sm w-full group-hover:bg-neu-primary/20 transition-colors" />
                        <div className="h-1 bg-neu-text-muted/30 rounded-sm w-5/6" />
                        <div className="h-1 bg-neu-text-muted/30 rounded-sm w-4/5" />
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 font-medium text-xs">
                    <span className={`transition-colors ${i === 0 ? 'group-hover:text-neu-text text-neu-text-light' : 'text-neu-text-muted'}`}>{tpl}</span>
                    {i === 0 && <span className="bg-neu-border px-2 py-0.5 rounded text-[10px] text-neu-text-muted">Default</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-32">
        <div className="border border-neu-border bg-neu-bg-panel rounded-2xl p-6 sm:p-12 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
          <h2 className="font-bold text-2xl sm:text-3xl mb-4">
            Stop sending the same resume everywhere
          </h2>
          <p className="text-neu-text-light text-sm sm:text-base mb-8 max-w-sm">
            Paste a job description, let the AI rewrite your experience to match, check the ATS score, and export a clean PDF. That's it.
          </p>
          <Link
            to="/register"
            className="group w-full sm:w-auto bg-neu-primary text-neu-bg-panel text-sm font-medium px-8 py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-neu-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transform transition-all duration-200 flex items-center justify-center"
          >
            Get Started — it's free
          </Link>
        </div>
      </section>

      <footer className="border-t border-neu-border bg-neu-bg">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-neu-text-light">
          <div className="font-semibold text-neu-text flex items-center gap-2">
             <FileText className="w-4 h-4" /> ResuAI
          </div>
          <span>© {new Date().getFullYear()} ResuAI</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;