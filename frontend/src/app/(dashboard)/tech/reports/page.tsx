'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus } from '@/types';
import {
  FileText,
  Wrench,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Calendar,
  User as UserIcon,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.RECEIVED]: 'Recibido',
  [AppointmentStatus.DIAGNOSING]: 'En Diagnóstico',
  [AppointmentStatus.WAITING_PARTS]: 'Esperando Repuestos',
  [AppointmentStatus.FINISHED]: 'Finalizado',
  [AppointmentStatus.DELIVERED]: 'Entregado',
};

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  [AppointmentStatus.RECEIVED]: { bg: 'bg-slate-100', text: 'text-slate-600' },
  [AppointmentStatus.DIAGNOSING]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [AppointmentStatus.WAITING_PARTS]: { bg: 'bg-amber-100', text: 'text-amber-700' },
  [AppointmentStatus.FINISHED]: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  [AppointmentStatus.DELIVERED]: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

export default function TechReports() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportDate] = useState(new Date());

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/appointments/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setAppointments(await res.json());
      } catch (error) {
        console.error('Error fetching tech report data', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMyAppointments();
  }, [token]);

  const handlePrint = () => window.print();

  const completed = appointments.filter(a => [AppointmentStatus.FINISHED, AppointmentStatus.DELIVERED].includes(a.status)).length;
  const inProgress = appointments.filter(a => [AppointmentStatus.DIAGNOSING, AppointmentStatus.WAITING_PARTS].includes(a.status)).length;
  const pending = appointments.filter(a => a.status === AppointmentStatus.RECEIVED).length;
  const completionRate = appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" id="tech-report-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Informe de Rendimiento</h1>
          <p className="text-slate-500 mt-1">
            Técnico: <span className="font-semibold text-slate-700">{user?.nombre}</span> · 
            Generado el {reportDate.toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm"
          >
            <Printer size={16} className="mr-2" /> Imprimir
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-medium text-sm shadow-sm"
          >
            <Download size={16} className="mr-2" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Asignadas', value: appointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En Proceso', value: inProgress, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pendientes', value: pending, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Completadas', value: completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      {/* Completion Rate */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Tasa de Completación</h2>
          <span className="text-3xl font-black text-emerald-600">{completionRate}%</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
          />
        </div>
        <p className="text-slate-500 text-sm mt-3">{completed} de {appointments.length} reparaciones completadas satisfactoriamente.</p>
      </div>

      {/* Detailed Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
          <FileText className="mr-2 text-blue-500 w-5 h-5" />
          Detalle de Reparaciones Asignadas
        </h2>
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No tienes reparaciones asignadas en este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-slate-500 font-semibold">#ID</th>
                  <th className="pb-3 text-slate-500 font-semibold">Cliente</th>
                  <th className="pb-3 text-slate-500 font-semibold">Equipo</th>
                  <th className="pb-3 text-slate-500 font-semibold">Descripción de Falla</th>
                  <th className="pb-3 text-slate-500 font-semibold">Estado</th>
                  <th className="pb-3 text-slate-500 font-semibold text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map(apt => {
                  const sc = STATUS_COLORS[apt.status];
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-slate-400 font-mono text-xs">#{apt.id}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <UserIcon size={12} />
                          </div>
                          <span className="font-medium text-slate-900">{apt.client?.nombre || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-slate-400" />
                          {apt.equipment?.marca} {apt.equipment?.modelo}
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 max-w-[200px] truncate italic">"{apt.descripcion_falla}"</td>
                      <td className="py-3">
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", sc.bg, sc.text)}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-500 text-xs">{new Date(apt.created_at).toLocaleDateString('es-VE')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointments.some(a => a.notas_tecnicas) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
            <AlertCircle className="mr-2 text-amber-500 w-5 h-5" />
            Notas Técnicas Registradas
          </h2>
          <div className="space-y-4">
            {appointments.filter(a => a.notas_tecnicas).map(apt => (
              <div key={apt.id} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-bold text-amber-700 mb-1">Cita #{apt.id} — {apt.equipment?.marca} {apt.equipment?.modelo}</p>
                <p className="text-sm text-slate-700 italic">"{apt.notas_tecnicas}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
