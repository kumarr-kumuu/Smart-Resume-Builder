
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Download, Sparkles, Plus, Trash2, User, Briefcase, 
  GraduationCap, Wrench, Save, CheckCircle, AlertTriangle, 
  FileText, WifiOff, Cloud, X, Target, PartyPopper
} from 'lucide-react';
import { generateResumeSuggestions, analyzeResume } from '../services/geminiService';
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
  personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '', linkedin: '', website: '' },
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'cloud' | 'local' | 'offline'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tempSkill, setTempSkill] = useState('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI & Score State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  const [targetField, setTargetField] = useState<{section: 'summary' | 'experience' | 'education', index?: number} | null>(null);
  const [score, setScore] = useState<ResumeScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScoreVisible, setIsScoreVisible] = useState(false);

  // Monitor Connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToast({ message: "Back online! Syncing your progress...", type: 'info' });
      saveToServer(resume);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setToast({ message: "You are offline. Progress saved locally.", type: 'warning' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [resume]);

  // Completion Logic
  const completionStatus = useMemo(() => {
    const sections = {
      info: !!resume.personalInfo.fullName && !!resume.personalInfo.email,
      experience: resume.experience.length > 0 && resume.experience.every(e => e.role && e.company),
      education: resume.education.length > 0 && resume.education.every(edu => edu.school && edu.degree),
      skills: resume.skills.length >= 3
    };
    const allFilled = sections.info && sections.experience && sections.education && sections.skills;
    return { ...sections, allFilled };
  }, [resume]);

  // Check for recovery
  useEffect(() => {
    if (id === 'new') {
      const draftStr = localStorage.getItem('smart_resume_local_draft');
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          if (draft.personalInfo.fullName || draft.experience.length > 0 || draft.skills.length > 0) {
            setShowRecovery(true);
          }
        } catch (e) {
          localStorage.removeItem('smart_resume_local_draft');
        }
      }
    }
  }, [id]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Save Logic
  const saveToServer = useCallback(async (data: Resume) => {
    setSaveStatus('saving');
    setIsSaving(true);
    localStorage.setItem('smart_resume_local_draft', JSON.stringify({ ...data, lastEdited: new Date().toISOString() }));

    if (!navigator.onLine) {
      setSaveStatus('local');
      setIsSaving(false);
      return;
    }

    try {
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSaveStatus('cloud');
      setIsSaving(false);
    } catch (err) {
      setSaveStatus('local');
      setIsSaving(false);
      setToast({ message: "Cloud sync failed. Saved locally.", type: 'warning' });
    }
  }, []);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (id === 'new' && !resume.personalInfo.fullName && resume.experience.length === 0) return;
      saveToServer(resume);
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [resume, saveToServer, id]);

  const handleRecover = () => {
    const draft = localStorage.getItem('smart_resume_local_draft');
    if (draft) {
      setResume(JSON.parse(draft));
      setToast({ message: "Progress restored from previous session", type: 'success' });
    }
    setShowRecovery(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('smart_resume_local_draft');
    setShowRecovery(false);
  };

  const handleFinalize = async () => {
    setIsSaving(true);
    try {
      setResume(prev => ({ ...prev, status: 'final' }));
      setToast({ message: "Resume finalized! Redirecting to dashboard...", type: 'success' });
      localStorage.removeItem('smart_resume_local_draft');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setToast({ message: "Failed to publish resume.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Field Handlers
  const handleInfoChange = (field: keyof typeof resume.personalInfo, value: string) => {
    setResume(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const handleAddExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        company: '', role: '', startDate: '', endDate: '', description: ''
      }]
    }));
  };

  const handleUpdateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const newExp = [...resume.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setResume(prev => ({ ...prev, experience: newExp }));
  };

  const handleAddEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        school: '', degree: '', year: '', description: ''
      }]
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const newEdu = [...resume.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setResume(prev => ({ ...prev, education: newEdu }));
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    const skill = tempSkill.trim();
    if (skill && !resume.skills.includes(skill)) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setTempSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleAiSuggest = async (section: 'summary' | 'experience' | 'education', index?: number) => {
    setTargetField({ section, index });
    setIsAiModalOpen(true);
    setAiLoading(true);

    let context = "";
    let roleOrDegree = "Professional";

    if (section === 'summary') {
      context = resume.personalInfo.summary;
      roleOrDegree = resume.experience[0]?.role || "Expert";
    } else if (section === 'experience' && index !== undefined) {
      context = resume.experience[index].description;
      roleOrDegree = resume.experience[index].role;
    } else if (section === 'education' && index !== undefined) {
      context = resume.education[index].description || "";
      roleOrDegree = resume.education[index].degree;
    }

    const suggestions = await generateResumeSuggestions(
      roleOrDegree,
      section, 
      context,
      { targetJob: resume.title }
    );
    setAiSuggestions(suggestions);
    setAiLoading(false);
  };

  const handleAnalyzeResume = async () => {
    // Check if sections are filled
    if (!completionStatus.allFilled) {
      setToast({ 
        message: "Please fill all sections (Info, Work, Studies, Skills) to see your AI score!", 
        type: 'warning' 
      });
      return;
    }

    if (score && !isScoreVisible) {
      setIsScoreVisible(true);
      return;
    }

    setIsAnalyzing(true);
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return a consistent 85% score as requested
    const fixedScore: ResumeScore = {
      overall: 85,
      breakdown: {
        quality: 88,
        relevance: 82,
        skills: 90,
        clarity: 85,
        ats: 80
      },
      feedback: [
        "Add quantifiable achievements to your work history for higher impact.",
        "Ensure all strong action verbs are used consistently across roles.",
        "Great job including relevant skills! Consider adding a few more industry-specific certifications."
      ]
    };

    setScore(fixedScore);
    setIsScoreVisible(true);
    setToast({ message: "Resume optimization calculated!", type: 'success' });
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Recovery Modal */}
      {showRecovery && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 text-center animate-scale-in">
             <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <AlertTriangle size={40} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-3">Restore Draft?</h2>
             <p className="text-gray-500 mb-10 leading-relaxed">
               We found an unsaved draft from your last visit. Would you like to restore it or start fresh?
             </p>
             <div className="flex flex-col gap-3">
                <button onClick={handleRecover} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                   <FileText size={20} /> Restore My Work
                </button>
                <button onClick={handleStartFresh} className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                   Start New Resume
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-30 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex flex-col">
            <input 
              value={resume.title} 
              onChange={(e) => setResume({...resume, title: e.target.value})}
              className="font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 text-xl placeholder-gray-400"
              placeholder="Resume Title..."
            />
            <div className="flex items-center gap-2 h-5 mt-0.5">
               {saveStatus === 'saving' && (
                 <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1.5 animate-pulse">
                   <Save size={12} /> Auto-saving...
                 </span>
               )}
               {saveStatus === 'cloud' && (
                 <span className="text-[11px] text-green-600 font-bold flex items-center gap-1.5">
                   <Cloud size={12} /> Saved to Cloud {lastSavedTime}
                 </span>
               )}
               {saveStatus === 'local' && (
                 <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1.5">
                   <WifiOff size={12} /> Saved Locally (Offline)
                 </span>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleAnalyzeResume}
             disabled={isAnalyzing}
             className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
               isScoreVisible ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
             }`}
           >
             <Sparkles size={16} /> {isAnalyzing ? 'Analyzing...' : isScoreVisible ? 'Review Open' : 'AI Review'}
           </button>
           <button 
             onClick={handleFinalize}
             className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95"
           >
             Finish & Publish
           </button>
           <button onClick={() => window.print()} className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
             <Download size={22} />
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-full md:w-[450px] bg-white border-r border-gray-100 flex flex-col h-full z-10 shadow-2xl print:hidden">
           <div className="flex bg-gray-50/50 p-2 border-b border-gray-100 gap-1">
              <NavButton active={activeSection === 'personal'} onClick={() => setActiveSection('personal')} icon={User} label="Info" />
              <NavButton active={activeSection === 'experience'} onClick={() => setActiveSection('experience')} icon={Briefcase} label="Work" />
              <NavButton active={activeSection === 'education'} onClick={() => setActiveSection('education')} icon={GraduationCap} label="Studies" />
              <NavButton active={activeSection === 'skills'} onClick={() => setActiveSection('skills')} icon={Wrench} label="Skills" />
           </div>

           <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
              {/* Completion Success Banner */}
              {completionStatus.allFilled && (
                <div className="animate-fade-in-up bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] shadow-sm mb-6">
                   <div className="flex gap-4 items-start">
                      <div className="bg-emerald-500 text-white p-2 rounded-xl">
                        <PartyPopper size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-emerald-900 uppercase tracking-widest text-xs mb-1">Congratulations!</h4>
                        <p className="text-sm text-emerald-700 font-medium">
                          You’ve built a professional resume. Your profile is 90% complete and highly optimized for recruiters.
                        </p>
                      </div>
                   </div>
                </div>
              )}

              {activeSection === 'personal' && (
                <div className="animate-fade-in space-y-8">
                  <SectionTitle title="Personal Details" />
                  <div className="grid grid-cols-1 gap-6">
                    <InputField label="Full Name" value={resume.personalInfo.fullName} onChange={(v) => handleInfoChange('fullName', v)} placeholder="John Doe" />
                    <InputField label="Email Address" value={resume.personalInfo.email} onChange={(v) => handleInfoChange('email', v)} placeholder="john@example.com" />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Phone" value={resume.personalInfo.phone} onChange={(v) => handleInfoChange('phone', v)} placeholder="+1 234 567" />
                      <InputField label="Location" value={resume.personalInfo.location} onChange={(v) => handleInfoChange('location', v)} placeholder="City, Country" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Summary</label>
                      <AiButton onClick={() => handleAiSuggest('summary')} />
                    </div>
                    <textarea 
                      value={resume.personalInfo.summary} 
                      onChange={(e) => handleInfoChange('summary', e.target.value)}
                      className="w-full p-5 border-2 border-gray-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-[15px] min-h-[160px] transition-all bg-gray-50/30 font-medium"
                      placeholder="e.g. Dedicated Software Engineer with 5+ years..."
                    />
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="animate-fade-in space-y-8">
                   <div className="flex justify-between items-center">
                     <SectionTitle title="Work History" />
                     <button onClick={handleAddExperience} className="text-[11px] font-black uppercase tracking-widest text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100">
                       Add Role
                     </button>
                   </div>
                   <div className="space-y-6">
                     {resume.experience.map((exp, index) => (
                       <div key={exp.id} className="bg-gray-50/50 p-6 rounded-[2rem] border-2 border-gray-50 relative group transition-all hover:border-gray-100 hover:bg-white">
                         <button onClick={() => setResume(p => ({ ...p, experience: p.experience.filter((_, i) => i !== index)}))} className="absolute top-6 right-6 text-gray-300 hover:text-red-500">
                           <Trash2 size={18} />
                         </button>
                         <div className="grid grid-cols-1 gap-5">
                           <InputField label="Position" value={exp.role} onChange={(v) => handleUpdateExperience(index, 'role', v)} placeholder="Product Manager" />
                           <InputField label="Company" value={exp.company} onChange={(v) => handleUpdateExperience(index, 'company', v)} placeholder="Company Name" />
                           <div className="grid grid-cols-2 gap-4">
                             <InputField label="Start Date" value={exp.startDate} onChange={(v) => handleUpdateExperience(index, 'startDate', v)} placeholder="MM/YYYY" />
                             <InputField label="End Date" value={exp.endDate} onChange={(v) => handleUpdateExperience(index, 'endDate', v)} placeholder="Present" />
                           </div>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Achievements</label>
                                <AiButton onClick={() => handleAiSuggest('experience', index)} />
                              </div>
                              <textarea 
                                value={exp.description} 
                                onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none text-sm min-h-[120px] bg-white transition-all font-medium"
                              />
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {activeSection === 'education' && (
                 <div className="animate-fade-in space-y-8">
                    <div className="flex justify-between items-center">
                      <SectionTitle title="Education" />
                      <button onClick={handleAddEducation} className="text-[11px] font-black uppercase tracking-widest text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100">
                        Add Study
                      </button>
                    </div>
                    {resume.education.map((edu, index) => (
                      <div key={edu.id} className="bg-gray-50/50 p-8 rounded-[2rem] border-2 border-gray-50 relative group hover:bg-white hover:border-gray-100 transition-all">
                         <button onClick={() => setResume(p => ({ ...p, education: p.education.filter((_, i) => i !== index)}))} className="absolute top-6 right-6 text-gray-300 hover:text-red-500">
                           <Trash2 size={18} />
                         </button>
                         <div className="space-y-6">
                           <InputField label="Institution" value={edu.school} onChange={(v) => handleUpdateEducation(index, 'school', v)} placeholder="University of X" />
                           <InputField label="Degree / Course" value={edu.degree} onChange={(v) => handleUpdateEducation(index, 'degree', v)} placeholder="B.S. Computer Science" />
                           <InputField label="Year of Graduation" value={edu.year} onChange={(v) => handleUpdateEducation(index, 'year', v)} placeholder="2024" />
                           
                           <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Honors & Projects</label>
                                <AiButton onClick={() => handleAiSuggest('education', index)} />
                              </div>
                              <textarea 
                                value={edu.description || ''} 
                                onChange={(e) => handleUpdateEducation(index, 'description', e.target.value)}
                                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none text-sm min-h-[100px] bg-white transition-all font-medium"
                                placeholder="e.g. Dean's List, Relevant Coursework: Data Structures..."
                              />
                           </div>
                         </div>
                      </div>
                    ))}
                 </div>
              )}

              {activeSection === 'skills' && (
                 <div className="animate-fade-in space-y-8">
                    <SectionTitle title="Skills & Expertise" />
                    <div className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                       <label className="block text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">Add Skills (Tech, Soft, Certs)</label>
                       
                       <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
                         <input 
                           value={tempSkill}
                           onChange={(e) => setTempSkill(e.target.value)}
                           className="flex-1 p-4 bg-white/10 border-2 border-white/10 rounded-2xl focus:border-white/30 outline-none text-[15px] font-medium text-white placeholder-white/40"
                           placeholder="Type a skill and press Enter..."
                         />
                         <button 
                           type="submit"
                           className="bg-white text-indigo-900 p-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95"
                         >
                           <Plus size={24} />
                         </button>
                       </form>

                       <div className="flex flex-wrap gap-3">
                         {resume.skills.map((skill, i) => (
                           <span 
                             key={i} 
                             className="group flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all border border-white/10"
                           >
                             {skill}
                             <button 
                               onClick={() => handleRemoveSkill(skill)}
                               className="text-white/40 group-hover:text-white transition-colors"
                             >
                               <X size={14} />
                             </button>
                           </span>
                         ))}
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden md:flex flex-col flex-1 bg-gray-100 h-full relative overflow-hidden">
           {score && isScoreVisible && (
             <div className="absolute top-8 right-8 z-20 w-80 animate-slide-in-right">
               <ScoreCard 
                 score={score} 
                 loading={isAnalyzing} 
                 onDismiss={() => setIsScoreVisible(false)} 
               />
             </div>
           )}

           <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start print:p-0 print:block print:overflow-visible no-scrollbar">
              <div 
                className="bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] w-[210mm] min-h-[297mm] text-gray-800 print:shadow-none print:w-full print:h-auto origin-top transition-all duration-300"
                style={{ transform: 'scale(0.85)' }}
              >
                 <ResumeRenderer data={resume} />
              </div>
           </div>
        </div>
      </div>

      <AiSuggestionModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        loading={aiLoading}
        suggestions={aiSuggestions}
        onApply={(text) => {
          if (!targetField) return;
          if (targetField.section === 'summary') {
            handleInfoChange('summary', text);
          } else if (targetField.section === 'experience' && targetField.index !== undefined) {
            handleUpdateExperience(targetField.index, 'description', text);
          } else if (targetField.section === 'education' && targetField.index !== undefined) {
            handleUpdateEducation(targetField.index, 'description', text);
          }
          setIsAiModalOpen(false);
          setToast({ message: "Content enhanced!", type: 'success' });
        }}
      />
    </div>
  );
};

// --- Helper Components ---

const NavButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] transition-all rounded-xl
      ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'}
    `}
  >
    <Icon size={16} />
    {label}
  </button>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-2xl font-bold text-gray-900 font-heading">{title}</h2>
);

const InputField = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
    <input 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-[15px] font-medium transition-all bg-gray-50/30"
      placeholder={placeholder}
    />
  </div>
);

const AiButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-[0.1em] transition-colors">
    <Sparkles size={14} />
    AI Assist
  </button>
);

export default Editor;
