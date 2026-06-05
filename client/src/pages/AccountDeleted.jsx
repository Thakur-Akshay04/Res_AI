import { Home, LogIn, Trash2 } from 'lucide-react';

const AccountDeleted = () => {
  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-red-500/5 to-orange-500/5 blur-3xl top-[-200px] left-[-200px]" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-red-600/4 to-rose-500/4 blur-3xl bottom-[-150px] right-[-100px]" />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="bg-neu-bg-panel border border-neu-border rounded-2xl p-10 shadow-exec-lg text-center">
          
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-pulse-soft">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>

          <div className="exec-divider mb-6" />
          <h1 className="font-bold text-2xl tracking-tight mb-3">
            Account Deleted
          </h1>
          <p className="text-neu-text-muted text-sm leading-relaxed mb-8">
            Your account has been <span className="text-red-400 font-medium">permanently deleted</span>. All your resumes and data have been erased and cannot be recovered.
          </p>

          <div className="space-y-3">
            <a
              href="/"
              className="neu-btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
              id="deleted-home-btn"
            >
              <Home className="w-4 h-4" />
              Go Back to Home Page
            </a>
            <a
              href="/login"
              className="neu-btn w-full flex items-center justify-center gap-2 py-3 text-sm"
              id="deleted-login-btn"
            >
              <LogIn className="w-4 h-4" />
              Login or Sign Up
            </a>
          </div>

          <p className="text-[10px] text-neu-text-muted mt-6 tracking-wide uppercase">
            Thank you for using ResuCraft
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDeleted;
