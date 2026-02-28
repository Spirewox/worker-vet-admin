import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CheckCircle, Trash2 } from "lucide-react";
import type{ Question } from "../../interface/question.interface";
import type { Department, Skill } from "../../interface/settings.interface";

interface QuestionEditorProps {
  question: Question;
  index: number;
  skillsData: Skill[];
  departmentsData: Department[];
  onChange: (updated: Question) => void;
  onRemove: () => void;
  onValidityChange?: (isValid: boolean) => void;
}

export function QuestionEditor({
  question,
  index,
  skillsData,
  departmentsData,
  onChange,
  onValidityChange,
  onRemove
}: QuestionEditorProps) {

  const errors = useMemo(() => {
    if (!question) return {};

    const newErrors: Record<string, string> = {};

    if (!question.skill_category) newErrors.skill_category = "Skill is required";
    if (!question.department) newErrors.department = "Department is required";
    if (!question.scenario?.trim()) newErrors.scenario = "Scenario cannot be empty";
    if (!question.question_text?.trim()) newErrors.question_text = "Question text is required";

    if (!question.options || question.options.length < 2) {
      newErrors.options = "At least 2 options are required";
    } else if (question.options.some(opt => !opt.content.trim())) {
      newErrors.options = "All options must be filled";
    }

    if (question.correct_option_index === undefined) {
      newErrors.correct_option_index = "Select the correct option";
    }

    return newErrors;
  }, [question]);

  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  // useEffect(() => {
  //   if (onValidityChange) {
  //     onValidityChange(Object.keys(errors).length === 0);
  //   }
  // }, [errors, onValidityChange]);

  // const isValid = Object.keys(errors).length === 0;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Question {index + 1}</CardTitle>
          <CardDescription>Edit before submitting</CardDescription>
        </div>

        <Button
          size="icon"
          variant="destructive"
          onClick={onRemove}
          title="Remove question"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skill + Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Skill Category</Label>
            <Select
              onValueChange={(val) => onChange({ ...question, skill_category: val })}
              value={String(question.skill_category) || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Skill..." />
              </SelectTrigger>
              <SelectContent>
                {skillsData.map(s => (
                  <SelectItem key={s._id} value={s._id}>{s.skill_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.skill_category && <p className="text-red-500 text-xs">{errors.skill_category}</p>}
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              onValueChange={(val) => onChange({ ...question, department: val })}
              value={question.department || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department..." />
              </SelectTrigger>
              <SelectContent>
                {departmentsData.map(d => (
                  <SelectItem key={d._id} value={d._id}>{d.department_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
          </div>
        </div>

        {/* Scenario */}
        <div className="space-y-2">
          <Label>Scenario</Label>
          <Textarea
            placeholder="Describe the workplace situation..."
            value={question.scenario || ""}
            onChange={(e) => onChange({ ...question, scenario: e.target.value })}
          />
          {errors.scenario && <p className="text-red-500 text-xs">{errors.scenario}</p>}
        </div>

        {/* Question + Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Question</Label>
            <Input
              placeholder="What should the employee do?"
              value={question.question_text || ""}
              onChange={(e) => onChange({ ...question, question_text: e.target.value })}
            />
            {errors.question_text && <p className="text-red-500 text-xs">{errors.question_text}</p>}
          </div>

          <div className="space-y-2">
            <Label>Time Limit (Seconds)</Label>
            <Input
              type="number"
              min={10}
              max={300}
              value={question.time_seconds || 30}
              onChange={(e) => onChange({ ...question, time_seconds: parseInt(e.target.value) || 30 })}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Options</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options?.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={opt.content}
                  onChange={(e) => {
                    const newOpts = [...(question.options || [])];
                    newOpts[idx].content = e.target.value;
                    onChange({ ...question, options: newOpts });
                  }}
                />

                <Button
                  type="button"
                  size="icon"
                  variant={idx === question.correct_option_index ? "default" : "outline"}
                  onClick={() => onChange({ ...question, correct_option_index: idx })}
                  className={idx === question.correct_option_index ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  title="Mark as Correct"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          {errors.options && <p className="text-red-500 text-xs">{errors.options}</p>}
          {errors.correct_option_index && <p className="text-red-500 text-xs">{errors.correct_option_index}</p>}
        </div>

        {/* Submit Validation */}
        {!isValid && (
          <p className="text-red-600 text-sm mt-2">
            Please fill all required fields before submitting.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
