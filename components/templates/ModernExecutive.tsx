import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const ModernExecutive: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white text-gray-800 flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gray-900 text-white p-8 mb-6">
        <h1 className="text-4xl font-bold tracking-tight uppercase mb-2">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-blue-400 font-medium tracking-widest uppercase text-sm">
          {experience[0]?.role || 'Professional'}
        </p>
      </div>

      <div className="flex flex-1 px-8 pb-8 gap-8">
        {/* Main Column */}
        <div className="flex-[2] space-y-6">
          {personalInfo.summary && (
            <section>
              <h2 className="text-lg font-bold border-b-2 border-gray-900 pb-1 mb-3 uppercase tracking-wider">Profile</h2>
              <p className="text-sm leading-relaxed text-gray-600">{personalInfo.summary}</p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold border-b-2 border-gray-900 pb-1 mb-4 uppercase tracking-wider">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900">{exp.role}</h3>
                    <span className="text-xs text-gray-500 font-bold">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <p className="text-sm text-blue-600 font-semibold mb-2">{exp.company}</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-lg font-bold border-b-2 border-gray-900 pb-1 mb-3 uppercase tracking-wider">Contact</h2>
            <div className="text-sm space-y-2 text-gray-600">
              {personalInfo.email && <p className="break-all"><strong>E:</strong> {personalInfo.email}</p>}
              {personalInfo.phone && <p><strong>P:</strong> {personalInfo.phone}</p>}
              {personalInfo.location && <p><strong>L:</strong> {personalInfo.location}</p>}
              {personalInfo.linkedin && <p className="text-blue-600 text-xs">LinkedIn</p>}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold border-b-2 border-gray-900 pb-1 mb-3 uppercase tracking-wider">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-sm font-bold text-gray-900">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.school}</p>
                  <p className="text-xs text-gray-400">{edu.year}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold border-b-2 border-gray-900 pb-1 mb-3 uppercase tracking-wider">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
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

export default ModernExecutive;