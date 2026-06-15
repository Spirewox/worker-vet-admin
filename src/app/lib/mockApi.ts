// Dev-only mock layer. Installs a custom axios adapter that answers the admin
// endpoints with realistic sample data so the dashboard can be reviewed
// without a backend. Activated only when VITE_USE_MOCKS === "true" (see
// main.tsx). Inert in production.
import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const adminUser = {
  _id: "admin-1",
  full_name: "Admin User",
  email: "admin@workervet.com",
  phone: "+234 800 000 0000",
  role: "admin",
  status: "active",
};

const departments = [
  { _id: "dept-care", department_name: "Patient Care", is_active: true },
  { _id: "dept-ops", department_name: "Operations", is_active: true },
  { _id: "dept-admin", department_name: "Administration", is_active: true },
];

const skills = [
  { _id: "sk-trust", skill_name: "Trust", is_active: true },
  { _id: "sk-integrity", skill_name: "Integrity", is_active: true },
  { _id: "sk-ethics", skill_name: "Ethics", is_active: true },
  { _id: "sk-comm", skill_name: "Communication", is_active: true },
  { _id: "sk-prof", skill_name: "Professionalism", is_active: true },
];

const dashboardMetrics = {
  totalCandidates: 1240, totalCandidatesMoM: 12, assessmentsTaken: 3180,
  assessmentsPassed: 8, passRateMoM: -3, avgPassRate: 64, activeJobsCount: 18,
};

const recentAssessments = [
  { participant_name: "Ada Obi", job_department: "Patient Care", percentage: 90, result: "pass", submitted_at: "2026-06-12T10:00:00Z" },
  { participant_name: "Bola Eze", job_department: "Administration", percentage: 48, result: "fail", submitted_at: "2026-06-12T09:10:00Z" },
  { participant_name: "Chidi Umeh", job_department: "Operations", percentage: 72, result: "pass", submitted_at: "2026-06-11T16:30:00Z" },
];

const deptPassRates = [
  { department_name: "Patient Care", percentage: 78, total_people: 220, total_passed: 172 },
  { department_name: "Operations", percentage: 61, total_people: 140, total_passed: 85 },
  { department_name: "Administration", percentage: 54, total_people: 96, total_passed: 52 },
];

const globalSkills = [
  { skill_id: "sk-trust", skill_name: "Trust", average_percentage: 81 },
  { skill_id: "sk-integrity", skill_name: "Integrity", average_percentage: 77 },
  { skill_id: "sk-ethics", skill_name: "Ethics", average_percentage: 58 },
  { skill_id: "sk-comm", skill_name: "Communication", average_percentage: 52 },
  { skill_id: "sk-prof", skill_name: "Professionalism", average_percentage: 69 },
];

const revenueSummary = {
  total: 1860000, training: 1500000, certificate: 300000, hardcopy: 60000,
  transactions: 124, totalMoM: 18,
};

const transactions = [
  { _id: "t1", reference: "WV-TXN-1001", candidate_name: "Ada Obi", type: "training", description: "Workplace Ethics course", amount: 500, status: "success", created_at: "2026-06-12T10:05:00Z" },
  { _id: "t2", reference: "WV-TXN-1002", candidate_name: "Ada Obi", type: "certificate", description: "Patient Care certificate", amount: 50, status: "success", created_at: "2026-06-12T10:20:00Z" },
  { _id: "t3", reference: "WV-TXN-1003", candidate_name: "Chidi Umeh", type: "training", description: "Communication course", amount: 500, status: "success", created_at: "2026-06-11T14:00:00Z" },
  { _id: "t4", reference: "WV-TXN-1004", candidate_name: "Bola Eze", type: "hardcopy", description: "Hard-copy certificate", amount: 20, status: "pending", created_at: "2026-06-11T11:30:00Z" },
  { _id: "t5", reference: "WV-TXN-1005", candidate_name: "Ngozi Ali", type: "certificate", description: "Operations certificate", amount: 50, status: "refunded", created_at: "2026-06-10T08:45:00Z" },
];

const trainingCourses = [
  {
    _id: "course-ethics", title: "Workplace Ethics",
    description: "Apply fairness, honesty and sound judgment to real workplace situations.",
    department: departments[2], price: 500, passMark: 0.67, is_active: true,
    enrollments: 64, completions: 41,
    modules: [
      { _id: "m1", title: "Recognising an ethical dilemma", description: "Spot decisions that affect others.", durationLabel: "6 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { _id: "m2", title: "Policy, judgment and escalation", description: "Use the code of conduct, then judgment.", durationLabel: "8 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    ],
    resources: [{ _id: "r1", label: "Ethics framework (PDF)", url: "#", type: "pdf" }],
    quiz: [{ _id: "q1", question: "A colleague asks you to overlook a small breach. You:", options: ["Agree", "Decline and follow policy"], answerIndex: 1 }],
  },
  {
    _id: "course-comm", title: "Effective Communication",
    description: "Listen first, confirm understanding and communicate early.",
    department: departments[1], price: 500, passMark: 0.67, is_active: true,
    enrollments: 38, completions: 22,
    modules: [
      { _id: "m3", title: "Listening to understand", description: "Reflect back what you heard.", durationLabel: "5 min", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
    ],
    resources: [],
    quiz: [{ _id: "q2", question: "Best way to confirm a request:", options: ["Assume", "Reflect back and confirm"], answerIndex: 1 }],
  },
];

const certificates = [
  { _id: "c1", certificate_id: "WV-CERT-AB12CD", candidate: { _id: "u1", full_name: "Ada Obi", email: "ada@example.com" }, type: "assessment", title: "Patient Care", score: 90, status: "issued", issued_at: "2026-06-12T10:30:00Z" },
  { _id: "c2", certificate_id: "WV-CERT-EF34GH", candidate: { _id: "u2", full_name: "Chidi Umeh", email: "chidi@example.com" }, type: "training", title: "Effective Communication", score: 80, status: "issued", issued_at: "2026-06-11T15:00:00Z" },
  { _id: "c3", certificate_id: "WV-CERT-IJ56KL", candidate: { _id: "u3", full_name: "Ngozi Ali", email: "ngozi@example.com" }, type: "assessment", title: "Operations", score: 76, status: "revoked", issued_at: "2026-06-09T12:00:00Z" },
];

const hardcopyOrders = [
  { _id: "h1", certificate_id: "WV-CERT-AB12CD", candidate_name: "Ada Obi", course_title: "Patient Care", address: "12 Marina Rd", city: "Lagos", country: "Nigeria", fee: 20, status: "pending", requested_at: "2026-06-12T11:00:00Z" },
  { _id: "h2", certificate_id: "WV-CERT-EF34GH", candidate_name: "Chidi Umeh", course_title: "Effective Communication", address: "5 Wuse Zone", city: "Abuja", country: "Nigeria", fee: 20, status: "shipped", tracking: "NIPOST-99201", requested_at: "2026-06-10T09:00:00Z" },
];

const auditEntries = [
  { _id: "a1", actor: "Admin User", action: "revoked certificate", target: "WV-CERT-IJ56KL", created_at: "2026-06-12T12:00:00Z" },
  { _id: "a2", actor: "Admin User", action: "created training course", target: "Effective Communication", created_at: "2026-06-11T13:30:00Z" },
  { _id: "a3", actor: "Admin User", action: "updated pricing", target: "Certificate fee → ₦50", created_at: "2026-06-10T10:15:00Z" },
];

const trends = [
  { month: "Jan", assessments: 280, passed: 168, pass_rate: 60, revenue: 210000 },
  { month: "Feb", assessments: 340, passed: 224, pass_rate: 66, revenue: 268000 },
  { month: "Mar", assessments: 410, passed: 246, pass_rate: 60, revenue: 305000 },
  { month: "Apr", assessments: 520, passed: 359, pass_rate: 69, revenue: 372000 },
  { month: "May", assessments: 610, passed: 421, pass_rate: 69, revenue: 430000 },
  { month: "Jun", assessments: 720, passed: 518, pass_rate: 72, revenue: 505000 },
];

const funnel = [
  { stage: "Registered", count: 1240 },
  { stage: "Took assessment", count: 880 },
  { stage: "Passed", count: 564 },
  { stage: "Certified", count: 412 },
  { stage: "Hired", count: 96 },
];

const pricing = { training_price: 500, certificate_price: 50, hardcopy_fee: 20 };

const assessmentConfig = { pass_mark: 70, time_limit: 600, max_attempts: 3, retake_cooldown_hours: 24, validity_days: 365 };

const candidatesRes = {
  data: [
    { _id: "u1", full_name: "Ada Obi", email: "ada@example.com", phone: "+234 801", target_department: "Patient Care", cv: { filename: "ada.pdf", url: "#" }, recent_activity: { department_name: "Patient Care", result: "pass", submitted_at: "2026-06-12T10:00:00Z" } },
    { _id: "u2", full_name: "Chidi Umeh", email: "chidi@example.com", phone: "+234 802", target_department: "Operations", cv: { filename: "chidi.pdf", url: "#" }, recent_activity: { department_name: "Operations", result: "pass", submitted_at: "2026-06-11T16:30:00Z" } },
  ],
  meta: { page: 1, limit: 20, total: 2, totalPages: 1, search: null },
};

const admins = [
  { _id: "admin-1", full_name: "Admin User", email: "admin@workervet.com", role: "super_admin", status: "active", createdAt: "2026-01-10T00:00:00Z" },
  { _id: "admin-2", full_name: "Tunde Bako", email: "tunde@workervet.com", role: "editor", status: "active", createdAt: "2026-03-02T00:00:00Z" },
];

const jobsRes = {
  data: [
    { _id: "job-1", job_title: "Care Assistant", job_description: "Compassionate hands-on care.", department: departments[0], location: "Lagos", salary_range: "₦240k–₦280k", is_active: true, application_count: 14 },
    { _id: "job-2", job_title: "Operations Coordinator", job_description: "Keep the floor running.", department: departments[1], location: "Abuja", salary_range: "₦300k–₦340k", is_active: true, application_count: 8 },
  ],
  meta: { filters: { department: null, search: null }, limit: 20, page: 1, total: 2, totalPages: 1 },
};

const candidateSkills = {
  candidate_id: "u1", candidate_name: "Ada Obi", total_assessments: 3, pass_rate: 67, avg_score: 71,
  skills: globalSkills.map((s) => ({ skill_id: s.skill_id, skill_name: s.skill_name, percentage: s.average_percentage })),
};

const talents = [
  {
    _id: "u1", full_name: "Ada Obi", email: "ada@example.com", phone: "+234 801", cv: { filename: "ada.pdf", url: "#" },
    certified_departments: [{ department_id: "dept-care", department_name: "Patient Care", score: 90, date: "2026-06-12T10:00:00Z" }],
    avg_score: 88, pass_rate: 100, assessments_taken: 3, last_active: "2026-06-12T10:00:00Z", shortlisted: true,
    top_skills: [{ skill_name: "Trust", percentage: 92 }, { skill_name: "Ethics", percentage: 90 }, { skill_name: "Communication", percentage: 88 }],
  },
  {
    _id: "u2", full_name: "Chidi Umeh", email: "chidi@example.com", phone: "+234 802", cv: { filename: "chidi.pdf", url: "#" },
    certified_departments: [{ department_id: "dept-ops", department_name: "Operations", score: 76, date: "2026-06-11T16:30:00Z" }],
    avg_score: 74, pass_rate: 80, assessments_taken: 5, last_active: "2026-06-11T16:30:00Z", shortlisted: false,
    top_skills: [{ skill_name: "Integrity", percentage: 82 }, { skill_name: "Professionalism", percentage: 78 }],
  },
  {
    _id: "u3", full_name: "Ngozi Ali", email: "ngozi@example.com", phone: "+234 803", cv: { filename: "ngozi.pdf", url: "#" },
    certified_departments: [
      { department_id: "dept-care", department_name: "Patient Care", score: 84, date: "2026-06-08T10:00:00Z" },
      { department_id: "dept-admin", department_name: "Administration", score: 79, date: "2026-05-30T10:00:00Z" },
    ],
    avg_score: 81, pass_rate: 90, assessments_taken: 4, last_active: "2026-06-08T10:00:00Z", shortlisted: false,
    top_skills: [{ skill_name: "Communication", percentage: 86 }, { skill_name: "Trust", percentage: 83 }],
  },
];

const talentStats = { total: talents.length, certified: 4, avg_score: 81, top_department: "Patient Care" };

const assessmentHistory = [
  {
    date: "2026-06-12T10:00:00Z", job_name: "Care Assistant", department_name: "Patient Care", score: "9/10", percentage: 90, result: "pass",
    skills: [
      { skill_name: "Trust", percentage: 92 },
      { skill_name: "Integrity", percentage: 88 },
      { skill_name: "Ethics", percentage: 90 },
      { skill_name: "Communication", percentage: 88 },
    ],
  },
  {
    date: "2026-05-20T10:00:00Z", job_name: "", department_name: "Administration", score: "4/10", percentage: 48, result: "fail",
    skills: [
      { skill_name: "Trust", percentage: 60 },
      { skill_name: "Integrity", percentage: 55 },
      { skill_name: "Ethics", percentage: 40 },
      { skill_name: "Communication", percentage: 38 },
    ],
  },
];

const resolve = (config: InternalAxiosRequestConfig): unknown | undefined => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();
  const path = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0].replace(/^\/+/, "").replace(/\/+$/, "");
  const params = new URLSearchParams(url.split("?")[1] || "");

  if (method !== "get") return { success: true };

  if (path === "auth/whoami") return { data: adminUser };
  if (path === "assessment/metrics") return dashboardMetrics;
  if (path === "assessment/recent") return recentAssessments;
  if (path === "assessment/department/pass-rate") return deptPassRates;
  if (path === "assessment/global/skills") return globalSkills;
  if (path === "analytics/trends") return trends;
  if (path === "analytics/funnel") return funnel;
  if (/^assessment\/candidate\/[^/]+\/skills$/.test(path)) return candidateSkills;
  if (/^assessment\/history\/[^/]+$/.test(path)) return assessmentHistory;

  if (path === "payments/summary") return revenueSummary;
  if (path === "payments/transactions") {
    const t = params.get("type"); const s = params.get("status");
    let list = transactions;
    if (t) list = list.filter((x) => x.type === t);
    if (s) list = list.filter((x) => x.status === s);
    return { data: list };
  }

  if (path === "talent-pool/stats") return talentStats;
  if (path === "talent-pool") {
    const dept = params.get("department");
    const skill = params.get("skill");
    const minScore = Number(params.get("min_score") || 0);
    const shortlisted = params.get("shortlisted") === "true";
    const search = (params.get("search") || "").toLowerCase();
    const sort = params.get("sort") || "avg_score";
    let list = talents.slice();
    if (dept) list = list.filter((t) => t.certified_departments.some((d) => d.department_id === dept));
    if (skill) list = list.filter((t) => t.top_skills.some((s) => s.skill_name === skill));
    if (minScore) list = list.filter((t) => t.avg_score >= minScore);
    if (shortlisted) list = list.filter((t) => t.shortlisted);
    if (search) list = list.filter((t) => t.full_name.toLowerCase().includes(search) || t.email.toLowerCase().includes(search));
    if (sort === "pass_rate") list.sort((a, b) => b.pass_rate - a.pass_rate);
    else if (sort === "recent") list.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
    else list.sort((a, b) => b.avg_score - a.avg_score);
    return { data: list, meta: { page: 1, limit: list.length, total: list.length, totalPages: 1 } };
  }

  if (path === "training") return { data: trainingCourses };
  if (path === "certificates") return { data: certificates };
  if (path === "certificates/hardcopy-orders") return { data: hardcopyOrders };
  if (path === "audit-logs") return { data: auditEntries };
  if (path === "settings/pricing") return pricing;
  if (path === "settings/assessment-config") return assessmentConfig;

  if (path === "departments") return departments;
  if (path === "skills") return skills;
  if (path === "users/admins") return admins;
  if (path.startsWith("users/candidates/recent-activity")) return candidatesRes;

  if (path === "jobs") return jobsRes;
  if (/^jobs\/[^/]+\/applicants$/.test(path)) {
    return {
      data: [
        { _id: "ap1", is_certified: true, status: "shortlisted", createdAt: "2026-06-10T10:00:00Z", applicant: { _id: "u1", full_name: "Ada Obi", email: "ada@example.com", phone: "+234 801", cv: { filename: "ada.pdf", url: "#" }, target_department: departments[0] } },
        { _id: "ap2", is_certified: false, status: "applied", createdAt: "2026-06-11T10:00:00Z", applicant: { _id: "u4", full_name: "Femi Cole", email: "femi@example.com", phone: "+234 803", cv: { filename: "femi.pdf", url: "#" }, target_department: departments[0] } },
      ],
      meta: { page: 1, limit: 20, total: 2, totalPages: 1, search: null, job: { _id: "job-1", job_title: "Care Assistant" } },
    };
  }

  return undefined;
};

export const installMockApi = () => {
  axios.defaults.adapter = async (config): Promise<AxiosResponse> => {
    const data = resolve(config as InternalAxiosRequestConfig);
    const base = { headers: config.headers, config: config as InternalAxiosRequestConfig, request: {} };
    if (data === undefined) {
      return Promise.reject({ response: { status: 404, data: { message: "Not mocked" }, ...base }, isAxiosError: true, config });
    }
    await new Promise((r) => setTimeout(r, 200));
    return { data, status: 200, statusText: "OK", ...base } as AxiosResponse;
  };
  console.info("[mockApi] installed — serving sample admin data");
};
