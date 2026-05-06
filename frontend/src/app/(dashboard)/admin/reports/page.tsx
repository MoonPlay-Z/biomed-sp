'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus, User, UserRole, InventoryItem, DashboardStats } from '@/types';
import { 
  BarChart3, 
  Download,
  Calendar,
  TrendingUp,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Package,
  FileText,
  Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.RECEIVED]: 'Recibidos',
  [AppointmentStatus.DIAGNOSING]: 'En Diagnóstico',
  [AppointmentStatus.WAITING_PARTS]: 'Esperando Repuestos',
  [AppointmentStatus.FINISHED]: 'Finalizados',
  [AppointmentStatus.DELIVERED]: 'Entregados',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.RECEIVED]: 'bg-slate-500',
  [AppointmentStatus.DIAGNOSING]: 'bg-blue-500',
  [AppointmentStatus.WAITING_PARTS]: 'bg-amber-500',
  [AppointmentStatus.FINISHED]: 'bg-emerald-500',
  [AppointmentStatus.DELIVERED]: 'bg-indigo-500',
};

export default function AdminReports() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportDate] = useState(new Date());

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, aptRes, usersRes, invRes] = await Promise.all([
          fetch(`${apiUrl}/dashboard/stats`, { headers }),
          fetch(`${apiUrl}/appointments`, { headers }),
          fetch(`${apiUrl}/users`, { headers }),
          fetch(`${apiUrl}/inventory`, { headers }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (aptRes.ok) setAppointments(await aptRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (invRes.ok) setInventory(await invRes.json());
      } catch (error) {
        console.error('Error fetching report data', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAll();
  }, [token]);

  const handlePrint = () => window.print();

  const techs = users.filter(u => u.role === UserRole.TECH);
  const clients = users.filter(u => u.role === UserRole.CLIENT);
  const lowStockItems = inventory.filter(i => i.cantidad <= i.cantidad_minima);
  const totalApts = appointments.length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" id="report-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Informe General</h1>
          <p className="text-slate-500 mt-1">
            Generado el {reportDate.toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <Printer size={16} className="mr-2" />
            Imprimir
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium text-sm shadow-sm"
          >
            <Download size={16} className="mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Citas', value: totalApts, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Técnicos', value: techs.length, icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Clientes', value: clients.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Stock Bajo', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={clsx("p-2.5 rounded-xl w-fit mb-3", kpi.bg)}>
              <kpi.icon className={clsx("w-5 h-5", kpi.color)} />
            </div>
            <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Appointments by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <BarChart3 className="mr-2 text-blue-500 w-5 h-5" />
            Distribución por Estado
          </h2>
          <div className="space-y-3">
            {Object.values(AppointmentStatus).map(status => {
              const count = appointments.filter(a => a.status === status).length;
              const pct = totalApts > 0 ? Math.round((count / totalApts) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{STATUS_LABELS[status]}</span>
                    <span className="font-bold text-slate-900">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={clsx("h-full rounded-full", STATUS_COLORS[status])}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <TrendingUp className="mr-2 text-emerald-500 w-5 h-5" />
            Carga por Técnico
          </h2>
          {techs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No hay técnicos registrados.</p>
          ) : (
            <div className="space-y-3">
              {techs.map(tech => {
                const count = appointments.filter(a => a.tech_id === tech.id).length;
                const pct = totalApts > 0 ? Math.round((count / totalApts) * 100) : 0;
                return (
                  <div key={tech.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{tech.nombre}</span>
                      <span className="font-bold text-slate-900">{count} citas</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Critical Items */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
          <Package className="mr-2 text-amber-500 w-5 h-5" />
          Repuestos con Stock Crítico
        </h2>
        {lowStockItems.length === 0 ? (
          <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">Todos los repuestos están dentro de niveles aceptables.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-slate-500 font-semibold">SKU</th>
                  <th className="pb-3 text-slate-500 font-semibold">Repuesto</th>
                  <th className="pb-3 text-slate-500 font-semibold text-right">Existencias</th>
                  <th className="pb-3 text-slate-500 font-semibold text-right">Mínimo</th>
                  <th className="pb-3 text-slate-500 font-semibold text-right">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lowStockItems.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50 transition-colors">
                    <td className="py-3 font-mono text-slate-500 text-xs">{item.sku}</td>
                    <td className="py-3 font-medium text-slate-900">{item.nombre_repuesto}</td>
                    <td className="py-3 text-right font-bold text-amber-600">{item.cantidad}</td>
                    <td className="py-3 text-right text-slate-500">{item.cantidad_minima}</td>
                    <td className="py-3 text-right text-slate-500">{item.proveedor || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Appointments List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
          <FileText className="mr-2 text-blue-500 w-5 h-5" />
          Listado Completo de Citas
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="pb-3 text-slate-500 font-semibold">#ID</th>
                <th className="pb-3 text-slate-500 font-semibold">Cliente</th>
                <th className="pb-3 text-slate-500 font-semibold">Equipo</th>
                <th className="pb-3 text-slate-500 font-semibold">Técnico</th>
                <th className="pb-3 text-slate-500 font-semibold">Estado</th>
                <th className="pb-3 text-slate-500 font-semibold text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-400 font-mono text-xs">#{apt.id}</td>
                  <td className="py-3 font-medium text-slate-900">{apt.client?.nombre || '—'}</td>
                  <td className="py-3 text-slate-600">{apt.equipment?.marca} {apt.equipment?.modelo}</td>
                  <td className="py-3 text-slate-600">{apt.tech?.nombre || <span className="text-amber-500 text-xs">Sin asignar</span>}</td>
                  <td className="py-3">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      STATUS_COLORS[apt.status].replace('bg-', 'bg-opacity-10 bg-').replace('bg-bg-', 'bg-'),
                      apt.status === AppointmentStatus.RECEIVED ? 'bg-slate-100 text-slate-600' :
                      apt.status === AppointmentStatus.DIAGNOSING ? 'bg-blue-100 text-blue-700' :
                      apt.status === AppointmentStatus.WAITING_PARTS ? 'bg-amber-100 text-amber-700' :
                      apt.status === AppointmentStatus.FINISHED ? 'bg-emerald-100 text-emerald-700' :
                      'bg-indigo-100 text-indigo-700'
                    )}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-500 text-xs">{new Date(apt.created_at).toLocaleDateString('es-VE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
