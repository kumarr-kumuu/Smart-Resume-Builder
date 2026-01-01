
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, Layout, Layers, Sparkles } from 'lucide-react';
import ResumeRenderer from '../components/templates/ResumeRenderer';
import { Resume } from '../types';

interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
}

const templateDefinitions: TemplateDefinition[] = [
  { id: 'modern-executive', name: 'Modern Executive', category: 'Professional', description: 'Bold headers and high-contrast layout for leadership roles.' },
  { id: 'minimalist', name: 'Clean Minimalist', category: 'Minimalist', description: 'Maximum whitespace and elegant typography for a clean look.' },
  { id: 'creative-pro', name: 'Creative Pro', category: 'Creative', description: 'Vibrant sidebar and modern accents for design and marketing.' },
  { id: 'classic-blue', name: 'Classic Blue', category: 'Corporate', description: 'Conservative, formal layout with a professional blue color palette.' },
  { id: 'tech-focused', name: 'Tech Focused', category: 'Technical', description: 'Monospaced elements and code-like syntax for software engineers.' },
  { id: 'elegant-serif', name: 'Elegant Serif', category: 'Professional', description: 'Sophisticated serif fonts for a classic, high-end feel.' },
  { id: 'ats-optimized', name: 'ATS Optimized', category: 'Minimalist', description: 'Simple single-column structure designed for machine readability.' },
  { id: 'student-entry', name: 'Student Entry', category: 'Student', description: 'Education-first layout optimized for new graduates and interns.' },
  { id: 'compact-column', name: 'Compact Column', category: 'Corporate', description: 'Dense information display perfect for long career histories.' },
  { id: 'freelancer-showcase', name: 'Freelancer Showcase', category: 'Creative', description: 'Highlighting skills and achievements for independent contractors.' },
];

const mockResumeData: Resume = {
  id: 'preview',
  title: 'Preview',
  lastEdited: '',
  templateId: 'modern-executive',
  status: 'draft',
  personalInfo: {
    fullName: 'ALEXANDER DUPONT',
    email: 'alex.d@example.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    summary: 'Strategic Senior Product Manager with 10+ years of experience leading cross-functional teams in the fintech space. Proven track record of increasing user engagement by 40% through data-driven product iterations.'
  },
  experience: [
    { id: '1', role: 'Director of Product', company: 'Nexus FinTech', startDate: '2019', endDate: 'Present', description: 'Overseeing a team of 15 product managers and designers.\nImplemented agile workflows reducing time-to-market by 25%.' }
  ],
  education: [
    { id: '1', school: 'Columbia University', degree: 'MBA in Strategy', year: '2015' }
  ],
  skills: ['Product Strategy', 'Team Leadership', 'Python', 'SQL', 'UX Design']
};

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', 'Professional', 'Minimalist', 'Creative', 'Corporate', 'Technical', 'Student'];

  const filteredTemplates = templateDefinitions.filter(t => 
    (filter === 'All' || t.category === filter) &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUseTemplate = (templateId: string) => {
    const newId = `resume-${Date.now()}`;
    navigate(`/editor/${newId}?template=${templateId}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Sparkles size={14} className="animate-pulse" /> Premium Design Library
        </div>
        <h1 className="text-5xl font-black font-heading text-white mb-4 tracking-tighter uppercase">Choose Your Studio Style</h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
          Every layout is industry-vetted, ATS-compatible, and engineered by AI to ensure your profile captures attention in milliseconds.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex bg-brand-surface p-1 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto w-full lg:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === cat ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search template catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4.5 bg-brand-surface border border-white/5 rounded-2xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all shadow-xl font-bold text-white text-sm placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* Grid Layout Update: 4 columns responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="group cursor-pointer" onClick={() => handleUseTemplate(template.id)}>
            {/* Wrapper with fixed aspect ratio 3:4 */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-md bg-brand-surface border border-white/5 transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:border-brand-red/30">
               
               {/* Live Template Preview Scaled Down & Optimized for 3:4 */}
               <div className="absolute inset-0 origin-top pointer-events-none transition-transform duration-500 group-hover:scale-[0.32]" 
                    style={{ transform: 'scale(0.30)', width: '333.33%', height: '333.33%' }}>
                  <div className="w-full h-full bg-white shadow-inner">
                    <ResumeRenderer data={{...mockResumeData, templateId: template.id}} />
                  </div>
               </div>
               
               {/* Hover Overlay */}
               <div className="absolute inset-0 bg-brand-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 backdrop-blur-[4px]">
                  <div className="bg-brand-red p-3 rounded-full text-white mb-4 shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                    <Layers size={24} />
                  </div>
                  <p className="text-white text-xs text-center font-bold mb-6 leading-relaxed uppercase tracking-widest">{template.description}</p>
                  <button 
                    className="w-full bg-brand-red text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-2xl hover:bg-brand-redHover active:scale-95 transition-all text-[10px]"
                  >
                    Load Style
                  </button>
               </div>

               {/* Tag Badge */}
               <div className="absolute top-4 left-4 bg-brand-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-2xl text-[8px] font-black tracking-[0.2em] uppercase text-white border border-white/10 group-hover:border-brand-red/50 transition-colors">
                  {template.category}
               </div>
            </div>
            
            {/* Template Info Below Card */}
            <div className="mt-5 flex justify-between items-center px-1">
              <div className="min-w-0">
                <h3 className="font-black text-white text-sm uppercase tracking-tighter truncate group-hover:text-brand-red transition-colors">
                  {template.name}
                </h3>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">{template.category} Style</p>
              </div>
              <div className="p-2 text-gray-700 group-hover:text-white transition-colors">
                <Info size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-32 bg-brand-surface rounded-[3rem] border-2 border-dashed border-white/5">
          <Layout size={64} className="mx-auto text-gray-800 mb-6" />
          <h3 className="text-lg font-black text-gray-500 uppercase tracking-widest">No matching styles found</h3>
          <p className="text-gray-700 mt-2 text-sm font-bold">Try expanding your search or selecting 'All' categories.</p>
        </div>
      )}
    </div>
  );
};

export default Templates;
