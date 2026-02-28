import {useEffect, useState} from "react"
import { Input } from "../ui/input";
import { BarChart, Briefcase, Calendar, Mail, Search, Send, TrendingUp, Users, X } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useCandidateAssessmentHistory, useCandidates, useCandidateSkills } from "../../hooks/useCandidates";
import type { CandidateAct } from "../../hooks/useCandidates";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import type { Department } from "../../interface/settings.interface";

const UserManagementModule: React.FC = () => {
  const {user} = useAuth()
  const [filter, setFilter] = useState<'all' | 'success'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const limit = 20
  const [selectedUser, setSelectedUser] = useState<CandidateAct >({} as CandidateAct);
  const {data : usersData} = useCandidates({
    enabled : !!user && user.role == "admin",
    search : debouncedSearch,
    page,
    limit
  })
  const { data : candidateSkills, isLoading : candidateSkillsLoading, } = useCandidateSkills(selectedUser?._id)

  const { data : assessmentHistory, isLoading : assessmentHistoryLoading, } = useCandidateAssessmentHistory(selectedUser?._id)
  useEffect(() => {
    const handler = setTimeout(() =>{
      setDebouncedSearch(search)
      setPage(1)
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);


  // Helper to calculate Skill stats for a user



  const handleInvite = () => {
    if (!selectedUser) return;
    const subject = encodeURIComponent("Interview Invitation - Workervet");
    const body = encodeURIComponent(`Dear ${selectedUser.full_name},\n\nWe were impressed with your recent assessment results on Workervet. We would like to invite you for an interview to discuss potential opportunities.\n\nPlease let us know your availability for the coming week.\n\nBest regards,\nThe Hiring Team`);
    window.location.href = `mailto:${selectedUser.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Management</h2>
           <p className="text-slate-500 mt-1">Monitor candidate registrations, assessment history, and certifications.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input 
                placeholder="Search candidates..." 
                className="pl-9 w-full sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <div className="flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
             <button 
               onClick={() => setFilter('all')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
             >
               All
             </button>
             <button 
               onClick={() => setFilter('success')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'success' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}
             >
               Certified
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {usersData?.data?.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No candidates found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          usersData?.data?.map((user, idx) => (
            <Card key={idx} className="flex flex-col h-full hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg ring-4 ring-white shadow-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                         {user.full_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                         <h3 className="font-bold text-base text-slate-900 leading-tight">{user.full_name}</h3>
                         <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                           <Mail className="w-3 h-3" /> {user.email}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm border border-slate-100">
                      {user.target_department && (
                        <div className="flex items-center justify-between">
                           <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Target</span>
                           <span className="font-medium text-slate-700 text-right">{(user.target_department as Department).department_name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                         <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Phone</span>
                         <span className="font-medium text-slate-700">{user.phone || 'N/A'}</span>
                      </div>
                      {user.cv.filename && (
                         <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">CV</span>
                            <Link to={user.cv.url} target="_blank" className="font-medium text-blue-600 truncate max-w-[120px]" title={user.cv.filename}>{user.cv.filename}</Link>
                         </div>
                      )}
                   </div>
                </div>
                
                <Button 
                    variant="outline" 
                    className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                    onClick={() => setSelectedUser(()=> user)}
                >
                    <BarChart className="w-4 h-4 mr-2" /> View Performance
                </Button>
              </div>

              <div className="mt-auto bg-slate-50/50 border-t border-slate-100 p-4">
                 <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Briefcase className="w-3 h-3" /> Recent Activity
                 </h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {user?.recent_activity ? ( <div className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                           <div className="min-w-0 flex-1 mr-2">
                              <div className="font-medium text-xs text-slate-900 truncate" title={user?.recent_activity.department_name}>
                                 {user?.recent_activity.department_name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                 <Calendar className="w-3 h-3" /> {new Date(user?.recent_activity.submitted_at).toLocaleDateString()}
                              </div>
                           </div>
                           <Badge variant={user?.recent_activity?.result == "pass" ? "success" : "destructive"} className="h-5 px-1.5 text-[9px] uppercase">
                             {user?.recent_activity?.result == "pass" ? "Pass" : "Fail"}
                           </Badge>
                        </div>) : (
                      <div className="text-center py-2 text-sm text-slate-400 italic bg-white rounded border border-dashed border-slate-200">
                        No assessments taken
                      </div>
                    )}
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Performance Modal */}
      {(selectedUser?._id && !assessmentHistoryLoading && !candidateSkillsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedUser(() => ({} as CandidateAct))}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            {selectedUser.full_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{selectedUser.full_name}</h3>
                            <p className="text-sm text-slate-500">{(selectedUser.target_department as Department).department_name || "No Dept"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleInvite} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Send className="w-4 h-4 mr-2" /> Invite to Interview
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedUser(() => ({} as CandidateAct))}>
                          <X className="w-5 h-5 text-slate-400 hover:text-slate-900" />
                      </Button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Total Assessments</p>
                          <p className="text-2xl font-bold text-slate-900 mt-1">{candidateSkills?.total_assessments || 0}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Pass Rate</p>
                          <p className="text-2xl font-bold text-emerald-600 mt-1">{candidateSkills?.pass_rate || 0}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase font-semibold">Avg. Score</p>
                          <p className="text-2xl font-bold text-blue-600 mt-1">{candidateSkills?.avg_score || 0}%</p>
                      </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Skill Competency Profile
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {
                            candidateSkillsLoading  ? Array.from({ length: 5 }).map((_, idx) => <SkillStatSkeleton key={idx} />) :
                            candidateSkills?.skills?.map((stat) => (
                                <div key={stat.skill_id} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{stat.skill_name}</span>
                                        <span className="text-slate-500 font-mono">{stat?.percentage?.toFixed(2) || 0}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                stat.percentage! >= 80 ? 'bg-emerald-500' : 
                                                stat.percentage! >= 60 ? 'bg-blue-500' : 
                                                stat?.message ? 'bg-slate-300' : 'bg-amber-500'
                                            }`} 
                                            style={{ width: `${stat?.percentage || 0}%` }}
                                        />
                                    </div>
                                    {stat?.message && <p className="text-[10px] text-slate-400">Not yet tested</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* History Table */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Assessment History
                        </h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Context</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3 text-right">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {
                                    assessmentHistoryLoading ?  Array.from({ length: 5 }).map((_, idx) => <AssessmentRowSkeleton key={idx} />) :
                                    assessmentHistory?.length === 0 ? (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No history available</td></tr>
                                    ) : (
                                        assessmentHistory?.map((a,idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    {a.department_name}
                                                    {a.job_name && <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Job App</span>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{a.score} ({a.percentage}%)</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Badge variant={a.result == "pass" ? "success" : "destructive"}>
                                                        {a.result == "pass"  ? "PASS" : "FAIL"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};


export default UserManagementModule


function AssessmentRowSkeleton() {
  return (
    <tr className="animate-pulse hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-3 text-right">
        <Skeleton className="h-5 w-12 rounded-full" />
      </td>
    </tr>
  );
}


function SkillStatSkeleton() {
  return (
    <div className="space-y-1.5 animate-pulse">
      {/* Name and percentage row */}
      <div className="flex justify-between text-sm">
        <div className="h-3 w-24 bg-slate-200 rounded"></div>
        <div className="h-3 w-10 bg-slate-200 rounded"></div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full w-3/4 bg-slate-300 rounded-full"></div>
      </div>

      {/* Optional message */}
      <div className="h-3 w-16 bg-slate-200 rounded text-[10px]"></div>
    </div>
  );
}