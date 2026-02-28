import { Activity, BarChart3, Briefcase, FileText, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { StatCard } from "../AdminDashboard";
import { Badge } from "../ui/badge";
import { useDashboardMetrics, useGlobalSkillPerformance } from "../../hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";
import { useDepartmentsPassRate, useRecentAssessments } from "../../hooks/useCandidates";

const DashboardOverviewModule: React.FC = () => {
  const {user} = useAuth()

  const {data : assementData, isLoading : assessmentLoading} = useRecentAssessments(!!user && user.role == "admin")
  const {data : passRates} = useDepartmentsPassRate(!!user && user.role == "admin")
  const {data : metric} = useDashboardMetrics(!!user && user.role == "admin")


  const {data : performaceSkills,isLoading : performanceSkillsLoading} = useGlobalSkillPerformance()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Executive Dashboard</h2>
        <p className="text-slate-500 mt-1">Platform intelligence and real-time performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Candidates" 
          value={metric?.totalCandidates || 0} 
          icon={<Users className="w-5 h-5 text-blue-600" />} 
          description="Registered users"
          trend={`+${metric?.totalCandidatesMoM}% this month`}
          trendUp={true}
        />
        <StatCard 
          title="Assessments Taken" 
          value={metric?.assessmentsTaken || 0} 
          icon={<FileText className="w-5 h-5 text-blue-600" />} 
          description="Total completions"
          trend={`+${metric?.assessmentsPassed}% this month`}
          trendUp={true}
        />
        <StatCard 
          title="Avg. Pass Rate" 
          value={`${metric?.avgPassRate || 0}%`} 
          icon={<Activity className="w-5 h-5 text-emerald-600" />} 
          description="Across all departments"
          trend={`${metric?.passRateMoM}% this month`}
          trendUp={false}
        />
        <StatCard  
          title="Active Jobs" 
          value={metric?.activeJobsCount || 0} 
          icon={<Briefcase className="w-5 h-5 text-purple-600" />} 
          description="Open positions"
          trend="Stable"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Performance Chart */}
        <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <BarChart3 className="w-5 h-5 text-slate-500" /> Department Performance
             </CardTitle>
             <CardDescription>Assessment volume and pass rates by department.</CardDescription>
           </CardHeader>
           <CardContent>
             {passRates?.length === 0 ? (
               <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed rounded-lg">
                 No assessment data available yet.
               </div>
             ) : (
               <div className="space-y-6">
                 {passRates?.map(stat => (
                   <div key={stat.department_name} className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="font-medium text-slate-700">{stat.department_name}</span>
                       <span className="text-slate-500">{stat.total_passed}/{stat.total_people} passed ({stat.percentage || 0}%)</span>
                     </div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full" style={{ width: `${stat.percentage || 0}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="bg-slate-50/50">
           <CardHeader>
             <CardTitle className="text-lg">Recent Assessments</CardTitle>
             <CardDescription>Latest candidate submissions.</CardDescription>
           </CardHeader>
           <CardContent className="px-0">
             <div className="space-y-0 divide-y divide-slate-100">
                {
                  assessmentLoading ? Array.from({ length: 6 }).map((_, i) => (
                    <AssessmentActivitySkeleton key={i} />
                  )) : assementData?.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No recent activity.</div>
                ) : (
                  assementData?.map((activity, i) => (
                    <div key={i} className="p-4 hover:bg-white transition-colors flex items-start gap-3">
                       <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${activity.result == "pass" ? 'bg-emerald-500' : 'bg-red-500'}`} />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{activity?.participant_name}</p>
                          <p className="text-xs text-slate-500 truncate">{activity.job_department}</p>
                       </div>
                       <div className="text-right">
                          <Badge variant={activity.result == "pass" ? 'success' : 'destructive'} className="text-[10px] h-5 px-1.5">
                            {activity?.percentage}%
                          </Badge>
                          <p className="text-[10px] text-slate-400 mt-1">{activity?.submitted_at && new Date(activity?.submitted_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
           </CardContent>
        </Card>
      </div>
      
      {/* Additional Analytics: Skill Gaps (Simulated Visual) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-500" /> Skill Analysis
          </CardTitle>
          <CardDescription>Aggregate performance across core competencies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {
              performanceSkillsLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkillCardSkeleton key={i} />)
              ) : performaceSkills && performaceSkills.length > 0 ? (performaceSkills?.map(skill => {
              const score = Number(skill?.average_percentage?.toFixed(2)); // use actual data
              // Determine color based on score
              let color = "text-emerald-600 bg-emerald-50 border-emerald-100";
              if (score < 75) color = "text-amber-600 bg-amber-50 border-amber-100";

              return (
                <div
                  key={skill.skill_id}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${color}`}
                >
                  <span className="text-2xl font-bold">{score}%</span>
                  <span className="text-xs font-medium uppercase tracking-wide opacity-80 mt-1">
                    {skill.skill_name}
                  </span>
                </div>
              );
              })) : <EmptySkillState />
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverviewModule;

const EmptySkillState = () => (
  <div className="col-span-full flex items-center justify-center h-28 rounded-xl border border-dashed text-sm text-slate-500">
    No skill performance data available yet
  </div>
);


const SkillCardSkeleton = () => (
  <div className="p-4 rounded-xl border bg-slate-100 animate-pulse flex flex-col items-center justify-center text-center">
    <div className="h-7 w-12 bg-slate-300 rounded mb-2" />
    <div className="h-3 w-20 bg-slate-300 rounded" />
  </div>
);


function AssessmentActivitySkeleton() {
  return (
    <div className="p-4 flex items-start gap-3 animate-pulse">
      {/* Status dot */}
      <div className="mt-1 w-2 h-2 rounded-full bg-slate-300 shrink-0" />

      {/* Name + department */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="h-3 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>

      {/* Percentage badge + date */}
      <div className="text-right space-y-1">
        <div className="h-5 w-10 bg-slate-200 rounded-full ml-auto" />
        <div className="h-3 w-16 bg-slate-200 rounded ml-auto" />
      </div>
    </div>
  );
}
