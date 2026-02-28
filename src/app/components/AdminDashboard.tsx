import React from 'react';

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

  Settings,
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/admin' && location.pathname === '/admin');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-slate-950 text-slate-50 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md shadow-lg shadow-blue-900/50">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">
                Workervet
                <span className="text-slate-500 font-normal">Admin</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavTab
                active={isActive('/admin')}
                onClick={() => navigate('/admin')}
                icon={<LayoutGrid className="w-4 h-4" />}
                label="Dashboard"
              />
              <NavTab
                active={isActive('/admin/users')}
                onClick={() => navigate('/admin/users')}
                icon={<Users className="w-4 h-4" />}
                label="Candidates"
              />
              <NavTab
                active={isActive('/admin/questions')}
                onClick={() => navigate('/admin/questions')}
                icon={<FileText className="w-4 h-4" />}
                label="Questions"
              />
              <NavTab
                active={isActive('/admin/jobs')}
                onClick={() => navigate('/admin/jobs')}
                icon={<Briefcase className="w-4 h-4" />}
                label="Jobs"
              />
              <NavTab
                active={isActive('/admin/settings')}
                onClick={() => navigate('/admin/settings')}
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
              />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-xs text-slate-400">
              Administrator
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden overflow-x-auto flex items-center gap-1 px-4 pb-2 -mt-1 no-scrollbar">
          <MobileNavTab active={isActive('/admin')} onClick={() => navigate('/admin')} label="Dashboard" />
          <MobileNavTab active={isActive('/admin/users')} onClick={() => navigate('/admin/users')} label="Candidates" />
          <MobileNavTab active={isActive('/admin/questions')} onClick={() => navigate('/admin/questions')} label="Question Bank" />
          <MobileNavTab active={isActive('/admin/jobs')} onClick={() => navigate('/admin/jobs')} label="Job Board" />
          <MobileNavTab active={isActive('/admin/settings')} onClick={() => navigate('/admin/settings')} label="Settings" />
        </div>
      </header>

      {/* Routed Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavTab = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-transparent ${
      active 
        ? 'bg-blue-600 text-white shadow-sm border-blue-500/20' 
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
    }`}
  >
    <span className="mr-2 opacity-80">{icon}</span>
    {label}
  </button>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MobileNavTab = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active 
        ? 'bg-blue-600 border-blue-600 text-white' 
        : 'bg-slate-900 border-slate-800 text-slate-400'
    }`}
  >
    {label}
  </button>
);

// --- Modules ---


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



