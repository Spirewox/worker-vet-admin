import { useEffect, useState } from "react";
import {
  Search, Star, Trophy, Briefcase, Mail, FileText, Download, Award,
  Users, Sparkles, Medal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { NativeSelect } from "../ui/native-select";
import { StatCard } from "../AdminDashboard";
import { toast } from "react-toastify";
import { axiosDelete, axiosPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useDepartments, useSkills } from "../../hooks/useSettings";
import { useJobs } from "../../hooks/useJobs";
import { useTalentPool, useTalentStats } from "../../hooks/useTalentPool";
import type { Talent, TalentPoolParams } from "../../hooks/useTalentPool";
import type { Department } from "../../interface/settings.interface";
import type { IJob } from "../../interface/job.interface";
import { CandidatePerformanceDetail } from "./CandidatePerformanceDetail";
import { formatDate } from "../../lib/format";
import { downloadCsv } from "../../lib/export";

const deptId = (d?: string | Department) => (typeof d === "string" ? d : d?._id);
const deptName = (d?: string | Department) => (typeof d === "string" ? d : d?.department_name);

type View = "pool" | "leaderboard" | "match";

const TalentPool = () => {
  const { user } = useAuth();
  const enabled = !!user && user.role === "admin";

  const [view, setView] = useState<View>("pool");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [department, setDepartment] = useState("");
  const [skill, setSkill] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<NonNullable<TalentPoolParams["sort"]>>("avg_score");
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [jobId, setJobId] = useState("");
  const [detail, setDetail] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(h);
  }, [search]);

  const { data: departments } = useDepartments();
  const { data: skills } = useSkills();
  const { data: jobs } = useJobs(enabled, { page: 1, limit: 100 });
  const { data: stats } = useTalentStats(enabled);

  const selectedJob = jobs?.data?.find((j) => j._id === jobId) as IJob | undefined;
  const matchDept = selectedJob ? deptId(selectedJob.department) : undefined;

  const params: TalentPoolParams =
    view === "leaderboard"
      ? { sort: "avg_score", limit: 50 }
      : view === "match"
        ? { department: matchDept, sort: "avg_score", limit: 50 }
        : { search: debounced, department, skill, min_score: minScore || undefined, sort, shortlisted: shortlistedOnly, limit: 24 };

  const poolEnabled = enabled && (view !== "match" || !!matchDept);
  const { data: pool, refetch } = useTalentPool(poolEnabled, params);
  const talents = pool?.data ?? [];

  const toggleShortlist = async (t: Talent) => {
    try {
      if (t.shortlisted) await axiosDelete(`talent-pool/${t._id}/shortlist`, true);
      else await axiosPost(`talent-pool/${t._id}/shortlist`, {}, true);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update shortlist");
    }
  };

  const invite = (t: Talent) => {
    const subject = encodeURIComponent("Opportunity at Workervet");
    const body = encodeURIComponent(`Dear ${t.full_name},\n\nYour verified performance on Workervet stood out. We'd like to discuss an opportunity with you.\n\nBest regards,\nThe Hiring Team`);
    window.location.href = `mailto:${t.email}?subject=${subject}&body=${body}`;
  };

  const exportPool = () =>
    downloadCsv(
      "talent-pool",
      talents.map((t) => ({
        name: t.full_name, email: t.email, phone: t.phone ?? "",
        certified_in: t.certified_departments.map((d) => d.department_name).join("; "),
        avg_score: t.avg_score, pass_rate: t.pass_rate, assessments: t.assessments_taken,
        last_active: formatDate(t.last_active),
      }))
    );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Verified Talent" value={stats?.total ?? 0} icon={<Users className="w-5 h-5 text-blue-600" />} description="Passed candidates" />
        <StatCard title="Certifications" value={stats?.certified ?? 0} icon={<Award className="w-5 h-5 text-amber-600" />} description="Total earned" />
        <StatCard title="Avg Score" value={`${stats?.avg_score ?? 0}%`} icon={<Sparkles className="w-5 h-5 text-emerald-600" />} description="Across the pool" />
        <StatCard title="Top Department" value={stats?.top_department ?? "—"} icon={<Trophy className="w-5 h-5 text-purple-600" />} description="Most certified" />
      </div>

      {/* View tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <ViewTab active={view === "pool"} onClick={() => setView("pool")} icon={<Users className="w-4 h-4" />} label="Pool" />
        <ViewTab active={view === "leaderboard"} onClick={() => setView("leaderboard")} icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
        <ViewTab active={view === "match"} onClick={() => setView("match")} icon={<Briefcase className="w-4 h-4" />} label="Job Match" />
      </div>

      {view === "pool" && (
        <>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search talent..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <NativeSelect value={department} onChange={(e) => setDepartment(e.target.value)} className="lg:w-44">
              <option value="">All departments</option>
              {departments?.map((d) => <option key={d._id} value={d._id}>{d.department_name}</option>)}
            </NativeSelect>
            <NativeSelect value={skill} onChange={(e) => setSkill(e.target.value)} className="lg:w-40">
              <option value="">All skills</option>
              {skills?.map((s) => <option key={s._id} value={s.skill_name}>{s.skill_name}</option>)}
            </NativeSelect>
            <NativeSelect value={String(minScore)} onChange={(e) => setMinScore(Number(e.target.value))} className="lg:w-32">
              <option value="0">Any score</option>
              <option value="50">50%+</option>
              <option value="70">70%+</option>
              <option value="80">80%+</option>
            </NativeSelect>
            <NativeSelect value={sort} onChange={(e) => setSort(e.target.value as TalentPoolParams["sort"] as NonNullable<TalentPoolParams["sort"]>)} className="lg:w-40">
              <option value="avg_score">Top score</option>
              <option value="pass_rate">Pass rate</option>
              <option value="recent">Most recent</option>
            </NativeSelect>
            <Button variant={shortlistedOnly ? "default" : "outline"} onClick={() => setShortlistedOnly((v) => !v)}>
              <Star className={`w-4 h-4 mr-1.5 ${shortlistedOnly ? "fill-current" : ""}`} /> Shortlisted
            </Button>
            <Button variant="outline" onClick={exportPool}><Download className="w-4 h-4 mr-1.5" /> Export</Button>
          </div>

          {!talents.length ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {talents.map((t) => (
                <TalentCard key={t._id} talent={t} onView={() => setDetail({ id: t._id, name: t.full_name })} onStar={() => toggleShortlist(t)} onInvite={() => invite(t)} />
              ))}
            </div>
          )}
        </>
      )}

      {view === "leaderboard" && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Top performers</CardTitle></CardHeader>
          <CardContent className="p-0">
            {!talents.length ? <Empty /> : (
              <div className="divide-y divide-slate-100">
                {talents.map((t, i) => (
                  <div key={t._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 cursor-pointer" onClick={() => setDetail({ id: t._id, name: t.full_name })}>
                    <RankBadge rank={i + 1} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{t.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.certified_departments.map((d) => d.department_name).join(", ") || "—"}</p>
                    </div>
                    <span className="text-xs text-slate-400 hidden sm:block">{t.pass_rate}% pass</span>
                    <span className="text-lg font-black text-slate-900">{t.avg_score}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {view === "match" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-slate-600">Find verified talent for an open role:</p>
            <NativeSelect value={jobId} onChange={(e) => setJobId(e.target.value)} className="sm:w-72">
              <option value="">Select a job...</option>
              {jobs?.data?.map((j) => <option key={j._id} value={j._id}>{j.job_title} · {deptName(j.department)}</option>)}
            </NativeSelect>
          </div>
          {!jobId ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl text-slate-500">
              <Briefcase className="w-8 h-8 text-slate-300 mb-2" /> Pick a job to see matching talent.
            </div>
          ) : !talents.length ? (
            <div className="flex items-center justify-center h-40 text-sm text-slate-500">No certified talent matches this role yet.</div>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{talents.length}</span> talents certified in{" "}
                <span className="font-semibold text-slate-700">{deptName(selectedJob?.department)}</span>, ranked by score.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {talents.map((t) => (
                  <TalentCard key={t._id} talent={t} matchDept={matchDept} onView={() => setDetail({ id: t._id, name: t.full_name })} onStar={() => toggleShortlist(t)} onInvite={() => invite(t)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {detail && <CandidatePerformanceDetail candidateId={detail.id} name={detail.name} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default TalentPool;

const TalentCard = ({ talent: t, matchDept, onView, onStar, onInvite }: {
  talent: Talent; matchDept?: string; onView: () => void; onStar: () => void; onInvite: () => void;
}) => {
  const matchCert = matchDept ? t.certified_departments.find((d) => d.department_id === matchDept) : undefined;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            {t.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{t.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{t.email}</p>
          </div>
        </div>
        <button onClick={onStar} title="Shortlist" className={t.shortlisted ? "text-amber-500" : "text-slate-300 hover:text-amber-400"}>
          <Star className={`w-5 h-5 ${t.shortlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {t.certified_departments.map((d) => (
          <Badge key={d.department_name} variant={matchCert && d.department_id === matchDept ? "default" : "success"} className="gap-1">
            <Award className="w-3 h-3" /> {d.department_name} · {d.score}%
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span>Avg <span className="font-bold text-slate-900">{t.avg_score}%</span></span>
        <span>Pass <span className="font-bold text-slate-900">{t.pass_rate}%</span></span>
        <span>{t.assessments_taken} assessments</span>
      </div>

      {!!t.top_skills?.length && (
        <div className="flex flex-wrap gap-1 mt-2">
          {t.top_skills.slice(0, 3).map((s) => (
            <span key={s.skill_name} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s.skill_name} {s.percentage}%</span>
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <Button size="sm" variant="outline" className="flex-1" onClick={onView}>View</Button>
        {t.cv?.url && (
          <a href={t.cv.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2.5 text-slate-500 hover:text-slate-900" title="View CV">
            <FileText className="w-4 h-4" />
          </a>
        )}
        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onInvite}><Mail className="w-3.5 h-3.5 mr-1.5" /> Invite</Button>
      </div>
    </div>
  );
};

const ViewTab = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
    {icon} {label}
  </button>
);

const RankBadge = ({ rank }: { rank: number }) => {
  const colors = ["bg-amber-100 text-amber-700", "bg-slate-200 text-slate-600", "bg-orange-100 text-orange-700"];
  const cls = rank <= 3 ? colors[rank - 1] : "bg-slate-50 text-slate-500";
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${cls}`}>
      {rank <= 3 ? <Medal className="w-4 h-4" /> : rank}
    </div>
  );
};

const Empty = () => (
  <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl text-slate-500">
    <Users className="w-8 h-8 text-slate-300 mb-2" /> No talent matches your filters.
  </div>
);
