'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus } from '@/types';
import { 
  Wrench, 
  Calendar, 
  User, 
  Monitor, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.RECEIVED]: 'bg-slate-100 text-slate-600',
  [AppointmentStatus.DIAGNOSING]: 'bg-blue-100 text-blue-600',
  [AppointmentStatus.WAITING_PARTS]: 'bg-amber-100 text-amber-600',
  [AppointmentStatus.FINISHED]: 'bg-emerald-100 text-emerald-600',
  [AppointmentStatus.DELIVERED]: 'bg-indigo-100 text-indigo-600',
};

export default function TechRepairs() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';


        const res = await fetch(`${apiUrl}/appointments/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error('Failed to fetch appointments', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyAppointments();
  }, [token]);

  const updateStatus = async (id: number, newStatus: AppointmentStatus) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';


      const res = await fetch(`${apiUrl}/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status: newStatus } : apt
        ));
      }
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis Reparaciones</h1>
        <p className="text-slate-500 mt-2">Equipos asignados para diagnóstico y mantenimiento.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <Wrench className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No hay reparaciones asignadas</h3>
            <p className="text-slate-500 mt-1">Cuando se te asigne un equipo, aparecerá aquí.</p>
          </div>
        ) : (
          appointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <Monitor size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-lg">
                      {apt.equipment?.marca} {apt.equipment?.modelo}
                    </h3>
                    <span className={clsx("px-2 py-0.5 rounded text-xs font-bold uppercase", statusColors[apt.status])}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm flex items-center mt-1">
                    <User size={14} className="mr-1" /> {apt.client?.nombre} 
                    <span className="mx-2">•</span>
                    <Calendar size={14} className="mr-1" /> {new Date(apt.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <p className="text-sm text-slate-600 line-clamp-2 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                  "{apt.descripcion_falla}"
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {apt.status === AppointmentStatus.RECEIVED && (
                  <button 
                    onClick={() => updateStatus(apt.id, AppointmentStatus.DIAGNOSING)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors"
                  >
                    Empezar Diagnóstico
                  </button>
                )}
                {apt.status === AppointmentStatus.DIAGNOSING && (
                  <button 
                    onClick={() => updateStatus(apt.id, AppointmentStatus.FINISHED)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors"
                  >
                    Marcar como Listo
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
