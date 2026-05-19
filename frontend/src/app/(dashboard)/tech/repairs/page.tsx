'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus, InventoryItem, InventoryTransaction } from '@/types';
import { getInventory, requestPart, getTransactions } from '@/lib/inventoryStore';
import { 
  Wrench, Calendar, User, Monitor, ChevronRight,
  CheckCircle2, AlertCircle, Crown, Package, Plus,
  FileText, History, DollarSign, X, ArrowRight, ShoppingCart,
  Clock
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.RECEIVED]: 'bg-slate-100 text-slate-600',
  [AppointmentStatus.DIAGNOSING]: 'bg-blue-100 text-blue-600',
  [AppointmentStatus.WAITING_PARTS]: 'bg-amber-100 text-amber-600',
  [AppointmentStatus.FINISHED]: 'bg-emerald-100 text-emerald-600',
  [AppointmentStatus.DELIVERED]: 'bg-indigo-100 text-indigo-600',
};

export default function TechRepairs() {
  const { token, user: authUser } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showFicha, setShowFicha] = useState(false);
  
  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usedParts, setUsedParts] = useState<InventoryTransaction[]>([]);

  const reloadData = useCallback(async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/appointments/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
      const invData = await getInventory(token);
      setInventory(invData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

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
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
        if (selectedApt?.id === id) setSelectedApt(prev => prev ? {...prev, status: newStatus} : null);
      }
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const openFicha = async (apt: Appointment) => {
    if (!token) return;
    setSelectedApt(apt);
    try {
      const transactions = await getTransactions(token, apt.id);
      setUsedParts(transactions);
      setShowFicha(true);
    } catch (err) {
      console.error(err);
      setUsedParts([]);
      setShowFicha(true);
    }
  };

  const handleRequestPart = async (item: InventoryItem) => {
    if (!selectedApt || !authUser || !token) return;
    try {
      await requestPart(token, {
        appointment_id: selectedApt.id,
        inventory_id: item.id,
        quantity: 1,
      });
      alert(`Solicitud enviada para: ${item.nombre_repuesto}. El administrador debe aprobarla para que aparezca en la ficha.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-blue-100">
            <Wrench size={12} /> Centro Técnico
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Reparaciones</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestione el diagnóstico y la asignación de repuestos para equipos médicos.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{appointments.filter(a => a.status === AppointmentStatus.FINISHED).length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completadas</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{appointments.filter(a => a.status === AppointmentStatus.DIAGNOSING).length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">En Proceso</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {appointments.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[3rem] border border-dashed border-slate-200 shadow-premium">
            <Wrench className="mx-auto h-16 w-16 text-slate-200 mb-6" />
            <h3 className="text-2xl font-black text-slate-900">No hay tareas pendientes</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Relájate, por ahora no tienes equipos asignados para reparación.</p>
          </div>
        ) : (
          appointments.map((apt, index) => {
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group overflow-hidden"
              >
                <div className="flex flex-col xl:flex-row xl:items-center p-8 gap-8">
                  {/* Left: Info */}
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Monitor size={36} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight truncate">
                          {apt.equipment?.marca} {apt.equipment?.modelo}
                        </h3>
                        <span className={clsx("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", statusColors[apt.status])}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-2 italic"><User size={14} className="text-blue-500" /> {apt.client?.nombre}</span>
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {new Date(apt.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'long' })}</span>
                        <span className="flex items-center gap-2"><Package size={14} className="text-blue-500" /> SN: {apt.equipment?.serial_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Falla */}
                  <div className="xl:max-w-md w-full">
                    <div className="bg-slate-50/80 backdrop-blur-sm p-5 rounded-[1.5rem] border border-slate-100 relative group/falla">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle size={12} /> Diagnóstico Inicial
                      </p>
                      <p className="text-sm text-slate-700 font-medium italic line-clamp-3 leading-relaxed">
                        "{apt.descripcion_falla}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-3 xl:shrink-0">
                    <button 
                      onClick={() => openFicha(apt)}
                      className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                      <FileText size={16} /> Ficha Técnica
                    </button>
                    
                    {apt.status === AppointmentStatus.RECEIVED && (
                      <button 
                        onClick={() => updateStatus(apt.id, AppointmentStatus.DIAGNOSING)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        Empezar
                      </button>
                    )}
                    
                    {apt.status === AppointmentStatus.DIAGNOSING && (
                      <button 
                        onClick={() => updateStatus(apt.id, AppointmentStatus.FINISHED)}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
                      >
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Ficha de Reparación Modal */}
      <AnimatePresence>
        {showFicha && selectedApt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-900/20">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ficha de Reparación</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">ID: #{selectedApt.id} • {selectedApt.equipment?.marca} {selectedApt.equipment?.modelo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={`/chat?appointmentId=${selectedApt.id}`}
                    target="_blank"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                  >
                    <MessageSquare size={14} /> Chat de Soporte
                  </a>
                  <button onClick={() => setShowFicha(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                    <X size={28} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 bg-gradient-to-br from-white to-slate-50/50">
                
                {/* Left Column: Equipment & Client */}
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">
                      <Monitor size={14} /> Información del Equipo
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase">Marca / Modelo</p>
                        <p className="text-slate-900 font-black text-lg">{selectedApt.equipment?.marca} {selectedApt.equipment?.modelo}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase">Número de Serial</p>
                        <p className="text-slate-900 font-mono font-black">{selectedApt.equipment?.serial_number}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Cliente</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-slate-900 font-black text-sm">{selectedApt.client?.nombre}</p>
                            <p className="text-slate-400 text-xs font-medium truncate">{selectedApt.client?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
                      <DollarSign size={14} /> Resumen de Facturación
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Mano de Obra</span>
                        <span className="text-slate-900 font-black">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Repuestos Utilizados</span>
                        <span className="text-slate-900 font-black">${usedParts.reduce((acc, t) => acc + (t.quantity * Number(t.price_at_time || 0)), 0).toFixed(2)}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                        <span className="text-slate-900 font-black text-xl tracking-tight">TOTAL FINAL</span>
                        <span className="text-3xl font-black text-[#000080] tracking-tighter">${usedParts.reduce((acc, t) => acc + (t.quantity * Number(t.price_at_time || 0)), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column: Used Parts */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <History size={14} /> Repuestos en Factura / Ficha
                      </h4>
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500">
                        {usedParts.length} ÍTEMS
                      </span>
                    </div>
                    
                    <div className="p-8 flex-1">
                      {usedParts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-4 shadow-inner">
                            <ShoppingCart size={40} />
                          </div>
                          <p className="text-slate-400 font-bold text-sm">No se han registrado repuestos aún.</p>
                          <p className="text-slate-300 text-xs mt-1">Usa el selector inferior para solicitar inventario.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {usedParts.map(part => (
                            <div key={part.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                  <Package size={20} />
                                </div>
                                <div>
                                  <p className="text-slate-900 font-black text-sm">{part.inventory?.nombre_repuesto}</p>
                                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cant: {part.quantity} • Unit: ${Number(part.price_at_time || 0).toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-900 font-black text-lg tracking-tighter">${(part.quantity * Number(part.price_at_time || 0)).toFixed(2)}</p>
                                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Procesado</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-8 bg-slate-900">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                        <Plus size={14} className="text-blue-400" /> Solicitar Repuesto del Inventario
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inventory.slice(0, 4).map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleRequestPart(item)}
                            className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left hover:bg-white/10 hover:border-blue-500/30 transition-all group/item"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">{item.sku}</span>
                              <span className="text-[10px] font-black text-slate-500">Stock: {item.cantidad}</span>
                            </div>
                            <h5 className="text-white font-black text-sm mb-4 truncate">{item.nombre_repuesto}</h5>
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 font-black text-lg tracking-tight">${Number(item.costo_unitario).toFixed(2)}</span>
                              <div className="p-2 bg-blue-600 rounded-xl text-white opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
