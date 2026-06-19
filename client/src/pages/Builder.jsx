import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Sparkles, FileText, ArrowLeft, Save, Download, Share2,
  Plus, Trash2, X, ChevronDown, ChevronUp, Eye, Layers,
  GraduationCap, FolderCode, Award, Trophy, Users, Wrench
} from 'lucide-react';
import api from '@/lib/axios';
import useResumeStore from '@/stores/resumeStore';
import useAuthStore from '@/stores/authStore';
import ATSScoreMeter from '@/components/dashboard/ATSScoreMeter';
import KeywordBadges from '@/components/dashboard/KeywordBadges';
import SectionBreakdown from '@/components/dashboard/SectionBreakdown';
import LineSuggestions from '@/components/resume/LineSuggestions';
import ResumePreview from '@/components/resume/ResumePreview';
import AITokenMeter from '@/components/dashboard/AITokenMeter';
import useGroqStore from '@/stores/groqStore';
import VersionHistory from '@/components/resume/VersionHistory';

import StreamingProgress from '@/components/ui/StreamingProgress';

const SectionCard = ({ id, icon: Icon, title, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="neu-card p-5" id={id} data-section={id}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
        type="button"
      >
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
          {title}
        </h3>
        {open ? <ChevronUp className="w-4 h-4 text-neu-text-muted" /> : <ChevronDown className="w-4 h-4 text-neu-text-muted" />}
      </button>
      {open && <div className="mt-4 animate-slide-up">{children}</div>}
    </div>
  );
};

const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const leftPanelRef = useRef(null);

  const {
    generatedContent, setGeneratedContent,
    atsResult, setAtsResult,
    isGenerating, setIsGenerating,
    isScoring, setIsScoring,
    streamProgress, setStreamProgress,
    streamTokens, setStreamTokens, appendStreamToken,

    resetBuilder,
  } = useResumeStore();

  const [profileType, setProfileType] = useState('fresher');

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '', email: user?.email || '', phone: '', address: '',
    linkedin: user?.linkedin || '', website: user?.portfolio || '', github: user?.github || ''
  });

  const [education, setEducation] = useState([
    { institution: '', degree: '', field: '', graduationYear: '', gpa: '' }
  ]);

  const [experience, setExperience] = useState([
    { company: '', role: '', duration: '', locationType: '', bullets: [''] }
  ]);

  const [projects, setProjects] = useState([
    { title: '', description: '', bullets: [''], techStack: [''], link: '' }
  ]);

  const [certifications, setCertifications] = useState([
    { name: '', issuer: '', year: '', status: '' }
  ]);

  const [codingProfile, setCodingProfile] = useState({
    totalProblems: '',
    leetcode: '',
    gfg: '',
    codeforces: '',
  });

  const [achievements, setAchievements] = useState([
    { title: '', description: '' }
  ]);

  const [activities, setActivities] = useState([
    { title: '', role: '', description: '' }
  ]);

  const [skills, setSkills] = useState(['']);
  const [newSkill, setNewSkill] = useState('');

  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [professionalSummary, setProfessionalSummary] = useState('');

  const [showVersions, setShowVersions] = useState(false);
  const [activeExpIdx, setActiveExpIdx] = useState(0);

  const { data: resume, isLoading: isResumeLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => api.get(`/resumes/${id}`).then((r) => r.data.data),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (resume) {
      setProfileType(resume.profileType || 'fresher');
      setJobTitle(resume.jobTitle || '');
      setCompanyName(resume.companyName || '');
      setJdText(resume.jobDescriptionText || '');
      if (resume.personalInfo?.name) setPersonalInfo(resume.personalInfo);
      if (resume.originalExperience?.length > 0) {
        setExperience(resume.originalExperience.map(e => ({
          ...e, bullets: e.bullets?.length ? e.bullets : ['']
        })));
      }
      if (resume.originalEducation?.length > 0) setEducation(resume.originalEducation);
      if (resume.originalProjects?.length > 0) {
        setProjects(resume.originalProjects.map(p => ({
          ...p,
          techStack: p.techStack?.length ? p.techStack : [''],
          bullets: p.bullets?.length ? p.bullets : ['']
        })));
      }
      if (resume.originalCertifications?.length > 0) setCertifications(resume.originalCertifications);
      if (resume.originalAchievements?.length > 0) setAchievements(resume.originalAchievements);
      if (resume.originalActivities?.length > 0) setActivities(resume.originalActivities);
      if (resume.originalSkills?.length > 0) setSkills(resume.originalSkills);
      if (resume.originalCodingProfile) setCodingProfile(resume.originalCodingProfile);

      if (resume.versions?.length > 0) {
        const latest = resume.versions[resume.versions.length - 1];
        setGeneratedContent(latest.content);
        if (latest.content?.summary) {
          setProfessionalSummary(latest.content.summary);
        }
        if (latest.content?.skills?.length > 0 && skills.length <= 1 && !skills[0]) {
          setSkills(latest.content.skills);
        }
        if (resume.atsScore) {
          setAtsResult({
            overall_score: resume.atsScore,
            matched_keywords: resume.matchedKeywords || [],
            missing_keywords: resume.missingKeywords || [],
            suggestions: resume.suggestions || [],
          });
        }
      }
    }

    return () => resetBuilder();
  }, [resume]);

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const btn = el.querySelector('button');
      const isOpen = el.querySelector('.animate-slide-up');
      if (!isOpen && btn) btn.click();

      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-neu-primary', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-neu-primary', 'ring-offset-2'), 1500);
      }, 100);
    }
  }, []);

  const addItem = (setter, template) => setter(prev => [...prev, { ...template }]);
  const removeItem = (setter, idx) => setter(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));
  const updateItem = (setter, idx, field, value) => setter(prev => {
    const updated = [...prev];
    updated[idx] = { ...updated[idx], [field]: value };
    return updated;
  });

  const addExperience = () => {
    setExperience([...experience, { company: '', role: '', duration: '', locationType: '', bullets: [''] }]);
    setActiveExpIdx(experience.length);
  };
  const removeExperience = (idx) => {
    if (experience.length <= 1) return;
    setExperience(experience.filter((_, i) => i !== idx));
    if (activeExpIdx >= experience.length - 1) setActiveExpIdx(Math.max(0, experience.length - 2));
  };
  const updateExperience = (idx, field, value) => {
    const updated = [...experience];
    updated[idx] = { ...updated[idx], [field]: value };
    setExperience(updated);
  };
  const updateBullet = (expIdx, bulletIdx, value) => {
    const updated = [...experience];
    const bullets = [...updated[expIdx].bullets];
    bullets[bulletIdx] = value;
    updated[expIdx] = { ...updated[expIdx], bullets };
    setExperience(updated);
  };
  const addBullet = (expIdx) => {
    const updated = [...experience];
    updated[expIdx] = { ...updated[expIdx], bullets: [...updated[expIdx].bullets, ''] };
    setExperience(updated);
  };
  const removeBullet = (expIdx, bulletIdx) => {
    const updated = [...experience];
    if (updated[expIdx].bullets.length <= 1) return;
    updated[expIdx] = {
      ...updated[expIdx],
      bullets: updated[expIdx].bullets.filter((_, i) => i !== bulletIdx)
    };
    setExperience(updated);
  };

  const updateTech = (projIdx, techIdx, value) => {
    setProjects(prev => {
      const updated = [...prev];
      const techStack = [...updated[projIdx].techStack];
      techStack[techIdx] = value;
      updated[projIdx] = { ...updated[projIdx], techStack };
      return updated;
    });
  };
  const addTech = (projIdx) => {
    setProjects(prev => {
      const updated = [...prev];
      updated[projIdx] = { ...updated[projIdx], techStack: [...updated[projIdx].techStack, ''] };
      return updated;
    });
  };
  const removeTech = (projIdx, techIdx) => {
    setProjects(prev => {
      const updated = [...prev];
      if (updated[projIdx].techStack.length <= 1) return updated;
      updated[projIdx] = {
        ...updated[projIdx],
        techStack: updated[projIdx].techStack.filter((_, i) => i !== techIdx)
      };
      return updated;
    });
  };

  const updateProjectBullet = (projIdx, bulletIdx, value) => {
    const updated = [...projects];
    const bullets = [...updated[projIdx].bullets];
    bullets[bulletIdx] = value;
    updated[projIdx] = { ...updated[projIdx], bullets };
    setProjects(updated);
  };

  const addProjectBullet = (projIdx) => {
    const updated = [...projects];
    updated[projIdx] = { ...updated[projIdx], bullets: [...updated[projIdx].bullets, ''] };
    setProjects(updated);
  };

  const removeProjectBullet = (projIdx, bulletIdx) => {
    const updated = [...projects];
    if (updated[projIdx].bullets.length <= 1) return;
    updated[projIdx] = {
      ...updated[projIdx],
      bullets: updated[projIdx].bullets.filter((_, i) => i !== bulletIdx)
    };
    setProjects(updated);
  };

  const handleGenerate = useCallback(async () => {
    const validExp = experience.filter(e => e.company && e.role && e.bullets.some(b => b.trim()));
    const validEdu = education.filter(e => e.institution && e.degree);
    const validProj = projects.filter(p => p.title);

    if (validExp.length === 0 && validEdu.length === 0 && validProj.length === 0) {
      toast.error('Add at least one education, experience, or project');
      return;
    }
    if (jdText && jdText.length < 50) {
      toast.error('Job description must be at least 50 characters if provided');
      return;
    }
    if (!jobTitle.trim()) {
      toast.error('Please enter a Job Title — it\'s needed for the professional summary');
      const titleField = document.getElementById('builder-job-title-field');
      if (titleField) {
        titleField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleField.focus();
        titleField.classList.add('ring-2', 'ring-neutral-500');
        setTimeout(() => titleField.classList.remove('ring-2', 'ring-neutral-500'), 2000);
      }
      return;
    }

    setIsGenerating(true);
    setStreamProgress('Analyzing job description...');
    setStreamTokens('');
    setGeneratedContent(null);

    try {
      const token = useAuthStore.getState().token;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/resume/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobTitle,
          jobDescriptionText: jdText,
          experience: validExp,
          education: validEdu,
          projects: validProj,
          certifications: certifications.filter(c => c.name),
          achievements: achievements.filter(a => a.title),
          activities: activities.filter(a => a.title),
          skills: skills.filter(s => s.trim()),
          codingProfile: (codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces)
            ? codingProfile : null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Generation failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'progress') {
              setStreamProgress(parsed.step);
            } else if (parsed.type === 'token') {
              appendStreamToken(parsed.content);
            } else if (parsed.type === 'complete') {
              setGeneratedContent(parsed.content);
              if (parsed.content?.summary) {
                setProfessionalSummary(parsed.content.summary);
              }
              if (parsed.content?.skills?.length > 0) {
                setSkills(parsed.content.skills);
              }
              if (parsed.content?.certifications?.length > 0) {
                setCertifications(parsed.content.certifications.map(c => ({
                  name: c.name || '',
                  issuer: c.issuer || '',
                  year: c.year || '',
                  status: c.status || '',
                })));
              }
              setStreamProgress('Generation complete!');
              useAuthStore.getState().setRateLimited(false);
              toast.success('Resume generated!');
              useGroqStore.getState().refreshAfterAIAction(useAuthStore.getState().token);
              const token = useAuthStore.getState().token;
              fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(res => res.json()).then(data => {
                if (data.success && data.data?.apiCredits !== undefined) {
                  useAuthStore.getState().updateUser({ apiCredits: data.data.apiCredits });
                }
              }).catch(() => { });
            } else if (parsed.type === 'error') {
              const isRateLimit = parsed.message?.toLowerCase().includes('rate limit') ||
                parsed.message?.includes('429') ||
                parsed.message?.toLowerCase().includes('tokens per day') ||
                parsed.message?.toLowerCase().includes('tpd');
              if (isRateLimit) {
                useAuthStore.getState().setRateLimited(true);
              }
              useGroqStore.getState().refreshAfterAIAction(useAuthStore.getState().token);
              toast.error(parsed.message);
            }
          } catch (e) {
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'AI service unavailable');
    } finally {
      setIsGenerating(false);
    }
  }, [jobTitle, experience, education, projects, certifications, achievements, activities, skills, jdText]);

  const handleScore = useCallback(async () => {
    const hasAnything =
      professionalSummary ||
      skills.filter(s => s.trim()).length > 0 ||
      education.some(e => e.institution || e.degree) ||
      experience.some(e => e.company || e.role) ||
      projects.some(p => p.title);

    if (!hasAnything) {
      toast.error('Add some resume details before running the ATS audit');
      return;
    }

    const effectiveContent = {
      contact_info: personalInfo,
      summary: professionalSummary || generatedContent?.summary || '',
      education: education.filter(e => e.institution || e.degree),
      experience: experience.filter(e => e.company || e.role),
      projects: projects.filter(p => p.title),
      certifications: certifications.filter(c => c.name),
      achievements: achievements.filter(a => a.title),
      activities: activities.filter(a => a.title),
      skills:
        skills.filter(s => s.trim()).length > 0
          ? skills.filter(s => s.trim())
          : generatedContent?.skills || [],
    };

    setIsScoring(true);
    try {
      const res = await api.post('/resume/audit', {
        resumeContent: effectiveContent,
        jobDescription: jdText,
      });
      if (res.data.data?.apiCredits !== undefined) {
        useAuthStore.getState().updateUser({ apiCredits: res.data.data.apiCredits });
      }

      setAtsResult(res.data.data);
      useAuthStore.getState().setRateLimited(false);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      useGroqStore.getState().refreshAfterAIAction(useAuthStore.getState().token);
      toast.success(`ATS Audit complete! Score: ${res.data.data.overall_score}/100`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Scoring failed';
      const isRateLimit = msg.toLowerCase().includes('rate limit') ||
        msg.includes('429') || msg.toLowerCase().includes('tokens per day');
      if (isRateLimit) useAuthStore.getState().setRateLimited(true);
      toast.error(msg);
    } finally {
      useGroqStore.getState().refreshAfterAIAction(useAuthStore.getState().token);
      setIsScoring(false);
    }
  }, [
    professionalSummary, skills, education, experience, projects,
    certifications, achievements, activities, generatedContent, jdText,
  ]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let resumeId = id;

      if (!resumeId) {
        const createRes = await api.post('/resumes', {
          profileType,
          jobTitle: jobTitle || 'Untitled Position',
          companyName,
          personalInfo,
          originalExperience: experience,
          originalEducation: education,
          originalProjects: projects,
          originalCertifications: certifications,
          originalAchievements: achievements,
          originalActivities: activities,
          originalSkills: skills.filter(s => s.trim()),
        });
        resumeId = createRes.data.data._id;
      }

      await api.post(`/resumes/${resumeId}/version`, {
        content: generatedContent,
        atsScore: atsResult?.overall_score || atsResult?.score || 0,
        matchedKeywords: atsResult?.matched_keywords || [],
        missingKeywords: atsResult?.missing_keywords || [],
        suggestions: atsResult?.suggestions || [],
        jobDescriptionText: jdText,
        personalInfo,
        originalExperience: experience,
        originalEducation: education,
        originalProjects: projects,
        originalCertifications: certifications,
        originalAchievements: achievements,
        originalActivities: activities,
        originalSkills: skills.filter(s => s.trim()),
        profileType,
        jobTitle: jobTitle || 'Untitled Position',
        companyName,
      });

      return resumeId;
    },
    onSuccess: (resumeId) => {
      toast.success('Version saved!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      if (!id) navigate(`/builder/${resumeId}`, { replace: true });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      let resumeId = id;

      const draftPayload = {
        profileType,
        jobTitle: jobTitle || 'Untitled Position',
        companyName,
        personalInfo,
        originalExperience: experience,
        originalEducation: education,
        originalProjects: projects,
        originalCertifications: certifications,
        originalAchievements: achievements,
        originalActivities: activities,
        originalSkills: skills.filter(s => s.trim()),
      };

      if (!resumeId) {
        const createRes = await api.post('/resumes', draftPayload);
        resumeId = createRes.data.data._id;
      } else {
        await api.post(`/resumes/${resumeId}/version`, {
          ...draftPayload,
          content: generatedContent || {
            summary: professionalSummary,
            education: education.filter(e => e.institution?.trim()),
            experience: experience.filter(e => e.company?.trim() || e.role?.trim()),
            projects: projects.filter(p => p.title?.trim()),
            certifications: certifications.filter(c => c.name?.trim()),
            achievements: achievements.filter(a => a.title?.trim()),
            activities: activities.filter(a => a.title?.trim()),
            skills: skills.filter(s => s.trim()),
            skillCategories: [],
            codingProfile: (codingProfile.totalProblems || codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces)
              ? codingProfile : null,
          },
          jobDescriptionText: jdText,
          atsScore: atsResult?.overall_score || atsResult?.score || 0,
          matchedKeywords: atsResult?.matched_keywords || [],
          missingKeywords: atsResult?.missing_keywords || [],
          suggestions: atsResult?.suggestions || [],
        });
      }

      return resumeId;
    },
    onSuccess: (resumeId) => {
      toast.success('Draft saved!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      if (!id) navigate(`/builder/${resumeId}`, { replace: true });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save draft'),
  });

  const handleExport = useCallback(async () => {
    if (!id || !resume?.versions || resume.versions.length === 0) {
      toast.error('Please save a version first');
      return;
    }

    const loadingToast = toast.loading('Generating PDF...');
    try {
      const token = useAuthStore.getState().token;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const formProjects = projects.filter(p => p.title?.trim());
      const formExperience = experience.filter(e => e.company?.trim() || e.role?.trim());
      const formEducation = education.filter(e => e.institution?.trim());
      const formCertifications = certifications.filter(c => c.name?.trim());
      const formAchievements = achievements.filter(a => a.title?.trim());
      const formActivities = activities.filter(a => a.title?.trim());
      const formSkills = skills.filter(s => s.trim());

      const contentToSave = generatedContent || {
        summary: professionalSummary,
        education: formEducation,
        experience: formExperience,
        projects: formProjects,
        certifications: formCertifications,
        achievements: formAchievements,
        activities: formActivities,
        skills: formSkills,
        skillCategories: [],
        codingProfile: (codingProfile.totalProblems || codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces)
          ? codingProfile : null,
      };

      if (generatedContent) {
        contentToSave.summary = professionalSummary || generatedContent.summary;
        contentToSave.projects = formProjects.length > 0 ? formProjects : generatedContent.projects;
        contentToSave.experience = formExperience.length > 0 ? formExperience : generatedContent.experience;
        contentToSave.education = formEducation.length > 0 ? formEducation : generatedContent.education;
        contentToSave.certifications = formCertifications.length > 0 ? formCertifications : generatedContent.certifications;
        contentToSave.achievements = formAchievements.length > 0 ? formAchievements : generatedContent.achievements;
        contentToSave.activities = formActivities.length > 0 ? formActivities : generatedContent.activities;
        contentToSave.skills = formSkills.length > 0 ? formSkills : generatedContent.skills;
        const userEditedSkills = formSkills.length > 0 && (
          formSkills.length !== (generatedContent.skills?.length || 0) ||
          formSkills.some((s, i) => s !== generatedContent.skills?.[i])
        );
        if (userEditedSkills) {
          contentToSave.skillCategories = [];
        }
      }

      const res = await fetch(
        `${apiUrl}/resume/export/${id}/1?template=modern`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: contentToSave,
            personalInfo,
            jobTitle: jobTitle || 'Untitled Position'
          })
        }
      );

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('application/json')) {
        let errMsg = 'PDF export failed';
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();

      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      const pdfBlob = new Blob([blob], { type: 'application/octet-stream' });
      const filename = `${personalInfo.name?.replace(/\s+/g, '_') || 'resume'}_${companyName?.replace(/\s+/g, '_') || 'company'}.pdf`;

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(pdfBlob, filename);
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        a.setAttribute('type', 'application/octet-stream');
        a.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
      }

      toast.dismiss(loadingToast);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || err.message || 'PDF export failed');
    }
  }, [
    id, resume, personalInfo, companyName, projects, experience, education,
    certifications, achievements, activities, skills, generatedContent,
    professionalSummary, codingProfile, jobTitle, atsResult, jdText
  ]);

  const deleteVersionMutation = useMutation({
    mutationFn: async (versionNumbers) => {
      if (Array.isArray(versionNumbers)) {
        // Run sequentially to prevent Mongoose version key (__v) concurrency conflict errors
        for (const vNum of versionNumbers) {
          await api.delete(`/resumes/${id}/version/${vNum}`);
        }
        return versionNumbers;
      } else {
        await api.delete(`/resumes/${id}/version/${versionNumbers}`);
        return [versionNumbers];
      }
    },
    onSuccess: (deletedList) => {
      if (deletedList.length === 1) {
        toast.success(`Version ${deletedList[0]} deleted`);
      } else {
        toast.success(`${deletedList.length} versions deleted`);
      }
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete version(s)'),
  });

  const visibilityMutation = useMutation({
    mutationFn: () => api.patch(`/resumes/${id}/visibility`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
      const { isPublic, publicSlug } = res.data.data;
      if (isPublic) {
        navigator.clipboard.writeText(`${window.location.origin}/r/${publicSlug}`);
        toast.success('Public link copied!');
      } else {
        toast.success('Resume is now private');
      }
    },
  });

  if (id && isResumeLoading) {
    return (
      <div className="min-h-screen bg-neu-bg animate-pulse">
        <header className="px-4 py-4 flex items-center justify-between max-w-[1600px] mx-auto border-b border-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/[0.08]" />
            <div className="w-40 h-6 rounded bg-white/[0.08] hidden sm:block" />
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-10 rounded bg-white/[0.08]" />
            <div className="w-20 h-10 rounded bg-white/[0.08]" />
            <div className="w-20 h-10 rounded bg-white/[0.08]" />
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 px-4 pb-8 max-w-[1600px] mx-auto mt-6" style={{ height: 'calc(100vh - 100px)' }}>
          <div className="lg:w-[45%] space-y-4 overflow-hidden">
            <div className="neu-card p-5 border border-white/[0.05] bg-neu-bg-panel/40 space-y-4">
              <div className="h-4 bg-white/[0.08] w-1/3 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-white/[0.04] col-span-2 rounded" />
                <div className="h-10 bg-white/[0.04] rounded" />
                <div className="h-10 bg-white/[0.04] rounded" />
                <div className="h-10 bg-white/[0.04] col-span-2 rounded" />
              </div>
            </div>

            <div className="neu-card p-5 border border-white/[0.05] bg-neu-bg-panel/40 space-y-4">
              <div className="h-4 bg-white/[0.08] w-1/4 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-white/[0.04] rounded" />
                <div className="h-10 bg-white/[0.04] rounded" />
              </div>
            </div>

            <div className="neu-card p-5 border border-white/[0.05] bg-neu-bg-panel/40 space-y-4">
              <div className="h-4 bg-white/[0.08] w-1/4 rounded" />
              <div className="h-20 bg-white/[0.04] rounded" />
            </div>
          </div>

          <div className="lg:w-[55%] flex flex-col gap-4">
            <div className="flex-1 bg-white dark:bg-zinc-950 rounded-xl p-8 border border-white/[0.05] shadow-sm flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 bg-white/[0.08] w-48 rounded" />
                <div className="h-3 bg-white/[0.04] w-64 rounded" />
              </div>
              <div className="h-[1px] bg-white/[0.05] w-full" />
              <div className="space-y-2">
                <div className="h-4 bg-white/[0.08] w-24 rounded" />
                <div className="space-y-1">
                  <div className="h-3 bg-white/[0.04] w-full rounded" />
                  <div className="h-3 bg-white/[0.04] w-[95%] rounded" />
                  <div className="h-3 bg-white/[0.04] w-[90%] rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-white/[0.08] w-32 rounded" />
                <div className="flex justify-between">
                  <div className="h-3 bg-white/[0.06] w-36 rounded" />
                  <div className="h-3 bg-white/[0.04] w-24 rounded" />
                </div>
                <div className="space-y-1.5 pl-3">
                  <div className="h-2.5 bg-white/[0.04] w-full rounded" />
                  <div className="h-2.5 bg-white/[0.04] w-[92%] rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-bg">
      <header className="px-4 py-4 flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="neu-btn px-3 py-2.5" id="builder-back-btn">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="hidden sm:block">
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="bg-transparent font-display font-bold text-lg outline-none border-b-2 border-transparent focus:border-neu-primary transition-colors"
              placeholder="Position Title"
              id="builder-job-title"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <AITokenMeter />
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="neu-btn text-xs px-4 py-2.5 flex items-center gap-1.5"
            id="builder-versions-btn"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Versions</span>
            {resume?.versions?.length > 0 && (
              <span className="bg-neu-primary/10 text-neu-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {resume.versions.length}
              </span>
            )}
          </button>
          {id && (
            <button
              onClick={() => visibilityMutation.mutate()}
              className={`neu-btn text-xs px-4 py-2.5 flex items-center gap-1.5 ${resume?.isPublic ? 'text-neu-success' : ''}`}
              id="builder-share-btn"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{resume?.isPublic ? 'Public' : 'Share'}</span>
            </button>
          )}
          <button
            onClick={() => saveDraftMutation.mutate()}
            disabled={saveDraftMutation.isPending}
            className="neu-btn text-xs px-4 py-2.5 flex items-center gap-1.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
            id="builder-save-draft-btn"
            title="Save all form data without AI generation"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!generatedContent || saveMutation.isPending}
            className="neu-btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5"
            id="builder-save-btn"
            title="Save AI-generated resume as a new version"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleExport}
            disabled={!id || !resume?.versions?.length}
            className="neu-btn text-xs px-4 py-2.5 flex items-center gap-1.5"
            id="builder-export-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 px-4 pb-8 max-w-[1600px] mx-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <div ref={leftPanelRef} className="lg:w-[45%] overflow-y-auto space-y-4 pb-4 pr-1 scrollbar-custom" style={{ maxHeight: 'calc(100vh - 100px)' }}>

          <div className="neu-card p-4" id="section-profile-type">
            <div className="flex items-center gap-2">
              <span className="text-sm font-display font-bold text-neu-text-light">I am a:</span>
              <div className="flex bg-neu-bg-dark rounded-xl p-1 gap-1">
                <button
                  onClick={() => setProfileType('fresher')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${profileType === 'fresher'
                      ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black shadow-md'
                      : 'text-neu-text-muted hover:text-neu-text'
                    }`}
                  id="toggle-fresher"
                >
                  🎓 Fresher
                </button>
                <button
                  onClick={() => setProfileType('experienced')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${profileType === 'experienced'
                      ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black shadow-md'
                      : 'text-neu-text-muted hover:text-neu-text'
                    }`}
                  id="toggle-experienced"
                >
                  💼 Experienced
                </button>
              </div>
            </div>
            {profileType === 'fresher' && (
              <p className="text-xs text-neu-text-muted mt-2 ml-1">
                ✨ Perfect for recent graduates! Add your education, projects, certifications and achievements.
              </p>
            )}
          </div>

          <div className="neu-card p-5" id="section-personal">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neu-primary/10 flex items-center justify-center">
                <FileText className="w-3 h-3 text-neu-primary" />
              </div>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="neu-input text-sm col-span-2" placeholder="Full Name" value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} id="builder-pinfo-name" />
              <input className="neu-input text-sm" placeholder="Email" value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} id="builder-pinfo-email" />
              <input className="neu-input text-sm" placeholder="Phone" value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} id="builder-pinfo-phone" />
              <input className="neu-input text-sm" placeholder="LinkedIn URL" value={personalInfo.linkedin}
                onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} id="builder-pinfo-linkedin" />
              <input className="neu-input text-sm" placeholder="Portfolio / Website URL" value={personalInfo.website || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })} id="builder-pinfo-website" />
              {profileType === 'fresher' && (
                <input className="neu-input text-sm" placeholder="GitHub URL" value={personalInfo.github || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })} id="builder-pinfo-github" />
              )}
              <input className={`neu-input text-sm ${profileType === 'fresher' ? '' : 'col-span-2'}`} placeholder="Address (e.g., City, State)" value={personalInfo.address}
                onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })} id="builder-pinfo-address" />
            </div>
          </div>

          <div className="neu-card p-5" id="section-target">
            <h3 className="font-display font-bold text-sm mb-4">Target Position</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="neu-input text-sm" placeholder="Job Title" value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)} id="builder-job-title-field" />
              <input className="neu-input text-sm" placeholder="Company Name" value={companyName}
                onChange={(e) => setCompanyName(e.target.value)} id="builder-company-field" />
            </div>
          </div>

          <SectionCard id="section-education" icon={GraduationCap} title="Education" color="bg-neutral-800 dark:bg-neutral-700" defaultOpen={profileType === 'fresher'}>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-4 last:mb-0 neu-flat p-4 rounded-xl relative">
                {education.length > 1 && (
                  <button onClick={() => removeItem(setEducation, idx)}
                    className="absolute top-2 right-2 p-1 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input className="neu-input text-sm" placeholder="e.g., MIT / IIT Delhi" value={edu.institution}
                    onChange={(e) => updateItem(setEducation, idx, 'institution', e.target.value)} />
                  <input className="neu-input text-sm" placeholder="e.g., B.Tech / B.Sc / MBA" value={edu.degree}
                    onChange={(e) => updateItem(setEducation, idx, 'degree', e.target.value)} />
                  <input className="neu-input text-sm" placeholder="e.g., Computer Science" value={edu.field}
                    onChange={(e) => updateItem(setEducation, idx, 'field', e.target.value)} />
                  <input className="neu-input text-sm" placeholder="e.g., 2024" value={edu.graduationYear}
                    onChange={(e) => updateItem(setEducation, idx, 'graduationYear', e.target.value)} />
                </div>
                <input className="neu-input text-sm mt-3" placeholder="GPA (e.g., 8.5/10 or 3.8/4.0)" value={edu.gpa}
                  onChange={(e) => updateItem(setEducation, idx, 'gpa', e.target.value)} />
              </div>
            ))}
            <button onClick={() => addItem(setEducation, { institution: '', degree: '', field: '', graduationYear: '', gpa: '' })}
              className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Education
            </button>
          </SectionCard>

          <SectionCard id="section-experience" icon={FileText} title={profileType === 'fresher' ? 'Work Experience (Optional)' : 'Work Experience'} color="bg-neutral-800 dark:bg-neutral-700" defaultOpen={profileType === 'experienced'}>
            {experience.map((exp, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <button
                  onClick={() => setActiveExpIdx(activeExpIdx === idx ? -1 : idx)}
                  className="w-full flex items-center justify-between neu-flat p-3 rounded-xl text-left"
                >
                  <span className="text-sm font-medium truncate">
                    {exp.company || exp.role ? `${exp.role || 'Role'} at ${exp.company || 'Company'}` : `Experience ${idx + 1}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {exp.locationType && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neu-primary/10 text-neu-primary border border-neu-primary/20 hidden sm:inline">
                        {exp.locationType}
                      </span>
                    )}
                    {experience.length > 1 && (
                      <span onClick={(e) => { e.stopPropagation(); removeExperience(idx); }}
                        className="p-1 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </span>
                    )}
                    {activeExpIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {activeExpIdx === idx && (
                  <div className="mt-3 space-y-3 animate-slide-up pl-1">
                    <div className="grid grid-cols-2 gap-3">
                      <input className="neu-input text-sm" placeholder="Company" value={exp.company}
                        onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
                      <input className="neu-input text-sm" placeholder="Role / Title" value={exp.role}
                        onChange={(e) => updateExperience(idx, 'role', e.target.value)} />
                    </div>
                    <input className="neu-input text-sm" placeholder="Duration (e.g., Jan 2022 - Present)" value={exp.duration}
                      onChange={(e) => updateExperience(idx, 'duration', e.target.value)} />

                    <input className="neu-input text-sm" placeholder="Location Type" value={exp.locationType || ''}
                      onChange={(e) => updateExperience(idx, 'locationType', e.target.value)} />

                    <div>
                      <label className="text-xs font-medium text-neu-text-light mb-2 block">Bullet Points</label>
                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2 mb-2">
                          <span className="text-neu-text-muted text-xs mt-3">•</span>
                          <textarea
                            className="neu-textarea text-sm min-h-[60px]"
                            placeholder="Describe your achievement..."
                            value={bullet}
                            onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                            rows={2}
                          />
                          {exp.bullets.length > 1 && (
                            <button onClick={() => removeBullet(idx, bIdx)}
                              className="mt-2 p-1.5 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addBullet(idx)}
                        className="text-xs text-neu-primary font-medium hover:underline flex items-center gap-1 mt-1">
                        <Plus className="w-3 h-3" /> Add bullet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addExperience} className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1 mt-2" id="builder-add-exp">
              <Plus className="w-3 h-3" /> Add Experience
            </button>
          </SectionCard>

          <SectionCard id="section-projects" icon={FolderCode} title="Projects" color="bg-neutral-800 dark:bg-neutral-700" defaultOpen={profileType === 'fresher'}>
            {projects.map((proj, idx) => (
              <div key={idx} className="mb-4 last:mb-0 neu-flat p-4 rounded-xl relative">
                {projects.length > 1 && (
                  <button onClick={() => removeItem(setProjects, idx)}
                    className="absolute top-2 right-2 p-1 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <input className="neu-input text-sm mb-3" placeholder="e.g., E-commerce Website" value={proj.title}
                  onChange={(e) => updateItem(setProjects, idx, 'title', e.target.value)} />

                <div className="mb-3">
                  <label className="text-xs font-medium text-neu-text-light mb-2 block">Project Highlights (Bullet Points)</label>
                  {proj.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 mb-2">
                      <span className="text-neu-text-muted text-xs mt-3">•</span>
                      <textarea
                        className="neu-textarea text-sm min-h-[60px]"
                        placeholder="Describe a key feature or achievement..."
                        value={bullet}
                        onChange={(e) => updateProjectBullet(idx, bIdx, e.target.value)}
                        rows={2}
                      />
                      {proj.bullets.length > 1 && (
                        <button onClick={() => removeProjectBullet(idx, bIdx)}
                          className="mt-2 p-1.5 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addProjectBullet(idx)}
                    className="text-xs text-neu-primary font-medium hover:underline flex items-center gap-1 mt-1">
                    <Plus className="w-3 h-3" /> Add bullet
                  </button>
                </div>

                <input className="neu-input text-sm mb-3" placeholder="Project URL or GitHub link" value={proj.link}
                  onChange={(e) => updateItem(setProjects, idx, 'link', e.target.value)} />
                <div>
                  <label className="text-xs font-medium text-neu-text-light mb-2 block">Tech Stack</label>
                  <div className="flex flex-wrap gap-2">
                    {proj.techStack.map((tech, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-1">
                        <input className="neu-input text-xs py-1.5 px-2 w-28" placeholder="e.g., React"
                          value={tech} onChange={(e) => updateTech(idx, tIdx, e.target.value)} />
                        {proj.techStack.length > 1 && (
                          <button onClick={() => removeTech(idx, tIdx)} className="p-1 text-neu-danger">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addTech(idx)}
                      className="text-xs text-neu-primary font-medium hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addItem(setProjects, { title: '', description: '', bullets: [''], techStack: [''], link: '' })}
              className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Project
            </button>
          </SectionCard>

          <SectionCard id="section-certifications" icon={Award} title="Certifications" color="bg-neutral-800 dark:bg-neutral-700">
            {certifications.map((cert, idx) => (
              <div key={idx} className="mb-3 last:mb-0 neu-flat p-4 rounded-xl relative">
                {certifications.length > 1 && (
                  <button onClick={() => removeItem(setCertifications, idx)}
                    className="absolute top-2 right-2 p-1 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input className="neu-input text-sm" placeholder="e.g., AWS Cloud Practitioner" value={cert.name}
                    onChange={(e) => updateItem(setCertifications, idx, 'name', e.target.value)} />
                  <input className="neu-input text-sm" placeholder="e.g., Amazon" value={cert.issuer}
                    onChange={(e) => updateItem(setCertifications, idx, 'issuer', e.target.value)} />
                  <input className="neu-input text-sm" placeholder="Year (e.g., 2024)" value={cert.year}
                    onChange={(e) => updateItem(setCertifications, idx, 'year', e.target.value)} />
                  <select className="neu-input text-sm" value={cert.status || ''}
                    onChange={(e) => updateItem(setCertifications, idx, 'status', e.target.value)}>
                    <option value="">Status (optional)</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
            ))}
            <button onClick={() => addItem(setCertifications, { name: '', issuer: '', year: '', status: '' })}
              className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Certification
            </button>
          </SectionCard>

          <SectionCard id="section-achievements" icon={Trophy} title="Achievements" color="bg-neutral-800 dark:bg-neutral-700">
            {achievements.map((ach, idx) => (
              <div key={idx} className="mb-3 last:mb-0 neu-flat p-4 rounded-xl relative">
                {achievements.length > 1 && (
                  <button onClick={() => removeItem(setAchievements, idx)}
                    className="absolute top-2 right-2 p-1 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <input className="neu-input text-sm mb-2" placeholder="e.g., Winner — Smart India Hackathon 2023"
                  value={ach.title} onChange={(e) => updateItem(setAchievements, idx, 'title', e.target.value)} />
                <textarea className="neu-textarea text-sm min-h-[50px]"
                  placeholder="Brief description (optional)" value={ach.description}
                  onChange={(e) => updateItem(setAchievements, idx, 'description', e.target.value)} rows={2} />
              </div>
            ))}
            <button onClick={() => addItem(setAchievements, { title: '', description: '' })}
              className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Achievement
            </button>
          </SectionCard>

          <SectionCard id="section-activities" icon={Users} title="Extracurricular Activities" color="bg-neutral-800 dark:bg-neutral-700">
            {activities.map((act, idx) => (
              <div key={idx} className="mb-3 last:mb-0 neu-flat p-4 rounded-xl relative">
                {activities.length > 1 && (
                  <button onClick={() => removeItem(setActivities, idx)}
                    className="absolute top-2 right-2 p-1 text-neu-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input className="neu-input text-sm" placeholder="e.g., Google Developer Student Club"
                    value={act.title} onChange={(e) => updateItem(setActivities, idx, 'title', e.target.value)} />
                  <input className="neu-input text-sm" placeholder="e.g., Lead / Member"
                    value={act.role} onChange={(e) => updateItem(setActivities, idx, 'role', e.target.value)} />
                </div>
                <textarea className="neu-textarea text-sm min-h-[50px]"
                  placeholder="What did you do? (optional)" value={act.description}
                  onChange={(e) => updateItem(setActivities, idx, 'description', e.target.value)} rows={2} />
              </div>
            ))}
            <button onClick={() => addItem(setActivities, { title: '', role: '', description: '' })}
              className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Activity
            </button>
          </SectionCard>

          <SectionCard id="section-coding" icon={FileText} title="Coding Profile" color="bg-neutral-800 dark:bg-neutral-700" defaultOpen={false}>
            <p className="text-xs text-neu-text-muted mb-3">Add your competitive programming profiles to showcase problem-solving skills.</p>
            <div className="space-y-3">
              <input className="neu-input text-sm" placeholder="Total problems solved (e.g., 300)"
                value={codingProfile.totalProblems}
                onChange={(e) => setCodingProfile({ ...codingProfile, totalProblems: e.target.value })}
                id="builder-cp-total" />
              <div className="grid grid-cols-3 gap-3">
                <input className="neu-input text-sm" placeholder="LeetCode username"
                  value={codingProfile.leetcode}
                  onChange={(e) => setCodingProfile({ ...codingProfile, leetcode: e.target.value })}
                  id="builder-cp-lc" />
                <input className="neu-input text-sm" placeholder="GFG username"
                  value={codingProfile.gfg}
                  onChange={(e) => setCodingProfile({ ...codingProfile, gfg: e.target.value })}
                  id="builder-cp-gfg" />
                <input className="neu-input text-sm" placeholder="Codeforces username"
                  value={codingProfile.codeforces}
                  onChange={(e) => setCodingProfile({ ...codingProfile, codeforces: e.target.value })}
                  id="builder-cp-cf" />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="section-skills" icon={Wrench} title="Skills" color="bg-neutral-800 dark:bg-neutral-700" defaultOpen={false}>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, idx) => (
                skill && (
                  <span key={idx} className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    {skill}
                    <button onClick={() => setSkills(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-0.5 p-0.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )
              ))}
              {skills.filter(s => s.trim()).length === 0 && (
                <p className="text-xs text-neu-text-muted">No skills added yet. Add skills below or let AI generate them.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="neu-input text-sm flex-1"
                placeholder="e.g., React, Node.js, Python..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSkill.trim()) {
                    e.preventDefault();
                    setSkills(prev => [...prev.filter(s => s.trim()), newSkill.trim()]);
                    setNewSkill('');
                  }
                }}
                id="builder-skill-input"
              />
              <button
                onClick={() => {
                  if (newSkill.trim()) {
                    setSkills(prev => [...prev.filter(s => s.trim()), newSkill.trim()]);
                    setNewSkill('');
                  }
                }}
                className="neu-btn text-xs px-3 py-1.5 flex items-center gap-1"
                type="button"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {generatedContent?.skills?.length > 0 && (
              <p className="text-[10px] text-neu-text-muted mt-2">✨ Skills were auto-populated by AI. Feel free to add or remove.</p>
            )}
          </SectionCard>

          <div className="neu-card p-5" id="section-jd">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm">Job Description <span className="text-neu-text-muted font-normal text-xs">(optional)</span></h3>
              <span className="text-xs text-neu-text-muted">{jdText.length} chars</span>
            </div>
            <textarea
              className="neu-textarea text-sm min-h-[160px]"
              placeholder="Paste the full job description here... (optional)"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              id="builder-jd-textarea"
            />
          </div>

          <div className="neu-card p-5" id="section-summary">
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neutral-800/10 dark:bg-neutral-700/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-neutral-800 dark:text-neutral-200" />
              </div>
              Professional Summary
              {generatedContent?.summary && (
                <span className="text-[10px] text-neu-text-muted font-normal ml-auto">✨ AI Generated — Edit below</span>
              )}
            </h3>
            {jobTitle && (
              <div className="mb-3 -mt-1">
                <span className="inline-block text-sm font-semibold tracking-wide text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                  {jobTitle}
                </span>
              </div>
            )}
            {!professionalSummary && !generatedContent?.summary && (
              <p className="text-xs text-neu-text-muted mb-2 flex items-center gap-1">
                💡 Click <strong>Generate Resume</strong> to auto-create a summary with your job title{jobTitle ? ` "${jobTitle}"` : ''}, or write your own below.
              </p>
            )}
            <textarea
              className="neu-textarea text-sm min-h-[100px]"
              placeholder="Write or let AI generate your professional summary..."
              value={professionalSummary}
              onChange={(e) => {
                setProfessionalSummary(e.target.value);
                if (generatedContent) {
                  setGeneratedContent({ ...generatedContent, summary: e.target.value });
                }
              }}
              id="builder-summary-textarea"
              rows={4}
            />
            {professionalSummary && jobTitle && !professionalSummary.toLowerCase().includes(jobTitle.toLowerCase()) && (
              <p className="text-xs text-status-cyan mt-2 flex items-center gap-1">
                ⚠️ Your summary doesn't contain the job title "{jobTitle}". Consider adding it for better ATS matching.
              </p>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="neu-btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-bold"
            id="builder-generate-btn"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Resume
              </>
            )}
          </button>

          {(generatedContent || professionalSummary || skills.filter(s => s.trim()).length > 0
            || education.some(e => e.institution) || experience.some(e => e.company)
            || projects.some(p => p.title)) && (
              <button
                onClick={handleScore}
                disabled={isScoring}
                className="neu-btn w-full py-3 flex items-center justify-center gap-2 text-sm"
                id="builder-score-btn"
                title="Re-run to see your updated score after making edits"
              >
                {isScoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neu-primary/30 border-t-neu-primary rounded-full animate-spin" />
                    Scoring...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-neu-primary" />
                    {atsResult ? 'Re-run ATS Audit' : 'Deep ATS Audit'}
                  </>
                )}
              </button>
            )}
        </div>

        <div className="lg:w-[55%] overflow-y-auto space-y-4 pb-4 scrollbar-custom" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {isGenerating && <StreamingProgress progress={streamProgress} tokens={streamTokens} />}



          {atsResult && (
            <div className="space-y-4">
              <div className="neu-card p-5 space-y-4">
                <ATSScoreMeter score={atsResult.overall_score || atsResult.score} />
                <KeywordBadges
                  matched={atsResult.matched_keywords}
                  missing={atsResult.missing_keywords}
                />
                {atsResult.suggestions?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-neu-text-light mb-2">AI Suggestions</h4>
                    <div className="space-y-2">
                      {atsResult.suggestions.map((s, i) => (
                        <div key={i} className="neu-inset p-3 rounded-xl text-xs text-neu-text-light flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-neu-primary mt-0.5 flex-shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {atsResult.sections && (
                <SectionBreakdown sections={atsResult.sections} />
              )}

              {atsResult.line_suggestions?.length > 0 && (
                <LineSuggestions suggestions={atsResult.line_suggestions} />
              )}
            </div>
          )}

          <ResumePreview
            personalInfo={personalInfo}
            jobTitle={jobTitle}
            content={(() => {
              const formProjects = projects.filter(p => p.title?.trim());
              const formExperience = experience.filter(e => e.company?.trim() || e.role?.trim());
              const formEducation = education.filter(e => e.institution?.trim());
              const formCertifications = certifications.filter(c => c.name?.trim());
              const formAchievements = achievements.filter(a => a.title?.trim());
              const formActivities = activities.filter(a => a.title?.trim());
              const formSkills = skills.filter(s => s.trim());

              if (generatedContent) {
                const userEditedSkills = formSkills.length > 0 && (
                  formSkills.length !== (generatedContent.skills?.length || 0) ||
                  formSkills.some((s, i) => s !== generatedContent.skills?.[i])
                );
                return {
                  ...generatedContent,
                  summary: professionalSummary || generatedContent.summary,
                  projects: formProjects.length > 0 ? formProjects : generatedContent.projects,
                  experience: formExperience.length > 0 ? formExperience : generatedContent.experience,
                  education: formEducation.length > 0 ? formEducation : generatedContent.education,
                  certifications: formCertifications.length > 0 ? formCertifications : generatedContent.certifications,
                  achievements: formAchievements.length > 0 ? formAchievements : generatedContent.achievements,
                  activities: formActivities.length > 0 ? formActivities : generatedContent.activities,
                  skills: formSkills.length > 0 ? formSkills : generatedContent.skills,
                  skillCategories: userEditedSkills ? [] : (generatedContent.skillCategories || []),
                  codingProfile: codingProfile.totalProblems || codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces
                    ? codingProfile : generatedContent.codingProfile,
                };
              }

              const hasAny = professionalSummary || formProjects.length > 0 || formExperience.length > 0 ||
                formEducation.length > 0 || formSkills.length > 0 || formCertifications.length > 0 ||
                formAchievements.length > 0 || formActivities.length > 0;

              return hasAny ? {
                summary: professionalSummary,
                projects: formProjects,
                experience: formExperience,
                education: formEducation,
                certifications: formCertifications,
                achievements: formAchievements,
                activities: formActivities,
                skills: formSkills,
                skillCategories: [],
                codingProfile: codingProfile.totalProblems || codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces
                  ? codingProfile : null,
              } : null;
            })()}
            template="modern"
            isGenerating={isGenerating}
            streamTokens={streamTokens}
            onSectionClick={scrollToSection}
          />
        </div>
      </div>

      {showVersions && (
        <VersionHistory
          versions={resume?.versions || []}
          onSelect={(v) => {
            setGeneratedContent(v.content);
            setShowVersions(false);
            toast.success(`Loaded version ${v.versionNumber}`);
          }}
          onDelete={(versionNumber) => deleteVersionMutation.mutate(versionNumber)}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
};


export default Builder;
