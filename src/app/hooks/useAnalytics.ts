import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export interface TrendPoint {
  month: string;
  assessments: number;
  passed: number;
  pass_rate: number;
  revenue: number;
}

const fetchTrends = async () => {
  const response = await axiosGet(`analytics/trends`, true);
  if (Array.isArray(response)) return response as TrendPoint[];
  return (response?.data ?? []) as TrendPoint[];
};

export const useTrends = (enabled: boolean) => {
  return useQuery({
    queryKey: ["analytics-trends"],
    enabled,
    queryFn: fetchTrends,
    retry: false,
  });
};

export interface FunnelStage {
  stage: string;
  count: number;
}

const fetchFunnel = async () => {
  const response = await axiosGet(`analytics/funnel`, true);
  if (Array.isArray(response)) return response as FunnelStage[];
  return (response?.data ?? []) as FunnelStage[];
};

export const useFunnel = (enabled: boolean) => {
  return useQuery({
    queryKey: ["analytics-funnel"],
    enabled,
    queryFn: fetchFunnel,
    retry: false,
  });
};
