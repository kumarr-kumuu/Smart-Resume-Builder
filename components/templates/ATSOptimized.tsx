
import React from 'react';
import { Resume } from '../../types';

interface TemplateProps {
  data: Resume;
}

const ATSOptimized: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="bg-white text-black p-12 min-h-full font-sans text-[11pt] leading-normal">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1">{personalInfo.fullName || 'FULL NAME'}</h1>
        <p className="text-[10pt]">
          {personalInfo.location} | {personalInfo.phone} | {personalInfo.email}
          {personalInfo.dob && ` | DOB: ${personalInfo.dob}`}
        </p>
        <p className="text-[10pt] italic">
          {personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`}
          {personalInfo.website && ` | Portfolio: ${personalInfo.website}`}
        </p>
      </div>

      <div className="space-y-6">
        {personalInfo.summary && (
          <section>
            <h2 className="font-bold uppercase border-b border-black mb-2">Summary</h2>
            <p className="text-[10pt]">{personalInfo.summary}</p>
          </section>
        )}

        <section>
          <h2 className="font-bold uppercase border-b border-black mb-3">Experience</h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold">
                  <span>{exp.company}</span>
                  <span>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="italic mb-1">{exp.role}</div>
                <p className="text-[10pt] whitespace-pre-line pl-4">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold uppercase border-b border-black mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between mb-1">
              <div>
                <span className="font-bold">{edu.school}</span>, {edu.degree}
              </div>
              <span>{edu.year}</span>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-bold uppercase border-b border-black mb-2">Skills</h2>
          <p className="text-[10pt]">
            <span className="font-bold">Technical Skills:</span> {skills.join(', ')}
          </p>
        </section>
      </div>
    </div>
  );
};

export default ATSOptimized;
