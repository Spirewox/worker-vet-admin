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
  Briefcase,
  LayoutGrid,
  Settings,
  GraduationCap,
  Award,
  Wallet,
  Menu,
  X,
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

interface AdminDashboardProps {
  onLogout: () => void;
}

const NAV_ITEMS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
  { path: '/admin/users', label: 'Candidates', icon: <Users className="w-4 h-4" /> },
  { path: '/admin/questions', label: 'Questions', icon: <FileText className="w-4 h-4" /> },
  { path: '/admin/jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
  { path: '/admin/training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
  { path: '/admin/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { path: '/admin/payments', label: 'Payments', icon: <Wallet className="w-4 h-4" /> },
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
        <Logo markClass="w-7 h-7" textClass="text-base" sub="Admin" />
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden ml-auto text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">Administrator</p>
            <p className="text-[11px] text-slate-400 truncate">Full access</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-slate-500 hover:text-slate-900 mt-1"
        >
          <LogOut className="w-4 h-4" /> Logout
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
        <header className="md:hidden h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200 text-slate-900 flex items-center justify-between px-4 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-slate-500 hover:text-slate-900">
            <Menu className="w-5 h-5" />
          </button>
          <Logo markClass="w-6 h-6" textClass="text-sm" />
          <button onClick={onLogout} className="text-slate-500 hover:text-slate-900">
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
      <div className="flex justify-between items-start gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
           {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">{value}</h3>
      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
         {description && <p className="text-xs text-slate-400">{description}</p>}
         {trend && (
           <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
             {trend}
           </span>
         )}
      </div>
    </CardContent>
  </Card>
);
