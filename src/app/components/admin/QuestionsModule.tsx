import {useState, useRef, useMemo} from "react"
import * as XLSX from 'xlsx';
import { Badge } from '../ui/badge';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Edit2, FileSpreadsheet, FileText, Plus, Trash2, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {useDepartmentQuestions, useQuestionBank } from '../../hooks/useQuestionQueries';

import type { QBank} from '../../hooks/useQuestionQueries';
import { useDepartments, useSkills } from '../../hooks/useSettings';
import type { Question } from '../../interface/question.interface';
import type { Department, Skill } from '../../interface/settings.interface';
import { ImportPreview } from './ImportPreview';
import { axiosDelete, axiosPatch, axiosPost } from '../../lib/api';
import { toast } from 'react-toastify';
import ExcelJS from "exceljs";


const QuestionsModule = () => {
  const [selectedDept, setSelectedDept] = useState<QBank | null>(null);
  const {data : questionsData,isLoading : questionDeptLoading,refetch : refetchQBank} = useQuestionBank()
  const {data : skillsData} = useSkills();
  const {data : departmentsData} = useDepartments();
  const {data : departmentQuestions,refetch : refetchDeptQ} = useDepartmentQuestions(selectedDept?.department_id || "")
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const departmentMap = useMemo(() => {
    if (!departmentsData) return new Map<string, string>();

    return new Map(
      departmentsData.map(d => [d.department_name, d._id])
    );
  }, [departmentsData]);

  const skillMap = useMemo(() => {
    if (!skillsData) return new Map<string, string>();

    return new Map(
      skillsData.map(s => [s.skill_name, s._id])
    );
  }, [skillsData]);

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    options: [{content : ""},{content : ""}],
    correct_option_index: 0,
    department: selectedDept?.department_id,
    skill_category : "",
    time_seconds: 30
  });


  const refreshData = () => {
    refetchDeptQ()
    refetchQBank()
  };

  const resetForm = () => {
    
    setNewQuestion({ 
      options: [{content : ""},{content : ""}], 
      correct_option_index: 0,
      department: selectedDept?.department_id,
      time_seconds: 30
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (q: Question) => {
    console.log(q)
    setNewQuestion({...q});
    setEditingId(q._id!);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async(id: string) => {
    try {
      if (confirm("Are you sure you want to delete this question?")) {
        await axiosDelete(`questions/${id}`,true)
        toast.success("Question deleted successfully")
        refreshData();
      }
    } catch (error) {
      console.log(error)
      toast.error("An error occurred while trying to delete question")
    }
    
  };

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      if (!newQuestion.scenario || !newQuestion.question_text || !newQuestion.skill_category || !newQuestion.department){
        toast.error("Please fill in all required fields")
        return
      };
    
      if (editingId) {
        // Update
        const q: Question = {
          ...newQuestion as Question,
          _id: editingId,
        };

        await axiosPatch(`questions/${editingId}`, q,true)
      } else {
        // Add
        const q: Question = {
          skill_category: newQuestion.skill_category,
          scenario: newQuestion.scenario,
          question_text: newQuestion.question_text,
          options: newQuestion.options,
          correct_option_index: newQuestion.correct_option_index || 0,
          department: newQuestion.department,
          time_seconds: newQuestion.time_seconds || 30,
        };

        await axiosPost('question',q,true)
      }

      toast.success("Question data submitted successfully")
      
      refreshData();
      resetForm();
    } catch (error) {
      console.log(error)
      toast.error("An error occurred while trying to submit your request")
    }finally{
      setIsSubmitting(false)
    }
  };

  // --- File Import Logic ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Processing file...");
    
    try {

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await processExcelFile(file, selectedDept?.department_id);
        
      }else {
        setImportStatus("Error: Unsupported file type. Please use .xlsx or .docx");
      }
    } catch (err) {
      console.error(err);
      setImportStatus("Error parsing file. Please check the format.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const processExcelFile = (file: File, defaultDept?: string) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          const parsedQuestions: Question[] = [];

          let count = 0;
          jsonData.forEach((row) => {
            const scenario = row['Scenario'] || row['scenario'];
            const qText = row['Question'] || row['question'];
            
            const deptName = row['Department'] || row['department'];
            const skillName = row['Skill'] || row['skill'];

            const departmentId = departmentMap.get(deptName);
            const skillId = skillMap.get(skillName);
            const time = parseInt(row['Time Limit'] || row['TimeLimit'] || row['time'] || '30');

            if (skillId && scenario && qText) {
              const options = [
                row['Option 1'] || row['option1'] || '',
                row['Option 2'] || row['option2'] || '',
                row['Option 3'] || row['option3'] || '',
                row['Option 4'] || row['option4'] || ''
              ].filter(o => o !== '').map(o => ({ content: o }));

              let correctIndex = 0;
              const ansRaw = row['Answer'] || row['answer'] || row['Correct'] || row['correct'];
              
              if (typeof ansRaw === 'number') {
                correctIndex = ansRaw - 1;
              } else if (typeof ansRaw === 'string') {
                const lowerAns = ansRaw.toLowerCase().trim();
                if (['a', '1'].includes(lowerAns)) correctIndex = 0;
                else if (['b', '2'].includes(lowerAns)) correctIndex = 1;
                else if (['c', '3'].includes(lowerAns)) correctIndex = 2;
                else if (['d', '4'].includes(lowerAns)) correctIndex = 3;
              }

              if (options.length >= 2) {
                 const q: Question = {
                   skill_category: skillId ,
                   scenario: scenario,
                   question_text: qText,
                   options: options,
                   correct_option_index : Math.max(0, Math.min(correctIndex, options.length - 1)),
                   department: departmentId || departmentsData?.[0]?._id || defaultDept!,
                   time_seconds: time || 30,
                 };
                 parsedQuestions.push(q);
                 count++;
              }
            }
          });
          console.log(parsedQuestions)
          setImportedQuestions(parsedQuestions);
          setShowPreview(true);
          
          // refreshData();
          setImportStatus(`Success: Imported ${count} questions from Excel.`);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // const processWordFile = async (file: File, defaultDept?: string) => {
  //   return new Promise<void>((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = async (e) => {
  //       try {
  //         const arrayBuffer = e.target?.result as ArrayBuffer;
  //         const result = await mammoth.extractRawText({ arrayBuffer });
  //         const text = result.value;
          
  //         const lines = text.split('\n').map(l => l.trim()).filter(l => l);
          
  //         const getBaseQuestion = () => ({ 
  //            options: [], 
  //            department: (defaultDept && defaultDept !== 'General') ? defaultDept as Department : undefined,
  //            timeLimit: 30
  //         });
          
  //         let currentQ: Partial<Question> = getBaseQuestion();
  //         let count = 0;
          
  //         for (let i = 0; i < lines.length; i++) {
  //           const line = lines[i];
            
  //           if (line.toLowerCase().startsWith('skill:')) {
  //              if (currentQ.skill_category && currentQ.question_text) {
  //                count++;
  //                currentQ = getBaseQuestion();
  //              }
  //              currentQ.skill_category = line.substring(6).trim();
  //           } else if (line.toLowerCase().startsWith('department:')) {
  //              const d = line.substring(11).trim();
  //              if (departments.includes(d)) {
  //                currentQ.department = d as Department;
  //              }
  //           } else if (line.toLowerCase().startsWith('time:')) {
  //               const t = parseInt(line.substring(5).trim());
  //               if (!isNaN(t)) currentQ.time_seconds = t;
  //           } else if (line.toLowerCase().startsWith('scenario:')) {
  //              currentQ.scenario = line.substring(9).trim();
  //           } else if (line.toLowerCase().startsWith('question:')) {
  //              currentQ.question_text = line.substring(9).trim();
  //           } else if (new RegExp("^[a-d]\\)", "i").test(line) || new RegExp("^[1-4]\\)").test(line)) {
  //              const optText = line.substring(2).trim();
  //              currentQ.options = [...(currentQ.options || []), optText];
  //           } else if (line.toLowerCase().startsWith('answer:')) {
  //              const ans = line.substring(7).trim().toLowerCase();
  //              let idx = 0;
  //              if (ans === 'b' || ans === '2') idx = 1;
  //              if (ans === 'c' || ans === '3') idx = 2;
  //              if (ans === 'd' || ans === '4') idx = 3;
  //              currentQ.correct_option_index = idx;
  //           }
  //         }
  //         if (currentQ.skill_category && currentQ.question_text) {
  //           //  saveParsedQuestion(currentQ);
  //            count++;
  //         }

  //         refreshData();
  //         setImportStatus(`Success: Imported ${count} questions from Word.`);
  //         resolve();
  //       } catch (err) {
  //         reject(err);
  //       }
  //     };
  //     reader.readAsArrayBuffer(file);
  //   });
  // };

  // const saveParsedQuestion = (q: Partial<Question>) => {
  //    if (!q.skill || !q.questionText || !q.options || q.options.length < 2) return;
  //    const finalQ: Question = {
  //      id: `imp-doc-${Date.now()}-${Math.random()}`,
  //      skill: q.skill as Skill,
  //      scenario: q.scenario || "Scenario from document",
  //      questionText: q.questionText,
  //      options: q.options,
  //      correctOptionIndex: q.correctOptionIndex || 0,
  //      explanation: "Imported from Word Doc",
  //      department: q.department,
  //      timeLimit: q.timeLimit || 30,
  //      isPreset: true
  //    };
  //    addPresetQuestion(finalQ);
  // };


  // const downloadTemplate = () => {
  //   const headers = ["Department", "Skill", "Scenario", "Question", "Option 1", "Option 2", "Option 3", "Option 4", "Correct", "Explanation", "Time Limit"];
  //   const sampleRow = ["Sales", "Trust", "Client issue scenario...", "What to do?", "Act", "Decline", "Ignore", "Consult", 2, "Reasoning...", 45];
  //   const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Questions Template");
  //   XLSX.writeFile(wb, "Workervet_Question_Template.xlsx");
  // };

  // const downloadTemplate = (
  //   departments: Department[] = [],
  //   skills: Skill[] = []
  // ) => {
  //   const headers = [
  //     "Department",
  //     "Skill",
  //     "Scenario",
  //     "Question",
  //     "Option 1",
  //     "Option 2",
  //     "Option 3",
  //     "Option 4",
  //     "Correct",
  //     "Explanation",
  //     "Time Limit"
  //   ];

  //   const sampleRow = [
  //     departments[0]?.department_name || "",
  //     skills[0]?.skill_name || "",
  //     "Client issue scenario...",
  //     "What should the employee do?",
  //     "Act",
  //     "Decline",
  //     "Ignore",
  //     "Consult",
  //     2,
  //     "Reasoning...",
  //     45
  //   ];

  //   const mainWs = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

  //   const deptSheetData = [
  //     ["Department ID", "Department Name"],
  //     ...departments.map(d => [d._id, d.department_name])
  //   ];
  //   const deptWs = XLSX.utils.aoa_to_sheet(deptSheetData);

  //   const skillSheetData = [
  //     ["Skill ID", "Skill Name"],
  //     ...skills.map(s => [s._id, s.skill_name])
  //   ];
  //   const skillWs = XLSX.utils.aoa_to_sheet(skillSheetData);

  //   const deptRange = `Departments!$B$2:$B$${departments.length + 1}`;
  //   const skillRange = `Skills!$B$2:$B$${skills.length + 1}`;

  //   mainWs["!dataValidation"] = [
  //     {
  //       type: "list",
  //       allowBlank: true,
  //       sqref: "A2:A1000",
  //       formulas: [deptRange]
  //     },
  //     {
  //       type: "list",
  //       allowBlank: true,
  //       sqref: "B2:B1000", 
  //       formulas: [skillRange]
  //     }
  //   ];

  //   // ======================
  //   // Workbook
  //   // ======================
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, mainWs, "Questions Template");
  //   XLSX.utils.book_append_sheet(wb, deptWs, "Departments");
  //   XLSX.utils.book_append_sheet(wb, skillWs, "Skills");

  //   XLSX.writeFile(wb, "Workervet_Question_Template.xlsx");
  // };


  const downloadTemplate = async (
    departments: Department[] = [],
    skills: Skill[] = []
  ) => {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Questions Template");
    const deptSheet = workbook.addWorksheet("Departments");
    const skillSheet = workbook.addWorksheet("Skills");

    sheet.addRow([
      "Department",
      "Skill",
      "Scenario",
      "Question",
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Correct",
      "Explanation",
      "Time Limit"
    ]);

    deptSheet.addRow(["Department ID", "Department Name"]);
    departments.forEach(d =>
      deptSheet.addRow([d._id, d.department_name])
    );

    skillSheet.addRow(["Skill ID", "Skill Name"]);
    skills.forEach(s =>
      skillSheet.addRow([s._id, s.skill_name])
    );

    const deptRange = `Departments!$B$2:$B$${departments.length + 1}`;
    const skillRange = `Skills!$B$2:$B$${skills.length + 1}`;

    for (let i = 2; i <= 1000; i++) {
      sheet.getCell(`A${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [deptRange]
      };

      sheet.getCell(`B${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [skillRange]
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Workervet_Question_Template.xlsx";
    link.click();
  };

  // --- Render Views ---

  if(showPreview){
    return(
      <ImportPreview
        initialQuestions={importedQuestions}
        skillsData={skillsData!}
        isSubmittingImport={isSubmittingImport}
        departmentsData={departmentsData!}
        onCancel={() => setShowPreview(false)}
        onSubmitAll={async(finalQuestions) => {
          setIsSubmittingImport(true)
          try {
            await axiosPost('questions/bulk', finalQuestions,true )
            toast.success("Questions Uploaded Successfully")
            refreshData();
            setShowPreview(false)
          } catch (error) {
            console.log(error)
            if(error instanceof Error)
            toast.error(error.message)
            else toast.error("Failed to upload questions")
          }finally{
            setIsSubmittingImport(false)
          }
          // 🔥 API call here
          // submitBulkQuestions(finalQuestions);
    }}
  />
    )
  }

  if (!selectedDept) {
    // Overview Mode: Grid of Departments
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
           <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Question Bank</h2>
              <p className="text-slate-500 mt-1">Select a department to manage its scenario questions.</p>
           </div>
           <Button 
             variant={isImporting ? 'default' : 'outline'} 
             onClick={() => setIsImporting(!isImporting)}
             className={isImporting ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : ""}
           >
             {isImporting ? <X className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />} 
             {isImporting ? 'Close Import' : 'Import Questions'}
           </Button>
        </div>

        {isImporting && (
          <Card className="border-blue-200 bg-slate-50 mb-6">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
               <div>
                 <CardTitle className="text-lg">Import Questions</CardTitle>
                 <CardDescription>Upload Excel (.xlsx) file with mixed department questions.</CardDescription>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={()=>downloadTemplate(departmentsData, skillsData)} className="gap-2">
                   <FileSpreadsheet className="w-4 h-4" /> Download Template
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => setIsImporting(false)} className="text-slate-500 hover:text-red-500">
                    <X className="w-4 h-4" />
                 </Button>
               </div>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col gap-4">
                 <div className="p-8 border-2 border-dashed border-slate-300 rounded-lg bg-white flex flex-col items-center justify-center gap-3 text-center hover:bg-slate-50 transition-colors relative">
                    <Input 
                      type="file" 
                      ref={fileInputRef}
                      accept=".xlsx,.xls" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                    <div className="bg-blue-100 p-3 rounded-full">
                       <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">Supports .xlsx</p>
                    </div>
                 </div>
  
                 {importStatus && (
                   <div className={`text-sm p-3 rounded-md flex items-center gap-2 ${importStatus.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                      {importStatus.startsWith('Error') ? <AlertCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                      {importStatus}
                   </div>
                 )}
                 {/* <div className="text-xs text-slate-500 text-center bg-white p-3 rounded border border-slate-100">
                    <span className="font-semibold">Format Guide:</span> Excel: "Department", "Skill", "Scenario", "Question", "Option 1-4", "Correct", "Time Limit". Word: "Department:", "Skill:", "Time:", etc.
                 </div> */}
               </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {
           questionDeptLoading ? <QuestionByDeptSkeleton/>  :
           questionsData?.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">
              No departments found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              There are no questions added yet.
            </p>
          </div> :
           questionsData?.map(dept => {
             return (
               <Card 
                 key={dept.department_id} 
                 className="hover:shadow-md transition-all cursor-pointer border-slate-200 hover:border-blue-300 group relative"
                 onClick={() => setSelectedDept(dept)}
               >
                 <CardHeader className="p-6">
                   <div className="flex justify-between items-start">
                     <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                       {
                        <FileText className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                       }
                     </div>
                     <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono text-xs">
                       {dept.question_count} Qs
                     </Badge>
                   </div>
                   <CardTitle className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                     {dept.department_name}
                   </CardTitle>
                   <CardDescription className="line-clamp-1 mt-1">
                     Manage scenario questions for {dept.department_name}
                   </CardDescription>
                 </CardHeader>
               </Card>
             );
           })}
        </div>
      </div>
    );
  }

  // Detail Mode: Question List
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedDept(null); setIsAdding(false); setIsImporting(false); }} className="-ml-2 text-slate-500 hover:text-slate-900">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Overview
           </Button>
           <h2 className="text-2xl font-bold tracking-tight">{selectedDept.department_name} Questions</h2>
           <p className="text-slate-500">Managing {departmentQuestions?.total} questions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isImporting ? 'default' : 'outline'} 
            onClick={() => setIsImporting(!isImporting)}
            className={isImporting ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : ""}
          >
             {isImporting ? <X className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />} 
             {isImporting ? 'Close Import' : 'Import'}
          </Button>
          <Button onClick={() => {
            console.log("here")
            resetForm(); 
            setIsAdding(!isAdding);
            setNewQuestion({...newQuestion, department: selectedDept.department_id})
          }}>
            {isAdding ? <X className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2" />} 
            {isAdding ? 'Close Form' : 'Add Question'}
          </Button>
        </div>
      </div>

      {isImporting && (
          <Card className="border-blue-200 bg-slate-50 mb-6">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
               <div>
                 <CardTitle className="text-lg">Import Questions to {selectedDept?.department_name}</CardTitle>
                 <CardDescription>Upload a file. Questions without a department specified will be assigned to <strong>{selectedDept?.department_name}</strong>.</CardDescription>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={()=>downloadTemplate(departmentsData,skillsData)} className="gap-2">
                   <FileSpreadsheet className="w-4 h-4" /> Download Template
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => setIsImporting(false)} className="text-slate-500 hover:text-red-500">
                    <X className="w-4 h-4" />
                 </Button>
               </div>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col gap-4">
                 <div className="p-8 border-2 border-dashed border-slate-300 rounded-lg bg-white flex flex-col items-center justify-center gap-3 text-center hover:bg-slate-50 transition-colors relative">
                    <Input 
                      type="file" 
                      ref={fileInputRef}
                      accept=".xlsx,.xls,.docx" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                    <div className="bg-blue-100 p-3 rounded-full">
                       <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">Supports .xlsx</p>
                    </div>
                 </div>
  
                 {importStatus && (
                   <div className={`text-sm p-3 rounded-md flex items-center gap-2 ${importStatus.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                      {importStatus.startsWith('Error') ? <AlertCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                      {importStatus}
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
      )}

      {isAdding && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Question' : 'New Question'}</CardTitle>
            <CardDescription>Add or edit a scenario-based question for {selectedDept?.department_name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Skill Category</Label>
                 <Select 
                   onValueChange={(val) => setNewQuestion({...newQuestion, skill_category: val})}
                   value={String(newQuestion.skill_category) || ''}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select Skill..." />
                   </SelectTrigger>
                   <SelectContent>
                     {skillsData?.map(s => <SelectItem key={s._id} value={s._id}>{s.skill_name}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Department</Label>
                 <Select 
                   onValueChange={(val) => setNewQuestion({...newQuestion, department : val})}
                   value={newQuestion.department}
                   disabled={true} 
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
              <Label>Scenario</Label>
              <Textarea 
                placeholder="Describe the workplace situation..."
                value={newQuestion.scenario || ''}
                onChange={(e) => setNewQuestion({...newQuestion, scenario: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Question</Label>
                <Input 
                  placeholder="What should the employee do?"
                  value={newQuestion.question_text || ''}
                  onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                 <Label>Time Limit (Seconds)</Label>
                 <Input 
                   type="number"
                   min="10"
                   max="300"
                   value={newQuestion.time_seconds || 30}
                   onChange={(e) => setNewQuestion({...newQuestion, time_seconds: parseInt(e.target.value) || 30})}
                 />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newQuestion.options?.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input 
                      placeholder={`Option ${idx + 1}`}
                      value={opt.content}
                      onChange={(e) => {
                        const newOpts = [...(newQuestion.options || [])];
                        newOpts[idx].content = e.target.value;
                        setNewQuestion({...newQuestion, options: newOpts});
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant={
                        // Use id if available, otherwise fall back to index
                        newQuestion.correct_option_id
                          ? opt?._id === newQuestion.correct_option_id
                            ? "default"
                            : "outline"
                          : idx === newQuestion.correct_option_index
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {
                        // Set either id (if exists) or index
                        if (opt._id) {
                          setNewQuestion({ ...newQuestion, correct_option_id: opt._id,correct_option_index: idx });
                        } else {
                          setNewQuestion({ ...newQuestion, correct_option_index: idx });
                        }
                      }}
                      className={
                        newQuestion.correct_option_id
                          ? opt._id === newQuestion.correct_option_id
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : ""
                          : idx === newQuestion.correct_option_index
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : ""
                      }
                      title="Mark as Correct"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : editingId ? 'Update Question' : 'Save Question'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {departmentQuestions?.total === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-400">No questions found for {selectedDept?.department_name}.</p>
          </div>
        ) : (
          departmentQuestions?.questions?.map((q) => (
            <Card key={q._id} className="relative group hover:border-slate-300 transition-colors">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(q)} className="text-slate-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(q._id!)} className="text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{(q.skill_category as Skill).skill_name}</Badge>
                  {q.time_seconds && (
                    <Badge variant="outline" className="text-slate-500 font-mono text-[10px] gap-1">
                       <Clock className="w-3 h-3"/> {q.time_seconds}s
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-slate-800 mb-2">{q.scenario}</p>
                <p className="text-sm text-slate-600 mb-4 font-medium">{q.question_text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {q?.options?.map((opt, i) => (
                    <div key={i} className={`p-2 rounded border ${opt._id === q.correct_option_id ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-500 border-transparent'}`}>
                      {opt.content} {opt._id === q.correct_option_id && <span className="text-xs ml-1 font-bold text-emerald-600">(Correct)</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionsModule

const QuestionByDeptSkeleton = ()=>(<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-lg border border-slate-200 p-6 space-y-4"
      >
        <div className="h-10 w-10 bg-slate-200 rounded-lg" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    ))}
  </div>)