'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  PackageSearch, 
  BarChart3, 
  Wrench, 
  MessageSquare, 
  MonitorSmartphone,
  CalendarPlus,
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { UserRole, RouteItem } from '@/types';
import clsx from 'clsx';

const routes: RouteItem[] = [
  // ADMIN Routes
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, requiredRoles: [UserRole.ADMIN] },
  { label: 'Gestión de Usuarios', href: '/admin/users', icon: Users, requiredRoles: [UserRole.ADMIN] },
  { label: 'Inventario Completo', href: '/admin/inventory', icon: PackageSearch, requiredRoles: [UserRole.ADMIN] },
  { label: 'Informes', href: '/admin/reports', icon: BarChart3, requiredRoles: [UserRole.ADMIN] },
  
  // TECH Routes
  { label: 'Mis Reparaciones Asignadas', href: '/tech/repairs', icon: Wrench, requiredRoles: [UserRole.TECH] },
  { label: 'Inventario de Repuestos', href: '/tech/inventory', icon: PackageSearch, requiredRoles: [UserRole.TECH] },
  { label: 'Chat con Cliente', href: '/tech/chat', icon: MessageSquare, requiredRoles: [UserRole.TECH] },

  // CLIENT Routes
  { label: 'Mis Equipos', href: '/client/equipment', icon: MonitorSmartphone, requiredRoles: [UserRole.CLIENT] },
  { label: 'Estado de Reparación', href: '/client/status', icon: Stethoscope, requiredRoles: [UserRole.CLIENT] },
  { label: 'Nueva Cita', href: '/reception', icon: CalendarPlus, requiredRoles: [UserRole.CLIENT] },
];

export const Sidebar = ({ userRole = UserRole.CLIENT }: { userRole?: UserRole }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const filteredRoutes = routes.filter(route => route.requiredRoles.includes(userRole));

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar container */}
      <aside 
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#000080] text-slate-300 transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-20 bg-slate-900/50 border-b border-slate-700/50">
          <Stethoscope className="w-8 h-8 text-blue-400 mr-2" />
          <h1 className="text-xl font-bold text-white tracking-wider">JaMechanic</h1>
        </div>

        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#878681]">
            Menú Principal ({userRole})
          </div>
          <nav className="flex-1 space-y-2">
            {filteredRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={clsx(
                    "flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group",
                    isActive 
                      ? "bg-white/10 text-white shadow-inner" 
                      : "hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={clsx(
                    "w-5 h-5 mr-3 transition-colors duration-200",
                    isActive ? "text-blue-400" : "text-[#878681] group-hover:text-blue-300"
                  )} />
                  <span className="font-medium text-sm">{route.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-slate-900/30 border-t border-slate-700/50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              {userRole[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Usuario Demo</p>
              <p className="text-xs text-[#878681]">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
