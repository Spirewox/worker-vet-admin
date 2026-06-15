import {useState, useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Eye, EyeOff, Wallet, SlidersHorizontal, UserCog, History } from "lucide-react";
import AdminsModule from "./AdminsModule";
import AuditModule from "./AuditModule";
import { useDepartments, useSkills } from "../../hooks/useSettings";
import { usePricing } from "../../hooks/usePricing";
import { useAssessmentConfig } from "../../hooks/useAssessmentConfig";
import type { Department, Skill } from "../../interface/settings.interface";
import { toast } from "react-toastify";
import { axiosDelete, axiosPatch, axiosPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { CURRENCY_SYMBOL } from "../../lib/format";

const SettingsModule = () => {
    const [tab, setTab] = useState<'general' | 'admins' | 'audit'>('general')
    const {data : departments,refetch : refetchDepartments, isLoading : departmentsLoading} = useDepartments()
    const {data : skills,refetch : refetchskills, isLoading : skillsLoading} = useSkills()
    const {data : pricing, refetch : refetchPricing} = usePricing()
    const { logout } = useAuth();

    // Pricing config
    const [pricingForm, setPricingForm] = useState({ training_price: 0, certificate_price: 0, hardcopy_fee: 0 });
    const [isSubmittingPricing, setIsSubmittingPricing] = useState(false);
    useEffect(() => {
        if (pricing) setPricingForm({
            training_price: pricing.training_price ?? 0,
            certificate_price: pricing.certificate_price ?? 0,
            hardcopy_fee: pricing.hardcopy_fee ?? 0,
        });
    }, [pricing]);

    const handleSavePricing = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingPricing(true);
            await axiosPatch('settings/pricing', pricingForm, true);
            toast.success("Pricing updated");
            refetchPricing();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update pricing");
        } finally {
            setIsSubmittingPricing(false);
        }
    };

    // Assessment configuration
    const {data : assessmentConfig, refetch : refetchAssessmentConfig} = useAssessmentConfig()
    const [configForm, setConfigForm] = useState({ pass_mark: 70, time_limit: 600, max_attempts: 3, retake_cooldown_hours: 24, validity_days: 365 });
    const [isSubmittingConfig, setIsSubmittingConfig] = useState(false);
    useEffect(() => {
        if (assessmentConfig) setConfigForm({
            pass_mark: assessmentConfig.pass_mark ?? 70,
            time_limit: assessmentConfig.time_limit ?? 600,
            max_attempts: assessmentConfig.max_attempts ?? 3,
            retake_cooldown_hours: assessmentConfig.retake_cooldown_hours ?? 24,
            validity_days: assessmentConfig.validity_days ?? 365,
        });
    }, [assessmentConfig]);

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingConfig(true);
            await axiosPatch('settings/assessment-config', configForm, true);
            toast.success("Assessment configuration updated");
            refetchAssessmentConfig();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update configuration");
        } finally {
            setIsSubmittingConfig(false);
        }
    };
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
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h2>
                <p className="text-slate-500 mt-1">Configure departments, skills, admins and platform preferences.</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
                <SettingsTab active={tab === 'general'} onClick={() => setTab('general')} icon={<SlidersHorizontal className="w-4 h-4" />} label="General" />
                <SettingsTab active={tab === 'admins'} onClick={() => setTab('admins')} icon={<UserCog className="w-4 h-4" />} label="Admins" />
                <SettingsTab active={tab === 'audit'} onClick={() => setTab('audit')} icon={<History className="w-4 h-4" />} label="Audit Log" />
            </div>

            {tab === 'admins' ? <AdminsModule /> : tab === 'audit' ? <AuditModule /> : (
            <div className="space-y-8">
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
                    <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-slate-500" /> Pricing</CardTitle>
                    <CardDescription>Set the fees (in {CURRENCY_SYMBOL}) candidates pay for training and certificates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSavePricing} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Training course ({CURRENCY_SYMBOL})</label>
                                <Input type="number" min="0" value={pricingForm.training_price}
                                    onChange={e => setPricingForm(p => ({ ...p, training_price: Number(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Certificate ({CURRENCY_SYMBOL})</label>
                                <Input type="number" min="0" value={pricingForm.certificate_price}
                                    onChange={e => setPricingForm(p => ({ ...p, certificate_price: Number(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Hard-copy fee ({CURRENCY_SYMBOL})</label>
                                <Input type="number" min="0" value={pricingForm.hardcopy_fee}
                                    onChange={e => setPricingForm(p => ({ ...p, hardcopy_fee: Number(e.target.value) }))} className="mt-1" />
                            </div>
                        </div>
                        <Button type="submit" disabled={isSubmittingPricing}>{isSubmittingPricing ? "Saving..." : "Save Pricing"}</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Assessment Rules</CardTitle>
                    <CardDescription>Pass mark, time limit, and retake policy applied to candidate assessments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Pass mark (%)</label>
                                <Input type="number" min="0" max="100" value={configForm.pass_mark}
                                    onChange={e => setConfigForm(p => ({ ...p, pass_mark: Number(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Time limit (sec)</label>
                                <Input type="number" min="0" value={configForm.time_limit}
                                    onChange={e => setConfigForm(p => ({ ...p, time_limit: Number(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Max attempts</label>
                                <Input type="number" min="1" value={configForm.max_attempts}
                                    onChange={e => setConfigForm(p => ({ ...p, max_attempts: Number(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Retake cooldown (hrs)</label>
                                <Input type="number" min="0" value={configForm.retake_cooldown_hours}
                                    onChange={e => setConfigForm(p => ({ ...p, retake_cooldown_hours: Number(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Cert validity (days)</label>
                                <Input type="number" min="0" value={configForm.validity_days}
                                    onChange={e => setConfigForm(p => ({ ...p, validity_days: Number(e.target.value) }))} className="mt-1" />
                            </div>
                        </div>
                        <Button type="submit" disabled={isSubmittingConfig}>{isSubmittingConfig ? "Saving..." : "Save Rules"}</Button>
                    </form>
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
            )}
        </div>
    );
};

export default SettingsModule

const SettingsTab = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
            active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
        }`}
    >
        {icon} {label}
    </button>
)

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
