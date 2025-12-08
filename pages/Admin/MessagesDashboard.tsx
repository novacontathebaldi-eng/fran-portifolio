import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, Mail, MessageSquare, Filter, RefreshCw, X } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { Message } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeString } from '../../utils/stringUtils';

export const MessagesDashboard: React.FC = () => {
    const { messages, updateMessageStatus, deleteMessage, showToast } = useProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<Message['status'] | 'all'>('all');
    const [sourceFilter, setSourceFilter] = useState<Message['source'] | 'all'>('all');
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    // Filter Logic
    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const normalizedSearch = normalizeString(searchTerm);
            const matchesSearch =
                normalizeString(msg.name || '').includes(normalizedSearch) ||
                normalizeString(msg.email || '').includes(normalizedSearch) ||
                normalizeString(msg.message || '').includes(normalizedSearch);

            const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
            const matchesSource = sourceFilter === 'all' || msg.source === sourceFilter;

            return matchesSearch && matchesStatus && matchesSource;
        });
    }, [messages, searchTerm, statusFilter, sourceFilter]);

    // Grouping by Date
    const groupedMessages = useMemo(() => {
        return filteredMessages.reduce((groups, msg) => {
            const date = new Date(msg.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let key = 'Mais antigos';
            if (date.toDateString() === today.toDateString()) key = 'Hoje';
            else if (date.toDateString() === yesterday.toDateString()) key = 'Ontem';
            else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) key = 'Esta Semana';

            if (!groups[key]) groups[key] = [];
            groups[key].push(msg);
            return groups;
        }, {} as Record<string, Message[]>);
    }, [filteredMessages]);

    // Sort order for groups
    const groupOrder = ['Hoje', 'Ontem', 'Esta Semana', 'Mais antigos'];

    const toggleExpand = (id: string) => {
        if (expandedIds.includes(id)) {
            setExpandedIds(prev => prev.filter(i => i !== id));
        } else {
            // Auto mark as read when expanding if new
            const msg = messages.find(m => m.id === id);
            if (msg && msg.status === 'new') {
                updateMessageStatus(id, 'read');
            }
            setExpandedIds(prev => [...prev, id]);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
            await deleteMessage(id);
            showToast('Mensagem excluída.', 'info');
        }
    };

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await updateMessageStatus(id, 'read');
        showToast('Mensagem marcada como lida.', 'success');
    };

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-black">Central de Mensagens</h2>
                    <p className="text-gray-500 mt-1">
                        Gerencie contatos do site e conversas do Chatbot em um só lugar.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-bold text-gray-600">{messages.filter(m => m.status === 'new').length} Novas</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 sticky top-4 z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome, email ou conteúdo..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white cursor-pointer"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="new">Novas</option>
                                <option value="read">Lidas</option>
                                <option value="replied">Respondidas</option>
                            </select>
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value as any)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black appearance-none bg-white cursor-pointer"
                            >
                                <option value="all">Todas as Origens</option>
                                <option value="contact_form">Formulário de Contato</option>
                                <option value="chatbot">Chatbot (IA)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {groupOrder.map(group => {
                    const groupMsgs = groupedMessages[group];
                    if (!groupMsgs || groupMsgs.length === 0) return null;

                    return (
                        <div key={group}>
                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 px-2">{group}</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                                {groupMsgs.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`group transition hover:bg-gray-50 cursor-pointer ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => toggleExpand(msg.id)}
                                    >
                                        <div className="p-4 flex items-start gap-4">
                                            {/* Icon / Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.source === 'chatbot' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {msg.source === 'chatbot' ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                            </div>

                                            {/* Preview Info */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`text-sm truncate ${msg.status === 'new' ? 'font-bold text-black' : 'font-medium text-gray-700'}`}>
                                                            {msg.name}
                                                        </h4>
                                                        {msg.status === 'new' && (
                                                            <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Nova</span>
                                                        )}
                                                        {msg.status === 'replied' && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> Respondida
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                                                    {msg.source === 'contact_form' && msg.subject && <span className="font-medium text-gray-600">[{msg.subject}]</span>}
                                                    <span className="truncate">{msg.email || msg.phone || 'Sem contato'}</span>
                                                </p>
                                                <p className={`text-sm text-gray-600 line-clamp-2 ${expandedIds.includes(msg.id) ? 'hidden' : 'block'}`}>
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {expandedIds.includes(msg.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-gray-50 px-4 pb-4 pt-0 border-t border-gray-100"
                                                >
                                                    <div className="pt-4 pl-14">
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
                                                            {msg.message}
                                                        </p>

                                                        {/* Contact Details Block */}
                                                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 text-xs text-gray-600 flex flex-wrap gap-4">
                                                            {msg.email && (
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="w-3 h-3" />
                                                                    <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()} className="hover:text-blue-600 hover:underline">{msg.email}</a>
                                                                </div>
                                                            )}
                                                            {msg.phone && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold">Tel:</span>
                                                                    <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="hover:text-green-600 hover:underline">{msg.phone}</a>
                                                                </div>
                                                            )}
                                                            <div className="ml-auto text-gray-400 italic">
                                                                ID: {msg.id}
                                                            </div>
                                                        </div>

                                                        {/* Action Bar */}
                                                        <div className="flex gap-2 justify-end">
                                                            {msg.status === 'new' && (
                                                                <button
                                                                    onClick={(e) => handleMarkAsRead(msg.id, e)}
                                                                    className="px-3 py-1.5 bg-white border border-gray-200 hover:border-black rounded-lg text-xs font-bold transition flex items-center gap-2"
                                                                >
                                                                    <CheckCircle className="w-3 h-3" /> Marcar como lida
                                                                </button>
                                                            )}
                                                            {msg.email && (
                                                                <a
                                                                    href={`mailto:${msg.email}?subject=Resposta: ${msg.subject || 'Contato Fran Siller'}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateMessageStatus(msg.id, 'replied');
                                                                    }}
                                                                    className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition flex items-center gap-2"
                                                                >
                                                                    <Mail className="w-3 h-3" /> Responder
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={(e) => handleDelete(msg.id, e)}
                                                                className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-bold transition flex items-center gap-2 ml-auto"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> Excluir
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredMessages.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-gray-600 mb-2">Nenhuma mensagem encontrada</h3>
                        <p className="text-gray-400 text-sm">
                            Tente ajustar os filtros de busca.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
