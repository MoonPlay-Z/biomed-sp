'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Wrench, MapPin, Phone, ArrowRight, X, Loader2, CheckCircle2, Eye, EyeOff, Star, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
  rif_cedula: z.string().min(5, 'Ingrese su RIF o cédula'),
  telefono: z.string().min(10, 'Teléfono inválido'),
});
type RegisterForm = z.infer<typeof registerSchema>;

const plans = [
  {
    name: 'Básico', price: '$50/mes', icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100',
    features: ['Diagnóstico inicial gratuito', '1 reparación mensual', 'Soporte WhatsApp'],
  },
  {
    name: 'Profesional', price: '$150/mes', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100', badge: 'Más Popular',
    features: ['Diagnóstico gratuito', '5 reparaciones/mes', 'Prioridad de atención', 'Soporte 24/7'],
  },
  {
    name: 'Empresarial', price: '$350/mes', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100', badge: 'Premium',
    features: ['Reparaciones ilimitadas', 'Técnico dedicado', 'Reporte mensual', 'Soporte premium 24/7'],
  },
];

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'CLIENT' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al registrarse');
      }
      setSuccess(true);
      reset();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => { setSuccess(false); setErrorMsg(''); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#000080] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-wider">JaMechanic</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium items-center">
          <a href="#servicios" className="hover:text-blue-300 transition-colors">Servicios</a>
          <a href="#planes" className="hover:text-blue-300 transition-colors">Planes</a>
          <a href="#ubicacion" className="hover:text-blue-300 transition-colors">Ubicación</a>
          <Link href="/login" className="px-4 py-1.5 border border-white/30 rounded-full hover:bg-white/10 transition-colors">
            Acceso Clientes
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#000080] to-blue-900 text-white py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Precisión Técnica en <span className="text-blue-400">Electromedicina</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Garantizamos la operatividad y precisión de tus equipos médicos con estándares internacionales. Tu aliado confiable en el sector salud.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={openModal}
                className="inline-flex items-center px-8 py-4 bg-white text-[#000080] rounded-full font-bold text-lg hover:bg-blue-50 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:-translate-y-1"
              >
                Agendar Servicio
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-white/40 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Iniciar Sesión
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#000080] mb-4">Servicios Especializados</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Activity, title: 'Reparación de Monitores', desc: 'Diagnóstico y reparación a nivel de componente para monitores de signos vitales, multiparámetros y desfibriladores.' },
            { icon: ShieldCheck, title: 'Calibración de Seguridad Eléctrica', desc: 'Pruebas rigurosas bajo normativas internacionales para asegurar la integridad de pacientes y operadores.' },
            { icon: Wrench, title: 'Mantenimiento Preventivo', desc: 'Planes de mantenimiento programado para clínicas y hospitales, minimizando tiempos de inactividad de equipos críticos.' },
          ].map((svc) => (
            <motion.div
              key={svc.title}
              whileHover={{ y: -4 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svc.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{svc.title}</h3>
              <p className="text-slate-600 leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section id="planes" className="py-20 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Planes de Servicio</h2>
            <p className="text-slate-400">Elige el plan que mejor se adapte a las necesidades de tu institución</p>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition-all relative overflow-hidden group"
                >
                  {plan.badge && (
                    <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      {plan.badge}
                    </span>
                  )}
                  <div className={`${plan.bg} p-3 rounded-xl w-fit mb-4`}>
                    <Icon className={`w-6 h-6 ${plan.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-2xl font-black text-blue-400 mb-6">{plan.price}</p>
                  <ul className="space-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={openModal}
                    className="mt-8 w-full py-3 border border-blue-500 text-blue-400 rounded-xl font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white"
                  >
                    Solicitar Plan
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="ubicacion" className="bg-slate-800 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Ubicación Estratégica</h2>
            <p className="text-slate-300 mb-8 text-lg">Operamos desde el corazón de los llanos occidentales para atender a clínicas y centros hospitalarios de la región.</p>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Laboratorio Central</h4>
                  <p className="text-slate-400">Acarigua-Araure, Edo. Portuguesa — Venezuela, ZP 3301</p>
                </div>
              </div>
              <div className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Información Legal</h4>
                  <p className="text-slate-400">RIF: J-50493820-1 · Empresa debidamente registrada.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Contacto</h4>
                  <p className="text-slate-400">+58 414 000 0000 · soporte@jamechanic.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-700 p-2 rounded-2xl overflow-hidden shadow-2xl h-[350px]">
            <div className="w-full h-full bg-slate-600 rounded-xl flex items-center justify-center relative overflow-hidden group">
              <MapPin className="w-16 h-16 text-blue-500 absolute z-10 group-hover:scale-125 transition-all" />
              <div className="absolute w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} JaMechanic. Todos los derechos reservados.</p>
      </footer>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#000080] to-blue-700 px-7 py-6 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-5 h-5 text-blue-300" />
                    <span className="font-bold text-lg">JaMechanic</span>
                  </div>
                  <h2 className="text-2xl font-black">Regístrate como Cliente</h2>
                  <p className="text-blue-200 text-sm mt-1">Accede al seguimiento de tus equipos médicos</p>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors mt-1">
                  <X size={20} />
                </button>
              </div>

              <div className="p-7">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h3>
                      <p className="text-slate-500 mb-6">Tu cuenta ha sido creada. Ahora puedes iniciar sesión para dar seguimiento a tus equipos.</p>
                      <div className="flex gap-3">
                        <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">
                          Cerrar
                        </button>
                        <Link
                          href="/login"
                          onClick={closeModal}
                          className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-500 transition-colors"
                        >
                          Iniciar Sesión
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      {errorMsg && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                          {errorMsg}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre / Razón Social</label>
                        <input
                          {...register('nombre')}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Clínica San José C.A."
                        />
                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">RIF / Cédula</label>
                          <input
                            {...register('rif_cedula')}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="J-12345678-9"
                          />
                          {errors.rif_cedula && <p className="text-red-500 text-xs mt-1">{errors.rif_cedula.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                          <input
                            {...register('telefono')}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0414-1234567"
                          />
                          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                        <input
                          {...register('email')}
                          type="email"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ejemplo@clinica.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                          <input
                            {...register('password')}
                            type={showPass ? 'text' : 'password'}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#000080] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center justify-center disabled:opacity-60 mt-2"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Mi Cuenta'}
                      </button>

                      <p className="text-center text-slate-500 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" onClick={closeModal} className="text-blue-600 font-bold hover:underline">
                          Iniciar Sesión
                        </Link>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
