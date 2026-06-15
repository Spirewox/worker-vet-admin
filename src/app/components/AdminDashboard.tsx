import React, { useState } from 'react';

import { Button } from './ui/button';
import {
  Card,
  CardContent
} from './ui/card';

import {
  Users,
  FileText,
  LogOut,
  Shield,
  Briefcase,
  LayoutGrid,
  UserCog,
  Settings,
  GraduationCap,
  Award,
  Wallet,
  History,
  Menu,
  X,
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  onLogout: () => void;
}

const NAV_ITEMS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
  { path: '/admin/users', label: 'Candidates', icon: <Users className="w-4 h-4" /> },
  { path: '/admin/admins', label: 'Admins', icon: <UserCog className="w-4 h-4" /> },
  { path: '/admin/questions', label: 'Questions', icon: <FileText className="w-4 h-4" /> },
  { path: '/admin/jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
  { path: '/admin/training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
  { path: '/admin/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { path: '/admin/payments', label: 'Payments', icon: <Wallet className="w-4 h-4" /> },
  { path: '/admin/audit', label: 'Audit', icon: <History className="w-4 h-4" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarBody = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-50 w-64">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md shadow-lg shadow-blue-900/50">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Workervet<span className="text-slate-500 font-normal">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => go(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-transparent ${
              isActive(item.path)
                ? 'bg-blue-600 text-white shadow-sm border-blue-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="opacity-80">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div className="px-3 pb-2 text-xs text-slate-500">Administrator</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop sidebar (fixed) */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-200">
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="md:pl-64 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 bg-slate-950 text-slate-50 flex items-center justify-between px-4 sticky top-0 z-20 shadow-md">
          <button onClick={() => setMobileOpen(true)} className="text-slate-300 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">Workervet<span className="text-slate-500 font-normal">Admin</span></span>
          </div>
          <button onClick={onLogout} className="text-slate-300 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Shared stat card (used across modules) ---

export const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, icon, description, trend, trendUp }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
           <p className="text-sm font-medium text-slate-500">{title}</p>
           <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-slate-100 rounded-lg">
           {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
         {description && <p className="text-xs text-slate-400">{description}</p>}
         {trend && (
           <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
             {trend}
           </span>
         )}
      </div>
    </CardContent>
  </Card>
);
