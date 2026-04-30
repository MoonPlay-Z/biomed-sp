'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { InventoryItem } from '@/types';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminInventory() {
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventario de Repuestos</h1>
          <p className="text-slate-500 mt-2">Control de stock y suministros técnicos.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={20} className="mr-2" />
          Nuevo Repuesto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={20} className="mr-2" />
          Filtros
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Repuesto / SKU</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Actual</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Costo Unitario</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500 mr-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.nombre_repuesto}</p>
                      <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`text-sm font-bold ${item.cantidad <= item.cantidad_minima ? 'text-amber-600' : 'text-slate-900'}`}>
                      {item.cantidad} unidades
                    </span>
                    {item.cantidad <= item.cantidad_minima && (
                      <AlertTriangle size={16} className="text-amber-500 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Mínimo: {item.cantidad_minima}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  ${item.costo_unitario || '0.00'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.proveedor || 'No especificado'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit3 size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No se encontraron repuestos con los criterios de búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
