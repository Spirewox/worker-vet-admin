import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";
import type { Question } from "../interface/question.interface";

export interface QBank{
  "department_id": string,
  "department_name": string,
  "question_count": number
}

const fetchQuestionBank = async () => {
  const response = await axiosGet(`departments/by-questions`, true);
  return response as QBank[];
};

// Custom hook
export const useQuestionBank = () => {
  return useQuery({
    queryKey: ["question-bank",], // cache key
    queryFn: ()=>fetchQuestionBank(),
    retry : false,
  });
};

export interface QuestionsByDepartmentResponse {
  department_id: string;
  total: number;
  questions: Question[];
}

const fetchDepartmentQuestions = async (id : string) => {
  const response = await axiosGet(`questions/department/${id}`, true);
  return response as QuestionsByDepartmentResponse;
};

// Custom hook
export const useDepartmentQuestions = (id : string) => {
  return useQuery({
    queryKey: ["department-questions",], // cache key
    enabled : !!id,
    queryFn: ()=>fetchDepartmentQuestions(id),
    retry : false,
  });
};


