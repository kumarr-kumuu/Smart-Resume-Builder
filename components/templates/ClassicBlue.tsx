import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const ClassicBlue: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white text-gray-800 p-10 min-h-full border-t-[12px] border-blue-800 shadow-inner">
      {/* Name and Title */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight leading-none mb-1">
            {personalInfo.fullName || 'NAME SURNAME'}
          </h1>
          <p className="text-lg font-semibold text-gray-500 italic">
            {experience[0]?.role || 'Job Title'}
          </p>
        </div>
        <div className="text-right text-sm space-y-1">
          {personalInfo.email && <p className="text-blue-800 font-medium">{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
        </div>
      </div>

      <div className="space-y-8">
        {personalInfo.summary && (
          <section>
            <h2 className="text-base font-bold text-blue-800 border-b border-gray-200 mb-3 flex items-center justify-between">
               SUMMARY 
               <span className="h-[1px] flex-1 ml-4 bg-gray-100"></span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">{personalInfo.summary}</p>
          </section>
        )}

        <section>
          <h2 className="text-base font-bold text-blue-800 border-b border-gray-200 mb-4 flex items-center justify-between">
             PROFESSIONAL EXPERIENCE 
             <span className="h-[1px] flex-1 ml-4 bg-gray-100"></span>
          </h2>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-center mb-1">
                   <h3 className="text-sm font-extrabold text-gray-900">{exp.company}</h3>
                   <span className="text-xs font-bold text-gray-500 italic">{exp.startDate} — {exp.endDate}</span>
                </div>
                <p className="text-sm font-bold text-blue-700 mb-2">{exp.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed pl-2 border-l border-gray-100 ml-1">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-10">
          <section>
            <h2 className="text-base font-bold text-blue-800 border-b border-gray-200 mb-4 flex items-center">
               EDUCATION
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-sm font-bold text-gray-900">{edu.school}</p>
                  <p className="text-xs text-gray-600 font-medium">{edu.degree}</p>
                  <p className="text-xs text-gray-400 italic">{edu.year}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-blue-800 border-b border-gray-200 mb-4 flex items-center">
               SKILLS
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-1 h-1 bg-blue-800 rounded-full"></div>
                  {skill}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClassicBlue;