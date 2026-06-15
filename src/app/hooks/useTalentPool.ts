import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export interface CertifiedDepartment {
  department_id?: string;
  department_name: string;
  score: number;
  date: string;
}

export interface TalentSkill {
  skill_name: string;
  percentage: number;
}

export interface Talent {
  _id: string;
  full_name: string;
  email: string;
  phone?: string;
  cv?: { filename: string; url: string } | null;
  certified_departments: CertifiedDepartment[];
  avg_score: number;
  pass_rate: number;
  assessments_taken: number;
  top_skills: TalentSkill[];
  last_active?: string;
  shortlisted?: boolean;
}

export interface TalentPoolRes {
  data: Talent[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface TalentPoolParams {
  search?: string;
  department?: string;
  skill?: string;
  min_score?: number;
  sort?: "avg_score" | "pass_rate" | "recent";
  shortlisted?: boolean;
  page?: number;
  limit?: number;
}

const fetchTalentPool = async (params: TalentPoolParams) => {
  const q = new URLSearchParams();
  if (params.search) q.append("search", params.search);
  if (params.department) q.append("department", params.department);
  if (params.skill) q.append("skill", params.skill);
  if (params.min_score) q.append("min_score", String(params.min_score));
  if (params.sort) q.append("sort", params.sort);
  if (params.shortlisted) q.append("shortlisted", "true");
  if (params.page) q.append("page", String(params.page));
  if (params.limit) q.append("limit", String(params.limit));

  const response = await axiosGet(`talent-pool?${q.toString()}`, true);
  if (Array.isArray(response)) {
    return {
      data: response as Talent[],
      meta: { page: 1, limit: response.length, total: response.length, totalPages: 1 },
    } as TalentPoolRes;
  }
  return response as TalentPoolRes;
};

export const useTalentPool = (enabled: boolean, params: TalentPoolParams) => {
  return useQuery({
    queryKey: ["talent-pool", params],
    enabled,
    queryFn: () => fetchTalentPool(params),
    retry: false,
  });
};

export interface TalentStats {
  total: number;
  certified: number;
  avg_score: number;
  top_department: string;
}

const fetchTalentStats = async () => {
  const response = await axiosGet(`talent-pool/stats`, true);
  return response as TalentStats;
};

export const useTalentStats = (enabled: boolean) => {
  return useQuery({
    queryKey: ["talent-pool-stats"],
    enabled,
    queryFn: fetchTalentStats,
    retry: false,
  });
};
