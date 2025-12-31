import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const TechFocused: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white text-gray-900 p-10 min-h-full font-mono text-[13px]">
      {/* Technical Header */}
      <div className="border-2 border-black p-4 mb-8 relative">
        <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-600 tracking-tighter">
          // DEVELOPER_PROFILE
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">
          {personalInfo.fullName?.toUpperCase() || 'DEVELOPER NAME'}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
          {personalInfo.email && <span>EMAIL: "{personalInfo.email}"</span>}
          {personalInfo.location && <span>LOCATION: "{personalInfo.location}"</span>}
          {personalInfo.website && <span>SITE: "{personalInfo.website}"</span>}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
           <section>
             <h2 className="text-sm font-black bg-black text-white px-2 py-0.5 inline-block mb-4">EXPERIENCE[]</h2>
             <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-black text-blue-600 underline">#{exp.role.replace(/\s+/g, '_').toUpperCase()}</h3>
                      <span className="text-[10px] text-gray-400 font-bold">[{exp.startDate} - {exp.endDate}]</span>
                    </div>
                    <p className="font-bold text-gray-700 mb-2">@ {exp.company}</p>
                    <p className="text-gray-500 leading-tight">
                      {exp.description}
                    </p>
                  </div>
                ))}
             </div>
           </section>

           <section>
              <h2 className="text-sm font-black bg-black text-white px-2 py-0.5 inline-block mb-4">EDUCATION[]</h2>
              <div className="space-y-3">
                 {education.map((edu) => (
                   <div key={edu.id} className="flex justify-between">
                     <div>
                       <span className="font-black">{edu.school}</span>
                       <span className="text-gray-500 ml-2">({edu.degree})</span>
                     </div>
                     <span className="text-gray-400">{edu.year}</span>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        <div className="col-span-4 space-y-8 border-l border-gray-100 pl-8">
           <section>
              <h2 className="text-xs font-black text-gray-400 mb-4 tracking-widest uppercase">Stack.keywords</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 font-bold border border-blue-100 rounded">
                    {skill}
                  </span>
                ))}
              </div>
           </section>

           {personalInfo.summary && (
             <section>
                <h2 className="text-xs font-black text-gray-400 mb-4 tracking-widest uppercase">Summary.md</h2>
                <p className="text-gray-500 italic leading-snug">
                  {personalInfo.summary}
                </p>
             </section>
           )}
        </div>
      </div>
    </div>
  );
};

export default TechFocused;