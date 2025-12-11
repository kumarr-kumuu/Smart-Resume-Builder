export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'Free' | 'Pro';
}

export interface Resume {
  id: string;
  title: string;
  lastEdited: string;
  thumbnail?: string;
  templateId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Template {
  id: string;
  name: string;
  image: string;
  category: string;
}

export interface Suggestion {
  id: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}