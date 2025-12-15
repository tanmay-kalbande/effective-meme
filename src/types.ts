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

export type AIProvider = 'google' | 'cerebras' | 'mistral';

export interface AISettings {
  provider: AIProvider;
  googleApiKey: string;
  cerebrasApiKey: string;
  mistralApiKey: string;
  googleModel: string;
  cerebrasModel: string;
  mistralModel: string;
}

export const DEFAULT_SETTINGS: AISettings = {
  provider: 'google',
  googleApiKey: '',
  cerebrasApiKey: '',
  mistralApiKey: '',
  googleModel: 'gemini-2.0-flash',
  cerebrasModel: 'qwen-3-235b',
  mistralModel: 'mistral-small-latest'
};

// Model options for each provider
export const GOOGLE_MODELS = [
  { value: 'gemini-2.0-flash', label: 'Gemini Flash Latest' },
  { value: 'gemma-3-27b-it', label: 'Gemma 3 27B' },
];

export const CEREBRAS_MODELS = [
  { value: 'gpt-oss-120b', label: 'GPT-OSS 120B' },
  { value: 'qwen-3-235b', label: 'Qwen 3 235B Instruct' },
  { value: 'zai-glm-4.6', label: 'ZAI GLM 4.6' },
];

export const MISTRAL_MODELS = [
  { value: 'mistral-small-latest', label: 'Mistral Small' },
  { value: 'mistral-medium-latest', label: 'Mistral Medium' },
  { value: 'mistral-large-latest', label: 'Mistral Large' },
];
