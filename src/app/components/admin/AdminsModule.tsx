import { useState } from "react";
import { Mail, Plus, Shield, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useAdmins } from "../../hooks/useCandidates";
import type { AdminUser } from "../../hooks/useCandidates";
import { useAuth } from "../../context/AuthContext";
import { axiosDelete, axiosPost } from "../../lib/api";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const AdminsModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: admins, isLoading } = useAdmins(!!user && user.role === "admin");

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axiosPost("users/admin", form, true);
      toast.success(`Invite sent to ${form.email}. A temporary password has been emailed to them.`);
      setForm({ full_name: "", email: "" });
      setShowInvite(false);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Failed to invite admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Remove admin "${admin.full_name}"? This cannot be undone.`)) return;
    try {
      await axiosDelete(`users/${admin._id}`, true);
      toast.success("Admin removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Failed to remove admin");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Admin Management</h2>
          <p className="text-slate-500 mt-1">
            View and manage administrator accounts. Invite new admins — they receive a temporary password by email.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Invite Admin
        </Button>
      </div>

      {/* Admins Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-slate-500" /> Administrators
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${admins?.length ?? 0} admin${admins?.length !== 1 ? "s" : ""} registered`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : admins?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-xl">
              <Shield className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No administrators found</p>
              <p className="text-sm text-slate-400">Invite the first admin to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins?.map((admin) => (
                <AdminCard
                  key={admin._id}
                  admin={admin}
                  isSelf={admin._id === user?._id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowInvite(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Invite New Admin</h3>
              </div>
              <button
                onClick={() => setShowInvite(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Fill in the details below. A temporary password will be automatically generated and sent to the provided email address.
              </p>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="e.g. jane@company.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowInvite(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!form.full_name || !form.email || isSubmitting}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsModule;

// ─── Admin Card ────────────────────────────────────────────────────────────────

const AdminCard = ({
  admin,
  isSelf,
  onDelete,
}: {
  admin: AdminUser;
  isSelf: boolean;
  onDelete: (a: AdminUser) => void;
}) => (
  <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white group">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-white shadow-sm">
        {admin.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900 text-sm truncate">{admin.full_name}</p>
          {isSelf && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-300 text-blue-600 shrink-0">
              You
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
          <Mail className="w-3 h-3 shrink-0" /> {admin.email}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Joined {new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
    {!isSelf && (
      <button
        onClick={() => onDelete(admin)}
        className="ml-2 text-slate-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        title="Remove admin"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
);
