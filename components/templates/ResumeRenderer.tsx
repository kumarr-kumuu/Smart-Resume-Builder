
import React from 'react';
import { Resume } from '../../types';
import ModernExecutive from './ModernExecutive';
import Minimalist from './Minimalist';
import CreativePro from './CreativePro';
import ClassicBlue from './ClassicBlue';
import TechFocused from './TechFocused';
import ElegantSerif from './ElegantSerif';
import ATSOptimized from './ATSOptimized';
import StudentEntry from './StudentEntry';
import CompactColumn from './CompactColumn';
import FreelancerShowcase from './FreelancerShowcase';

interface ResumeRendererProps {
  data: Resume;
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data }) => {
  const { templateId } = data;

  switch (templateId) {
    case 'modern-executive':
      return <ModernExecutive data={data} />;
    case 'minimalist':
      return <Minimalist data={data} />;
    case 'creative-pro':
      return <CreativePro data={data} />;
    case 'classic-blue':
      return <ClassicBlue data={data} />;
    case 'tech-focused':
      return <TechFocused data={data} />;
    case 'elegant-serif':
      return <ElegantSerif data={data} />;
    case 'ats-optimized':
      return <ATSOptimized data={data} />;
    case 'student-entry':
      return <StudentEntry data={data} />;
    case 'compact-column':
      return <CompactColumn data={data} />;
    case 'freelancer-showcase':
      return <FreelancerShowcase data={data} />;
    default:
      return <ModernExecutive data={data} />;
  }
};

export default ResumeRenderer;
