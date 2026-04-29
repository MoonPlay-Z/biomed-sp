import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Wrench, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JaMechanic | Reparación Equipos Médicos Venezuela',
  description: 'Servicio técnico especializado en electromedicina. Reparación de monitores, calibración de seguridad eléctrica y mantenimiento preventivo en Acarigua-Araure, Portuguesa.',
  keywords: 'reparación equipos médicos Venezuela, electromedicina Portuguesa, calibración equipos médicos, mantenimiento preventivo',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Corporativo */}
      <header className="bg-[#000080] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-wider">JaMechanic</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#servicios" className="hover:text-blue-300 transition-colors">Servicios</a>
          <a href="#ubicacion" className="hover:text-blue-300 transition-colors">Ubicación</a>
          <a href="/login" className="hover:text-blue-300 transition-colors">Acceso Clientes</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-[#000080] to-blue-900 text-white py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-5xl mx-auto text-center z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Precisión Técnica en <span className="text-blue-400">Electromedicina</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Garantizamos la operatividad y precisión de tus equipos médicos con estándares internacionales. Tu aliado confiable en el sector salud.
          </p>
          <Link 
            href="/reception" 
            className="inline-flex items-center px-8 py-4 bg-white text-[#000080] rounded-full font-bold text-lg hover:bg-blue-50 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:-translate-y-1"
          >
            Agendar Servicio
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#000080] mb-4">Servicios Especializados</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Reparación de Monitores</h3>
            <p className="text-slate-600 leading-relaxed">
              Diagnóstico y reparación a nivel de componente para monitores de signos vitales, multiparámetros y desfibriladores.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Calibración de Seguridad Eléctrica</h3>
            <p className="text-slate-600 leading-relaxed">
              Pruebas rigurosas bajo normativas internacionales para asegurar la integridad de pacientes y operadores.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Mantenimiento Preventivo</h3>
            <p className="text-slate-600 leading-relaxed">
              Planes de mantenimiento programado para clínicas y hospitales, minimizando tiempos de inactividad de equipos críticos.
            </p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="ubicacion" className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Ubicación Estratégica</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Operamos desde el corazón de los llanos occidentales para atender a clínicas y centros hospitalarios de la región.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Laboratorio Central</h4>
                  <p className="text-slate-400">Acarigua-Araure, Edo. Portuguesa</p>
                  <p className="text-slate-400">Venezuela, ZP 3301</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Información Legal</h4>
                  <p className="text-slate-400">RIF: J-50493820-1</p>
                  <p className="text-slate-400">Empresa debidamente registrada y certificada.</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg">Contacto</h4>
                  <p className="text-slate-400">+58 414 000 0000</p>
                  <p className="text-slate-400">soporte@jamechanic.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-2 rounded-2xl overflow-hidden shadow-2xl h-[400px]">
            {/* Embedded map representation */}
            <div className="w-full h-full bg-slate-700 rounded-xl flex items-center justify-center relative overflow-hidden group">
              <MapPin className="w-16 h-16 text-blue-500 absolute z-10 group-hover:scale-125 group-hover:text-blue-400 transition-all" />
              <div className="absolute w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-blue-900/30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} JaMechanic. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
