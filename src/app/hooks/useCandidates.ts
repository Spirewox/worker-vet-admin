import { useQuery } from "@tanstack/react-query"
import { axiosGet } from "../lib/api"
import type { Department } from "../interface/settings.interface"

export interface CandidateAct{
    _id : string
    "full_name": string,
    "email": string,
    "phone": string,
    "target_department": string | Department,
    "cv": {
        "filename": string,
        "url": string
    },
    "recent_activity": {
    "department_name": string
    "result": "pass" | "fail",
    "submitted_at": Date
    }
}
export interface CandidateActRes
{
  "data": CandidateAct[],
  "meta": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "search": string | null
  }
}


const fetchCandidates = async (params : {enabled : boolean, search : string, page : number, limit : number}) => {
    const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.search) queryParams.append('search', String(params.search));
  
  const endpoint = `users/candidates/recent-activity/?${queryParams.toString()}`;
  const response = await axiosGet(endpoint, true);
  return response as CandidateActRes;
};

// Custom hook
export const useCandidates = (params : {enabled : boolean, search : string, page : number, limit : number}) => {
  return useQuery({
    queryKey: ["candidates",params], // cache key
    enabled : params.enabled,
    queryFn: ()=>fetchCandidates(params),
    retry : false,
  });
};

export interface CandidateSkill {
    "skill_id": string,
    "skill_name": string,
    "percentage" ?: number
    "message" ?: string
}

export interface CandidateSkillRes
{
  "candidate_id": string,
  "candidate_name": string,
  "total_assessments": number,
  "pass_rate": number,
  "avg_score": number,
  "skills": CandidateSkill[]
}


const fetchCandidateSkills = async (id : string) => {
  const response = await axiosGet(`assessment/candidate/${id}/skills`, true);
  return response as CandidateSkillRes
};

// Custom hook
export const useCandidateSkills = (id : string) => {
  return useQuery({
    queryKey: ["candidate-skills",id],
    enabled : !!id ,
    queryFn: ()=>fetchCandidateSkills(id),
    retry : false,
  });
};



export interface AssessmentHistory {
  "date": Date,
  "job_name": string,
  department_name : string,
  "score": string,
  "percentage": number,
  "result": "pass" | "fail"
}



const fetchCandidateAssessmentHistory = async (id : string) => {
  const response = await axiosGet(`assessment/history/${id}`, true);
  return response as AssessmentHistory[]
};

// Custom hook
export const useCandidateAssessmentHistory = (id : string) => {
  return useQuery({
    queryKey: ["canidate-assessment-history",id],
    enabled : !!id ,
    queryFn: ()=>fetchCandidateAssessmentHistory(id),
    retry : false,
  });
};

export interface AssessmentRe {
    "participant_name": string,
    "job_department": string,
    "percentage": number,
    "result": "pass" | "fail",
    "submitted_at": Date | null
}

const fetchRecentAssessments = async () => {
  const response = await axiosGet(`assessment/recent`, true);
  return response as AssessmentRe[]
};

// Custom hook
export const useRecentAssessments= (enabled : boolean) => {
  return useQuery({
    queryKey: ["assessments", ],
    enabled,
    queryFn: ()=>fetchRecentAssessments(),
    retry : false,
  });
};

export interface DepartmentPassRate {
  
  "department_name": string,
  "percentage": number,
  "total_people": number,
  "total_passed": number
}

const fetchDepartmentsPassRate = async () => {
  const response = await axiosGet(`assessment/department/pass-rate`, true);
  return response as DepartmentPassRate[]
};

// Custom hook
export const useDepartmentsPassRate= (enabled : boolean) => {
  return useQuery({
    queryKey: ["department-passrates", ],
    enabled,
    queryFn: ()=>fetchDepartmentsPassRate(),
    retry : false,
  });
};