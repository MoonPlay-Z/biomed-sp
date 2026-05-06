'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  PlanDefinition, SubscriptionRequest, INITIAL_PLANS,
  getSubscriptions, requestPlan, getClientActivePlan, getClientPendingPlan, getPlans
} from '@/lib/subscriptionStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, Star, CheckCircle2, Clock, X, ArrowRight,
  Crown, AlertCircle, RotateCcw, Tag, Activity
} from 'lucide-react';
import clsx from 'clsx';

const TIER_CONFIG = {
  basic: {
    label: 'Básico', icon: Shield,
    cardBorder: 'border-slate-200', headerBg: 'bg-gradient-to-br from-slate-700 to-slate-900',
    badge: 'bg-slate-100 text-slate-700', btnBg: 'bg-slate-800 hover:bg-slate-700',
    accentText: 'text-slate-700',
  },
  professional: {
    label: 'Profesional', icon: Zap,
    cardBorder: 'border-blue-200', headerBg: 'bg-gradient-to-br from-blue-600 to-blue-900',
    badge: 'bg-blue-100 text-blue-700', btnBg: 'bg-blue-700 hover:bg-blue-600',
    accentText: 'text-blue-700',
  },
  enterprise: {
    label: 'Empresarial', icon: Star,
    cardBorder: 'border-amber-200', headerBg: 'bg-gradient-to-br from-amber-500 to-orange-700',
    badge: 'bg-amber-100 text-amber-700', btnBg: 'bg-amber-600 hover:bg-amber-500',
    accentText: 'text-amber-700',
  },
};

const STATUS_CONFIG: Record<SubscriptionRequest['status'], { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'En revisión',  color: 'bg-amber-100 text-amber-700',   icon: Clock },
  approved:  { label: 'Activo',       color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected:  { label: 'Rechazado',    color: 'bg-red-100 text-red-700',        icon: X },
  cancelled: { label: 'Cancelado',    color: 'bg-slate-100 text-slate-500',    icon: RotateCcw },
};

export default function ClientPlans() {
  const { user } = useAuth();
  const [plans, setPlans]  = useState<PlanDefinition[]>([]);
  const [activePlan,  setActivePlan]  = useState<SubscriptionRequest | null>(null);
  const [pendingPlan, setPendingPlan] = useState<SubscriptionRequest | null>(null);

  useEffect(() => {
    setPlans(getPlans().filter(p => p.active));
  }, []);
  const [myHistory,   setMyHistory]   = useState<SubscriptionRequest[]>([]);
  const [confirming,  setConfirming]  = useState<PlanDefinition | null>(null);
  const [submitted,   setSubmitted]   = useState(false);

  const reload = () => {
    if (!user) return;
    setActivePlan(getClientActivePlan(user.id));
    setPendingPlan(getClientPendingPlan(user.id));
    setMyHistory(
      getSubscriptions()
        .filter(s => s.clientId === user.id)
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    );
  };

  useEffect(() => { reload(); }, [user]);

  const handleRequest = (plan: PlanDefinition) => {
    if (!user) return;
    requestPlan(user.id, user.nombre, user.email, plan);
    setConfirming(null);
    setSubmitted(true);
    reload();
    setTimeout(() => setSubmitted(false), 3000);
  };

  const subscriptions = plans.filter(p => p.category === 'subscription');
  const services      = plans.filter(p => p.category === 'service');

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-24 px-4">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
          <Activity className="w-3 h-3" /> Membresías & Servicios
        </span>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Eleve la Gestión de su <br />
          <span className="text-primary italic">Equipamiento Médico</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Planes diseñados para garantizar la operatividad continua de su institución de salud.
        </p>
      </motion.div>

      {/* Success Toast with Glass Effect */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 glass-effect border border-emerald-200/50 text-emerald-900 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm">Solicitud Enviada</p>
              <p className="text-xs opacity-80">Un asesor técnico le contactará en breve.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Status Banner */}
      {(activePlan || pendingPlan) && (() => {
        const current = activePlan || pendingPlan!;
        const sc = STATUS_CONFIG[current.status];
        const Icon = sc.icon;
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect border border-white/50 rounded-[3rem] p-10 shadow-glass overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className={clsx(
                  "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl animate-float",
                  activePlan ? 'bg-primary text-white shadow-primary/20' : 'bg-amber-100 text-amber-600 shadow-amber-500/10'
                )}>
                  <Crown size={40} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Actual de Membresía</span>
                    <span className={clsx("flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", sc.color)}>
                      <Icon size={12} /> {sc.label}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{current.plan.name}</h2>
                  <p className="text-slate-500 font-bold mt-1 text-lg">
                    Inversión: ${current.plan.price} <span className="text-sm font-medium opacity-60">/{current.plan.category === 'subscription' ? 'mensual' : 'evento'}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {pendingPlan && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Fecha Solicitud</p>
                    <p className="font-bold text-slate-900">{new Date(pendingPlan.requestedAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'long' })}</p>
                  </div>
                )}
                <div className="w-px h-12 bg-slate-200 hidden lg:block" />
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  Descargar Contrato
                </button>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Subscription Grid */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
            <Crown className="w-4 h-4 text-primary" /> Membresías Anuales
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {subscriptions.map((plan, i) => {
            const tier = TIER_CONFIG[plan.tier];
            const Icon = tier.icon;
            const isActive = activePlan?.plan.id === plan.id;
            const isPending = pendingPlan?.plan.id === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: 'spring' }}
                className={clsx(
                  "rounded-[3rem] border transition-all duration-500 flex flex-col relative group overflow-hidden",
                  isActive ? 'border-primary shadow-2xl scale-105 z-10' :
                  isPending ? 'border-amber-300 shadow-xl opacity-90' :
                  'border-slate-100 hover:border-primary/30 hover:shadow-2xl shadow-premium bg-white'
                )}
              >
                {/* Visual Header */}
                <div className={clsx("p-10 text-white relative", tier.headerBg)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  
                  {plan.badge && (
                    <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
                      {plan.badge}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                      <Icon size={24} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest opacity-80">{tier.label}</span>
                  </div>
                  
                  <h3 className="text-3xl font-black tracking-tight">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                    <span className="text-lg opacity-60">/mes</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-10 flex-1 flex flex-col bg-white">
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-semibold group/item">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors">
                          <CheckCircle2 size={12} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <div className="w-full py-5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-3xl text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Plan Actualmente Activo
                    </div>
                  ) : isPending ? (
                    <div className="w-full py-5 bg-amber-50 border border-amber-200 text-amber-700 rounded-3xl text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                      <Clock size={16} className="animate-spin-slow" /> Verificando Solicitud
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirming(plan)}
                      className={clsx(
                        "w-full py-5 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3",
                        tier.btnBg
                      )}
                    >
                      Elevar a este Plan <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Services Section with Cards */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
            <Tag className="w-4 h-4 text-primary" /> Servicios a la Carta
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((plan, i) => {
            const tier = TIER_CONFIG[plan.tier];
            const Icon = tier.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-premium hover:shadow-2xl transition-all flex flex-col sm:flex-row gap-8 items-start relative group"
              >
                <div className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500",
                  tier.badge.split(' ')[0],
                  tier.accentText
                )}>
                  <Icon size={32} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                      <p className="text-primary font-bold text-lg">${plan.price} <span className="text-xs text-slate-400 font-medium tracking-normal">/ por servicio</span></p>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((f, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-400 rounded-full border border-slate-100">
                        {f}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setConfirming(plan)}
                    className="pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-4 transition-all"
                  >
                    Solicitar ahora <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Confirmation Modal */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
              
              <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-float">
                <AlertCircle className="w-12 h-12 text-primary" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Confirmar Elección</h3>
              <p className="text-slate-500 text-lg mb-8">
                Está a punto de solicitar el <span className="text-primary font-black uppercase">{confirming.name}</span>.
              </p>
              
              <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Inversión Estimada</span>
                  <span className="text-2xl font-black text-slate-900">${confirming.price}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  *Esta solicitud no representa un cargo inmediato. Un consultor técnico verificará su historial de equipos antes de la activación final.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setConfirming(null)}
                  className="flex-1 py-5 border border-slate-200 rounded-[2rem] font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Regresar
                </button>
                <button
                  onClick={() => handleRequest(confirming)}
                  className="flex-1 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Confirmar Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

