'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#000080] flex items-center justify-center shadow-xl shadow-blue-900/30">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white animate-ping" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <Sidebar userRole={user.role} userName={user.nombre} />

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 flex justify-between items-center shadow-sm">
          {/* Left: System status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wide">Sistema Activo</span>
            </div>
          </div>

          {/* Right: Clock */}
          <ClockDisplay />
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function ClockDisplay() {
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!time) return null;

  const date = time.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const clock = time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex items-center gap-3 text-right">
      <div className="hidden md:block text-right">
        <p className="text-xs text-slate-400 font-medium capitalize">{date}</p>
        <p className="text-lg font-black text-[#000080] tracking-tight leading-tight">{clock}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-[#000080] flex items-center justify-center shadow-md shadow-blue-900/20">
        <Activity className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
