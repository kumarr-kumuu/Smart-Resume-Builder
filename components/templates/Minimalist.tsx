import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const Minimalist: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white text-slate-700 p-12 min-h-full font-serif">
      {/* Centered Header */}
      <div className="text-center mb-10 border-b border-slate-100 pb-8">
        <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-slate-900 mb-4">
          {personalInfo.fullName || 'Full Name'}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 tracking-widest uppercase font-medium">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      <div className="space-y-10 max-w-3xl mx-auto">
        {personalInfo.summary && (
          <section>
            <p className="text-sm leading-relaxed italic text-slate-500 text-center px-10">
              {personalInfo.summary}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-slate-900 mb-6 text-center">Experience</h2>
          <div className="space-y-8">
            {experience.map((exp) => (
              <div key={exp.id} className="relative pl-8 border-l border-slate-100">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{exp.role}</h3>
                    <p className="text-xs text-slate-400 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{exp.startDate} — {exp.endDate}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-12">
          <div>
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-slate-900 mb-4">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-sm font-bold text-slate-800">{edu.school}</p>
                  <p className="text-xs text-slate-500">{edu.degree}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-slate-900 mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {skills.map((skill, i) => (
                <span key={i} className="text-xs text-slate-500 font-medium tracking-wide">
                  / {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Minimalist;