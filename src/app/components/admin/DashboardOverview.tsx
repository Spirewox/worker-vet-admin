import { Activity, Briefcase, FileText, Users, Wallet, GraduationCap, Award, Printer, TrendingUp, BarChart3, PieChart as PieIcon, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { StatCard } from "../AdminDashboard";
import { Badge } from "../ui/badge";
import { useDashboardMetrics, useGlobalSkillPerformance } from "../../hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";
import { useDepartmentsPassRate, useRecentAssessments } from "../../hooks/useCandidates";
import { useRevenueSummary } from "../../hooks/usePayments";
import { useTrends, useFunnel } from "../../hooks/useAnalytics";
import { formatNaira } from "../../lib/format";
import {
  ResponsiveContainer, ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

const REVENUE_COLORS = ["#6366f1", "#f59e0b", "#64748b"];

const DashboardOverviewModule: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = !!user && user.role === "admin";

  const { data: metric } = useDashboardMetrics(isAdmin);
  const { data: revenue } = useRevenueSummary();
  const { data: passRates } = useDepartmentsPassRate(isAdmin);
  const { data: assementData, isLoading: assessmentLoading } = useRecentAssessments(isAdmin);
  const { data: performanceSkills } = useGlobalSkillPerformance();
  const { data: trends } = useTrends(isAdmin);
  const { data: funnel } = useFunnel(isAdmin);

  const revenueData = [
    { name: "Training", value: revenue?.training ?? 0 },
    { name: "Certificates", value: revenue?.certificate ?? 0 },
    { name: "Hard copies", value: revenue?.hardcopy ?? 0 },
  ];
  const radarData = (performanceSkills ?? []).map((s) => ({ skill: s.skill_name, score: Number(s.average_percentage?.toFixed(0) ?? 0) }));
  const barData = (passRates ?? []).map((p) => ({ name: p.department_name, pass: p.percentage ?? 0 }));
  const funnelMax = funnel?.[0]?.count || 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Executive Dashboard</h2>
        <p className="text-slate-500 mt-1">Platform intelligence and real-time performance metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Candidates" value={metric?.totalCandidates ?? 0} icon={<Users className="w-5 h-5 text-blue-600" />} description="Registered users" trend={metric?.totalCandidatesMoM != null ? `+${metric.totalCandidatesMoM}% this month` : undefined} trendUp />
        <StatCard title="Assessments Taken" value={metric?.assessmentsTaken ?? 0} icon={<FileText className="w-5 h-5 text-blue-600" />} description="Total completions" />
        <StatCard title="Avg. Pass Rate" value={`${metric?.avgPassRate ?? 0}%`} icon={<Activity className="w-5 h-5 text-emerald-600" />} description="Across all departments" trend={metric?.passRateMoM != null ? `${metric.passRateMoM}% this month` : undefined} trendUp={(metric?.passRateMoM ?? 0) >= 0} />
        <StatCard title="Active Jobs" value={metric?.activeJobsCount ?? 0} icon={<Briefcase className="w-5 h-5 text-purple-600" />} description="Open positions" />
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={formatNaira(revenue?.total)} icon={<Wallet className="w-5 h-5 text-emerald-600" />} description="All paid actions" trend={revenue?.totalMoM != null ? `+${revenue.totalMoM}% this month` : undefined} trendUp />
        <StatCard title="Training Sales" value={formatNaira(revenue?.training)} icon={<GraduationCap className="w-5 h-5 text-indigo-600" />} description="Course purchases" />
        <StatCard title="Certificate Sales" value={formatNaira(revenue?.certificate)} icon={<Award className="w-5 h-5 text-amber-600" />} description="Issued credentials" />
        <StatCard title="Hard-copy Fees" value={formatNaira(revenue?.hardcopy)} icon={<Printer className="w-5 h-5 text-slate-600" />} description="Shipped certificates" />
      </div>

      {/* Trends + Revenue split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-slate-500" /> Assessment &amp; Pass-rate Trend</CardTitle>
            <CardDescription>Monthly assessments taken and pass rate.</CardDescription>
          </CardHeader>
          <CardContent>
            {!trends?.length ? <ChartEmpty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={trends} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area yAxisId="left" type="monotone" dataKey="assessments" name="Assessments" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.5} />
                  <Line yAxisId="right" type="monotone" dataKey="pass_rate" name="Pass rate %" stroke="#10b981" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieIcon className="w-5 h-5 text-slate-500" /> Revenue Mix</CardTitle>
            <CardDescription>Share by paid action.</CardDescription>
          </CardHeader>
          <CardContent>
            {!revenue?.total ? <ChartEmpty /> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={revenueData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {revenueData.map((_, i) => <Cell key={i} fill={REVENUE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatNaira(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {revenueData.map((r, i) => (
                    <div key={r.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: REVENUE_COLORS[i] }} /> {r.name}</span>
                      <span className="font-semibold text-slate-900">{formatNaira(r.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department bar + Skill radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-500" /> Department Pass Rates</CardTitle>
            <CardDescription>Pass rate by department.</CardDescription>
          </CardHeader>
          <CardContent>
            {!barData.length ? <ChartEmpty /> : (
              <ResponsiveContainer width="100%" height={Math.max(220, barData.length * 48)}>
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="pass" name="Pass rate %" radius={[0, 6, 6, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-slate-500" /> Skill Competency</CardTitle>
            <CardDescription>Aggregate across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {!radarData.length ? <ChartEmpty /> : (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} outerRadius={90}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#cbd5e1" }} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5 text-slate-500" /> Hiring Conversion Funnel</CardTitle>
            <CardDescription>From registration to hire.</CardDescription>
          </CardHeader>
          <CardContent>
            {!funnel?.length ? <ChartEmpty /> : (
              <div className="space-y-3">
                {funnel.map((s, i) => {
                  const pct = Math.round((s.count / funnelMax) * 100);
                  const conv = i === 0 ? 100 : Math.round((s.count / (funnel[i - 1].count || 1)) * 100);
                  return (
                    <div key={s.stage}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{s.stage}</span>
                        <span className="text-slate-500">{s.count.toLocaleString()} {i > 0 && <span className="text-slate-400">· {conv}% of prev</span>}</span>
                      </div>
                      <div className="h-7 w-full bg-slate-100 rounded-md overflow-hidden">
                        <div className="h-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-end pr-2 text-[10px] font-semibold text-white" style={{ width: `${Math.max(pct, 6)}%` }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Assessments</CardTitle>
            <CardDescription>Latest candidate submissions.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y divide-slate-100">
              {assessmentLoading ? Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />) :
                !assementData?.length ? <div className="p-4 text-center text-slate-400 text-sm">No recent activity.</div> :
                  assementData.map((activity, i) => (
                    <div key={i} className="p-4 flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${activity.result === "pass" ? "bg-emerald-500" : "bg-red-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{activity?.participant_name}</p>
                        <p className="text-xs text-slate-500 truncate">{activity.job_department}</p>
                      </div>
                      <Badge variant={activity.result === "pass" ? "success" : "destructive"} className="text-[10px] h-5 px-1.5">{activity?.percentage}%</Badge>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverviewModule;

const ChartEmpty = () => (
  <div className="h-56 flex items-center justify-center text-slate-400 border border-dashed rounded-lg text-sm">No data available yet.</div>
);

function ActivitySkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 animate-pulse">
      <div className="mt-1 w-2 h-2 rounded-full bg-slate-300 shrink-0" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="h-3 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>
      <div className="h-5 w-10 bg-slate-200 rounded-full" />
    </div>
  );
}
