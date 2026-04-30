'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InventoryItem } from '@/types';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  History,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TechInventory() {
  const { token } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        apiUrl = apiUrl.replace(/\/$/, '');
        if (!apiUrl.endsWith('/api')) apiUrl += '/api';

        const res = await fetch(`${apiUrl}/inventory`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch inventory', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchInventory();
  }, [token]);

  const filteredItems = items.filter(item => 
    item.nombre_repuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Consulta de Repuestos</h1>
        <p className="text-slate-500 mt-2">Disponibilidad de piezas para reparaciones en curso.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar repuesto por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 p-3 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Package size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                item.cantidad <= item.cantidad_minima 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {item.cantidad <= item.cantidad_minima ? 'Stock Bajo' : 'Disponible'}
              </div>
            </div>
            
            <h3 className="font-bold text-slate-900 text-lg">{item.nombre_repuesto}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">{item.sku}</p>
            
            <div className="flex items-end justify-between border-t pt-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cantidad</p>
                <p className="text-2xl font-black text-slate-900">{item.cantidad}</p>
              </div>
              <button className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
                <ShoppingCart size={16} className="mr-1" />
                Solicitar
              </button>
            </div>
            
            {item.cantidad <= item.cantidad_minima && (
              <div className="mt-4 flex items-center text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">
                <AlertTriangle size={14} className="mr-1" />
                Existencias por debajo del mínimo de seguridad.
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <History className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No se encontraron resultados para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
