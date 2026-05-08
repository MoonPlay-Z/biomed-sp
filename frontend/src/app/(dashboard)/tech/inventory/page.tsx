'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InventoryItem, InventoryRequest } from '@/types';
import { getInventory, getRequests, requestPart } from '@/lib/inventoryStore';
import { 
  Package, Search, AlertTriangle, History, ShoppingCart, 
  ChevronRight, Clock, CheckCircle2, X, Plus, Filter,
  ArrowRight, Box, Wrench, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function TechInventory() {
  const { token, user: authUser } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'catalog' | 'my-requests'>('catalog');

  const reloadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [invData, reqData] = await Promise.all([
        getInventory(token),
        getRequests(token)
      ]);
      setItems(invData);
      if (authUser) {
        setRequests(reqData.filter(r => r.tech_id === authUser.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, authUser]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleRequest = async (item: InventoryItem) => {
    if (!token || !authUser) return;
    try {
      await requestPart(token, {
        inventory_id: item.id,
        quantity: 1,
        // appointment_id: 0, // Opcional
      });
      alert(`Solicitud enviada para: ${item.nombre_repuesto}`);
      reloadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter(item => 
    item.nombre_repuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#000080] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-blue-100">
            <Box size={12} /> Almacén Técnico
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Suministros & Repuestos</h1>
          <p className="text-slate-500 mt-2 text-lg">Consulta de stock global y gestión de tus solicitudes personales.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-1 shadow-sm">
          <button onClick={() => setTab('catalog')}
            className={clsx("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              tab === 'catalog' ? "bg-[#000080] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50")}>
            Catálogo Global
          </button>
          <button onClick={() => setTab('my-requests')}
            className={clsx("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
              tab === 'my-requests' ? "bg-[#000080] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-50")}>
            Mis Solicitudes
            {requests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse border-2 border-white"></span>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'catalog' ? (
          <motion.div key="catalog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-premium">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar por nombre, SKU o especificación..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all outline-none"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                <Filter size={18} /> Filtrar Categoría
              </button>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all group relative overflow-hidden">
                  
                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-[#000080] group-hover:text-white transition-all duration-500 shadow-inner">
                        <Package size={28} />
                      </div>
                      <div className={clsx("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                        item.cantidad <= item.cantidad_minima ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                        {item.cantidad <= item.cantidad_minima ? 'Stock Bajo' : 'Disponible'}
                      </div>
                    </div>
                    
                    <h3 className="font-black text-xl text-slate-900 tracking-tight mb-1 group-hover:text-[#000080] transition-colors">{item.nombre_repuesto}</h3>
                    <p className="text-[10px] text-blue-500 font-mono font-black uppercase tracking-widest mb-6">{item.sku}</p>
                    
                    <div className="flex items-end justify-between border-t border-slate-50 pt-6">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Stock Almacén</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{item.cantidad} <span className="text-xs text-slate-400 font-bold uppercase ml-1">UND</span></p>
                      </div>
                      <button 
                        onClick={() => handleRequest(item)}
                        disabled={item.cantidad <= 0}
                        className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          item.cantidad > 0 ? "bg-[#000080] text-white hover:bg-blue-800 shadow-lg shadow-blue-900/20 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
                        <ShoppingCart size={14} />
                        Solicitar
                      </button>
                    </div>
                    
                    {item.cantidad <= item.cantidad_minima && (
                      <div className="mt-6 flex items-center gap-3 text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <AlertTriangle size={16} className="shrink-0" />
                        Reposición necesaria pronto
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="requests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white p-24 text-center rounded-[3rem] border border-dashed border-slate-200 shadow-premium">
                <History className="mx-auto h-20 w-20 text-slate-100 mb-6" />
                <h3 className="text-2xl font-black text-slate-900">Historial Vacío</h3>
                <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">Aún no has solicitado repuestos. Cuando lo hagas, podrás seguir el estado de aprobación aquí.</p>
                <button onClick={() => setTab('catalog')} className="mt-8 px-8 py-4 bg-[#000080] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20">
                   Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                        req.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" : req.status === 'REJECTED' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}>
                        {req.status === 'APPROVED' ? <CheckCircle2 size={28} /> : req.status === 'REJECTED' ? <X size={28} /> : <Clock size={28} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-black text-xl text-slate-900 tracking-tight">{req.inventory?.nombre_repuesto}</h4>
                          <span className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            req.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" : req.status === 'REJECTED' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                            {req.status === 'APPROVED' ? 'Aprobado' : req.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><Box size={14} className="text-blue-500" /> Cant: {req.quantity}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {new Date(req.requested_at).toLocaleDateString()}</span>
                          {req.appointment_id && <span className="flex items-center gap-1.5"><Wrench size={14} className="text-blue-500" /> Ficha: #{req.appointment_id}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl">
                          <Clock size={14} className="animate-spin-slow" /> Esperando Aprobación
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Procesado el</p>
                          <p className="text-sm font-black text-slate-900">{req.resolved_at ? new Date(req.resolved_at).toLocaleDateString() : '---'}</p>
                        </div>
                      )}
                      <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Info Box */}
      <div className="bg-[#000080] rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden group">
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <h3 className="text-3xl font-black tracking-tight mb-4">¿Necesitas algo que no ves en el catálogo?</h3>
            <p className="text-blue-200 text-lg font-medium leading-relaxed">
              Si requieres un repuesto especial o una herramienta específica que no está listada, contacta directamente con el Jefe de Inventario para una orden de compra especial.
            </p>
          </div>
          <button className="px-10 py-5 bg-white text-[#000080] rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all">
            Contactar Almacén
          </button>
        </div>
      </div>
    </div>
  );
}

// Add smooth spin to lucide icons
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(style);
