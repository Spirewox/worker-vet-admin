import { Fragment, useState } from "react";
import { X, TrendingUp, Briefcase, ChevronDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { useCandidateSkills, useCandidateAssessmentHistory } from "../../hooks/useCandidates";
import { formatDate } from "../../lib/format";

const tone = (p: number) =>
  p >= 70 ? "text-emerald-600" : p >= 40 ? "text-amber-600" : "text-red-600";
const barTone = (p: number) =>
  p >= 70 ? "bg-emerald-500" : p >= 40 ? "bg-amber-500" : "bg-red-500";

export const CandidatePerformanceDetail = ({
  candidateId,
  name,
  onClose,
}: {
  candidateId: string;
  name: string;
  onClose: () => void;
}) => {
  const { data: skills } = useCandidateSkills(candidateId);
  const { data: history } = useCandidateAssessmentHistory(candidateId);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{name}</h3>
              <p className="text-sm text-slate-500">Performance overview</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Assessments" value={`${skills?.total_assessments ?? 0}`} />
            <Stat label="Pass Rate" value={`${skills?.pass_rate ?? 0}%`} valueClass="text-emerald-600" />
            <Stat label="Avg Score" value={`${skills?.avg_score ?? 0}%`} valueClass="text-blue-600" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Skill Competency Profile
            </h4>
            <div className="space-y-3">
              {skills?.skills?.map((s) => (
                <div key={s.skill_id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.skill_name}</span>
                    <span className="text-slate-500 font-mono">{s.percentage?.toFixed(0) ?? 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.message ? "bg-slate-300" : barTone(s.percentage ?? 0)}`} style={{ width: `${s.percentage ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Assessment History &amp; Breakdown
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Context</th>
                    <th className="px-4 py-2.5">Score</th>
                    <th className="px-4 py-2.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!history?.length ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No history</td></tr>
                  ) : history.map((a, idx) => {
                    const has = !!a.skills?.length;
                    const isOpen = open === idx;
                    return (
                      <Fragment key={idx}>
                        <tr className={`hover:bg-slate-50/50 ${has ? "cursor-pointer" : ""}`} onClick={() => has && setOpen(isOpen ? null : idx)}>
                          <td className="px-4 py-2.5 text-slate-600">{formatDate(a.date)}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-900">{a.department_name}</td>
                          <td className="px-4 py-2.5 text-slate-600">
                            <span className="inline-flex items-center gap-1.5">{a.score} ({a.percentage}%)
                              {has && <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge variant={a.result === "pass" ? "success" : "destructive"}>{a.result === "pass" ? "PASS" : "FAIL"}</Badge>
                          </td>
                        </tr>
                        {isOpen && has && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={4} className="px-4 py-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                {a.skills!.map((sk) => (
                                  <div key={sk.skill_name} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-600">{sk.skill_name}</span>
                                      <span className={`font-semibold ${tone(sk.percentage)}`}>{sk.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${barTone(sk.percentage)}`} style={{ width: `${sk.percentage}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
  <div className="bg-slate-50 rounded-lg p-4 text-center">
    <p className="text-xs text-slate-500 uppercase font-semibold">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${valueClass ?? "text-slate-900"}`}>{value}</p>
  </div>
);
