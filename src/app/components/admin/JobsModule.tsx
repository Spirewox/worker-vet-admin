import { Edit2, Plus, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {useState} from "react"
import { useJobs } from "../../hooks/useJobs";
import { useAuth } from "../../context/AuthContext";
import type { Department } from "../../interface/settings.interface";
import { useDepartments } from "../../hooks/useSettings";
import type { IJob } from "../../interface/job.interface";
import { Skeleton } from "../ui/skeleton";
import { axiosDelete, axiosPatch, axiosPost } from "../../lib/api";
import { toast } from "react-toastify";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

const JobsModule= () => {
    const {user} = useAuth()
  const [page , setPage] = useState(1)
const limit = 20
  const {data : departmentsData} = useDepartments()
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<IJob>>({});
  const {data : jobsData, isLoading : jobsLoading, refetch : refetchJobs} = useJobs(!!user && user.role == "admin",{page, limit}) 
const totalPages = jobsData?.meta?.totalPages || 1;

  // Function to generate an array of page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const rangeRegex = /^\d*\s?-?\s?\d*$/;

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true)
    try {
        e.preventDefault();
        if (currentJob._id) {
            await axiosPatch(`jobs/${currentJob._id}`, {...currentJob, salary_range : currentJob.salary_range ? formatNairaRange(currentJob.salary_range) : ''}, true)
            toast.success("Job edited successfully")
        } else {
            await axiosPost("jobs",{...currentJob, salary_range : currentJob.salary_range ? formatNairaRange(currentJob.salary_range) : ''},true)
            toast.success("Job posted successfully")
        }
        refetchJobs()
        setIsEditing(false);
        setCurrentJob({});
    } catch (error) {
        console.log(error)
        if(error instanceof Error)
        toast.error(error.message)

        toast.error("Failed to save job posting")
    }finally{
        setIsSubmitting(false)
    }
    
  };

  const handleDelete = async (id: string) => {
    try {
        if (confirm('Are you sure you want to delete this job posting?')) {
          await axiosDelete(`jobs/${id}`,true)
        }
        toast.success("Job deleted successfully")
    } catch (error) {
        if(error instanceof Error) toast.error(error.message)
        toast.error("Failed to delete job")
    }
      
  };

  const formatNairaRange = (range: string) => {
    if (!rangeRegex.test(range)) return;
    const [min, max] = range.split("-").map(v => Number(v.trim()));

    const format = (n: number) =>
        `₦${(n / 1000).toFixed(0)}k`;

    return `${format(min)} - ${format(max)}`;
    };

    const normalizeSalaryInput = (value: string): string => {
        // Split by hyphen
        const parts = value?.split("-").map(part => part.trim());

        const convert = (v: string) => {
        // Remove currency symbols
        v = v.replace(/[₦$,]/g, "").toLowerCase();

        let multiplier = 1;

        if (v.endsWith("k")) {
            multiplier = 1000;
            v = v.slice(0, -1);
        } else if (v.endsWith("m")) {
            multiplier = 1000000;
            v = v.slice(0, -1);
        }

        const num = parseFloat(v);

        if (isNaN(num)) return "";

        return Math.round(num * multiplier).toString();
        };

        // Convert each side
        const normalizedParts = parts?.map(convert)?.filter(Boolean);

        return normalizedParts?.join(" - ");
    };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-slate-900">Job Board Management</h2>
           <p className="text-slate-500 mt-1">Create and manage job listings.</p>
        </div>
        <Button onClick={() => { setCurrentJob({}); setIsEditing(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Post New Job
        </Button>
      </div>

      {isEditing ? (
          <Card className="max-w-3xl mx-auto">
              <CardHeader>
                  <CardTitle>{currentJob._id ? 'Edit Job' : 'Post New Job'}</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label>Job Title</Label>
                              <Input 
                                  value={currentJob.job_title || ''} 
                                  onChange={e => setCurrentJob({...currentJob, job_title: e.target.value})}
                                  required
                              />
                          </div>
                          <div className="space-y-2">
                              <Label>Department</Label>
                              <Select 
                                  value={String(currentJob?.department) || ''}
                                  onValueChange={val => setCurrentJob({...currentJob, department: val})}
                                  required
                              >
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select Department..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {departmentsData?.map(d => <SelectItem key={d._id} value={d._id}>{d.department_name}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                      
                      <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea 
                              value={currentJob.job_description || ''} 
                              onChange={e => setCurrentJob({...currentJob, job_description: e.target.value})}
                              required
                              className="min-h-[100px]"
                          />
                      </div>

                      <div className="space-y-2">
                          <Label>Requirements</Label>
                          <Textarea 
                              value={currentJob.requirements || ''} 
                              onChange={e => setCurrentJob({...currentJob, requirements: e.target.value})}
                              className="min-h-[100px]"
                              placeholder="- Requirement 1&#10;- Requirement 2"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label>Location</Label>
                              <Input 
                                  value={currentJob.location || ''} 
                                  onChange={e => setCurrentJob({...currentJob, location: e.target.value})}
                                  placeholder="e.g. Remote, New York"
                                  required
                              />
                          </div>
                          <div className="space-y-2">
                              <Label>Salary Range</Label>
                              <Input 
                                value={(currentJob.salary_range && !rangeRegex.test(currentJob.salary_range))  ? normalizeSalaryInput(currentJob.salary_range)  : currentJob.salary_range || ''} 
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow only numeric range format while typing
                                    if (!rangeRegex.test(value)) return;

                                    setCurrentJob({
                                    ...currentJob,
                                    salary_range: value
                                    });
                                }}
                                placeholder="e.g. $80k - $100k"
                              />
                          </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
                          <Button type="submit" disabled={isSubmitting}>Save Job Posting</Button>
                      </div>
                  </form>
              </CardContent>
          </Card>
      ) : (
        <div className="grid gap-4">
            {
            jobsLoading ? <JobCardSkeleton/> :
            jobsData?.data?.map(job => (
                <div key={job._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start group hover:border-blue-200 transition-all">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-slate-900">{job.job_title}</h3>
                            <Badge variant={job.is_active ? 'success' : 'secondary'} className="text-[10px]">
                                {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{(job?.department as Department)?.department_name} • {job.location}</p>
                        <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl">{job.job_description}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => { setCurrentJob({...job, department : (job.department as Department)._id}); setIsEditing(true); }}>
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(job._id!)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
            {jobsData?.data?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No jobs posted yet.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mt-6">
                <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    
                    disabled={!!(page === 1)}
                />
                <PaginationContent>
                    {getPageNumbers().map((num) => (
                    <PaginationItem key={num}>
                        <PaginationLink
                        isActive={num === page}
                        onClick={() => setPage(num)}
                        >
                        {num}
                        </PaginationLink>
                    </PaginationItem>
                    ))}
                </PaginationContent>
                <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                />
                </Pagination>
            )}

        </div>
      )}
    </div>
  );
};

export default JobsModule


function JobCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>

        <Skeleton className="h-4 w-64 mb-3" />
        <Skeleton className="h-4 w-full max-w-2xl mb-1" />
        <Skeleton className="h-4 w-5/6 max-w-2xl" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}