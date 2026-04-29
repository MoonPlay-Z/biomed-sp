import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // En un entorno real, obtendríamos el rol del usuario desde la sesión (ej. NextAuth)
  // Para demostración, usaremos CLIENT por defecto o podríamos simularlo
  const mockUserRole = UserRole.CLIENT; 

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar userRole={mockUserRole} />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
