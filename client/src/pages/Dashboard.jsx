import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus, FileText, Trash2, Clock, Building2,
  Search, Layers, ChevronRight, Briefcase,
  Eye, BarChart2, Upload, TrendingUp
} from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/stores/authStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AITokenMeter from '@/components/dashboard/AITokenMeter';

const ResumeThumbnail = ({ resume }) => {
  const score = resume.atsScore || 0;
  const lines = [0.85, 0.7, 0.9, 0.6, 0.75, 0.55, 0.8, 0.65];

  return (
    <div className="resume-thumbnail w-full p-4 relative select-none">
      <div className="mb-3">
        <div className="h-2.5 bg-gray-700/80 rounded-sm mb-1.5" style={{ width: '65%' }} />
        <div className="h-1.5 bg-gray-500/50 rounded-sm mb-1" style={{ width: '45%' }} />
        <div className="h-1.5 bg-gray-500/40 rounded-sm" style={{ width: '55%' }} />
      </div>

      <div className="h-px bg-gradient-to-r from-neutral-700/60 via-neutral-500/50 to-transparent mb-3" />

      <div className="space-y-2.5">
        <div>
          <div className="h-1.5 bg-neutral-700/40 rounded-sm w-1/4 mb-1.5" />
          <div className="space-y-1">
            <div className="h-1 bg-gray-500/35 rounded-sm w-full" />
            <div className="h-1 bg-gray-500/30 rounded-sm w-11/12" />
          </div>
        </div>

        <div>
          <div className="h-1.5 bg-neutral-700/40 rounded-sm w-1/3 mb-1.5" />
          <div className="pl-1.5 border-l border-neutral-500/25 space-y-1">
            {lines.slice(0, 4).map((w, i) => (
              <div key={i} className="h-1 bg-gray-500/30 rounded-sm" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
        </div>

        <div>
          <div className="h-1.5 bg-neutral-700/40 rounded-sm w-1/4 mb-1.5" />
          <div className="flex flex-wrap gap-1">
            {['React', 'Node', 'TS', 'AWS'].map((s) => (
              <span key={s} className="h-1.5 bg-gray-600/40 border border-gray-500/20 rounded-sm text-[5px] text-transparent px-1">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {score > 0 && (
        <div className={`absolute top-2 right-2 exec-score-badge text-[8px] font-bold
          ${score >= 80 ? 'exec-score-high' : score >= 50 ? 'exec-score-mid' : 'exec-score-low'}`}
        >
          {score}
        </div>
      )}

      <div className="absolute top-0 right-0 w-0 h-0"
        style={{
          borderStyle: 'solid',
          borderWidth: '0 10px 10px 0',
          borderColor: 'transparent #d0c8b8 transparent transparent',
        }}
      />
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 80) return 'exec-score-high';
  if (score >= 50) return 'exec-score-mid';
  return 'exec-score-low';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data.data),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted');
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete resume'),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/resumes', { jobTitle: 'Untitled Position' }),
    onSuccess: (res) => navigate(`/builder/${res.data.data._id}`),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create resume'),
  });

  const [deleteReportId, setDeleteReportId] = useState(null);

  const { data: reports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get('/analysis-reports').then((r) => r.data.data),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id) => api.delete(`/analysis-reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Analysis report deleted');
      setDeleteReportId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete report'),
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  const filtered = resumes.filter((r) =>
    r.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
    r.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neu-bg flex flex-col">
      <header className="border-b border-white/[0.05] bg-neu-bg/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 relative">
          <div className="flex shrink-0 -ml-2 sm:-ml-6 md:-ml-10">
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-2.5 group hover:opacity-90 transition-all" id="dashboard-logo">
              <div className="w-8 h-8 rounded-lg bg-neu-bg-panel border border-neu-border flex items-center justify-center text-neu-primary shadow-sm group-hover:border-neu-primary/50 transition-colors">
                <FileText className="w-4 h-4 text-neu-primary" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:inline font-bold text-xl tracking-tight text-neu-text font-display">
                ResuCraft
              </span>
            </Link>
          </div>

          {resumes.length > 0 && (
            <div className="hidden sm:flex flex-1 justify-center px-4 sm:px-8">
              <div className="relative w-full max-w-[280px] sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neu-text-muted" strokeWidth={2.25} />
                <input
                  type="text"
                  className="neu-input text-xs pl-9 pr-4 py-1.5 w-full bg-neu-bg-panel border border-neu-border text-neu-text transition-all focus:border-neu-primary"
                  placeholder="Search resumes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="dashboard-search"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />

            <Link
              to="/analyze"
              className="text-xs px-3 py-1.5 flex items-center gap-1.5 border border-neu-border bg-neu-bg-panel hover:bg-neu-primary/10 text-neu-text-light hover:text-neu-primary rounded-lg transition-all duration-200 shadow-sm"
              id="dashboard-analyze-btn"
            >
              <TrendingUp className="w-3.5 h-3.5 text-neu-primary" strokeWidth={2.25} />
              <span className="hidden sm:inline font-bold tracking-tight">Analyze</span>
            </Link>

            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="text-xs px-3.5 py-1.5 flex items-center gap-1.5 bg-neu-primary text-[var(--neu-btn-primary-text)] border border-neu-border hover:brightness-110 active:scale-[0.98] rounded-lg transition-all duration-200 font-bold tracking-tight shadow-md shadow-neu-primary/10"
              id="dashboard-new-resume-btn"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">New Resume</span>
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-0 sm:gap-2 border border-neu-border bg-neu-bg-panel hover:bg-neu-primary/10 px-1.5 sm:px-2.5 py-1 rounded-lg transition-all duration-200 shadow-sm group"
              id="dashboard-profile-link"
              style={{ height: '32px' }}
            >
              <div
                className="rounded-full overflow-hidden border border-neu-border group-hover:border-neu-primary/50 transition-colors flex-shrink-0 flex items-center justify-center"
                style={{ width: '22px', height: '22px', minWidth: '22px', minHeight: '22px' }}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="rounded-full object-cover"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                ) : (
                  <div className="w-full h-full bg-neu-primary/20 flex items-center justify-center rounded-full">
                    <span className="text-[9px] font-black text-neu-primary">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-neu-text-light group-hover:text-neu-text transition-colors duration-200">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>

            <AITokenMeter />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex-1 min-w-0">
            <div className="exec-label mb-2">Workspace</div>
            <h1 className="font-bold text-3xl tracking-tight">My Resumes</h1>
            <p className="text-neu-text-muted text-sm mt-1">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} · {resumes.filter(r => r.atsScore > 0).length} scored
            </p>
          </div>

          {resumes.length > 0 && (
            <div className="sm:hidden w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neu-text-muted" />
                <input
                  type="text"
                  className="neu-input text-xs pl-9 py-2.5 w-full"
                  placeholder="Search resumes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="dashboard-search-mobile"
                />
              </div>
            </div>
          )}

          <Link
            to="/analyze"
            className="hidden md:flex items-center gap-2 text-sm exec-bw-btn px-5 py-2.5 self-start md:self-auto active:scale-[0.98] group"
            id="dashboard-analyze-link"
          >
            <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" strokeWidth={2.5} />
            Upload & Analyze PDF
          </Link>
        </div>

        <div className="exec-divider mb-10" />

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="exec-resume-card flex flex-col border border-white/[0.05] bg-neu-bg-panel/40">
                <div className="h-40 bg-white/[0.03] border-b border-white/[0.05]" />
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/[0.08] w-2/3 rounded" />
                      <div className="h-3 bg-white/[0.04] w-1/2 rounded" />
                    </div>
                    <div className="w-8 h-8 rounded bg-white/[0.08]" />
                  </div>
                  <div className="h-2 bg-white/[0.04] w-1/3 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-white/[0.08] flex-1 rounded" />
                    <div className="h-8 bg-white/[0.08] w-10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/[0.08] text-center">
            <div className="w-12 h-12 border border-white/[0.08] flex items-center justify-center mb-6">
              <Layers className="w-5 h-5 text-neu-text-muted" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {search ? 'No Matches Found' : 'No Resumes Yet'}
            </h3>
            <p className="text-neu-text-muted text-sm mb-8 max-w-xs">
              {search
                ? 'Try a different search term.'
                : 'Create your first AI-optimized resume to get started.'}
            </p>
            {!search && (
              <button
                onClick={() => createMutation.mutate()}
                className="neu-btn-primary text-xs px-6 py-2.5 inline-flex items-center gap-2"
                id="dashboard-empty-create-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Resume
              </button>
            )}
          </div>

        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="exec-resume-card flex flex-col items-center justify-center min-h-[240px] border-dashed border-white/[0.1] hover:border-neu-primary/40 text-center group"
              id="dashboard-new-card-btn"
            >
              <div className="w-10 h-10 border border-white/[0.1] group-hover:border-neu-primary/40 flex items-center justify-center mb-3 transition-colors duration-200">
                <Plus className="w-4 h-4 text-neu-text-muted group-hover:text-neu-primary transition-colors duration-200" />
              </div>
              <span className="text-xs font-medium text-neu-text-muted group-hover:text-neu-text transition-colors duration-200 tracking-wider uppercase">
                New Resume
              </span>
            </button>

            {filtered.map((resume, idx) => (
              <div
                key={resume._id}
                className="exec-resume-card animate-fade-in flex flex-col"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Link to={`/builder/${resume._id}`} className="block flex-1" id={`dashboard-thumb-${resume._id}`}>
                  <ResumeThumbnail resume={resume} />
                </Link>

                <div className="border-t border-white/[0.05] p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{resume.jobTitle || 'Untitled'}</h3>
                      {resume.companyName && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-neu-text-muted">
                           <Building2 className="w-3 h-3 flex-shrink-0" />
                           <span className="truncate">{resume.companyName}</span>
                        </div>
                      )}
                    </div>
                    {resume.atsScore > 0 && (
                      <div className={`exec-score-badge ${getScoreClass(resume.atsScore)} flex-shrink-0`}>
                        {resume.atsScore}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-neu-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      {resume.versions?.length || 0}v
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(resume.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/builder/${resume._id}`}
                      className="flex-1 neu-btn text-[10px] px-3 py-1.5 flex items-center justify-center gap-1"
                      id={`dashboard-edit-${resume._id}`}
                    >
                      <Briefcase className="w-3 h-3" />
                      Open
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(resume._id)}
                      className="neu-btn text-[10px] px-2.5 py-1.5 text-neu-danger hover:border-red-800/50 hover:bg-red-900/[0.08] transition-colors"
                      id={`dashboard-delete-${resume._id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 flex items-end justify-between mb-10">
          <div>
            <div className="exec-label mb-2">Reports</div>
            <h2 className="font-bold text-3xl tracking-tight">Saved Analyses</h2>
            <p className="text-neu-text-muted text-sm mt-1">
              {reports.length} report{reports.length !== 1 ? 's' : ''} saved from ATS scans
            </p>
          </div>
        </div>

        <div className="exec-divider mb-10" />

        {isLoadingReports ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="exec-resume-card flex flex-col p-4 border border-white/[0.05] bg-neu-bg-panel/40">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded bg-white/[0.08]" />
                  <div className="w-8 h-8 rounded bg-white/[0.08]" />
                </div>
                <div className="h-4 bg-white/[0.08] w-3/4 rounded mb-2" />
                <div className="space-y-1.5 mb-4">
                  <div className="h-3 bg-white/[0.04] w-full rounded" />
                  <div className="h-3 bg-white/[0.04] w-5/6 rounded" />
                </div>
                <div className="h-3 bg-white/[0.04] w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/[0.08] text-center">
            <div className="w-10 h-10 border border-white/[0.08] flex items-center justify-center mb-4">
              <BarChart2 className="w-4 h-4 text-neu-text-muted" />
            </div>
            <h3 className="font-semibold text-sm mb-1">No Saved Reports</h3>
            <p className="text-neu-text-muted text-xs mb-4 max-w-xs">
              Upload a resume PDF to run a deep ATS audit and save your first report.
            </p>
            <Link
              to="/analyze"
              className="exec-bw-btn text-xs px-5 py-2.5 inline-flex items-center gap-2 active:scale-[0.98]"
              id="dashboard-no-reports-btn"
            >
              <Upload className="w-3.5 h-3.5" />
              Analyze Resume PDF
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.map((report, idx) => (
              <div
                key={report._id}
                className="exec-resume-card animate-fade-in flex flex-col p-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 border border-white/[0.08] flex items-center justify-center bg-neu-bg/50 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-neu-primary" />
                    </div>
                    {report.overall_score !== undefined && (
                      <div className={`exec-score-badge ${getScoreClass(report.overall_score)} flex-shrink-0`}>
                        {report.overall_score}
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm line-clamp-1 mb-1 font-display" title={report.resumeName}>
                    {report.resumeName}
                  </h3>

                  {report.jobDescription && (
                    <p className="text-xs text-neu-text-muted line-clamp-2 mb-3 h-8 leading-relaxed">
                      JD: {report.jobDescription}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-neu-text-muted mb-4">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(report.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/report/${report._id}`}
                    className="flex-1 neu-btn text-[10px] px-3 py-1.5 flex items-center justify-center gap-1 font-bold"
                    id={`dashboard-report-open-${report._id}`}
                  >
                    <Eye className="w-3 h-3" />
                    View Report
                  </Link>
                  <button
                    onClick={() => setDeleteReportId(report._id)}
                    className="neu-btn text-[10px] px-2.5 py-1.5 text-neu-danger hover:border-red-800/50 hover:bg-red-900/[0.08] transition-colors"
                    id={`dashboard-report-delete-${report._id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
          id="delete-modal"
        >
          <div className="neu-card p-8 max-w-sm w-full animate-scale-in border border-white/[0.08]">
            <div className="exec-divider mb-6" />

            <div className="w-10 h-10 border border-red-800/40 bg-red-900/10 flex items-center justify-center mb-5">
              <Trash2 className="w-4 h-4 text-neu-danger" />
            </div>

            <h3 className="font-semibold text-lg mb-2">Delete Resume?</h3>
            <p className="text-sm text-neu-text-muted mb-8 leading-relaxed">
              This action is irreversible. All versions and data associated with this resume will be permanently deleted.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteId(null)}
                className="neu-btn flex-1 text-xs py-2.5"
                id="delete-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="neu-btn-danger flex-1 text-xs py-2.5"
                id="delete-confirm-btn"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteReportId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
          id="delete-report-modal"
        >
          <div className="neu-card p-8 max-w-sm w-full animate-scale-in border border-white/[0.08]">
            <div className="exec-divider mb-6" />

            <div className="w-10 h-10 border border-red-800/40 bg-red-900/10 flex items-center justify-center mb-5">
              <Trash2 className="w-4 h-4 text-neu-danger" />
            </div>

            <h3 className="font-semibold text-lg mb-2">Delete Analysis Report?</h3>
            <p className="text-sm text-neu-text-muted mb-8 leading-relaxed">
              This action is irreversible. The saved ATS analysis report and score will be permanently deleted.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteReportId(null)}
                className="neu-btn flex-1 text-xs py-2.5"
                id="delete-report-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteReportMutation.mutate(deleteReportId)}
                disabled={deleteReportMutation.isPending}
                className="neu-btn-danger flex-1 text-xs py-2.5"
                id="delete-report-confirm-btn"
              >
                {deleteReportMutation.isPending ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;