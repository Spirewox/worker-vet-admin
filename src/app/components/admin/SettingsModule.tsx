import {useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useDepartments, useSkills } from "../../hooks/useSettings";
import type { Department, Skill } from "../../interface/settings.interface";
import { toast } from "react-toastify";
import { axiosDelete, axiosPost } from "../../lib/api";

const SettingsModule = () => {
    const {data : departments,refetch : refetchDepartments, isLoading : departmentsLoading} = useDepartments()
    const {data : skills,refetch : refetchskills, isLoading : skillsLoading} = useSkills()
    const [newDept, setNewDept] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [isSubmittingSkill, setIsSubmittingSkill] = useState(false)
    const [isSubmittingDept, setIsSubmittingDept] = useState(false)

    const handleAddSkill = async(e: React.FormEvent) => {
        try {
            e.preventDefault();
            setIsSubmittingSkill(true)
            await axiosPost('skills',{skill_name : newSkill},true)
            toast.success("Skill added successfully")
            setNewSkill("")
            refetchskills()
        } catch (error) {
            if(error instanceof Error)
            toast.error(error.message)

            else toast.error("An error occurred while adding skill")
        }finally{
            setIsSubmittingSkill(false)
        }
        
    };

    const handleDeleteSkill = async(skill: Skill) => {
        try {
            setIsSubmittingSkill(true)
            if (!confirm(`Delete skill "${skill.skill_name}"?`)) return;
            await axiosDelete(`skills/${skill._id}`,true)
            toast.success("Skill deleted successfully")
            refetchskills()
        } catch (error) {
            if(error instanceof Error)
            toast.error(error.message)
            else toast.error("An error occurred while deleting skill")
        }finally{
            setIsSubmittingSkill(false)
        }
        
        
    };

    const handleAddDept = async(e: React.FormEvent) => {
        try {
            e.preventDefault();
            setIsSubmittingDept(true)
            await axiosPost('departments',{department_name : newDept},true)
            toast.success("Department added successfully")
            refetchDepartments()
            setNewDept("")
        } catch (error) {
            if(error instanceof Error)
            toast.error(error.message)
            else toast.error("An error occurred while adding department")
        }finally{
            setIsSubmittingDept(false)
        }
        
        
    };

    const handleDeleteDept = async(dept: Department) => {
        try {
            setIsSubmittingDept(true)
           if (confirm(`Delete department "${dept.department_name}"? This may affect existing job postings.`)) {
                await axiosDelete(`skills/${dept._id}`,true)
                toast.success("Department deleted successfully")
                refetchDepartments()
            } 
        } catch (error) {
            if(error instanceof Error)
            toast.error(error.message)
            else toast.error("An error occurred while deleting department")
        }finally{
            setIsSubmittingDept(false)
        }
        
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h2>
                <p className="text-slate-500 mt-1">Configure departments,skills and platform preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>Manage the list of departments available for assessments and job postings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleAddDept} className="flex gap-2">
                        <Input 
                            placeholder="New Department Name" 
                            value={newDept} 
                            onChange={e => setNewDept(e.target.value)}
                            className="max-w-md"
                        />
                        <Button type="submit" disabled={!newDept || isSubmittingDept}>{isSubmittingDept ? "Submitting" : "Add Department"}</Button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {
                            departmentsLoading ? <GridSkeleton/> : departments?.length === 0 ? 
                            (
                                <EmptyState text="No departments yet. Add your first department." />
                            ) :
                        departments?.map(dept => (
                            <div key={dept._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="font-medium text-slate-700">{dept.department_name}</span>
                                <button 
                                    onClick={() => handleDeleteDept(dept)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                    Manage skills used in candidate assessments and job requirements.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <form onSubmit={handleAddSkill} className="flex gap-2">
                    <Input
                    placeholder="New Skill"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    className="max-w-md"
                    />
                    <Button type="submit" disabled={!newSkill || isSubmittingSkill}>
                    {isSubmittingSkill ? "Submitting skill" : "Add Skill"}
                    </Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {
                    skillsLoading ? <GridSkeleton/> : skills?.length === 0 ? 
                    (
                        <EmptyState text="No departments yet. Add your first department." />
                    ) :
                    skills?.map(skill => (
                    <div
                        key={skill._id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                        <span className="font-medium text-slate-700">{skill.skill_name}</span>
                        <button
                        onClick={() => handleDeleteSkill(skill)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsModule

export const EmptyState = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center h-24 text-sm text-slate-500 border border-dashed rounded-lg">
    {text}
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-12 rounded-lg bg-slate-200 animate-pulse"
      />
    ))}
  </div>
);
