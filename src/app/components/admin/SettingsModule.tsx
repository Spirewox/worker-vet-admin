import {useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { useDepartments, useSkills } from "../../hooks/useSettings";
import type { Department, Skill } from "../../interface/settings.interface";
import { toast } from "react-toastify";
import { axiosDelete, axiosPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const SettingsModule = () => {
    const {data : departments,refetch : refetchDepartments, isLoading : departmentsLoading} = useDepartments()
    const {data : skills,refetch : refetchskills, isLoading : skillsLoading} = useSkills()
    const { logout } = useAuth();
    const [newDept, setNewDept] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [isSubmittingSkill, setIsSubmittingSkill] = useState(false)
    const [isSubmittingDept, setIsSubmittingDept] = useState(false)

    // Change password state
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, newPwd: false, confirm: false });

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
                await axiosDelete(`departments/${dept._id}`,true)
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

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }
        try {
            setIsSubmittingPassword(true);
            await axiosPost('auth/reset-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            }, true);
            toast.success("Password changed successfully. Please log in again.");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            await logout();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error("An error occurred while changing password");
        } finally {
            setIsSubmittingPassword(false);
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

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password. You will be logged out after a successful change.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div className="relative">
                            <Input
                                type={showPasswords.current ? "text" : "password"}
                                placeholder="Current Password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPasswords.newPwd ? "text" : "password"}
                                placeholder="New Password (min. 8 characters)"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, newPwd: !prev.newPwd }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.newPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPasswords.confirm ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <Button
                            type="submit"
                            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || isSubmittingPassword}
                        >
                            {isSubmittingPassword ? "Updating..." : "Change Password"}
                        </Button>
                    </form>
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
