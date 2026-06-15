import { AlertTriangle, Briefcase, CheckCircle2, Copy, Edit2, Mail, MapPin, Plus, Search, Send, Star, Trash2, Users, Wallet, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { NativeSelect } from "../ui/native-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react"
import { useJobApplicants, useJobs, useJobStats } from "../../hooks/useJobs";
import type { ApplicationStatus } from "../../hooks/useJobs";
import { StatCard } from "../AdminDashboard";
import { useAuth } from "../../context/AuthContext";
import type { Department } from "../../interface/settings.interface";
import { useDepartments } from "../../hooks/useSettings";
import type { IJob } from "../../interface/job.interface";
import { Skeleton } from "../ui/skeleton";
import { axiosDelete, axiosPatch, axiosPost } from "../../lib/api";
import { toast } from "react-toastify";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

const JobsModule = () => {
    const frontendJobsBaseUrl = "https://worker-vet.fudfarmerintelligence.com/jobs";
    const { user } = useAuth()
    const [page, setPage] = useState(1)
    const limit = 20
    const applicantLimit = 10
    const { data: departmentsData } = useDepartments()
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentJob, setCurrentJob] = useState<Partial<IJob>>({});
    const [selectedApplicantsJob, setSelectedApplicantsJob] = useState<IJob | null>(null);
    const [applicantsPage, setApplicantsPage] = useState(1);
    const [jobToDelete, setJobToDelete] = useState<IJob | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        const h = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(h);
    }, [search]);
    useEffect(() => { setPage(1); }, [debouncedSearch, departmentFilter]);

    const hasFilters = !!debouncedSearch || !!departmentFilter || statusFilter !== 'all';
    const clearFilters = () => { setSearch(''); setDebouncedSearch(''); setDepartmentFilter(''); setStatusFilter('all'); };

    const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useJobs(!!user && user.role == "admin", { page, limit, search: debouncedSearch || undefined, department: departmentFilter || undefined })
    const { data: jobStats } = useJobStats(!!user && user.role == "admin")

    const visibleJobs = (jobsData?.data ?? []).filter(j =>
        statusFilter === 'all' ? true : statusFilter === 'active' ? j.is_active : !j.is_active
    );
    const { data: applicantsData, isLoading: applicantsLoading, refetch: refetchApplicants } = useJobApplicants(
        !!selectedApplicantsJob?._id,
        selectedApplicantsJob?._id,
        { page: applicantsPage, limit: applicantLimit },
    )

    const PIPELINE_STATUSES: ApplicationStatus[] = ["applied", "under_review", "shortlisted", "hired", "rejected"];
    const handleUpdateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
        try {
            await axiosPatch(`jobs/applications/${applicationId}/status`, { status }, true);
            toast.success("Applicant status updated");
            refetchApplicants();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        }
    };
    const totalPages = jobsData?.meta?.totalPages || 1;
    const applicantsTotalPages = applicantsData?.meta?.totalPages || 1;

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    const getApplicantPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= applicantsTotalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    useEffect(() => {
        setApplicantsPage(1)
    }, [selectedApplicantsJob?._id])

    const rangeRegex = /^\d*\s?-?\s?\d*$/;

    const handleSubmit = async (e: React.FormEvent) => {
        setIsSubmitting(true)
        try {
            e.preventDefault();
            if (currentJob._id) {
                await axiosPatch(`jobs/${currentJob._id}`, { ...currentJob, salary_range: currentJob.salary_range ? formatNairaRange(currentJob.salary_range) : '' }, true)
                toast.success("Job edited successfully")
            } else {
                await axiosPost("jobs", { ...currentJob, salary_range: currentJob.salary_range ? formatNairaRange(currentJob.salary_range) : '' }, true)
                toast.success("Job posted successfully")
            }
            refetchJobs()
            setIsEditing(false);
            setCurrentJob({});
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save job posting")
        } finally {
            setIsSubmitting(false)
        }

    };

    const confirmDelete = async () => {
        if (!jobToDelete?._id) return;
        try {
            setIsDeleting(true)
            await axiosDelete(`jobs/${jobToDelete._id}`, true)
            toast.success("Job deleted successfully")
            setJobToDelete(null)
            refetchJobs()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete job")
        } finally {
            setIsDeleting(false)
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

    const handleToggleActive = async (job: IJob) => {
        try {
            await axiosPatch(`jobs/${job._id}`, { is_active: !job.is_active }, true);
            toast.success(`Job ${job.job_title} is now ${!job.is_active ? 'ACTIVE' : 'INACTIVE'}`);
            refetchJobs();
        } catch (error) {
            console.log(error);
            if (error instanceof Error) toast.error(error.message);
            toast.error('Failed to update job status');
        }
    };

    const handleCopyFrontendUrl = async (job: IJob) => {
        if (!job._id) {
            toast.error("Unable to copy URL for this job");
            return;
        }

        const jobUrl = `${frontendJobsBaseUrl}/${job._id}`;

        try {
            await navigator.clipboard.writeText(jobUrl);
            toast.success("Frontend job URL copied");
        } catch (error) {
            console.log(error);
            toast.error("Failed to copy frontend job URL");
        }
    };

    const handleInviteApplicant = (candidate: { full_name: string; email: string }, jobTitle: string) => {
        const subject = encodeURIComponent(`Interview Invitation - ${jobTitle}`);
        const body = encodeURIComponent(`Dear ${candidate.full_name},\n\nThank you for applying for the ${jobTitle} role on Workervet. We would like to invite you for an interview to discuss your application further.\n\nPlease let us know your availability for the coming week.\n\nBest regards,\nThe Hiring Team`);
        window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Job Title</Label>
                                    <Input
                                        value={currentJob.job_title || ''}
                                        onChange={e => setCurrentJob({ ...currentJob, job_title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select
                                        value={String(currentJob?.department) || ''}
                                        onValueChange={val => setCurrentJob({ ...currentJob, department: val })}
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
                                    onChange={e => setCurrentJob({ ...currentJob, job_description: e.target.value })}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Requirements</Label>
                                <Textarea
                                    value={currentJob.requirements || ''}
                                    onChange={e => setCurrentJob({ ...currentJob, requirements: e.target.value })}
                                    className="min-h-[100px]"
                                    placeholder="- Requirement 1&#10;- Requirement 2"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                        value={currentJob.location || ''}
                                        onChange={e => setCurrentJob({ ...currentJob, location: e.target.value })}
                                        placeholder="e.g. Remote, New York"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Salary Range</Label>
                                    <Input
                                        value={(currentJob.salary_range && !rangeRegex.test(currentJob.salary_range)) ? normalizeSalaryInput(currentJob.salary_range) : currentJob.salary_range || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Allow only numeric range format while typing
                                            if (!rangeRegex.test(value)) return;

                                            setCurrentJob({
                                                ...currentJob,
                                                salary_range: value
                                            });
                                        }}
                                        placeholder="e.g. 80000 - 120000 (₦)"
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
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Jobs" value={jobStats?.total ?? 0} icon={<Briefcase className="w-5 h-5 text-blue-600" />} description="All postings" />
                    <StatCard title="Active" value={jobStats?.active ?? 0} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} description="Open positions" />
                    <StatCard title="Inactive" value={jobStats?.inactive ?? 0} icon={<X className="w-5 h-5 text-slate-500" />} description="Closed / hidden" />
                    <StatCard title="Applicants" value={jobStats?.total_applicants ?? 0} icon={<Users className="w-5 h-5 text-indigo-600" />} description="Across all jobs" />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input className="pl-9" placeholder="Search jobs by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <NativeSelect value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="lg:w-52">
                        <option value="">All departments</option>
                        {departmentsData?.map((d) => <option key={d._id} value={d._id}>{d.department_name}</option>)}
                    </NativeSelect>
                    <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')} className="lg:w-40">
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </NativeSelect>
                    {hasFilters && <Button variant="outline" onClick={clearFilters}><X className="w-4 h-4 mr-1" /> Clear</Button>}
                </div>

                <div className="grid gap-4">
                    {
                        jobsLoading ? <JobCardSkeleton /> :
                            visibleJobs.map(job => (
                                <div key={job._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start group hover:border-blue-200 transition-all gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-slate-900">{job.job_title}</h3>
                                            <Badge variant={job.is_active ? 'success' : 'secondary'} className="text-[10px]">
                                                {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3 flex items-center flex-wrap gap-x-3 gap-y-1">
                                            <span>{(job?.department as Department)?.department_name}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                                            {job.salary_range && <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> {job.salary_range}</span>}
                                        </p>
                                        <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl">{job.job_description}</p>
                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => setSelectedApplicantsJob(job as IJob)}
                                                className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600"
                                            >
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{job.application_count || 0} applicant{job.application_count === 1 ? '' : 's'}</span>
                                            </button>
                                            {!!job.applicant_stats?.shortlisted && (
                                                <Badge variant="warning" className="gap-1"><Star className="w-3 h-3" /> {job.applicant_stats.shortlisted} shortlisted</Badge>
                                            )}
                                            {!!job.applicant_stats?.hired && (
                                                <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> {job.applicant_stats.hired} hired</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedApplicantsJob(job as IJob)}
                                        >
                                            <Users className="w-4 h-4 mr-2" /> Applicants
                                        </Button>
                                        <Switch
                                            checked={!!job.is_active}
                                            onCheckedChange={() => handleToggleActive(job as IJob)}
                                            aria-label={`Toggle active for ${job.job_title}`}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyFrontendUrl(job as IJob)}
                                            aria-label={`Copy frontend URL for ${job.job_title}`}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => { setCurrentJob({ ...job, department: (job.department as Department)._id }); setIsEditing(true); }}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => setJobToDelete(job as IJob)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    {!jobsLoading && visibleJobs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 mb-4">{hasFilters ? "No jobs match your filters." : "No jobs posted yet."}</p>
                            {hasFilters
                                ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                                : <Button onClick={() => { setCurrentJob({}); setIsEditing(true); }}><Plus className="w-4 h-4 mr-2" /> Post New Job</Button>}
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
              </>
            )}

            {selectedApplicantsJob?._id && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedApplicantsJob(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Applicants</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedApplicantsJob.job_title} • {applicantsData?.meta?.total || selectedApplicantsJob.application_count || 0} applicant{(applicantsData?.meta?.total || selectedApplicantsJob.application_count || 0) === 1 ? '' : 's'}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedApplicantsJob(null)}>
                                <X className="w-5 h-5 text-slate-400 hover:text-slate-900" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            {applicantsLoading ? (
                                Array.from({ length: 4 }).map((_, idx) => <ApplicantRowSkeleton key={idx} />)
                            ) : applicantsData?.data?.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No applicants for this job yet.</p>
                                </div>
                            ) : (
                                applicantsData?.data?.map((application) => (
                                    <div key={application._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h4 className="text-base font-semibold text-slate-900">{application.applicant.full_name}</h4>
                                                    <Badge variant={application.is_certified ? 'success' : 'secondary'}>
                                                        {application.is_certified ? 'Certified' : 'Applied'}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {(application.status ?? 'applied').replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600 min-w-0">
                                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <span className="truncate">{application.applicant.email}</span>
                                                    </div>
                                                    <div className="text-slate-600">
                                                        <span className="font-medium text-slate-700">Phone:</span> {application.applicant.phone || 'N/A'}
                                                    </div>
                                                    <div className="text-slate-600">
                                                        <span className="font-medium text-slate-700">Target Department:</span> {application.applicant.target_department ? (application.applicant.target_department as Department).department_name : 'N/A'}
                                                    </div>
                                                    <div className="text-slate-600">
                                                        <span className="font-medium text-slate-700">Applied:</span> {new Date(application.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {application.applicant.cv?.filename && (
                                                    <div className="mt-3">
                                                        <a
                                                            href={application.applicant.cv.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                        >
                                                            View CV: {application.applicant.cv.filename}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Select
                                                    value={application.status ?? 'applied'}
                                                    onValueChange={(v) => handleUpdateApplicationStatus(application._id, v as ApplicationStatus)}
                                                >
                                                    <SelectTrigger className="w-40 capitalize">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PIPELINE_STATUSES.map((s) => (
                                                            <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    onClick={() => handleInviteApplicant(application.applicant, selectedApplicantsJob.job_title)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                >
                                                    <Send className="w-4 h-4 mr-2" /> Invite Candidate
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {applicantsTotalPages > 1 && (
                                <Pagination className="mt-2">
                                    <PaginationPrevious
                                        onClick={() => setApplicantsPage((p) => Math.max(1, p - 1))}
                                        disabled={applicantsPage === 1}
                                    />
                                    <PaginationContent>
                                        {getApplicantPageNumbers().map((num) => (
                                            <PaginationItem key={num}>
                                                <PaginationLink
                                                    isActive={num === applicantsPage}
                                                    onClick={() => setApplicantsPage(num)}
                                                >
                                                    {num}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                    </PaginationContent>
                                    <PaginationNext
                                        onClick={() => setApplicantsPage((p) => Math.min(applicantsTotalPages, p + 1))}
                                        disabled={applicantsPage === applicantsTotalPages}
                                    />
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {jobToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => !isDeleting && setJobToDelete(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Delete job posting?</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        <span className="font-medium text-slate-700">{jobToDelete.job_title}</span> will be permanently removed. This can't be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setJobToDelete(null)} disabled={isDeleting}>Cancel</Button>
                                <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete Job"}
                                </Button>
                            </div>
                        </div>
                    </div>
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

function ApplicantRowSkeleton() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-52" />
                </div>
                <Skeleton className="h-10 w-40 rounded-md" />
            </div>
        </div>
    );
}