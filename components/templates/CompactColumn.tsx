
import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const CompactColumn: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-gray-50 min-h-full flex flex-col p-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm mb-6 flex justify-between items-center border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{personalInfo.fullName}</h1>
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">{experience[0]?.role}</p>
        </div>
        <div className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          <p>{personalInfo.email}</p>
          <p>{personalInfo.phone}</p>
          <p>{personalInfo.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        <div className="col-span-4 space-y-6">
          <div className="bg-rose-500 rounded-3xl p-6 text-white">
            <h2 className="font-black uppercase tracking-widest text-[10px] mb-4 text-rose-200">Expertise</h2>
            <div className="flex flex-col gap-2">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <span className="text-xs font-bold">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h2 className="font-black uppercase tracking-widest text-[10px] mb-4 text-gray-300">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-xs font-black text-gray-900">{edu.degree}</p>
                  <p className="text-[10px] text-gray-400">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-8 bg-white rounded-3xl p-8 border border-gray-100 space-y-8">
          <section>
            <h2 className="font-black uppercase tracking-widest text-[10px] mb-6 text-gray-300">Background</h2>
            <p className="text-sm text-gray-600 leading-relaxed italic">"{personalInfo.summary}"</p>
          </section>

          <section>
            <h2 className="font-black uppercase tracking-widest text-[10px] mb-6 text-gray-300">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-rose-100">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{exp.role}</h3>
                    <span className="text-[10px] font-black text-rose-500">{exp.startDate}-{exp.endDate}</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 mb-2">{exp.company}</p>
                  <p className="text-xs text-gray-600 leading-snug">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CompactColumn;
