import { useQuery } from "@tanstack/react-query";
import { axiosGet } from "../lib/api";

export interface PricingConfig {
  training_price: number;
  certificate_price: number;
  hardcopy_fee: number;
}

const fetchPricing = async () => {
  const response = await axiosGet(`settings/pricing`, true);
  return response as PricingConfig;
};

export const usePricing = () => {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: fetchPricing,
    retry: false,
  });
};
