import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { NativeSelect } from "../ui/native-select";
import {
  Plus, Trash2, Pencil, GraduationCap, Video, FileText, ListChecks,
  ArrowLeft, Users, CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosDelete, axiosPatch, axiosPost } from "../../lib/api";
import { useTrainingCourses } from "../../hooks/useTraining";
import type {
  TrainingCourse, TrainingVideoModule, TrainingResourceItem, TrainingQuizQuestion, ResourceType,
} from "../../hooks/useTraining";
import { useDepartments } from "../../hooks/useSettings";
import type { Department } from "../../interface/settings.interface";
import { formatNaira } from "../../lib/format";

const emptyCourse = (): TrainingCourse => ({
  title: "", description: "", price: 500, passMark: 0.67, is_active: true,
  modules: [{ title: "", description: "", durationLabel: "", videoUrl: "" }],
  resources: [],
  quiz: [{ question: "", options: ["", ""], answerIndex: 0 }],
});

const deptName = (d?: string | Department) =>
  typeof d === "string" ? d : d?.department_name;
const deptId = (d?: string | Department) => (typeof d === "string" ? d : d?._id);

const TrainingModule = () => {
  const { data: courses, isLoading, refetch } = useTrainingCourses();
  const { data: departments } = useDepartments();
  const [editing, setEditing] = useState<TrainingCourse | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const startNew = () => { setEditing(emptyCourse()); setIsNew(true); };
  const startEdit = (c: TrainingCourse) => { setEditing(JSON.parse(JSON.stringify(c))); setIsNew(false); };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Course title is required");
    try {
      setSaving(true);
      const payload = { ...editing, department: deptId(editing.department) };
      if (isNew) await axiosPost("training", payload, true);
      else await axiosPatch(`training/${editing._id}`, payload, true);
      toast.success(isNew ? "Course created" : "Course updated");
      setEditing(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: TrainingCourse) => {
    if (!confirm(`Delete training course "${c.title}"?`)) return;
    try {
      await axiosDelete(`training/${c._id}`, true);
      toast.success("Course deleted");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const toggleActive = async (c: TrainingCourse) => {
    try {
      await axiosPatch(`training/${c._id}`, { is_active: !c.is_active }, true);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  if (editing) {
    return (
      <CourseEditor
        course={editing}
        departments={departments}
        isNew={isNew}
        saving={saving}
        onChange={setEditing}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Training Management</h2>
          <p className="text-slate-500 mt-1">Create and manage paid video training courses.</p>
        </div>
        <Button onClick={startNew}><Plus className="w-4 h-4 mr-2" /> New Course</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : !courses?.length ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-xl text-slate-500">
          <GraduationCap className="w-10 h-10 text-slate-300 mb-3" />
          No training courses yet. Create your first course.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c._id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{c.title}</CardTitle>
                  <Badge variant={c.is_active ? "success" : "outline"}>
                    {c.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{c.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {deptName(c.department) && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{deptName(c.department)}</span>
                  )}
                  <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {c.modules?.length || 0}</span>
                  <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> {c.quiz?.length || 0}</span>
                  <span className="font-semibold text-slate-700">{formatNaira(c.price)}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrollments ?? 0} enrolled</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {c.completions ?? 0} completed</span>
                </div>
                <div className="mt-auto flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(c)}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(c)}>
                    {c.is_active ? "Hide" : "Show"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(c)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingModule;

// ---- Editor ----

const RESOURCE_TYPES: ResourceType[] = ["pdf", "article", "video", "link"];

const CourseEditor = ({
  course, departments, isNew, saving, onChange, onCancel, onSave,
}: {
  course: TrainingCourse;
  departments?: Department[];
  isNew: boolean;
  saving: boolean;
  onChange: (c: TrainingCourse) => void;
  onCancel: () => void;
  onSave: () => void;
}) => {
  const set = (patch: Partial<TrainingCourse>) => onChange({ ...course, ...patch });

  const setModule = (i: number, patch: Partial<TrainingVideoModule>) => {
    const modules = course.modules.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    set({ modules });
  };
  const addModule = () =>
    set({ modules: [...course.modules, { title: "", description: "", durationLabel: "", videoUrl: "" }] });
  const removeModule = (i: number) => set({ modules: course.modules.filter((_, idx) => idx !== i) });

  const setResource = (i: number, patch: Partial<TrainingResourceItem>) =>
    set({ resources: course.resources.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  const addResource = () =>
    set({ resources: [...course.resources, { label: "", url: "", type: "pdf" }] });
  const removeResource = (i: number) => set({ resources: course.resources.filter((_, idx) => idx !== i) });

  const setQuestion = (i: number, patch: Partial<TrainingQuizQuestion>) =>
    set({ quiz: course.quiz.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) });
  const addQuestion = () =>
    set({ quiz: [...course.quiz, { question: "", options: ["", ""], answerIndex: 0 }] });
  const removeQuestion = (i: number) => set({ quiz: course.quiz.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <button onClick={onCancel} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </button>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {isNew ? "New training course" : "Edit course"}
      </h2>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Course title" value={course.title} onChange={(e) => set({ title: e.target.value })} />
          <Textarea placeholder="Description" value={course.description} onChange={(e) => set({ description: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NativeSelect
              value={typeof course.department === "string" ? course.department : course.department?._id ?? ""}
              onChange={(e) => set({ department: e.target.value })}
            >
              <option value="">No department</option>
              {departments?.map((d) => <option key={d._id} value={d._id}>{d.department_name}</option>)}
            </NativeSelect>
            <Input type="number" placeholder="Price (₦)" value={course.price ?? 0}
              onChange={(e) => set({ price: Number(e.target.value) })} />
            <Input type="number" step="0.01" min="0" max="1" placeholder="Pass mark (0-1)"
              value={course.passMark ?? 0.67} onChange={(e) => set({ passMark: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Video className="w-4 h-4" /> Video modules</CardTitle>
          <Button size="sm" variant="outline" onClick={addModule}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.modules.map((m, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">MODULE {i + 1}</span>
                <button onClick={() => removeModule(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <Input placeholder="Module title" value={m.title} onChange={(e) => setModule(i, { title: e.target.value })} />
              <Textarea placeholder="Module description" value={m.description} onChange={(e) => setModule(i, { description: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Video URL" className="md:col-span-2" value={m.videoUrl} onChange={(e) => setModule(i, { videoUrl: e.target.value })} />
                <Input placeholder="Duration e.g. 6 min" value={m.durationLabel} onChange={(e) => setModule(i, { durationLabel: e.target.value })} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Resources</CardTitle>
          <Button size="sm" variant="outline" onClick={addResource}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {!course.resources.length && <p className="text-sm text-slate-400">No resources.</p>}
          {course.resources.map((r, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <Input placeholder="Label" value={r.label} onChange={(e) => setResource(i, { label: e.target.value })} />
              <Input placeholder="URL" value={r.url} onChange={(e) => setResource(i, { url: e.target.value })} />
              <NativeSelect value={r.type} onChange={(e) => setResource(i, { type: e.target.value as ResourceType })}>
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
              <button onClick={() => removeResource(i)} className="text-slate-400 hover:text-red-500 justify-self-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><ListChecks className="w-4 h-4" /> Quick assessment</CardTitle>
          <Button size="sm" variant="outline" onClick={addQuestion}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add question</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.quiz.map((q, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">QUESTION {i + 1}</span>
                <button onClick={() => removeQuestion(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <Input placeholder="Question" value={q.question} onChange={(e) => setQuestion(i, { question: e.target.value })} />
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`answer-${i}`} checked={q.answerIndex === oi}
                    onChange={() => setQuestion(i, { answerIndex: oi })} />
                  <Input placeholder={`Option ${oi + 1}`} value={opt}
                    onChange={(e) => setQuestion(i, { options: q.options.map((o, idx) => (idx === oi ? e.target.value : o)) })} />
                  {q.options.length > 2 && (
                    <button onClick={() => setQuestion(i, { options: q.options.filter((_, idx) => idx !== oi), answerIndex: 0 })}
                      className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setQuestion(i, { options: [...q.options, ""] })}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add option
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : isNew ? "Create course" : "Save changes"}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};
