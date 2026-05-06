'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InventoryItem, InventoryTransaction, InventoryRequest, TransactionType } from '@/types';
import { getInventory, saveInventory, getTransactions, getRequests, saveRequests, approveRequest } from '@/lib/inventoryStore';
import { 
  Package, Search, Plus, AlertTriangle, Edit3, Trash2, Filter,
  CheckCircle2, X, History, DollarSign, TrendingUp, TrendingDown,
  ChevronRight, ArrowUpRight, ArrowDownLeft, Clock, User, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function AdminInventory() {
  const { token } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'inventory' | 'requests' | 'history'>('inventory');

  const reloadData = useCallback(() => {
    setItems(getInventory());
    setTransactions(getTransactions().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setRequests(getRequests().sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
    setLoading(false);
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleApprove = (reqId: string) => {
    approveRequest(reqId, 'Administrador'); // In a real app, use active admin name
    reloadData();
  };

  const handleReject = (reqId: string) => {
    const updated = getRequests().map(r => r.id === reqId ? { ...r, status: 'rejected' as const } : r);
    saveRequests(updated);
    reloadData();
  };

  const filteredItems = items.filter(item => 
    item.nombre_repuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#000080]/10 text-[#000080] text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-[#000080]/10">
            <Package size={12} /> Logística & Stock
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Inventario</h1>
          <p className="text-slate-500 mt-2 text-lg">Control escalable de repuestos, solicitudes técnicas y transacciones.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-6 py-4 bg-[#000080] text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95">
            <Plus size={18} className="mr-2" /> Nuevo Repuesto
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Valor Total', value: `$${items.reduce((acc, i) => acc + (i.cantidad * (i.costo_unitario || 0)), 0).toLocaleString()}`, icon: DollarSign, color: 'blue' },
          { label: 'Ítems en Stock', value: items.reduce((acc, i) => acc + i.cantidad, 0), icon: Package, color: 'emerald' },
          { label: 'Stock Crítico', value: items.filter(i => i.cantidad <= i.cantidad_minima).length, icon: AlertTriangle, color: 'amber' },
          { label: 'Solicitudes', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'indigo' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium flex items-center gap-5 hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] w-fit border border-slate-200">
        {[
          { id: 'inventory', label: 'Inventario de Repuestos', icon: Package },
          { id: 'requests', label: 'Solicitudes Técnicas', icon: Clock, count: requests.filter(r => r.status === 'pending').length },
          { id: 'history', label: 'Historial / Facturación', icon: History },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={clsx("flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
              tab === t.id ? "bg-white text-[#000080] shadow-md" : "text-slate-500 hover:bg-slate-200")}>
            <t.icon size={16} />
            {t.label}
            {t.count ? <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] animate-bounce">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {tab === 'inventory' && (
          <motion.div key="inv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-premium">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar por nombre, SKU o categoría..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all outline-none"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                <Filter size={20} /> Filtros Avanzados
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Repuesto / Identificador</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disponibilidad</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Costo Unitario</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item, index) => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 tracking-tight">{item.nombre_repuesto}</p>
                            <p className="text-[10px] text-blue-500 font-mono font-black uppercase tracking-widest">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={clsx("h-2.5 rounded-full", item.cantidad <= item.cantidad_minima ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${Math.min((item.cantidad / 20) * 100, 100)}%`, minWidth: '4px' }}></div>
                          <span className={clsx("text-sm font-black tracking-tight", item.cantidad <= item.cantidad_minima ? "text-amber-600" : "text-slate-900")}>
                            {item.cantidad} UND
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Min Requerido: {item.cantidad_minima}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-lg font-black text-[#000080] tracking-tighter">${item.costo_unitario?.toFixed(2)}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button className="p-3 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === 'requests' && (
          <motion.div key="req" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 gap-6">
            {requests.length === 0 ? (
              <div className="bg-white p-24 text-center rounded-[3rem] border border-dashed border-slate-200 shadow-premium">
                <Clock className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900">Sin Solicitudes Pendientes</h3>
                <p className="text-slate-500 mt-2 font-medium">Los técnicos no han solicitado repuestos por ahora.</p>
              </div>
            ) : (
              requests.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8 hover:shadow-2xl transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <Package size={28} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{req.itemName}</h3>
                          <span className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", 
                            req.status === 'pending' ? "bg-amber-100 text-amber-600" : req.status === 'approved' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-2"><User size={14} className="text-indigo-500" /> Técnico ID: #{req.techId}</span>
                          <span className="flex items-center gap-2"><FileText size={14} className="text-indigo-500" /> Ficha: #{req.appointmentId}</span>
                          <span className="flex items-center gap-2"><Clock size={14} className="text-indigo-500" /> {new Date(req.requestedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 rounded-2xl flex items-center gap-10">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cant Solicitada</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{req.quantity} Unidades</p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(req.id)}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                            <CheckCircle2 size={14} /> Aprobar
                          </button>
                          <button onClick={() => handleReject(req.id)}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all">
                            <X size={14} /> Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div key="hist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {transactions.length === 0 ? (
                  <div className="bg-white p-24 text-center rounded-[3rem] border border-dashed border-slate-200 shadow-premium">
                    <History className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                    <p className="text-slate-400 font-bold">Sin historial de transacciones.</p>
                  </div>
                ) : (
                  transactions.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-6 hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", 
                            t.type === TransactionType.SALE ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>
                            {t.type === TransactionType.SALE ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-black text-slate-900 tracking-tight">{t.itemName}</h4>
                              <span className={clsx("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest", 
                                t.type === TransactionType.SALE ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>
                                {t.type}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                              <span className="flex items-center gap-1"><User size={10} /> {t.techName}</span>
                              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                              {t.appointmentId && <span className="flex items-center gap-1 font-mono">#{t.appointmentId}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">${t.total.toFixed(2)}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cant: {t.quantity}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Invoicing Summary Widget */}
              <div className="space-y-6">
                <div className="bg-[#000080] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-8 flex items-center gap-2">
                      <DollarSign size={14} /> Facturación del Mes
                    </h4>
                    <div className="space-y-8">
                      <div>
                        <p className="text-5xl font-black tracking-tighter mb-2">
                          ${transactions.reduce((acc, t) => acc + t.total, 0).toLocaleString()}
                        </p>
                        <p className="text-xs font-medium text-blue-200">Total ingresos por venta de repuestos y reparaciones.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">Ventas</p>
                          <p className="text-xl font-black">${transactions.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.total, 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">Reparaciones</p>
                          <p className="text-xl font-black">${transactions.filter(t => t.type === TransactionType.REPAIR_USE).reduce((acc, t) => acc + t.total, 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> Más Vendidos
                  </h4>
                  <div className="space-y-4">
                    {items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400">
                            {i+1}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{item.nombre_repuesto}</span>
                        </div>
                        <span className="text-xs font-black text-[#000080]">24 Vend.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
