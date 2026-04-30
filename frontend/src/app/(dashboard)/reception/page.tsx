'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const formSchema = z.object({
  // Sección 1: Datos del cliente
  clientName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  clientRif: z.string().regex(/^[JGVEP]-\d{8,9}-\d?$/, 'Formato de RIF inválido (Ej: J-12345678-9)'),
  clientPhone: z.string().min(10, 'Teléfono inválido'),

  // Sección 2: Detalles técnicos
  brand: z.string().min(2, 'Marca es requerida'),
  model: z.string().min(2, 'Modelo es requerido'),
  serialNumber: z.string().min(3, 'El número de serial es requerido'),
  issueDescription: z.string().min(10, 'Describe la falla con más detalle'),

  // Sección 3: Imágenes
  images: z.custom<FileList>()
    .refine((files) => files && files.length === 3, 'Debe subir exactamente 3 imágenes (Frontal, Trasera, Detalle de Falla).')
});

type FormValues = z.infer<typeof formSchema>;

export default function ReceptionPage() {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setValue('images', files, { shouldValidate: true });
      
      const fileArray = Array.from(files);
      const previews = fileArray.map(file => URL.createObjectURL(file));
      
      setImagePreviews(prev => {
        // Clean up old object URLs
        prev.forEach(url => URL.revokeObjectURL(url));
        return previews;
      });
    }
  };

  const { user, token } = useAuth();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      apiUrl = apiUrl.replace(/\/$/, '');
      if (!apiUrl.endsWith('/api')) apiUrl += '/api';

      // 1. Enviar datos al backend
      const res = await fetch(`${apiUrl}/appointments/reception`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Error al guardar la recepción');

      alert('Recepción guardada exitosamente en el servidor.');
      setImagePreviews([]);
      setValue('images', {} as FileList);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recepción de Equipo</h1>
        <p className="text-slate-500 mt-2">Complete el formulario para ingresar un nuevo equipo al sistema de diagnóstico.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        
        {/* Sección 1: Datos del cliente */}
        <div>
          <h2 className="text-xl font-semibold text-[#000080] mb-4 flex items-center border-b pb-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
            Datos del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social</label>
              <input
                {...register('clientName')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Clínica San José"
              />
              {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RIF</label>
              <input
                {...register('clientRif')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="J-12345678-9"
              />
              {errors.clientRif && <p className="text-red-500 text-sm mt-1">{errors.clientRif.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                {...register('clientPhone')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0414-1234567"
              />
              {errors.clientPhone && <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message}</p>}
            </div>
          </div>
        </div>

        {/* Sección 2: Detalles Técnicos */}
        <div>
          <h2 className="text-xl font-semibold text-[#000080] mb-4 flex items-center border-b pb-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
            Detalles Técnicos del Equipo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
              <input
                {...register('brand')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ej. Fluke"
              />
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
              <input
                {...register('model')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ej. ProSim 8"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Serial</label>
              <input
                {...register('serialNumber')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="SN-9876543"
              />
              {errors.serialNumber && <p className="text-red-500 text-sm mt-1">{errors.serialNumber.message}</p>}
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Falla Reportada</label>
              <textarea
                {...register('issueDescription')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Describa la falla que presenta el equipo..."
              />
              {errors.issueDescription && <p className="text-red-500 text-sm mt-1">{errors.issueDescription.message}</p>}
            </div>
          </div>
        </div>

        {/* Sección 3: Imágenes */}
        <div>
          <h2 className="text-xl font-semibold text-[#000080] mb-4 flex items-center border-b pb-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
            Documentación Fotográfica
          </h2>
          <p className="text-sm text-slate-500 mb-4">Se requieren exactamente 3 imágenes (Frontal, Trasera y Detalle de la Falla).</p>
          
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium">Haga clic o arrastre las imágenes aquí</p>
            <p className="text-xs text-slate-500 mt-1">JPEG, PNG hasta 5MB</p>
          </div>
          {errors.images && <p className="text-red-500 text-sm mt-2 font-medium">{errors.images.message}</p>}

          {/* Previsualización */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {index === 0 ? 'Frontal' : index === 1 ? 'Trasera' : 'Detalle'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-[#000080] text-white rounded-lg font-medium hover:bg-blue-900 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Registrar Recepción
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
