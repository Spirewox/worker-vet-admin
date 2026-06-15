import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export type PaymentType = "training" | "certificate" | "hardcopy";
export type PaymentStatus = "success" | "pending" | "refunded";

export interface Transaction {
  _id: string;
  reference: string;
  candidate_name: string;
  type: PaymentType;
  description: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface RevenueSummary {
  total: number;
  training: number;
  certificate: number;
  hardcopy: number;
  transactions: number;
  totalMoM?: number;
}

const fetchTransactions = async (params?: { type?: string; status?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);
  const response = await axiosGet(`payments/transactions?${queryParams.toString()}`, true);
  if (Array.isArray(response)) return response as Transaction[];
  return (response?.data ?? []) as Transaction[];
};

export const useTransactions = (params?: { type?: string; status?: string }) => {
  return useQuery({
    queryKey: ["admin-transactions", params],
    queryFn: () => fetchTransactions(params),
    retry: false,
  });
};

const fetchRevenueSummary = async () => {
  const response = await axiosGet(`payments/summary`, true);
  return response as RevenueSummary;
};

export const useRevenueSummary = () => {
  return useQuery({
    queryKey: ["admin-revenue-summary"],
    queryFn: fetchRevenueSummary,
    retry: false,
  });
};
