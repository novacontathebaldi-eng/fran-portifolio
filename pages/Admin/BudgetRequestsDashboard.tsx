import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronDown, Eye, Archive, Download, FileText } from 'lucide-react';
import { BudgetRequest, BudgetStatus, BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '../../budgetTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BudgetRequestsDashboardProps {
    onViewDetails: (id: string) => void;
}

export const BudgetRequestsDashboard: React.FC<BudgetRequestsDashboardProps> = ({ onViewDetails }) => {
    // Mock data - será substituído por dados reais do Context
    const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([
        {
            id: '1',
            clientName: 'João Silva',
            clientEmail: 'joao@email.com',
            clientPhone: '(27) 99999-9999',
            projectLocationFull: 'Rua Teste, 123, Bairro Centro',
            projectCity: 'Vitória',
            projectState: 'ES',
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
        {
            id: '2',
            clientName: 'Maria Oliveira',
            clientEmail: 'maria@email.com',
            clientPhone: '(27) 98888-8888',
            projectLocationFull: 'Av. Principal, 456, Jardim Camburi',
            projectCity: 'Vitória',
            projectState: 'ES',
            status: 'analyzing',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filtrar orçamentos
    const filteredRequests = budgetRequests.filter(request => {
        // Filtro de pesquisa
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            request.clientName.toLowerCase().includes(searchLower) ||
            request.clientEmail.toLowerCase().includes(searchLower) ||
            request.projectCity.toLowerCase().includes(searchLower);

        // Filtro de status
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

        // Filtro de data
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const requestDate = new Date(request.createdAt);
            const now = new Date();
            if (dateFilter === 'today') {
                matchesDate = requestDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = requestDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = requestDate >= monthAgo;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Agrupar por data
    const groupedRequests = filteredRequests.reduce((groups, request) => {
        const date = new Date(request.createdAt);
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        let groupKey = '';
        if (date.toDateString() === today.toDateString()) {
            groupKey = 'Hoje';
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupKey = 'Ontem';
        } else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
            groupKey = 'Últimos 7 dias';
        } else {
            groupKey = 'Mais antigos';
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(request);
        return groups;
    }, {} as Record<string, BudgetRequest[]>);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Hoje': true,
        'Ontem': true,
        'Últimos 7 dias': false,
        'Mais antigos': false,
    });

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredRequests.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRequests.map(r => r.id));
        }
    };

    const handleBulkAction = (action: 'analyzing' | 'archive') => {
        if (selectedIds.length === 0) return;

        if (action === 'archive') {
            if (confirm(`Arquivar ${selectedIds.length} solicitação(ões)?`)) {
                // TODO: Implementar arquivamento
                console.log('Arquivar:', selectedIds);
                setSelectedIds([]);
            }
        } else {
            // TODO: Implementar mudança de status em massa
            console.log('Mudar status para', action, selectedIds);
            setSelectedIds([]);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-black">Solicitações de Orçamento</h2>
                    <p className="text-gray-500 mt-1">{filteredRequests.length} solicitação(ões) encontrada(s)</p>
                </div>

                {/* Bulk Actions */}
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex gap-2"
                        >
                            <button
                                onClick={() => handleBulkAction('analyzing')}
                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold text-xs hover:bg-blue-100 transition flex items-center gap-2"
                            >
                                <FileText className="w-3 h-3" />
                                Marcar como Em Análise ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => handleBulkAction('archive')}
                                className="bg-gray-50 text-gray-600 px-4 py-2 rounded-full font-bold text-xs hover:bg-gray-100 transition flex items-center gap-2"
                            >
                                <Archive className="w-3 h-3" />
                                Arquivar ({selectedIds.length})
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nome, email ou cidade..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="pending">Pendente</option>
                            <option value="analyzing">Em Análise</option>
                            <option value="quoted">Orçado</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
                        >
                            <option value="all">Todas as Datas</option>
                            <option value="today">Hoje</option>
                            <option value="week">Últimos 7 dias</option>
                            <option value="month">Este mês</option>
                        </select>
                    </div>
                </div>

                {/* Select All */}
                {filteredRequests.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === filteredRequests.length}
                                onChange={selectAll}
                                className="w-4 h-4 rounded text-black focus:ring-black"
                            />
                            Selecionar todos ({filteredRequests.length})
                        </label>
                    </div>
                )}
            </div>

            {/* Grouped List */}
            <div className="space-y-6">
                {Object.entries(groupedRequests).map(([groupName, requests]) => (
                    <div key={groupName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(groupName)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <div className="flex items-center gap-3">
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${expandedGroups[groupName] ? 'rotate-0' : '-rotate-90'
                                        }`}
                                />
                                <span className="font-bold text-sm uppercase text-gray-600">{groupName}</span>
                                <span className="text-xs text-gray-400">({requests.length})</span>
                            </div>
                        </button>

                        {/* Requests in Group */}
                        <AnimatePresence>
                            {expandedGroups[groupName] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="divide-y divide-gray-100"
                                >
                                    {requests.map(request => (
                                        <div
                                            key={request.id}
                                            className="p-4 hover:bg-gray-50 transition flex items-center gap-4"
                                        >
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(request.id)}
                                                onChange={() => toggleSelect(request.id)}
                                                className="w-4 h-4 rounded text-black focus:ring-black"
                                            />

                                            {/* Info */}
                                            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                <div>
                                                    <h4 className="font-bold text-sm">{request.clientName}</h4>
                                                    <p className="text-xs text-gray-500">{request.clientEmail}</p>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <Calendar className="w-3 h-3 inline mr-1" />
                                                    {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {request.projectCity}, {request.projectState}
                                                </div>
                                                <div className="flex justify-end">
                                                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${BUDGET_STATUS_COLORS[request.status]}`}>
                                                        {BUDGET_STATUS_LABELS[request.status]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <button
                                                onClick={() => onViewDetails(request.id)}
                                                className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredRequests.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-gray-600 mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-gray-400 text-sm">
                        {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                            ? 'Tente ajustar os filtros acima.'
                            : 'Aguardando novas solicitações de orçamento.'}
                    </p>
                </div>
            )}
        </div>
    );
};
