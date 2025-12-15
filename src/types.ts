export interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  summary: string;
  experiences: Experience[];
  skills: Skills;
  projects: Project[];
  certifications: string[];
}

export interface Experience {
  jobTitle: string;
  company: string;
  duration: string;
  duties: string[];
}

export interface Skills {
  languages: string;
  databases: string;
  mlAi: string;
  visualization: string;
  frameworks: string;
  bigData: string;
}

export interface Project {
  title: string;
  description: string;
}

export type AIProvider = 'google' | 'cerebras';

export interface AISettings {
  provider: AIProvider;
  googleApiKey: string;
  cerebrasApiKey: string;
  googleModel: string;
  cerebrasModel: string;
}

export const DEFAULT_SETTINGS: AISettings = {
  provider: 'google',
  googleApiKey: '',
  cerebrasApiKey: '',
  googleModel: 'gemma-3-27b-it',
  cerebrasModel: 'qwen-3-32b'
};
