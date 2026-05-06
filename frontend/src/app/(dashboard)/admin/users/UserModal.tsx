import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { X } from 'lucide-react';

export interface UserFormData extends Partial<User> {
  password?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserFormData) => void;
  user: User | null;
  loading: boolean;
}

export const UserModal = ({ isOpen, onClose, onSave, user, loading }: UserModalProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rif_cedula: '',
    telefono: '',
    role: UserRole.CLIENT,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '',
        rif_cedula: user.rif_cedula || '',
        telefono: user.telefono || '',
        role: user.role || UserRole.CLIENT,
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rif_cedula: '',
        telefono: '',
        role: UserRole.CLIENT,
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as UserFormData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md p-6 mx-auto bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-900">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Nombre Completo *</label>
            <input 
              type="text" 
              name="nombre" 
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Email *</label>
            <input 
              type="email" 
              name="email" 
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Contraseña {user ? '(Dejar en blanco para no cambiar)' : '*'}
            </label>
            <input 
              type="password" 
              name="password" 
              required={!user}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">RIF / Cédula</label>
              <input 
                type="text" 
                name="rif_cedula" 
                value={formData.rif_cedula}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Teléfono</label>
              <input 
                type="text" 
                name="telefono" 
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Rol *</label>
            <select 
              name="role" 
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value={UserRole.CLIENT}>Cliente</option>
              <option value={UserRole.TECH}>Técnico</option>
              <option value={UserRole.ADMIN}>Administrador</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center shadow-lg shadow-blue-500/20 disabled:opacity-70"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
