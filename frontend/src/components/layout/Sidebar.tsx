'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, PackageSearch, BarChart3, Wrench,
  MessageSquare, MonitorSmartphone, CalendarPlus, Menu, X,
  Activity, LogOut, FileText, Tag, Crown, Stethoscope
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole, RouteItem } from '@/types';
import clsx from 'clsx';

const routes: RouteItem[] = [
  // ADMIN
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, requiredRoles: [UserRole.ADMIN] },
  { label: 'Usuarios', href: '/admin/users', icon: Users, requiredRoles: [UserRole.ADMIN] },
  { label: 'Citas', href: '/admin/appointments', icon: CalendarPlus, requiredRoles: [UserRole.ADMIN] },
  { label: 'Inventario', href: '/admin/inventory', icon: PackageSearch, requiredRoles: [UserRole.ADMIN] },
  { label: 'Catálogo & Planes', href: '/admin/catalog', icon: Tag, requiredRoles: [UserRole.ADMIN] },
  { label: 'Informes', href: '/admin/reports', icon: BarChart3, requiredRoles: [UserRole.ADMIN] },
  // TECH
  { label: 'Reparaciones', href: '/tech/repairs', icon: Wrench, requiredRoles: [UserRole.TECH] },
  { label: 'Inventario', href: '/tech/inventory', icon: PackageSearch, requiredRoles: [UserRole.TECH] },
  { label: 'Chat con Cliente', href: '/tech/chat', icon: MessageSquare, requiredRoles: [UserRole.TECH] },
  { label: 'Mi Informe', href: '/tech/reports', icon: FileText, requiredRoles: [UserRole.TECH] },
  // CLIENT
  { label: 'Mis Equipos', href: '/client/equipment', icon: MonitorSmartphone, requiredRoles: [UserRole.CLIENT] },
  { label: 'Estado de Reparación', href: '/client/status', icon: Stethoscope, requiredRoles: [UserRole.CLIENT] },
  { label: 'Planes & Servicios', href: '/client/plans', icon: Crown, requiredRoles: [UserRole.CLIENT] },
  { label: 'Nueva Cita', href: '/reception', icon: CalendarPlus, requiredRoles: [UserRole.CLIENT] },
];

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.TECH]: 'Técnico',
  [UserRole.CLIENT]: 'Cliente',
};

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
}

export const Sidebar = ({ userRole = UserRole.CLIENT, userName }: SidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuth();

  const filteredRoutes = routes.filter(r => r.requiredRoles.includes(userRole));
  const initials = userName ? userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : userRole[0];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#000080] text-white rounded-xl shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-[240px] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
        "bg-[#000d47] border-r border-white/[0.06]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-500/20 border border-blue-400/30 p-1.5 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">JaMechanic</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-5 pb-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ROLE_LABEL[userRole]}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          {filteredRoutes.map(route => {
            const Icon = route.icon;
            const isActive = pathname === route.href || pathname.startsWith(route.href + '/');
            return (
              <Link
                key={route.href}
                href={route.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <Icon className={clsx(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="font-medium truncate">{route.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-black shadow-md shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName || 'Usuario'}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{ROLE_LABEL[userRole]}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
