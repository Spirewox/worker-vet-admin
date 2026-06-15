import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Award, Printer, Download, Search, Truck, Ban } from "lucide-react";
import { toast } from "react-toastify";
import { axiosPatch } from "../../lib/api";
import { useCertificates, useHardCopyOrders } from "../../hooks/useCertificates";
import type { AdminCertificate, HardCopyOrder } from "../../hooks/useCertificates";
import { formatNaira, formatDate } from "../../lib/format";
import { downloadCsv } from "../../lib/export";

type Tab = "issued" | "hardcopy";

const CertificatesModule = () => {
  const [tab, setTab] = useState<Tab>("issued");
  const [search, setSearch] = useState("");
  const { data: certs, isLoading: certsLoading, refetch: refetchCerts } = useCertificates();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useHardCopyOrders();

  const filteredCerts = (certs ?? []).filter(
    (c) =>
      c.candidate.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.certificate_id.toLowerCase().includes(search.toLowerCase())
  );

  const pendingOrders = (orders ?? []).filter((o) => o.status !== "shipped").length;

  const revoke = async (c: AdminCertificate) => {
    if (!confirm(`Revoke certificate ${c.certificate_id}?`)) return;
    try {
      await axiosPatch(`certificates/${c._id}/revoke`, {}, true);
      toast.success("Certificate revoked");
      refetchCerts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke");
    }
  };

  const ship = async (o: HardCopyOrder) => {
    const tracking = prompt("Enter tracking number to mark as shipped:");
    if (!tracking) return;
    try {
      await axiosPatch(`certificates/hardcopy/${o._id}/ship`, { tracking }, true);
      toast.success("Order marked as shipped");
      refetchOrders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update order");
    }
  };

  const exportCerts = () =>
    downloadCsv(
      "certificates",
      filteredCerts.map((c) => ({
        certificate_id: c.certificate_id,
        candidate: c.candidate.full_name,
        email: c.candidate.email,
        type: c.type,
        title: c.title,
        score: c.score ?? "",
        status: c.status,
        issued_at: formatDate(c.issued_at),
      }))
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Certificates</h2>
          <p className="text-slate-500 mt-1">Issued credentials and hard-copy fulfillment.</p>
        </div>
        {tab === "issued" && (
          <Button variant="outline" onClick={exportCerts}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <TabButton active={tab === "issued"} onClick={() => setTab("issued")} icon={<Award className="w-4 h-4" />} label={`Issued (${certs?.length ?? 0})`} />
        <TabButton active={tab === "hardcopy"} onClick={() => setTab("hardcopy")} icon={<Printer className="w-4 h-4" />} label={`Hard-copy queue${pendingOrders ? ` (${pendingOrders})` : ""}`} />
      </div>

      {tab === "issued" ? (
        <Card>
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search certificates..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {certsLoading ? (
              <ListSkeleton />
            ) : !filteredCerts.length ? (
              <Empty text="No certificates found." />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCerts.map((c) => (
                  <div key={c._id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{c.candidate.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{c.title} · {c.certificate_id}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{c.type}</Badge>
                    {c.score != null && <span className="text-sm font-semibold text-slate-700">{c.score}%</span>}
                    <span className="text-xs text-slate-400 hidden md:block">{formatDate(c.issued_at)}</span>
                    {c.status === "revoked" ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => revoke(c)}>
                        <Ban className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hard-copy orders</CardTitle>
            <CardDescription>Printed certificate requests awaiting fulfillment.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <ListSkeleton />
            ) : !orders?.length ? (
              <Empty text="No hard-copy orders." />
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <div key={o._id} className="flex items-center gap-4 px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{o.candidate_name}</p>
                      <p className="text-xs text-slate-500 truncate">{o.course_title}</p>
                      <p className="text-xs text-slate-400 truncate">{o.address}, {o.city}, {o.country}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{formatNaira(o.fee)}</span>
                    {o.status === "shipped" ? (
                      <div className="text-right">
                        <Badge variant="success">Shipped</Badge>
                        {o.tracking && <p className="text-[10px] text-slate-400 mt-1">{o.tracking}</p>}
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => ship(o)}>
                        <Truck className="w-3.5 h-3.5 mr-1.5" /> Mark shipped
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificatesModule;

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
      active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
    }`}
  >
    {icon} {label}
  </button>
);

const Empty = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center h-40 text-sm text-slate-500">{text}</div>
);

const ListSkeleton = () => (
  <div className="divide-y divide-slate-100">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-16 bg-slate-50 animate-pulse" />
    ))}
  </div>
);
