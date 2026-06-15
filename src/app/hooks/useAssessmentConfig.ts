import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export interface AssessmentConfig {
  pass_mark: number; // percentage required to pass
  time_limit: number; // seconds per assessment
  max_attempts: number;
  retake_cooldown_hours: number;
  validity_days: number; // how long a passed certification stays valid
}

const fetchAssessmentConfig = async () => {
  const response = await axiosGet(`settings/assessment-config`, true);
  return response as AssessmentConfig;
};

export const useAssessmentConfig = () => {
  return useQuery({
    queryKey: ["assessment-config"],
    queryFn: fetchAssessmentConfig,
    retry: false,
  });
};
