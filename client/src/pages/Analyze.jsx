import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Upload, FileText, ArrowLeft, Loader2, Search,
  Target, AlertTriangle, CheckCircle, XCircle, Sparkles, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import ATSScoreMeter from '@/components/dashboard/ATSScoreMeter';
import SectionBreakdown from '@/components/dashboard/SectionBreakdown';
import LineSuggestions from '@/components/resume/LineSuggestions';
import AITokenMeter from '@/components/dashboard/AITokenMeter';
import useGroqStore from '@/stores/groqStore';

const Analyze = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);
  const navigate = useNavigate();

  const pdfUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setFile(f);
    toast.success(`Selected: ${f.name}`);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error('Upload a resume PDF first'); return; }
    if (jdText && jdText.length < 50) { toast.error('Job description must be at least 50 characters if provided'); return; }

    setIsAnalyzing(true);
    setResult(null);
    const loadingToast = toast.loading('Analyzing your resume...');

    try {
      const token = useAuthStore.getState().token;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jdText);

      const res = await fetch(`${apiUrl}/resume/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      if (data.data?.apiCredits !== undefined) {
        useAuthStore.getState().updateUser({ apiCredits: data.data.apiCredits });
      }

      setResult(data.data);

      queryClient.invalidateQueries({ queryKey: ['reports'] });

      toast.dismiss(loadingToast);
      toast.success(`ATS Score: ${data.data.overall_score}/100`);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      useGroqStore.getState().refreshAfterAIAction(useAuthStore.getState().token);
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg">
      <header className="px-4 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="neu-btn px-3 py-2.5" id="analyze-back-btn">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg">Resume Analyzer</h1>
            <p className="text-xs text-neu-text-muted">Upload your resume & get a genuine ATS score</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AITokenMeter />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`neu-card p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] border-2 border-dashed ${dragOver
                ? 'border-neu-primary bg-neu-primary/5 scale-[1.02]'
                : file
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-transparent hover:border-neu-primary/30'
                }`}
              id="analyze-upload-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />

              {file ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-4">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-display font-bold text-sm text-emerald-700">{file.name}</p>
                  <p className="text-xs text-neu-text-muted mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Click to change
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-neutral-800 dark:bg-neutral-700 flex items-center justify-center shadow-lg mb-4">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-display font-bold text-sm">Drop your resume PDF here</p>
                  <p className="text-xs text-neu-text-muted mt-1">or click to browse • PDF only • Max 5MB</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="neu-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-neu-primary" />
                  Target Job Description <span className="text-neu-text-muted font-normal text-xs">(optional)</span>
                </h3>
                <span className="text-xs text-neu-text-muted">{jdText.length} chars</span>
              </div>
              <textarea
                className="neu-textarea text-sm min-h-[160px]"
                placeholder="Paste the full job description here... (optional)"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                id="analyze-jd-textarea"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || (jdText && jdText.length < 50)}
                className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg"
                style={{
                  backgroundColor: 'var(--neu-primary)',
                  color: 'var(--neu-bg)',
                  opacity: (isAnalyzing || !file || (jdText && jdText.length < 50)) ? 0.3 : 1
                }}
                id="analyze-submit-btn"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div ref={resultRef} className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 animate-slide-up">
            <div className="hidden lg:block h-[calc(100vh-8rem)] sticky top-8">
              <div className="neu-card p-3 w-full h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <FileText className="w-4 h-4 text-neu-primary" />
                  <h3 className="font-display font-bold text-sm">Original Resume</h3>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden bg-white/50 relative border-2 border-neu-border/50">
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Resume Preview"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="neu-card p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <ATSScoreMeter score={result.overall_score} />
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-base mb-2">Analysis Verdict</h3>
                    <p className="text-sm text-neu-text-light leading-relaxed">{result.verdict}</p>

                    {result.reportId && (
                      <div className="mt-4 flex items-center justify-between p-3.5 bg-status-indigo rounded-xl border border-status-indigo">
                        <div>
                          <p className="text-xs font-bold text-status-indigo">Auto-saved to Dashboard</p>
                          <p className="text-[10px] text-neu-text-muted mt-0.5">This report is now accessible from your dashboard.</p>
                        </div>
                        <Link
                          to={`/report/${result.reportId}`}
                          className="neu-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 text-status-indigo border-status-indigo hover:bg-[var(--neu-indigo-bg)]"
                          id="view-report-link"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Saved Report
                        </Link>
                      </div>
                    )}

                    {result.formatting_issues?.length > 0 && (
                      <div className="mt-4 p-3 bg-status-cyan rounded-xl border border-status-cyan">
                        <h4 className="text-xs font-bold text-status-cyan uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Formatting Issues
                        </h4>
                        <ul className="space-y-1">
                          {result.formatting_issues.map((issue, i) => (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="neu-card p-5">
                  <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Matched Keywords
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {result.matched_keywords?.length || 0}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matched_keywords?.length > 0 ? (
                      result.matched_keywords.map((kw, i) => (
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
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                      {result.missing_keywords?.length || 0}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_keywords?.length > 0 ? (
                      result.missing_keywords.map((kw, i) => (
                        <span key={i} className="neu-badge-danger text-[10px]">{kw}</span>
                      ))
                    ) : (
                      <p className="text-xs text-neu-text-muted italic">All important keywords found!</p>
                    )}
                  </div>
                </div>
              </div>

              <SectionBreakdown sections={result.sections} />
              <LineSuggestions suggestions={result.line_suggestions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;
