import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";
import type { GSkillPerformance } from "../interface/dashboard.interface";

const fetchGlobalSkillPerformance = async () => {
  const response = await axiosGet(`assessment/global/skills`, true);
  return response as GSkillPerformance[];
};

// Custom hook
export const useGlobalSkillPerformance = () => {
  return useQuery({
    queryKey: ["global-skill-performance"], // cache key
    queryFn: ()=>fetchGlobalSkillPerformance(),
    retry : false,
  });
};

export interface CanAssessMetriRes{
  departments_verified: number,
  assessments_passed: number,
  active_assessments: number,
}


const fetchCandidateAssessmentMetrics = async () => {
  const response = await axiosGet(`assessment/candidate/metrics`, true);
  return response as CanAssessMetriRes;
};


export const useCandidateAssessmentMetrics= (enabled : boolean) => {
  return useQuery({
    queryKey: ["assessment-metrics"], // cache key
    enabled,
    queryFn: ()=>fetchCandidateAssessmentMetrics(),
    retry : false,
  });
};

export interface CandidateAssessmentListRes{
  "assessment_id": string,
  "department": {
    "_id": string,
    "name": string
  },
  "score": string,
  "percentage": number,
  "result": "pass" | "fail",
  "status": 'in_progress' | 'submitted' | 'expired',
  "submitted_at": Date | null,
  "expires_at": "2026-02-10T15:02:11.000Z"
}


const fetchCandidateAssessmentList = async () => {
  const response = await axiosGet(`assessment/candidate`, true);
  return response as CandidateAssessmentListRes[];
};


export const useCandidateAssessmentList= (enabled : boolean) => {
  return useQuery({
    queryKey: ["candidate-assessments"],
    enabled,
    queryFn: ()=>fetchCandidateAssessmentList(),
    retry : false,
  });
};


export interface MetricsRes {
  totalCandidates: number,
  totalCandidatesMoM: number,
  assessmentsTaken: number,
  assessmentsPassed: number,
  passRateMoM:number,
  avgPassRate : number,
  activeJobsCount : number
}

const fetchDashboardMetrics = async () => {
  const response = await axiosGet(`assessment/metrics`, true);
  return response as MetricsRes;
};

// Custom hook
export const useDashboardMetrics = (enabled : boolean) => {
  return useQuery({
    queryKey: ["admin-dashboard-metrics"], // cache key
    enabled,
    queryFn: ()=>fetchDashboardMetrics(),
    retry : false,
  });
};

