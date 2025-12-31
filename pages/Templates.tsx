
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, Layout, Layers } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
          <Layers size={14} /> Premium Library
        </div>
        <h1 className="text-4xl font-black font-heading text-gray-900 mb-3">Choose Your Resume Template</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Every layout is industry-vetted, ATS-compatible, and fully customizable to help you stand out.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto w-full lg:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filter === cat ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search template styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="group">
            <div className="relative aspect-[1/1.414] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform group-hover:-translate-y-2 transition-all duration-500">
               {/* Live Template Preview Scaled Down */}
               <div className="absolute inset-0 origin-top pointer-events-none" style={{ transform: 'scale(0.28)', width: '357.14%', height: '357.14%' }}>
                  <ResumeRenderer data={{...mockResumeData, templateId: template.id}} />
               </div>
               
               {/* Hover Overlay */}
               <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 backdrop-blur-[4px]">
                  <p className="text-white text-base text-center font-medium mb-8 leading-relaxed">{template.description}</p>
                  <button 
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50 active:scale-95 transition-all text-sm"
                  >
                    Select This Style
                  </button>
               </div>

               {/* Tag */}
               <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-[10px] font-black tracking-widest uppercase text-gray-800 border border-gray-100">
                  {template.category}
               </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center px-2">
              <div>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                  {template.name}
                </h3>
              </div>
              <Info size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors cursor-help" />
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
          <Layout size={64} className="mx-auto text-gray-100 mb-6" />
          <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No matching templates</h3>
          <p className="text-gray-400 mt-2">Try a different category or search term.</p>
        </div>
      )}
    </div>
  );
};

export default Templates;
