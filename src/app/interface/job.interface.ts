import type { Department } from "./settings.interface";

export interface IJob {
  _id?: string;

  job_title: string;
  job_description: string;

  department: string | Department;

  requirements?: string;
  location?: string;
  salary_range?: string;

  is_active?: boolean;
  application_count?: number;
  // Optional pipeline breakdown for this job's applicants.
  applicant_stats?: {
    shortlisted?: number;
    hired?: number;
  };

  is_certified ?: boolean,
  is_applied ?: boolean,

  createdAt?: Date;
  updatedAt?: Date;
}