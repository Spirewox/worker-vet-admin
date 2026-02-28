import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";
import type { Department, Skill } from "../interface/settings.interface";

const fetchSkills = async () => {
  const response = await axiosGet(`skills`, true);
  return response as Skill[];
};

// Custom hook
export const useSkills = () => {
  return useQuery({
    queryKey: ["skill"], // cache key
    queryFn: ()=>fetchSkills(),
    retry : false,
  });
};


const fetchDepartments = async () => {
  const response = await axiosGet(`departments`, true);
  return response as Department[];
};

// Custom hook
export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"], // cache key
    queryFn: ()=>fetchDepartments(),
    retry : false,
  });
};