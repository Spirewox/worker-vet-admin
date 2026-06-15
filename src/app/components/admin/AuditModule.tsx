import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { History } from "lucide-react";
import { useAuditLog } from "../../hooks/useAudit";
import { formatDateTime } from "../../lib/format";

const AuditModule = () => {
  const { data: entries, isLoading } = useAuditLog();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Audit Log</h2>
        <p className="text-slate-500 mt-1">A record of administrative actions across the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" /> Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-slate-50 animate-pulse" />)}
            </div>
          ) : !entries?.length ? (
            <div className="flex items-center justify-center h-40 text-sm text-slate-500">No audit entries yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {entries.map((e) => (
                <div key={e._id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-semibold">{e.actor}</span> {e.action}{" "}
                      <span className="text-slate-600">{e.target}</span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{formatDateTime(e.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditModule;
