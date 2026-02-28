export type Department = string;

export const INITIAL_DEPARTMENTS: string[] = [
  'Sales & Customer Management',
  'Creative & Tech',
  'Finance',
  'Legal',
  'Business Administration'
];

export type Skill = 
  | 'Trust'
  | 'Integrity'
  | 'Accountability'
  | 'Communication'
  | 'Teamwork'
  | 'Ethics'
  | 'Confidentiality';

export const SKILLS: Skill[] = [
  'Trust', 'Integrity', 'Accountability', 'Communication', 'Teamwork', 'Ethics', 'Confidentiality'
];

export interface Question {
  id: string;
  skill_id: string;
  scenario: string;
  questionText: string;
  options: {_id : string, content : string}[];
  explanation: string;
  timeLimit?: number; // Added to allow setting countdown timer per question (in seconds)
  isPreset?: boolean; // Flag to identify manually added questions
  department?: Department; // Optional: specific department this question belongs to
}

export interface JobPosting {
  id: string;
  title: string;
  department: Department;
  description: string;
  requirements: string;
  location: string;
  salaryRange: string;
  createdAt: string;
  active: boolean;
}

export interface AssessmentResult {
  assessment_id: string;
  department_name: string;
  jobId?: string; // Optional: link result to a specific job posting
  submitted_at: Date;
  total_score: number;
  max_score : number;
  percentage: number;
  result : "pass" | "fail"
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  cvFileName?: string;
  targetDepartment?: Department;
  password?: string; // Added password field
  assessments: AssessmentResult[];
}