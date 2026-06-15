// Currency / formatting helpers. The platform operates in Nigerian Naira.
export const CURRENCY_SYMBOL = "₦";

export const formatNaira = (amount?: number | null) =>
  `${CURRENCY_SYMBOL}${Number(amount ?? 0).toLocaleString()}`;

export const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
