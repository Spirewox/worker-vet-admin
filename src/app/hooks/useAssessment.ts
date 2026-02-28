import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export interface CandidateAssessment {
    assessment_id: string,
    department_id: string,
    department_name: string,
    expires_at: Date | null,
    total_questions: number,
    questions: {
      index : number,
      question_id: string,
      question_text: string,
      options: string,
      skill : string,
      scenario : string
    }[],
}

const fetchCandidateAssessment = async (id : string) => {
  const response = await axiosGet(`assessment/${id}`, true);
  return response as CandidateAssessment;
};


export const useCandidateAssessment= (id : string) => {
  return useQuery({
    queryKey: ["candidate-assessment"],
    enabled : !!id,
    queryFn: ()=>fetchCandidateAssessment(id),
    retry : false,
  });
};