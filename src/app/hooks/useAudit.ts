import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export interface AuditEntry {
  _id: string;
  actor: string;
  action: string;
  target: string;
  created_at: string;
}

const fetchAuditLog = async () => {
  const response = await axiosGet(`audit-logs`, true);
  if (Array.isArray(response)) return response as AuditEntry[];
  return (response?.data ?? []) as AuditEntry[];
};

export const useAuditLog = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-audit-log"],
    enabled,
    queryFn: fetchAuditLog,
    retry: false,
  });
};
