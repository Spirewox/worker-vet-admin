import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export type CertificateType = "assessment" | "training";
export type CertificateStatus = "issued" | "revoked";

export interface AdminCertificate {
  _id: string;
  certificate_id: string;
  candidate: { _id: string; full_name: string; email: string };
  type: CertificateType;
  title: string;
  score?: number;
  status: CertificateStatus;
  issued_at: string;
}

export type HardCopyStatus = "pending" | "processing" | "shipped";

export interface HardCopyOrder {
  _id: string;
  certificate_id: string;
  candidate_name: string;
  course_title: string;
  address: string;
  city: string;
  country: string;
  fee: number;
  status: HardCopyStatus;
  tracking?: string;
  requested_at: string;
}

const fetchCertificates = async () => {
  const response = await axiosGet(`certificates`, true);
  if (Array.isArray(response)) return response as AdminCertificate[];
  return (response?.data ?? []) as AdminCertificate[];
};

export const useCertificates = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-certificates"],
    enabled,
    queryFn: fetchCertificates,
    retry: false,
  });
};

const fetchHardCopyOrders = async () => {
  const response = await axiosGet(`certificates/hardcopy-orders`, true);
  if (Array.isArray(response)) return response as HardCopyOrder[];
  return (response?.data ?? []) as HardCopyOrder[];
};

export const useHardCopyOrders = (enabled = true) => {
  return useQuery({
    queryKey: ["admin-hardcopy-orders"],
    enabled,
    queryFn: fetchHardCopyOrders,
    retry: false,
  });
};
