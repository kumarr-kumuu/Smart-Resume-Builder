
import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const StudentEntry: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white min-h-full border-t-[16px] border-emerald-500 p-12">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{personalInfo.fullName || 'Name'}</h1>
        <div className="flex gap-4 text-xs font-bold text-emerald-600 uppercase tracking-widest">
          <span>{personalInfo.email}</span>
          <span>/</span>
          <span>{personalInfo.phone}</span>
          <span>/</span>
          <span>{personalInfo.location}</span>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-4">
            EDUCATION
            <div className="h-0.5 flex-1 bg-gray-100"></div>
          </h2>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-3 text-sm font-black text-emerald-500">{edu.year}</div>
                <div className="col-span-9">
                  <h3 className="font-bold text-gray-900">{edu.school}</h3>
                  <p className="text-sm text-gray-500">{edu.degree}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-4">
            EXPERIENCE
            <div className="h-0.5 flex-1 bg-gray-100"></div>
          </h2>
          <div className="space-y-8">
            {experience.map((exp) => (
              <div key={exp.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-3 text-sm font-black text-gray-300">{exp.startDate} - {exp.endDate}</div>
                <div className="col-span-9">
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <p className="text-sm font-bold text-emerald-600 mb-2">{exp.company}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-4">
            SKILLS
            <div className="h-0.5 flex-1 bg-gray-100"></div>
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentEntry;
