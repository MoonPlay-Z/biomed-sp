'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus, User, UserRole } from '@/types';
import { 
  Calendar, 
  User as UserIcon, 
  Monitor, 
  Search,
  Filter,
  MoreVertical,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.RECEIVED]: 'bg-slate-100 text-slate-600 border-slate-200',
  [AppointmentStatus.DIAGNOSING]: 'bg-blue-100 text-blue-600 border-blue-200',
  [AppointmentStatus.WAITING_PARTS]: 'bg-amber-100 text-amber-600 border-amber-200',
  [AppointmentStatus.FINISHED]: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  [AppointmentStatus.DELIVERED]: 'bg-indigo-100 text-indigo-600 border-indigo-200',
};

export default function AdminAppointments() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        
        // Fetch Appointments
        const aptRes = await fetch(`${apiUrl}/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch Technicians
        const techRes = await fetch(`${apiUrl}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (aptRes.ok && techRes.ok) {
          const aptData = await aptRes.json();
          const userData = await techRes.json();
          setAppointments(aptData);
          setTechnicians(userData.filter((u: User) => u.role === UserRole.TECH));
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const updateAppointment = async (id: number, data: Partial<Appointment>) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const updatedApt = await res.json();
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, ...data, tech: technicians.find(t => t.id === data.tech_id) || apt.tech } : apt
        ));
      }
    } catch (error) {
      alert('Error al actualizar la cita');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.client?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.equipment?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.equipment?.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || apt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Citas</h1>
          <p className="text-slate-500 mt-1">Supervise, asigne y controle todas las reparaciones activas.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por cliente, marca o serial..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-5 h-5" />
          <select 
            className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            {Object.values(AppointmentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode='popLayout'>
          {filteredAppointments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300"
            >
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No se encontraron citas</h3>
              <p className="text-slate-500 mt-1">Intente ajustar los filtros de búsqueda.</p>
            </motion.div>
          ) : (
            filteredAppointments.map((apt) => (
              <motion.div
                layout
                key={apt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Equipment & Client Info */}
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                        <Monitor size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-900 text-lg">
                            {apt.equipment?.marca} {apt.equipment?.modelo}
                          </h3>
                          <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                            statusColors[apt.status]
                          )}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-600 text-sm flex items-center">
                            <UserIcon size={14} className="mr-2 text-slate-400" /> 
                            <span className="font-medium">{apt.client?.nombre}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-slate-500">{apt.equipment?.serial_number}</span>
                          </p>
                          <p className="text-slate-400 text-xs flex items-center">
                            <Calendar size={14} className="mr-2" /> 
                            Recibido el {new Date(apt.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Assignment & Status Controls */}
                    <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Técnico Asignado</label>
                        <select 
                          className={clsx(
                            "text-sm border rounded-lg px-3 py-2 outline-none transition-all w-48",
                            apt.tech_id ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50 text-amber-700"
                          )}
                          value={apt.tech_id || ''}
                          onChange={(e) => updateAppointment(apt.id, { tech_id: e.target.value ? +e.target.value : undefined })}
                        >
                          <option value="">Sin asignar</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado</label>
                        <select 
                          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none"
                          value={apt.status}
                          onChange={(e) => updateAppointment(apt.id, { status: e.target.value as AppointmentStatus })}
                        >
                          {Object.values(AppointmentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Failure Description */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic border border-slate-100 flex items-start gap-3">
                      <AlertTriangle className="text-amber-500 shrink-0 w-4 h-4 mt-0.5" />
                      "{apt.descripcion_falla}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
