import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";
import type { IJob } from "../interface/job.interface";

export interface JobRes{ 
  data : IJob[],
  meta : {
    filters: {department: string | null, search: string | null}
    limit: number
    page : number
    total : number
    totalPages : number
  }
}

const fetchJobs = async (params ?: {page ?: number, limit ?: number, search ?: string, department ?: string, job ?: string}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.search) queryParams.append('search', String(params.search));

  if (params?.department) queryParams.append('department', String(params.department));

  if (params?.job) queryParams.append('job', String(params.job));
  const endpoint = `jobs/?${queryParams.toString()}`;
  const response = await axiosGet(endpoint, true);
  return response as JobRes
};

// Custom hook
export const useJobs = (enabled : boolean, params ?: {page ?: number, limit ?: number, search ?: string, department ?: string, job ?: string} ) => {
  return useQuery({
    queryKey: ["jobs",params],
    enabled ,
    queryFn: ()=> fetchJobs(params),
    retry : false,
  });
};