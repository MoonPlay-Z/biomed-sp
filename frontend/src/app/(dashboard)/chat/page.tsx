'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types';
import { Send, User, Bot, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { token, user: authUser } = useAuth();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appointmentId = Number(searchParams.get('appointmentId')) || 1;

  const fetchMessages = useCallback(async (silent = false) => {
    if (!token || !appointmentId) return;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/appointments/${appointmentId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, appointmentId]);

  useEffect(() => {
    fetchMessages();
    // Polling cada 10 segundos para simular tiempo real en serverless
    const interval = setInterval(() => fetchMessages(true), 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !token || !appointmentId) return;

    const content = inputValue;
    setInputValue('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/appointments/${appointmentId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mensaje: content })
      });
      
      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      alert('Error al enviar mensaje');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <MessageSquare size={24} />
            </div>
            Mensajería Interna
          </h1>
          <p className="text-slate-500 font-medium mt-1">Reparación # {appointmentId} — Comunicación Directa</p>
        </div>
        <button 
          onClick={() => fetchMessages(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={14} className={clsx(isRefreshing && "animate-spin")} />
          Sincronizar
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col overflow-hidden">
        {/* Chat Status Bar */}
        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canal Seguro Activo</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Soporte JaMechanic</p>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-slate-50/30 to-white"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <MessageSquare size={64} className="mb-4 opacity-20" />
              <p className="font-bold">No hay mensajes aún.</p>
              <p className="text-xs uppercase tracking-widest font-black mt-1">Inicia la conversación para este caso.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === authUser?.id;
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={clsx(
                      "flex flex-col max-w-[75%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={clsx(
                      "px-6 py-4 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed",
                      isMe 
                        ? "bg-[#000080] text-white rounded-tr-none" 
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-md"
                    )}>
                      {msg.mensaje}
                    </div>
                    <div className={clsx(
                      "flex items-center gap-2 mt-2 px-2",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isMe ? 'Tú' : msg.sender?.nombre}
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje interno sobre esta reparación..."
              className="w-full pl-8 pr-20 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-premium group-hover:border-blue-200"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#000080] text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-all disabled:opacity-50 shadow-xl shadow-blue-900/20 active:scale-90"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <Clock size={12} /> Auto-sincronización cada 10s
            </span>
            <span className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <Bot size={12} /> Registro persistente en base de datos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
