'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
      const result = await res.json();
      login(result.access_token, result.user);
      router.push('/reception');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#000080] relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/20">
              <Activity className="w-10 h-10 text-blue-300" />
            </div>
            <span className="text-4xl font-black text-white tracking-tight">JaMechanic</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Plataforma de Gestión<br />
            <span className="text-blue-300">en Electromedicina</span>
          </h2>
          <p className="text-blue-200/70 text-lg leading-relaxed max-w-sm mx-auto">
            Control total de citas, reparaciones e inventario para tu equipo técnico.
          </p>

          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            {[
              { value: '100%', label: 'Trazabilidad' },
              { value: '24/7', label: 'Disponibilidad' },
              { value: '3 Roles', label: 'de Acceso' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-blue-200/70 mt-1 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Activity className="w-7 h-7 text-blue-600" />
            <span className="text-2xl font-black text-slate-900">JaMechanic</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-slate-500 mt-2">Ingresa tus credenciales para acceder al sistema.</p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-2"
            >
              <span className="shrink-0 mt-0.5">⚠️</span>
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000080] hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Iniciar Sesión <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
              ← Volver al sitio público
            </Link>
          </div>

          {/* Quick access hints */}
          <div className="mt-8 bg-blue-50/80 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Acceso Rápido (Demo)</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p><span className="font-semibold text-slate-800">Admin:</span> admin@jamechanic.com</p>
              <p><span className="font-semibold text-slate-800">Técnico:</span> tech@jamechanic.com</p>
              <p><span className="font-semibold text-slate-800">Cliente:</span> contacto@clinica.com</p>
              <p className="text-slate-400 mt-2">Contraseña: <span className="font-mono">admin123</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
