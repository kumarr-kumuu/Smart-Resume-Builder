import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const CreativePro: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white min-h-full flex">
      {/* Left Accent Sidebar */}
      <div className="w-1/3 bg-indigo-600 text-white p-8">
        <div className="mb-10 text-center">
           <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 border-2 border-white/50 flex items-center justify-center">
              <span className="text-4xl font-bold">{personalInfo.fullName?.charAt(0) || '?'}</span>
           </div>
           <h1 className="text-2xl font-bold leading-tight mb-2">{personalInfo.fullName || 'Your Name'}</h1>
           <p className="text-indigo-200 text-sm font-medium">{experience[0]?.role || 'Creative Talent'}</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">Contact</h2>
            <div className="text-xs space-y-3 opacity-90">
              <p className="flex items-center gap-2">{personalInfo.email}</p>
              <p>{personalInfo.phone}</p>
              <p>{personalInfo.location}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <p className="font-bold">{edu.degree}</p>
                  <p className="opacity-80">{edu.school}</p>
                  <p className="opacity-60">{edu.year}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">Skillset</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold tracking-wide border border-white/20">
                  {skill.toUpperCase()}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-10 bg-slate-50">
         <section className="mb-10">
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4">
               <span className="w-8 h-0.5 bg-indigo-600"></span> 
               ABOUT ME
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
               {personalInfo.summary}
            </p>
         </section>

         <section>
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-6">
               <span className="w-8 h-0.5 bg-indigo-600"></span> 
               WORK HISTORY
            </h2>
            <div className="space-y-8">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  <div className="mb-1 flex justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">{exp.role}</h3>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mb-3">{exp.company}</p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
         </section>
      </div>
    </div>
  );
};

export default CreativePro;