
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Download, Sparkles, Plus, Trash2, User, Briefcase, 
  GraduationCap, Wrench, Save, CheckCircle, AlertTriangle, AlertCircle,
  FileText, WifiOff, Cloud, X, Target, PartyPopper, Loader2, Play,
  Eye, Edit3, FileDown
} from 'lucide-react';
import { generateResumeSuggestions, analyzeResume } from '../services/geminiService';
import { saveResume } from '../services/resumeService';
import AiSuggestionModal from '../components/AiSuggestionModal';
import ScoreCard from '../components/ScoreCard';
import ResumeRenderer from '../components/templates/ResumeRenderer';
import { Resume, ExperienceItem, Suggestion, ResumeScore, EducationItem } from '../types';

type Toast = { message: string, type: 'success' | 'error' | 'info' | 'warning' } | null;

const initialResume: Resume = {
  id: 'new',
  title: 'Untitled Resume',
  lastEdited: new Date().toISOString(),
  templateId: 'modern-executive',
  status: 'draft',
  personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '', dob: '', linkedin: '', website: '' },
  experience: [],
  education: [],
  skills: []
};

const Editor: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume>({
    ...initialResume,
    templateId: searchParams.get('template') || initialResume.templateId
  });
  
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'cloud' | 'local' | 'offline'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tempSkill, setTempSkill] = useState('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  const [targetField, setTargetField] = useState<{section: 'summary' | 'experience' | 'education', index?: number} | null>(null);

  // Connectivity
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); setToast({ message: "Sync active", type: 'info' }); saveToServer(resume); };
    const handleOffline = () => { setIsOnline(false); setToast({ message: "Studio offline", type: 'warning' }); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [resume]);

  const completionStatus = useMemo(() => {
    const sections = {
      info: !!resume.personalInfo.fullName && !!resume.personalInfo.email,
      experience: resume.experience.length > 0 && resume.experience.every(e => e.role && e.company),
      education: resume.education.length > 0 && resume.education.every(edu => edu.school && edu.degree),
      skills: resume.skills.length >= 3
    };
    return { ...sections, allFilled: sections.info && sections.experience && sections.education && sections.skills };
  }, [resume]);

  const saveToServer = useCallback(async (data: Resume) => {
    setSaveStatus('saving');
    setIsSaving(true);
    const updatedData = { ...data, lastEdited: new Date().toISOString() };
    localStorage.setItem('smart_resume_local_draft', JSON.stringify(updatedData));

    if (!navigator.onLine) {
      setSaveStatus('local');
      setIsSaving(false);
      return;
    }

    try {
      await saveResume(updatedData);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSaveStatus('cloud');
    } catch (err) {
      setSaveStatus('local');
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (id === 'new' && !resume.personalInfo.fullName && resume.experience.length === 0) return;
      saveToServer(resume);
    }, 10000);
    return () => clearTimeout(autoSaveTimerRef.current!);
  }, [resume, saveToServer, id]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveResume({ ...resume, status: 'draft', lastEdited: new Date().toISOString() });
      setToast({ message: "Draft Saved to Dashboard", type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setToast({ message: "Save failed", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!completionStatus.allFilled) {
      setToast({ message: "Incomplete sections. Finish them before publishing!", type: 'warning' });
      return;
    }
    setIsSaving(true);
    try {
      await saveResume({ ...resume, status: 'final', lastEdited: new Date().toISOString() });
      setToast({ message: "Masterpiece Published!", type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setToast({ message: "Publishing failed", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById("resume-preview");
    if (!element) {
      setToast({ message: "Preview not found", type: 'error' });
      return;
    }

    const opt = {
      margin: 0,
      filename: `${resume.title || 'My_Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Use the global html2pdf from index.html
    if ((window as any).html2pdf) {
      (window as any).html2pdf().set(opt).from(element).save()
        .then(() => {
          setToast({ message: "✅ Resume downloaded successfully!", type: 'success' });
        })
        .catch((err: any) => {
          console.error("PDF Download error:", err);
          setToast({ message: "Failed to generate PDF", type: 'error' });
        });
    } else {
      setToast({ message: "PDF Library not loaded", type: 'error' });
    }
  };

  const handleInfoChange = (field: keyof typeof resume.personalInfo, value: string) => {
    setResume(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const handleAiSuggest = async (section: 'summary' | 'experience' | 'education', index?: number) => {
    setTargetField({ section, index });
    setIsAiModalOpen(true);
    setAiLoading(true);
    const roleOrDegree = section === 'summary' ? (resume.experience[0]?.role || "Expert") : (index !== undefined ? (section === 'experience' ? resume.experience[index].role : resume.education[index].degree) : "Expert");
    const suggestions = await generateResumeSuggestions(roleOrDegree, section, "", { targetJob: resume.title });
    setAiSuggestions(suggestions);
    setAiLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-brand-black overflow-hidden font-sans">
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-fade-in-up border glass ${
          toast.type === 'success' ? 'border-brand-red text-white' : 'border-white/10 text-gray-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-brand-red' : 'bg-gray-500'}`}></div>
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <header className="bg-brand-surface/50 glass border-b border-white/5 px-4 md:px-8 py-4 flex justify-between items-center z-50 print:hidden">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={() => navigate('/dashboard')} className="p-2.5 md:p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <input 
              value={resume.title} 
              onChange={(e) => setResume({...resume, title: e.target.value})}
              className="font-display font-extrabold text-white bg-transparent border-none p-0 focus:ring-0 text-lg md:text-xl placeholder-gray-700 w-32 sm:w-auto"
              placeholder="Resume Name..."
            />
            <div className="flex items-center gap-2 md:gap-4 h-4 md:h-5 mt-1">
               <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                 {saveStatus === 'saving' ? 'Syncing...' : `Synced ${lastSavedTime || ''}`}
                 <div className={`w-1 h-1 rounded-full ${saveStatus === 'cloud' ? 'bg-brand-red' : 'bg-gray-600'}`}></div>
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           <button 
             onClick={handleSaveDraft}
             disabled={isSaving}
             className="px-5 md:px-6 py-2.5 md:py-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-white/10 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-white/5 disabled:opacity-50"
           >
             Draft
           </button>
           <button 
             onClick={handleFinalize}
             disabled={isSaving}
             className="flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-brand-red to-pink-700 text-white rounded-2xl hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-red/20 disabled:opacity-50"
           >
             {isSaving ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} className="hidden sm:inline" /> Publish</>}
           </button>
           <button onClick={() => window.print()} className="p-3 md:p-4 bg-white/5 text-gray-400 rounded-2xl hover:bg-white/10 transition-colors hidden lg:block">
             <Download size={18} />
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative flex-col lg:flex-row">
        {/* Toggle Bar - Visible on Mobile (sm) and Tablet (md) */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] flex bg-brand-surface/90 backdrop-blur-2xl p-1.5 rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <button 
            onClick={() => setMobileView('edit')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${mobileView === 'edit' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500'}`}
          >
            <Edit3 size={16} /> Edit
          </button>
          <button 
            onClick={() => setMobileView('preview')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${mobileView === 'preview' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500'}`}
          >
            <Eye size={16} /> Preview
          </button>
        </div>

        {/* Editor Side panel */}
        <div className={`w-full lg:w-[480px] bg-brand-surface/30 border-r border-white/5 flex flex-col h-full z-10 glass no-print transition-all duration-300 ${mobileView === 'edit' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="flex p-3 md:p-4 gap-2 border-b border-white/5 bg-brand-black/20 overflow-x-auto no-scrollbar">
              <NavBtn active={activeSection === 'personal'} onClick={() => setActiveSection('personal')} icon={User} label="Info" />
              <NavBtn active={activeSection === 'experience'} onClick={() => setActiveSection('experience')} icon={Briefcase} label="Work" />
              <NavBtn active={activeSection === 'education'} onClick={() => setActiveSection('education')} icon={GraduationCap} label="Study" />
              <NavBtn active={activeSection === 'skills'} onClick={() => setActiveSection('skills')} icon={Wrench} label="Skills" />
           </div>

           <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 space-y-12 no-scrollbar relative pb-32 lg:pb-12">
              {activeSection === 'personal' && (
                <div className="animate-fade-in space-y-10">
                  <header>
                    <h2 className="text-2xl lg:text-3xl font-heading font-black text-white uppercase tracking-tighter mb-1">Identity</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global contact metadata</p>
                  </header>
                  <div className="grid grid-cols-1 gap-6">
                    <InputField label="Name" value={resume.personalInfo.fullName} onChange={(v) => handleInfoChange('fullName', v)} />
                    <InputField label="Email" value={resume.personalInfo.email} onChange={(v) => handleInfoChange('email', v)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputField label="Phone" value={resume.personalInfo.phone} onChange={(v) => handleInfoChange('phone', v)} />
                      <InputField label="Locale" value={resume.personalInfo.location} onChange={(v) => handleInfoChange('location', v)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputField label="Date of Birth" type="date" value={resume.personalInfo.dob || ''} onChange={(v) => handleInfoChange('dob', v)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Executive Summary</label>
                      <button onClick={() => handleAiSuggest('summary')} className="flex items-center gap-2 text-[9px] font-black text-brand-red uppercase tracking-widest hover:scale-105 transition-all p-3">
                        <Sparkles size={14} /> AI Boost
                      </button>
                    </div>
                    <textarea 
                      value={resume.personalInfo.summary} 
                      onChange={(e) => handleInfoChange('summary', e.target.value)}
                      className="w-full p-6 bg-brand-black border border-white/5 rounded-3xl focus:border-brand-red outline-none text-base lg:text-sm min-h-[220px] lg:min-h-[180px] text-gray-300 font-medium transition-all shadow-inner"
                      placeholder="High-level career trajectory overview..."
                    />
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="animate-fade-in space-y-10">
                   <div className="flex justify-between items-center">
                     <h2 className="text-2xl lg:text-3xl font-heading font-black text-white uppercase tracking-tighter">History</h2>
                     <button onClick={() => setResume(p => ({...p, experience: [...p.experience, {id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: ''}]}))} className="p-4 bg-brand-red text-white rounded-2xl shadow-lg shadow-brand-red/20 active:scale-90 transition-transform">
                       <Plus size={24} />
                     </button>
                   </div>
                   <div className="space-y-8">
                     {resume.experience.map((exp, idx) => (
                       <div key={exp.id} className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative group hover:border-white/10 transition-all shadow-xl">
                         <button onClick={() => setResume(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx)}))} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-brand-red transition-colors"><Trash2 size={18} /></button>
                         <div className="space-y-6">
                           <InputField label="Position" value={exp.role} onChange={(v) => {
                             const n = [...resume.experience]; n[idx].role = v; setResume({...resume, experience: n});
                           }} />
                           <InputField label="Organization" value={exp.company} onChange={(v) => {
                             const n = [...resume.experience]; n[idx].company = v; setResume({...resume, experience: n});
                           }} />
                           <div className="space-y-3">
                              <div className="flex justify-between px-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Deliverables</label>
                                <button onClick={() => handleAiSuggest('experience', idx)} className="text-[9px] font-black text-brand-red uppercase tracking-widest p-3">AI Enhance</button>
                              </div>
                              <textarea value={exp.description} onChange={(e) => {
                                const n = [...resume.experience]; n[idx].description = e.target.value; setResume({...resume, experience: n});
                              }} className="w-full p-6 bg-brand-black border border-white/5 rounded-2xl focus:border-brand-red outline-none text-base lg:text-sm text-gray-400 min-h-[160px] shadow-inner" placeholder="Quantify your achievements..." />
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {activeSection === 'education' && (
                <div className="animate-fade-in space-y-10 pb-16">
                   <div className="flex justify-between items-center">
                     <h2 className="text-2xl lg:text-3xl font-heading font-black text-white uppercase tracking-tighter">Study</h2>
                     <button 
                        onClick={() => setResume(p => ({...p, education: [...p.education, {id: Date.now().toString(), school: '', degree: '', year: ''}]}))}
                        className="p-4 bg-brand-red text-white rounded-2xl shadow-lg shadow-brand-red/20 transition-all active:scale-90"
                      >
                        <Plus size={24} />
                      </button>
                   </div>
                   <div className="space-y-8">
                     {resume.education.map((edu, idx) => (
                       <div key={edu.id} className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative group hover:border-white/10 transition-all shadow-xl">
                         <button onClick={() => setResume(p => ({ ...p, education: p.education.filter((_, i) => i !== idx)}))} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-brand-red transition-colors"><Trash2 size={18} /></button>
                         <div className="space-y-6">
                           <InputField label="Institution" value={edu.school} onChange={(v) => {
                             const n = [...resume.education]; n[idx].school = v; setResume({...resume, education: n});
                           }} />
                           <InputField label="Degree / Certification" value={edu.degree} onChange={(v) => {
                             const n = [...resume.education]; n[idx].degree = v; setResume({...resume, education: n});
                           }} />
                           <InputField label="Year" value={edu.year} onChange={(v) => {
                             const n = [...resume.education]; n[idx].year = v; setResume({...resume, education: n});
                           }} />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {activeSection === 'skills' && (
                 <div className="animate-fade-in space-y-10">
                    <h2 className="text-2xl lg:text-3xl font-heading font-black text-white uppercase tracking-tighter">Stack</h2>
                    <div className="bg-brand-red/10 border border-brand-red/20 p-6 md:p-8 rounded-[2.5rem]">
                       <form onSubmit={(e) => { e.preventDefault(); if(tempSkill.trim()) { setResume(p=>({...p, skills: [...p.skills, tempSkill.trim()]})); setTempSkill(''); }}} className="flex gap-4 mb-8">
                         <input value={tempSkill} onChange={e=>setTempSkill(e.target.value)} placeholder="Expertise keywords..." className="flex-1 px-6 py-4.5 bg-brand-black border border-white/5 rounded-2xl text-white outline-none focus:border-brand-red text-base lg:text-sm" />
                         <button type="submit" className="bg-brand-red text-white p-4.5 rounded-2xl shadow-lg shadow-brand-red/20 active:scale-90 transition-transform"><Plus size={24} /></button>
                       </form>
                       <div className="flex flex-wrap gap-3">
                         {resume.skills.map((s, i) => (
                           <span key={i} className="px-5 py-3 bg-brand-black/50 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-red flex items-center gap-3 shadow-md">
                             {s}
                             <button onClick={() => setResume(p=>({...p, skills: p.skills.filter((_,idx)=>idx!==i)}))} className="p-1 text-gray-600 hover:text-white transition-colors"><X size={14} /></button>
                           </span>
                         ))}
                       </div>
                    </div>

                    {/* Completion Message */}
                    {completionStatus.allFilled && (
                       <div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-8 rounded-[2rem] text-center shadow-2xl shadow-green-900/10 animate-fade-in-up transition-all duration-500 ease-in-out">
                         <div className="flex flex-col items-center gap-3">
                           <CheckCircle size={32} className="text-green-600 mb-2" />
                           <p className="font-heading font-black text-sm md:text-base uppercase tracking-wider">
                             🎉 Great job! 95% of your resume is ready.
                           </p>
                           <p className="text-[10px] md:text-xs font-bold opacity-80 leading-relaxed max-w-sm">
                             You’re almost done — feel free to preview or publish your resume when ready.
                           </p>
                         </div>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>

        {/* Live Preview area */}
        <div className={`flex-1 bg-brand-black h-full relative overflow-hidden transition-all duration-300 ${mobileView === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
           <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-brand-red/20 blur-[240px] rounded-full animate-pulse-slow"></div>
           </div>

           {/* Floating Action Buttons for Preview */}
           <div className="absolute top-8 right-8 z-30 hidden lg:flex gap-4">
              <button 
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-900/40 transition-all font-black uppercase tracking-widest text-[10px]"
              >
                <FileDown size={18} /> Download PDF
              </button>
           </div>

           <div className="z-20 w-full h-full overflow-y-auto p-4 md:p-8 lg:p-12 flex flex-col items-center no-scrollbar">
              <div 
                id="resume-preview"
                className="bg-white shadow-[0_50px_120px_rgba(0,0,0,0.8)] w-[210mm] min-h-[297mm] text-gray-800 origin-top transition-transform duration-500 ease-out mb-24 md:mb-12"
                style={{ 
                  transform: typeof window !== 'undefined' 
                    ? window.innerWidth < 768 
                      ? 'scale(0.42)' 
                      : window.innerWidth < 1024 
                        ? 'scale(0.58)' // Optimized for tablet split-less view
                        : 'scale(0.85)' 
                    : 'scale(0.85)' 
                }}
              >
                 <ResumeRenderer data={resume} />
              </div>
           </div>
        </div>
      </div>

      <AiSuggestionModal 
        isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)}
        loading={aiLoading} suggestions={aiSuggestions}
        onApply={(text) => {
          if (!targetField) return;
          if (targetField.section === 'summary') handleInfoChange('summary', text);
          else if (targetField.section === 'experience' && targetField.index !== undefined) {
             const n = [...resume.experience]; n[targetField.index].description = text; setResume({...resume, experience: n});
          }
          setIsAiModalOpen(false);
        }}
      />
    </div>
  );
};

const NavBtn = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-[2rem] transition-all min-w-[80px] ${active ? 'bg-brand-red text-white shadow-xl shadow-brand-red/30 scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <Icon size={22} />
    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{label}</label>
    <input 
      type={type}
      value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-6 py-5 bg-brand-black border border-white/5 rounded-2xl focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none text-base lg:text-sm font-bold text-white transition-all shadow-inner min-h-[58px]"
    />
  </div>
);

export default Editor;
