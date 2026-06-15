import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";
import type { Department, Skill } from "../interface/settings.interface";

export type ResourceType = "pdf" | "article" | "video" | "link";

export interface TrainingVideoModule {
  _id?: string;
  title: string;
  description: string;
  durationLabel: string;
  videoUrl: string;
}

export interface TrainingResourceItem {
  _id?: string;
  label: string;
  url: string;
  type: ResourceType;
}

export interface TrainingQuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export interface TrainingCourse {
  _id?: string;
  title: string;
  description: string;
  skill?: string | Skill;
  department?: string | Department;
  price?: number;
  passMark?: number;
  is_active?: boolean;
  modules: TrainingVideoModule[];
  resources: TrainingResourceItem[];
  quiz: TrainingQuizQuestion[];
  enrollments?: number;
  completions?: number;
  createdAt?: string;
}

const fetchTrainingCourses = async () => {
  const response = await axiosGet(`training`, true);
  // Tolerate a bare array or a { data } envelope.
  if (Array.isArray(response)) return response as TrainingCourse[];
  return (response?.data ?? []) as TrainingCourse[];
};

export const useTrainingCourses = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-training-courses"],
    enabled,
    queryFn: fetchTrainingCourses,
    retry: false,
  });
};
