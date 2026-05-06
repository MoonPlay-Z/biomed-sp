'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole } from '@/types';
import {
  SubscriptionRequest, getSubscriptions, approveSubscription,
  rejectSubscription, PlanDefinition, getPlans, addOrUpdatePlan, deletePlan
} from '@/lib/subscriptionStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Star, Tag, Shield, Zap, X,
  CheckCircle2, ToggleLeft, ToggleRight, Clock,
  Users, AlertCircle, Crown, Percent, Calendar
} from 'lucide-react';
import clsx from 'clsx';

type PlanTier = 'basic' | 'professional' | 'enterprise';
type Category = 'subscription' | 'service';

const TIER = {
  basic:        { label: 'Básico',      color: 'text-slate-600',  gradient: 'from-slate-500 to-slate-700',   icon: Shield },
  professional: { label: 'Profesional', color: 'text-blue-600',   gradient: 'from-blue-500 to-blue-700',     icon: Zap   },
  enterprise:   { label: 'Empresarial', color: 'text-amber-600',  gradient: 'from-amber-500 to-orange-600',  icon: Star  },
};

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled:'bg-slate-100 text-slate-500',
};

const EMPTY: Omit<PlanDefinition, 'id'> = {
  name:'', tier:'basic', category:'subscription', price:0, duration:1, description:'', features:[], active:true, isPromotion: false
};

export default function AdminCatalog() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [techs, setTechs] = useState<User[]>([]);
  const [tab, setTab] = useState<'catalog' | 'requests'>('catalog');
  const [catFilter, setCatFilter] = useState<'all'|Category>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PlanDefinition|null>(null);
  const [form, setForm] = useState<Omit<PlanDefinition,'id'>>(EMPTY);
  const [feat, setFeat] = useState('');
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [assignTech, setAssignTech] = useState<Record<string,number>>({});

  const reload = useCallback(() => {
    setPlans(getPlans());
    setRequests(getSubscriptions().sort((a,b)=>
      new Date(b.requestedAt).getTime()-new Date(a.requestedAt).getTime()));
  }, []);

  useEffect(() => {
    reload();
    const fetchTechs = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL||'/api'}/users`, {
          headers:{'Authorization':`Bearer ${token}`}
        });
        if (res.ok) {
          const all: User[] = await res.json();
          setTechs(all.filter(u => u.role === UserRole.TECH));
        }
      } catch (err) { console.error(err); }
    };
    fetchTechs();
  }, [token, reload]);

  const filtered = plans.filter(p => catFilter==='all'||p.category===catFilter);
  const pendingCount = requests.filter(r=>r.status==='pending').length;

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFeat(''); setShowModal(true); };
  const openEdit = (p: PlanDefinition) => {
    setEditing(p); const {id,...rest}=p; setForm(rest); setFeat(''); setShowModal(true);
  };
  
  const save = () => {
    if (!form.name.trim()) return;
    const newPlan: PlanDefinition = {
      ...form,
      id: editing ? editing.id : `plan_${Date.now()}`
    };
    addOrUpdatePlan(newPlan);
    setShowModal(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este plan?')) {
      deletePlan(id);
      reload();
    }
  };

  const toggleActive = (p: PlanDefinition) => {
    addOrUpdatePlan({...p, active: !p.active});
    reload();
  };

  const addFeat = () => { if(!feat.trim())return; setForm(f=>({...f,features:[...f.features,feat.trim()]})); setFeat(''); };
  const removeFeat = (i:number) => setForm(f=>({...f,features:f.features.filter((_,idx)=>idx!==i)}));

  const handleApprove = (id: string) => {
    const techId = assignTech[id];
    const tech = techs.find(t=>t.id===techId);
    approveSubscription(id, techId, tech?.nombre);
    reload();
  };
  
  const handleReject = () => {
    if (!rejectId) return;
    rejectSubscription(rejectId, rejectNote);
    setRejectId(null); setRejectNote('');
    reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catálogo & Planes</h1>
          <p className="text-slate-500 mt-1">Configura promociones, servicios y gestiona suscripciones.</p>
        </div>
        {tab==='catalog' && (
          <button onClick={openCreate}
            className="flex items-center px-6 py-3 bg-[#000080] text-white rounded-2xl hover:bg-blue-800 font-bold text-sm shadow-xl shadow-blue-900/20 transition-all">
            <Plus size={18} className="mr-2"/> Nuevo Plan / Promo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        {([['catalog','Gestión Catálogo'],['requests','Solicitudes Pendientes']] as const).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={clsx("px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative",
              tab===k?"bg-white text-[#000080] shadow-md":"text-slate-500 hover:text-slate-700 hover:bg-slate-200")}>
            {l}
            {k==='requests' && pendingCount>0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-black animate-bounce shadow-md">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CATALOG TAB */}
      {tab==='catalog' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
              {([['all','Todos'],['subscription','Suscripciones'],['service','Servicios']] as const).map(([k,l])=>(
                <button key={k} onClick={()=>setCatFilter(k)}
                  className={clsx("px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    catFilter===k?"bg-[#000080] text-white shadow-sm":"text-slate-500 hover:bg-slate-50")}>
                  {l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Percent size={14} className="text-amber-500"/> Promociones Activas: {plans.filter(p=>p.isPromotion).length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map(plan=>{
                const t = TIER[plan.tier as PlanTier];
                const TIcon = t.icon;
                return (
                  <motion.div key={plan.id} layout initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.9}}
                    className={clsx("bg-white rounded-[2rem] border-2 overflow-hidden shadow-sm hover:shadow-2xl transition-all relative group",
                      !plan.active?"opacity-50 border-slate-200":"border-transparent",
                      plan.isPromotion && plan.active ? "ring-2 ring-amber-400/50 ring-offset-2" : "")}>
                    
                    <div className={clsx("h-2 bg-gradient-to-r",t.gradient)}/>
                    
                    {plan.badge && (
                      <span className={clsx("absolute top-6 right-6 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white shadow-lg z-10 bg-gradient-to-r",t.gradient)}>
                        {plan.badge}
                      </span>
                    )}

                    <div className="p-8">
                      <div className="flex items-start gap-4 mb-5">
                        <div className={clsx("p-3 rounded-2xl bg-slate-50 shadow-inner",t.color)}><TIcon size={24}/></div>
                        <div>
                          <p className={clsx("text-[10px] font-black uppercase tracking-[0.2em]",t.color)}>{t.label} · {plan.category==='subscription'?'Suscripción':'Servicio'}</p>
                          <h3 className="font-black text-xl text-slate-900 tracking-tight">{plan.name}</h3>
                        </div>
                      </div>

                      <div className="mb-6 flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className={clsx("text-4xl font-black text-slate-900 tracking-tighter", plan.discountPrice ? "text-slate-400 line-through text-2xl" : "")}>
                            ${plan.price}
                          </span>
                          {plan.discountPrice && (
                            <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                              ${plan.discountPrice}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-bold ml-1 uppercase">
                            {plan.category==='subscription' ? `/${plan.duration === 1 ? 'Mes' : plan.duration+' Meses'}` : '/Servicio'}
                          </span>
                        </div>
                        {plan.isPromotion && (
                          <div className="mt-2 flex items-center gap-1.5 text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            <Percent size={10}/> ¡Precio Especial!
                          </div>
                        )}
                      </div>

                      <p className="text-slate-500 text-sm mb-6 font-medium line-clamp-2">{plan.description}</p>

                      <ul className="space-y-2 mb-8">
                        {plan.features.slice(0, 4).map((f,i)=>(
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-semibold group/f">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1 transition-transform group-hover/f:scale-125"/>
                            {f}
                          </li>
                        ))}
                        {plan.features.length > 4 && <li className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-6">+{plan.features.length - 4} más...</li>}
                      </ul>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <button onClick={()=>toggleActive(plan)}
                          className={clsx("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            plan.active?"text-emerald-600":"text-slate-400")}>
                          {plan.active?<ToggleRight size={22}/>:<ToggleLeft size={22}/>}
                          {plan.active?'Activo':'Inactivo'}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={()=>openEdit(plan)} className="p-2.5 text-slate-400 hover:text-[#000080] hover:bg-blue-50 rounded-xl transition-all"><Pencil size={18}/></button>
                          <button onClick={()=>handleDelete(plan.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* REQUESTS TAB */}
      {tab==='requests' && (
        <div className="space-y-6">
          {requests.length===0 ? (
            <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-24 text-center shadow-premium">
              <Users className="mx-auto w-12 h-12 text-slate-200 mb-4"/>
              <h3 className="text-xl font-bold text-slate-900">Sin Solicitudes</h3>
              <p className="text-slate-400 font-medium">Las peticiones de planes de los clientes aparecerán aquí.</p>
            </div>
          ) : requests.map(req=>{
            const sc = STATUS_STYLE[req.status];
            return (
              <motion.div key={req.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-8 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-[#000080] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/20"><Crown size={28}/></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="font-black text-xl text-slate-900 tracking-tight">{req.clientName}</h3>
                        <span className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",sc)}>{req.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-medium mb-3">
                        <span className="flex items-center gap-1.5 font-mono text-xs">{req.clientEmail}</span>
                        <span className="flex items-center gap-1.5 text-xs"><Calendar size={12}/> Solicitado: {new Date(req.requestedAt).toLocaleDateString('es-VE')}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Solicitado</p>
                          <p className="font-bold text-blue-800">{req.plan.name} — ${req.plan.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración</p>
                          <p className="font-bold text-slate-700">{req.plan.duration > 0 ? req.plan.duration + ' Meses' : 'Evento Único'}</p>
                        </div>
                      </div>
                      {req.assignedTechName && (
                        <div className="mt-3 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100 w-fit">
                          <Users size={14}/> Técnico: {req.assignedTechName}
                        </div>
                      )}
                      {req.techNote && <p className="mt-2 text-xs text-red-500 font-medium italic bg-red-50 p-2 rounded-lg border border-red-100">Motivo rechazo: {req.techNote}</p>}
                    </div>
                  </div>

                  {req.status==='pending' && (
                    <div className="flex flex-col sm:flex-row gap-4 lg:shrink-0 bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Técnico Responsable</label>
                        <select
                          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#000080] min-w-[200px] shadow-sm bg-white"
                          value={assignTech[req.id]||''}
                          onChange={e=>setAssignTech(prev=>({...prev,[req.id]:+e.target.value}))}>
                          <option value="">Seleccionar técnico...</option>
                          {techs.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 items-end">
                        <button onClick={()=>handleApprove(req.id)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">
                          <CheckCircle2 size={16}/> Aprobar
                        </button>
                        <button onClick={()=>setRejectId(req.id)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all">
                          <X size={16}/> Rechazar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Plan Edit/Create Modal — FULL REDESIGN */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md">
            <motion.div initial={{scale:.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:.95, opacity:0, y:20}}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#000080] rounded-xl text-white shadow-lg"><Tag size={20}/></div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editing?'Configurar Plan':'Nuevo Plan Estratégico'}</h2>
                </div>
                <button onClick={()=>setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={24}/></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nombre Comercial</label>
                    <input className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all"
                      value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ej. Membresía Hospitalaria Gold"/>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Categoría</label>
                    <select className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all bg-white"
                      value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value as Category}))}>
                      <option value="subscription">Suscripción Periódica</option>
                      <option value="service">Servicio Bajo Demanda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nivel de Cobertura</label>
                    <select className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all bg-white"
                      value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value as PlanTier}))}>
                      <option value="basic">Básico / Essential</option>
                      <option value="professional">Profesional / Pro</option>
                      <option value="enterprise">Empresarial / Elite</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-800">Estrategia de Precios & Tiempo</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Precio Base ($)</label>
                        <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-900"
                          value={form.price} onChange={e=>setForm(f=>({...f,price:+e.target.value}))}/>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Precio Oferta ($)</label>
                        <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-600"
                          value={form.discountPrice||0} onChange={e=>setForm(f=>({...f,discountPrice:+e.target.value||undefined}))}/>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Duración (Meses)</label>
                        <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-900 bg-white"
                          value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))}>
                          <option value={0}>Evento Único</option>
                          <option value={1}>1 Mes</option>
                          <option value={3}>3 Meses (Trimestre)</option>
                          <option value={6}>6 Meses (Semestre)</option>
                          <option value={12}>12 Meses (Año)</option>
                          <option value={24}>24 Meses (Bienio)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <input type="checkbox" id="ispromo" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={form.isPromotion} onChange={e=>setForm(f=>({...f,isPromotion:e.target.checked}))}/>
                      <label htmlFor="ispromo" className="text-sm font-bold text-slate-700 cursor-pointer">Marcar como Promoción Activa (Etiqueta de Oferta)</label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Badge Visual / Etiqueta</label>
                    <input className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all"
                      value={form.badge||''} onChange={e=>setForm(f=>({...f,badge:e.target.value}))} placeholder="Ej. Hot Sale, Mejor Valor, Nuevo..."/>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Descripción Estratégica</label>
                    <textarea rows={3} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 font-medium text-slate-600 resize-none"
                      value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe los beneficios principales..."/>
                  </div>

                  <div className="md:col-span-2 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Listado de Características</label>
                    <div className="flex gap-3 mb-6">
                      <div className="relative flex-1">
                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <input className="w-full border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-sm"
                          value={feat} onChange={e=>setFeat(e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addFeat())} placeholder="Agregue un beneficio del plan..."/>
                      </div>
                      <button onClick={addFeat} className="px-6 py-3 bg-[#000080] text-white rounded-2xl hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all">
                        <Plus size={20}/>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.features.map((f,i)=>(
                        <motion.div initial={{scale:.9, opacity:0}} animate={{scale:1, opacity:1}} key={i} className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm group">
                          <span className="text-sm font-semibold text-slate-700 truncate">{f}</span>
                          <button onClick={()=>removeFeat(i)} className="text-slate-300 hover:text-red-500 p-1 group-hover:scale-110 transition-all"><X size={16}/></button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex gap-4 justify-end bg-slate-50/50 shrink-0">
                <button onClick={()=>setShowModal(false)} className="px-6 py-3 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-200 transition-all">Cerrar</button>
                <button onClick={save} className="px-10 py-3 bg-[#000080] text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/20 hover:scale-[1.05] active:scale-[0.95] transition-all">
                  {editing?'Actualizar Plan':'Publicar Plan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectId && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
            <motion.div initial={{scale:.9, y:20}} animate={{scale:1, y:0}} exit={{scale:.9, y:20}}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle className="w-10 h-10 text-red-500 animate-pulse"/>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Rechazar Solicitud</h3>
              <p className="text-slate-500 mb-6 font-medium">Por favor, indica el motivo para notificar al cliente.</p>
              <textarea rows={3} placeholder="Motivo técnico o administrativo..."
                className="w-full border border-slate-200 rounded-[1.5rem] px-5 py-4 outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-600 resize-none text-sm mb-6 transition-all"
                value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
              <div className="flex gap-4">
                <button onClick={()=>setRejectId(null)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={handleReject} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all">Confirmar Rechazo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
