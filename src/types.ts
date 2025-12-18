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

// Resume version for history tracking
export interface ResumeVersion {
  id: string;
  name: string;
  timestamp: number;
  data: ResumeData;
  type: 'base' | 'tailored' | 'fixed';
  companyName?: string;
  jobTitle?: string;
  atsKeywords?: string[];
  changes?: string[]; // AI-generated list of changes made
  alignmentScore?: number; // 0-100 job match percentage
  alignmentDetails?: {
    matchingPoints: string[];
    missingPoints: string[];
  };
}

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
  googleModel: 'gemini-3-flash-preview',
  cerebrasModel: 'qwen-3-235b',
  mistralModel: 'mistral-small-latest'
};

// Model options for each provider
export const GOOGLE_MODELS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
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

// Helper to generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper to format timestamp
export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}



