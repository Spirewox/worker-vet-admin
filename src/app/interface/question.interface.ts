import type { Skill } from "./settings.interface";

export interface Question {
  _id ?: string;
  skill_category: Skill | string;
  department: string;
  scenario?: string;
  question_text: string;
  time_seconds: number;
  options?: Option[];
  correct_option_id ?: string;
  correct_option_index ?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Option {
  _id ?: string;
  content: string;
}