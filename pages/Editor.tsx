import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Sparkles, Plus, Trash2, GripVertical } from 'lucide-react';
import { generateResumeSuggestions } from '../services/geminiService';
import AiSuggestionModal from '../components/AiSuggestionModal';
import { Resume, ExperienceItem, Suggestion } from '../types';

// Initial Empty State
const initialResume: Resume = {
  id: 'new',
  title: 'Untitled Resume',
  lastEdited: new Date().toISOString(),
  templateId: '1',
  personalInfo: { fullName: 'Alex Doe', email: 'alex@example.com', phone: '(555) 123-4567', location: 'New York, NY', summary: '' },
  experience: [],
  education: [],
  skills: ['JavaScript', 'React', 'Team Leadership']
};

const Editor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume>(initialResume);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  
  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  const [targetField, setTargetField] = useState<{section: 'summary' | 'experience', index?: number} | null>(null);

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

  const handleAiSuggest = async (section: 'summary' | 'experience', index?: number) => {
    setTargetField({ section, index });
    setIsAiModalOpen(true);
    setAiLoading(true);
    setAiSuggestions([]);

    let context = "";
    if (section === 'summary') {
      context = `Job Title: ${resume.experience[0]?.role || 'Professional'}. Skills: ${resume.skills.join(', ')}`;
    } else if (section === 'experience' && index !== undefined) {
      context = `Role: ${resume.experience[index].role}. Company: ${resume.experience[index].company}`;
    }

    const suggestions = await generateResumeSuggestions(
      resume.experience[0]?.role || "Professional", 
      section, 
      context
    );
    
    setAiSuggestions(suggestions);
    setAiLoading(false);
  };

  const applySuggestion = (text: string) => {
    if (!targetField) return;
    
    if (targetField.section === 'summary') {
      handleInfoChange('summary', text);
    } else if (targetField.section === 'experience' && targetField.index !== undefined) {
      handleUpdateExperience(targetField.index, 'description', text);
    }
    setIsAiModalOpen(false);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-30 print-only:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <input 
            value={resume.title} 
            onChange={(e) => setResume({...resume, title: e.target.value})}
            className="font-semibold text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none text-lg"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
            <Save size={18} /> <span className="hidden sm:inline">Save</span>
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
          >
            <Download size={18} /> <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Editor Form Panel */}
        <div className="w-full md:w-1/2 lg:w-[45%] bg-white border-r border-gray-200 overflow-y-auto p-6 pb-20 print-only:hidden">
           {/* Section: Personal Info */}
           <section className="mb-8">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
               <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
               Personal Information
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                 <input 
                   value={resume.personalInfo.fullName}
                   onChange={(e) => handleInfoChange('fullName', e.target.value)}
                   className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                   placeholder="John Doe"
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                 <input 
                   value={resume.personalInfo.email}
                   onChange={(e) => handleInfoChange('email', e.target.value)}
                   className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                   placeholder="john@example.com"
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                 <input 
                   value={resume.personalInfo.phone}
                   onChange={(e) => handleInfoChange('phone', e.target.value)}
                   className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                   placeholder="(555) 555-5555"
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                 <input 
                   value={resume.personalInfo.location}
                   onChange={(e) => handleInfoChange('location', e.target.value)}
                   className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                   placeholder="City, State"
                 />
               </div>
               <div className="sm:col-span-2 relative">
                 <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-500">Professional Summary</label>
                    <button 
                      onClick={() => handleAiSuggest('summary')}
                      className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <Sparkles size={12} /> AI Suggest
                    </button>
                 </div>
                 <textarea 
                   value={resume.personalInfo.summary}
                   onChange={(e) => handleInfoChange('summary', e.target.value)}
                   className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                   placeholder="Briefly describe your professional background..."
                 />
               </div>
             </div>
           </section>

           {/* Section: Experience */}
           <section className="mb-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                  Experience
                </h2>
                <button 
                  onClick={handleAddExperience}
                  className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={16} /> Add Position
                </button>
             </div>
             
             <div className="space-y-6">
               {resume.experience.map((exp, index) => (
                 <div key={exp.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                   <button 
                    onClick={() => {
                      const newExp = resume.experience.filter((_, i) => i !== index);
                      setResume(prev => ({ ...prev, experience: newExp }));
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="grid grid-cols-2 gap-3 mb-3">
                     <input 
                       placeholder="Job Title"
                       value={exp.role}
                       onChange={(e) => handleUpdateExperience(index, 'role', e.target.value)}
                       className="w-full bg-white p-2 border border-gray-200 rounded-lg text-sm"
                     />
                     <input 
                       placeholder="Company"
                       value={exp.company}
                       onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                       className="w-full bg-white p-2 border border-gray-200 rounded-lg text-sm"
                     />
                     <input 
                       placeholder="Start Date"
                       value={exp.startDate}
                       onChange={(e) => handleUpdateExperience(index, 'startDate', e.target.value)}
                       className="w-full bg-white p-2 border border-gray-200 rounded-lg text-sm"
                     />
                     <input 
                       placeholder="End Date"
                       value={exp.endDate}
                       onChange={(e) => handleUpdateExperience(index, 'endDate', e.target.value)}
                       className="w-full bg-white p-2 border border-gray-200 rounded-lg text-sm"
                     />
                   </div>
                   <div className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-gray-500">Description</label>
                        <button 
                          onClick={() => handleAiSuggest('experience', index)}
                          className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <Sparkles size={12} /> AI Improve
                        </button>
                      </div>
                      <textarea 
                        placeholder="• Achieved X by doing Y..."
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                        className="w-full bg-white p-2 border border-gray-200 rounded-lg text-sm min-h-[80px]"
                      />
                   </div>
                 </div>
               ))}
               {resume.experience.length === 0 && (
                 <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                   No experience added yet.
                 </div>
               )}
             </div>
           </section>
        </div>

        {/* Live Preview Panel */}
        <div className="hidden md:flex flex-1 bg-gray-500/10 justify-center overflow-y-auto p-8 relative print:block print:p-0 print:bg-white print:overflow-visible print:absolute print:inset-0 print:w-full print:h-auto">
          {/* A4 Page */}
          <div className="resume-preview bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] text-gray-800 print:shadow-none mx-auto transform origin-top scale-100 lg:scale-90 xl:scale-100 transition-transform">
             {/* Resume Header */}
             <div className="border-b-2 border-gray-800 pb-6 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{resume.personalInfo.fullName || 'Your Name'}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                  {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                  {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
                </div>
             </div>

             {/* Summary */}
             {resume.personalInfo.summary && (
               <div className="mb-6">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Professional Summary</h2>
                 <p className="text-sm leading-relaxed text-gray-700">{resume.personalInfo.summary}</p>
               </div>
             )}

             {/* Experience */}
             <div className="mb-6">
               <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Experience</h2>
               <div className="space-y-4">
                 {resume.experience.map(exp => (
                   <div key={exp.id}>
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="font-bold text-gray-800">{exp.role}</h3>
                       <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</span>
                     </div>
                     <p className="text-sm font-medium text-gray-700 mb-1">{exp.company}</p>
                     <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                       {exp.description}
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Skills (Static for demo) */}
             <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <AiSuggestionModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        loading={aiLoading}
        suggestions={aiSuggestions}
        onApply={applySuggestion}
      />
    </div>
  );
};

export default Editor;