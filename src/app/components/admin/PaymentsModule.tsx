import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { NativeSelect } from "../ui/native-select";
import { StatCard } from "../AdminDashboard";
import { Wallet, GraduationCap, Award, Printer, Download, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import { axiosPatch } from "../../lib/api";
import { useRevenueSummary, useTransactions } from "../../hooks/usePayments";
import type { Transaction } from "../../hooks/usePayments";
import { formatNaira, formatDateTime } from "../../lib/format";
import { downloadCsv } from "../../lib/export";

const TYPE_BADGE: Record<Transaction["type"], { label: string; className: string }> = {
  training: { label: "Training", className: "bg-blue-50 text-blue-700" },
  certificate: { label: "Certificate", className: "bg-amber-50 text-amber-700" },
  hardcopy: { label: "Hard copy", className: "bg-slate-100 text-slate-600" },
};

const PaymentsModule = () => {
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const { data: summary } = useRevenueSummary();
  const { data: txns, isLoading, refetch } = useTransactions({ type, status });

  const refund = async (t: Transaction) => {
    if (!confirm(`Refund ${formatNaira(t.amount)} to ${t.candidate_name}?`)) return;
    try {
      await axiosPatch(`payments/transactions/${t._id}/refund`, {}, true);
      toast.success("Transaction refunded");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to refund");
    }
  };

  const exportTxns = () =>
    downloadCsv(
      "transactions",
      (txns ?? []).map((t) => ({
        reference: t.reference,
        candidate: t.candidate_name,
        type: t.type,
        description: t.description,
        amount: t.amount,
        status: t.status,
        date: formatDateTime(t.created_at),
      }))
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments &amp; Revenue</h2>
          <p className="text-slate-500 mt-1">Training, certificate and hard-copy transactions.</p>
        </div>
        <Button variant="outline" onClick={exportTxns}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={formatNaira(summary?.total)} icon={<Wallet className="w-5 h-5 text-emerald-600" />} description="All time" trend={summary?.totalMoM != null ? `+${summary.totalMoM}% MoM` : undefined} trendUp />
        <StatCard title="Training" value={formatNaira(summary?.training)} icon={<GraduationCap className="w-5 h-5 text-blue-600" />} description="Course sales" />
        <StatCard title="Certificates" value={formatNaira(summary?.certificate)} icon={<Award className="w-5 h-5 text-amber-600" />} description="Issued credentials" />
        <StatCard title="Hard copies" value={formatNaira(summary?.hardcopy)} icon={<Printer className="w-5 h-5 text-slate-600" />} description="Shipped certificates" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Transactions</CardTitle>
          <div className="flex gap-2">
            <NativeSelect value={type} onChange={(e) => setType(e.target.value)} className="w-36">
              <option value="">All types</option>
              <option value="training">Training</option>
              <option value="certificate">Certificate</option>
              <option value="hardcopy">Hard copy</option>
            </NativeSelect>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
              <option value="">All statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </NativeSelect>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-slate-50 animate-pulse" />)}
            </div>
          ) : !txns?.length ? (
            <div className="flex items-center justify-center h-40 text-sm text-slate-500">No transactions found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {txns.map((t) => {
                const badge = TYPE_BADGE[t.type];
                return (
                  <div key={t._id} className="flex items-center gap-4 px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{t.candidate_name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.description} · {t.reference}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatNaira(t.amount)}</span>
                    <Badge variant={t.status === "success" ? "success" : t.status === "refunded" ? "outline" : "warning"} className="capitalize">{t.status}</Badge>
                    <span className="text-xs text-slate-400 hidden lg:block w-32 text-right">{formatDateTime(t.created_at)}</span>
                    {t.status === "success" && (
                      <Button size="sm" variant="outline" onClick={() => refund(t)}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Refund
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsModule;
