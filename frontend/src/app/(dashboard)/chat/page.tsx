'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, Bot, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  id: number;
  mensaje: string;
  sender_id: number;
  created_at: string;
  sender?: {
    nombre: string;
    role: string;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Datos mock para demostración (esto vendría de la sesión y la URL de la cita)
  const appointmentId = 1;
  const userId = 1; 

  useEffect(() => {
    // Inicializar socket
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Conectado al servidor de chat');
      
      // Unirse a la sala de la cita
      socket.emit('joinRoom', { appointmentId, userId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('error', (error: string) => {
      console.error('Error de socket:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [appointmentId, userId]);

  useEffect(() => {
    // Auto-scroll al final
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      appointmentId,
      senderId: userId,
      content: inputValue,
    });

    setInputValue('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <MessageSquare className="mr-2 text-blue-600" />
            Centro de Comunicación
          </h1>
          <p className="text-slate-500">Cita # {appointmentId} - Soporte Técnico</p>
        </div>
        <div className="flex items-center">
          <span className={clsx(
            "w-3 h-3 rounded-full mr-2",
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          )} />
          <span className="text-sm font-medium text-slate-600">
            {isConnected ? "En línea" : "Desconectado"}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b bg-slate-50 flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Asistente JaMechanic</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Canal de Servicio Seguro</p>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
              <MessageSquare size={48} className="mb-2" />
              <p>No hay mensajes en esta conversación.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === userId;
              return (
                <div 
                  key={msg.id} 
                  className={clsx(
                    "flex flex-col max-w-[80%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={clsx(
                    "px-4 py-3 rounded-2xl text-sm shadow-sm",
                    isMe 
                      ? "bg-[#000080] text-white rounded-tr-none" 
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                  )}>
                    {msg.mensaje}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium px-1">
                    {msg.sender?.nombre || (isMe ? 'Yo' : 'Técnico')} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje para el técnico..."
            className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            className="w-10 h-10 bg-[#000080] text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-all disabled:opacity-50 shadow-md flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
