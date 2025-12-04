import React, { useState, useEffect } from 'react';
import { Search, Receipt, Calendar, MapPin, Package } from 'lucide-react';
import { BudgetRequest, BudgetStatus, BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '../../types/budgetTypes';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

interface ClientBudgetsViewProps {
    onViewDetails: (id: string) => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    clientId: string;
}

export const ClientBudgetsView: React.FC<ClientBudgetsViewProps> = ({ onViewDetails, showToast, clientId }) => {
    const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all');

    // Buscar orçamentos do cliente
    useEffect(() => {
        fetchClientBudgets();
    }, [clientId]);

    const fetchClientBudgets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('budget_requests')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map snake_case to camelCase
            const mapped: BudgetRequest[] = data.map(item => ({
                id: item.id,
                clientId: item.client_id,
                clientName: item.client_name,
                clientEmail: item.client_email,
                clientPhone: item.client_phone,
                projectLocationFull: item.project_location_full,
                projectCity: item.project_city,
                projectState: item.project_state,
                observations: item.observations,
                status: item.status,
                createdAt: item.created_at,
            }));

            setBudgetRequests(mapped);
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
            showToast?.('Erro ao carregar orçamentos', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredRequests = budgetRequests.filter(request => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            request.projectCity.toLowerCase().includes(searchLower) ||
            (request.observations || '').toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando seus orçamentos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-serif mb-2">Meus Orçamentos</h2>
                <p className="text-gray-500 text-sm">Acompanhe suas solicitações de orçamento e seus status.</p>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por cidade ou observação..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition bg-white"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition bg-white"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="pending">Pendente</option>
                            <option value="analyzing">Em Análise</option>
                            <option value="quoted">Orçado</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Budget List */}
            {filteredRequests.length > 0 ? (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition cursor-pointer"
                            onClick={() => onViewDetails(request.id)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Left Info */}
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Receipt className="w-5 h-5 text-gray-400" />
                                        <h3 className="font-bold text-lg">Solicitação de Orçamento</h3>
                                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${BUDGET_STATUS_COLORS[request.status]}`}>
                                            {BUDGET_STATUS_LABELS[request.status]}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Criado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {request.projectCity}, {request.projectState}
                                        </div>
                                    </div>

                                    {request.observations && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                            {request.observations}
                                        </p>
                                    )}
                                </div>

                                {/* Right Action */}
                                <div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDetails(request.id);
                                        }}
                                        className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition whitespace-nowrap"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-gray-600 mb-2">Nenhum orçamento encontrado</h3>
                    <p className="text-gray-400 text-sm">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Tente ajustar os filtros acima.'
                            : 'Você ainda não solicitou nenhum orçamento.'}
                    </p>
                </div>
            )}
        </div>
    );
};
