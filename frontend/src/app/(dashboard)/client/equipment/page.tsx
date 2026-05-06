'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Equipment, Appointment } from '@/types';
import { 
  Monitor, 
  Search, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ClientEquipment() {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyEquipment = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/appointments/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const appointments: Appointment[] = await res.json();
          // Extract unique equipment from appointments
          const equipmentMap = new Map<number, Equipment>();
          appointments.forEach(apt => {
            if (apt.equipment) {
              equipmentMap.set(apt.equipment.id, apt.equipment);
            }
          });
          setEquipment(Array.from(equipmentMap.values()));
        }
      } catch (error) {
        console.error('Failed to fetch equipment', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyEquipment();
  }, [token]);

  const filteredEquipment = equipment.filter(e => 
    e.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Equipos</h1>
          <p className="text-slate-500 mt-1">Historial de equipos registrados en JaMechanic.</p>
        </div>
        <Link 
          href="/reception"
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} className="mr-2" />
          Registrar Nuevo
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search className="text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Buscar por marca, modelo o serial..."
          className="flex-1 outline-none text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <Monitor className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No hay equipos registrados</h3>
            <p className="text-slate-500 mt-1">Sus equipos aparecerán aquí una vez registrados en el sistema.</p>
          </div>
        ) : (
          filteredEquipment.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Monitor size={32} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center mb-1">
                    <ShieldCheck size={10} className="mr-1" />
                    ACTIVO
                  </span>
                  <p className="text-slate-400 text-xs font-mono">{item.serial_number}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.marca}
                  </h3>
                  <p className="text-slate-500 font-medium">{item.modelo}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Tag size={14} className="mr-2" />
                    {item.tipo_equipo}
                  </div>
                  <Link 
                    href="/client/status" 
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <ChevronRight size={24} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
