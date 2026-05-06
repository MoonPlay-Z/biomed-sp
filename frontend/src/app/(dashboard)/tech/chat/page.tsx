'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, Message } from '@/types';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  MessageSquare, 
  Monitor, 
  User as UserIcon,
  Search,
  CheckCheck,
  Clock
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function TechChat() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch appointments for the sidebar
  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/appointments/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error('Failed to fetch appointments', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyAppointments();
  }, [token]);

  // Handle Socket Connection & Messages Fetch
  useEffect(() => {
    if (!activeAppointment || !user) return;

    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/appointments/${activeAppointment.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();

    // Setup WebSocket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const wsUrl = apiUrl.replace('/api', '');
    
    socketRef.current = io(wsUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinRoom', {
        appointmentId: activeAppointment.id,
        userId: user.id
      });
    });

    socketRef.current.on('newMessage', (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [activeAppointment, user, token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeAppointment || !user || !socketRef.current) return;

    // We rely on the socket event to update the UI
    socketRef.current.emit('sendMessage', {
      appointmentId: activeAppointment.id,
      senderId: user.id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.client?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.equipment?.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Sidebar: Chats List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar chat..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAppointments.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <MessageSquare className="mx-auto w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No hay chats disponibles</p>
            </div>
          ) : (
            filteredAppointments.map(apt => (
              <button
                key={apt.id}
                onClick={() => setActiveAppointment(apt)}
                className={clsx(
                  "w-full p-4 text-left border-b border-slate-100 transition-colors flex items-center gap-3",
                  activeAppointment?.id === apt.id ? "bg-blue-50 border-blue-100" : "hover:bg-slate-100"
                )}
              >
                <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm border border-slate-200 shrink-0">
                  <Monitor size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{apt.client?.nombre}</h4>
                  <p className="text-xs text-slate-500 truncate">{apt.equipment?.marca} {apt.equipment?.modelo}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeAppointment ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2.5 rounded-full text-slate-500">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{activeAppointment.client?.nombre}</h3>
                  <p className="text-xs text-slate-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Chat en línea
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Equipo</p>
                <p className="text-sm font-medium text-slate-700">{activeAppointment.equipment?.marca} {activeAppointment.equipment?.modelo}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                    <p>No hay mensajes en esta conversación.</p>
                    <p className="text-sm mt-1">Escribe el primer mensaje para el cliente.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const showName = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                          "flex flex-col max-w-[75%]",
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        {showName && (
                          <span className="text-xs text-slate-500 mb-1 ml-1">{msg.sender?.nombre || 'Cliente'}</span>
                        )}
                        <div className={clsx(
                          "px-4 py-2.5 rounded-2xl shadow-sm relative",
                          isMe 
                            ? "bg-blue-600 text-white rounded-br-sm" 
                            : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{msg.mensaje}</p>
                          <div className={clsx(
                            "text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70",
                            isMe ? "text-blue-100" : "text-slate-400"
                          )}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje al cliente..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 shadow-sm"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100 mb-4">
              <MessageSquare className="w-12 h-12 text-blue-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Seleccione una conversación</h3>
            <p className="text-sm">Haga clic en un chat de la barra lateral para ver los mensajes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
