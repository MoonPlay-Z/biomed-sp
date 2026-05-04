'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Users, 
  Package, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  AlertCircle,
  TrendingUp,
  PackageSearch
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats, AppointmentStatus, UserRole } from '@/types';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';


        const res = await fetch(`${apiUrl}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Citas Hoy', 
      value: stats?.appointmentsToday || 0, 
      icon: Clock, 
      color: 'bg-blue-500',
      trend: '+12% vs ayer'
    },
    { 
      label: 'Stock Bajo', 
      value: stats?.lowStockItems || 0, 
      icon: PackageSearch, 
      color: 'bg-amber-500',
      trend: 'Requiere acción'
    },
    { 
      label: 'Técnicos Activos', 
      value: stats?.usersByRole.find(r => r.role === UserRole.TECH)?.count || 0, 
      icon: Wrench, 
      color: 'bg-emerald-500',
      trend: 'Operativo'
    },
    { 
      label: 'Total Clientes', 
      value: stats?.usersByRole.find(r => r.role === UserRole.CLIENT)?.count || 0, 
      icon: Users, 
      color: 'bg-indigo-500',
      trend: 'En crecimiento'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-slate-500 mt-2">Resumen operativo de JaMechanic Electromedicina.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                <card.icon size={24} />
              </div>
              <span className="text-xs font-medium text-slate-400 flex items-center">
                <TrendingUp size={14} className="mr-1 text-emerald-500" />
                {card.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.label}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Status Chart Placeholder/Summary */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Activity className="mr-2 text-blue-500" />
            Estado de Reparaciones
          </h2>
          <div className="space-y-4">
            {stats?.appointmentsByStatus.map((item) => (
              <div key={item.status} className="group">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">{item.status}</span>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / (stats.appointmentsToday || 10)) * 100}%` }}
                    className="bg-blue-600 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
            {(!stats?.appointmentsByStatus || stats.appointmentsByStatus.length === 0) && (
              <p className="text-slate-400 text-center py-8">No hay datos de citas disponibles.</p>
            )}
          </div>
        </div>

        {/* Action Center / Quick Tasks */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl border border-slate-800">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <AlertCircle className="mr-2 text-amber-400" />
            Alertas Críticas
          </h2>
          <div className="space-y-6">
            {stats?.lowStockItems && stats.lowStockItems > 0 ? (
              <div className="flex items-start p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <PackageSearch className="text-amber-400 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-400">Inventario Bajo</h4>
                  <p className="text-xs text-slate-400 mt-1">Hay {stats.lowStockItems} repuestos que requieren reposición inmediata.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="text-emerald-400 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-400">Todo OK</h4>
                  <p className="text-xs text-slate-400 mt-1">Niveles de stock y reparaciones dentro de parámetros normales.</p>
                </div>
              </div>
            )}
            
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors">
              Generar Reporte Semanal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
