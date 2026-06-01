import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import ATSScoreMeter from '@/components/dashboard/ATSScoreMeter';
import SectionBreakdown from '@/components/dashboard/SectionBreakdown';
import LineSuggestions from '@/components/resume/LineSuggestions';
import ResumePreview from '@/components/resume/ResumePreview';

const AnalysisReportPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = useAuthStore.getState().token;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

        const res = await fetch(`${apiUrl}/analysis-reports/${id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch report');
        }

        setReport(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Error loading report');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    if (report?.pdfData) {
      try {
        const byteCharacters = atob(report.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error generating PDF URL from base64:', err);
      }
    }
  }, [report]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neu-bg animate-pulse">
        <header className="px-4 py-4 flex items-center justify-between max-w-[1400px] mx-auto border-b border-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/[0.08]" />
            <div className="space-y-1">
              <div className="w-48 h-5 rounded bg-white/[0.08]" />
              <div className="w-32 h-3.5 rounded bg-white/[0.04]" />
            </div>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto px-4 pb-12 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-8">
            
            <div className="space-y-4">
              <div className="neu-card p-4 h-[1150px] flex flex-col border border-white/[0.05] bg-neu-bg-panel/40">
                <div className="h-5 bg-white/[0.08] w-1/3 rounded mb-4" />
                <div className="flex-1 bg-white dark:bg-zinc-950 rounded-xl p-8 border border-white/[0.03] shadow-sm flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 bg-white/[0.08] w-48 rounded" />
                    <div className="h-3 bg-white/[0.04] w-64 rounded" />
                  </div>
                  <div className="h-[1px] bg-white/[0.05] w-full" />
                  <div className="space-y-3">
                    <div className="h-4 bg-white/[0.08] w-24 rounded" />
                    <div className="space-y-1">
                      <div className="h-3 bg-white/[0.04] w-full rounded" />
                      <div className="h-3 bg-white/[0.04] w-[95%] rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="neu-card p-6 border border-white/[0.05] bg-neu-bg-panel/40">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/[0.08] animate-spin flex-shrink-0" />
                  <div className="flex-1 space-y-3 w-full">
                    <div className="h-5 bg-white/[0.08] w-1/3 rounded" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-white/[0.04] w-full rounded" />
                      <div className="h-3.5 bg-white/[0.04] w-[92%] rounded" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="neu-card p-5 border border-white/[0.05] bg-neu-bg-panel/40 space-y-4">
                  <div className="h-4 bg-white/[0.08] w-1/2 rounded" />
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-5 bg-white/[0.06] w-16 rounded-full" />
                    <div className="h-5 bg-white/[0.06] w-20 rounded-full" />
                  </div>
                </div>
                <div className="neu-card p-5 border border-white/[0.05] bg-neu-bg-panel/40 space-y-4">
                  <div className="h-4 bg-white/[0.08] w-1/2 rounded" />
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-5 bg-white/[0.06] w-24 rounded-full" />
                    <div className="h-5 bg-white/[0.06] w-14 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="neu-card p-5 border border-white/[0.05] bg-neu-bg-panel/40 space-y-4">
                <div className="h-4 bg-white/[0.08] w-1/3 rounded" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                    <div className="h-3.5 bg-white/[0.04] w-1/4 rounded" />
                    <div className="h-3.5 bg-white/[0.06] w-12 rounded" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-neu-bg flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="font-display font-bold text-lg">Report Not Found</h2>
        <p className="text-sm text-neu-text-muted">The requested analysis report could not be found.</p>
        <Link to="/dashboard" className="neu-btn px-4 py-2 mt-2">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-bg">
      <header className="px-4 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="neu-btn px-3 py-2.5" id="report-back-btn">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg">{report.resumeName}</h1>
            <p className="text-xs text-neu-text-muted">
              Analyzed on {new Date(report.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-8">
          
          <div className="space-y-4">
            <div className="neu-card p-4 h-[1150px] flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <FileText className="w-4 h-4 text-neu-primary" />
                <h3 className="font-display font-bold text-sm">
                  {pdfUrl ? 'Original Resume' : 'Parsed Resume Content'}
                </h3>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-neu-border relative bg-white/50">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="max-h-full overflow-y-auto p-1">
                    <ResumePreview
                      personalInfo={report.content?.personalInfo}
                      content={report.content}
                      isGenerating={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="neu-card p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <ATSScoreMeter score={report.overall_score} />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base mb-2">Analysis Verdict</h3>
                  <p className="text-sm text-neu-text-light leading-relaxed">{report.verdict}</p>

                  {report.formatting_issues?.length > 0 && (
                    <div className="mt-4 p-3 bg-status-cyan rounded-xl border border-status-cyan">
                      <h4 className="text-xs font-bold text-status-cyan uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Formatting Issues
                      </h4>
                      <ul className="space-y-1">
                        {report.formatting_issues.map((issue, i) => (
                          <li key={i} className="text-xs text-neu-text-light flex items-start gap-1.5">
                            <span className="text-status-cyan mt-0.5">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {report.jobDescription && (
              <div className="neu-card p-5">
                <h3 className="font-display font-bold text-sm mb-2 text-neu-primary">Target Job Description</h3>
                <div className="max-h-[120px] overflow-y-auto text-xs text-neu-text-muted leading-relaxed whitespace-pre-line bg-neu-bg/50 p-3 rounded-lg border border-neu-border/55">
                  {report.jobDescription}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="neu-card p-5">
                <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Matched Keywords
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100/10 text-emerald-500 border border-emerald-500/20">
                    {report.matched_keywords?.length || 0}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {report.matched_keywords?.length > 0 ? (
                    report.matched_keywords.map((kw, i) => (
                      <span key={i} className="neu-badge-success text-[10px]">{kw}</span>
                    ))
                  ) : (
                    <p className="text-xs text-neu-text-muted italic">No keywords matched</p>
                  )}
                </div>
              </div>

              <div className="neu-card p-5">
                <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Missing Keywords
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100/10 text-red-500 border border-red-500/20">
                    {report.missing_keywords?.length || 0}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {report.missing_keywords?.length > 0 ? (
                    report.missing_keywords.map((kw, i) => (
                      <span key={i} className="neu-badge-danger text-[10px]">{kw}</span>
                    ))
                  ) : (
                    <p className="text-xs text-neu-text-muted italic">All important keywords found!</p>
                  )}
                </div>
              </div>
            </div>

            <SectionBreakdown sections={report.sections} />

            <LineSuggestions suggestions={report.line_suggestions} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisReportPage;
