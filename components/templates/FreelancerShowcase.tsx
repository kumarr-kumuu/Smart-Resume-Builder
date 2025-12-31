
import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const FreelancerShowcase: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-[#111] text-white min-h-full font-sans">
      <div className="p-12 bg-gradient-to-br from-indigo-600 to-purple-700">
        <h1 className="text-6xl font-black tracking-tighter mb-4">{personalInfo.fullName}</h1>
        <p className="text-xl font-medium opacity-80 max-w-2xl">{personalInfo.summary}</p>
      </div>

      <div className="p-12 grid grid-cols-12 gap-12">
        <div className="col-span-12">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-8">Selected Works & Experience</h2>
          <div className="grid grid-cols-2 gap-8">
            {experience.map((exp) => (
              <div key={exp.id} className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase">{exp.startDate} — {exp.endDate}</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{exp.role}</h3>
                <p className="text-indigo-400 font-bold mb-4">{exp.company}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-8">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-8">Technical Proficiencies</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, i) => (
              <span key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-4">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-8">Education</h2>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id}>
                <h4 className="font-bold text-lg">{edu.school}</h4>
                <p className="text-sm text-gray-400">{edu.degree}</p>
                <p className="text-xs text-gray-500 mt-1 font-bold">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 pt-12 border-t border-white/5 flex justify-between items-center text-xs font-bold text-gray-500">
          <div className="flex gap-8">
            <span>E: {personalInfo.email}</span>
            <span>P: {personalInfo.phone}</span>
            <span>L: {personalInfo.location}</span>
          </div>
          <div className="uppercase tracking-widest text-indigo-500">Available for Hire</div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerShowcase;
