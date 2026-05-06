'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus } from '@/types';
import { 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Package, 
  Truck,
  Monitor,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const statusSteps = [
  { status: AppointmentStatus.RECEIVED, label: 'Recibido', icon: Package, color: 'text-slate-500' },
  { status: AppointmentStatus.DIAGNOSING, label: 'Diagnosticando', icon: Stethoscope, color: 'text-blue-500' },
  { status: AppointmentStatus.WAITING_PARTS, label: 'Esperando Repuestos', icon: Clock, color: 'text-amber-500' },
  { status: AppointmentStatus.FINISHED, label: 'Reparado', icon: CheckCircle2, color: 'text-emerald-500' },
  { status: AppointmentStatus.DELIVERED, label: 'Entregado', icon: Truck, color: 'text-indigo-500' },
];

export default function ClientStatus() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/appointments/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative"
      >
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
          Seguimiento en Vivo
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Estado de mis Equipos</h1>
        <p className="text-slate-500 mt-2 text-lg">Siga en tiempo real el progreso del servicio técnico especializado.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-10">
        {appointments.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2.5rem] border border-dashed border-slate-200 shadow-premium">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Monitor size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No hay equipos activos</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">Cuando registre una nueva solicitud de mantenimiento, el seguimiento aparecerá aquí.</p>
          </div>
        ) : (
          appointments.map((apt, aptIndex) => {
            const currentStepIndex = statusSteps.findIndex(s => s.status === apt.status);
            
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: aptIndex * 0.1, type: 'spring', stiffness: 100 }}
                className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Header with Glass Effect */}
                <div className="glass-effect p-8 border-b border-white/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary p-4 rounded-[1.25rem] shadow-lg shadow-primary/20 text-white animate-float">
                      <Monitor size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-2xl tracking-tight">{apt.equipment?.marca} {apt.equipment?.modelo}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">Serial</span>
                        <span className="font-mono text-slate-700 font-bold text-sm">{apt.equipment?.serial_number}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Técnico</p>
                      <p className="text-slate-900 font-bold">{apt.tech?.nombre || 'Por asignar'}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div className="text-right">
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Ingreso</p>
                      <p className="text-slate-900 font-bold">{new Date(apt.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="p-10 bg-gradient-to-b from-white to-slate-50/30">
                  <div className="relative px-4">
                    {/* Progress Line Background */}
                    <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 hidden md:block rounded-full" />
                    
                    {/* Progress Line Active */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                      className="absolute top-6 left-0 h-1 bg-primary -translate-y-1/2 z-0 hidden md:block transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,128,0.3)]"
                    />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-0">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isActive = index === currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.status} className="flex md:flex-col items-center gap-5 md:gap-4 group">
                            <div className={clsx(
                              "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700",
                              isCompleted 
                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-110" 
                                : "bg-white border-slate-100 text-slate-300 group-hover:border-slate-300"
                            )}>
                              <Icon size={22} className={clsx(isActive && "animate-pulse")} />
                            </div>
                            <div className="text-left md:text-center">
                              <p className={clsx(
                                "text-xs font-black uppercase tracking-wider transition-colors duration-500",
                                isCompleted ? "text-slate-900" : "text-slate-400"
                              )}>
                                {step.label}
                              </p>
                              {isActive && (
                                <motion.span 
                                  layoutId="active-badge"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full mt-1.5"
                                >
                                  <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                                  EN PROCESO
                                </motion.span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Technical Note */}
                  <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start transition-all hover:shadow-md">
                    <div className="bg-primary/5 p-4 rounded-2xl text-primary shrink-0">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
                        Nota Técnica
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {apt.notas_tecnicas || 'Su equipo ha sido recibido correctamente en nuestras instalaciones. Un técnico especializado realizará el diagnóstico inicial para determinar los pasos a seguir.'}
                      </p>
                    </div>
                    <div className="ml-auto shrink-0 pt-1">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                            <Stethoscope size={12} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

