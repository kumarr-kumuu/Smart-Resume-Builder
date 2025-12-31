
import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const ElegantSerif: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-[#fcfcfc] text-[#1a1a1a] p-12 min-h-full font-serif">
      <div className="text-center mb-12 border-b-2 border-[#1a1a1a] pb-8">
        <h1 className="text-4xl italic font-light tracking-wide mb-4">
          {personalInfo.fullName || 'Name Surname'}
        </h1>
        <div className="flex justify-center gap-6 text-[11px] uppercase tracking-[0.2em] font-sans font-medium text-gray-500">
          <span>{personalInfo.email}</span>
          <span>&bull;</span>
          <span>{personalInfo.phone}</span>
          <span>&bull;</span>
          <span>{personalInfo.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 space-y-10">
          <section>
            <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] mb-6 text-gray-400">Professional Summary</h2>
            <p className="text-sm leading-relaxed indent-8 text-gray-700">{personalInfo.summary}</p>
          </section>

          <section>
            <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] mb-8 text-gray-400">Experience</h2>
            <div className="space-y-10">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-lg font-bold italic">{exp.role}</h3>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="text-xs font-sans font-black uppercase tracking-widest mb-4 text-[#d4af37]">{exp.company}</p>
                  <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-4 space-y-10 border-l border-gray-100 pl-10">
          <section>
            <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] mb-6 text-gray-400">Education</h2>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-sm font-bold italic">{edu.school}</p>
                  <p className="text-[11px] font-sans text-gray-500 mb-1">{edu.degree}</p>
                  <p className="text-[10px] font-sans text-gray-400">{edu.year}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] mb-6 text-gray-400">Expertise</h2>
            <div className="flex flex-col gap-3">
              {skills.map((skill, i) => (
                <span key={i} className="text-xs italic text-gray-700 border-b border-gray-100 pb-1">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ElegantSerif;
