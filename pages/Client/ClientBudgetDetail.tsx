import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Phone, Mail, Package, FileText, Clock, MessageSquare, AlertCircle, Send, X } from 'lucide-react';
import { BudgetRequest, BudgetStatus, BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS, BudgetHistoryEntry, ACTION_TYPE_ICONS } from '../../types/budgetTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';

interface Service {
    id: string;
    name: string;
    category: string;
}

interface RevisionRequest {
    id: string;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    admin_response: string | null;
    created_at: string;
    responded_at: string | null;
}

interface ClientBudgetDetailProps {
    requestId: string;
    onBack: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    clientId: string;
}

export const ClientBudgetDetail: React.FC<ClientBudgetDetailProps> = ({ requestId, onBack, showToast, clientId }) => {
    const [request, setRequest] = useState<BudgetRequest | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [history, setHistory] = useState<BudgetHistoryEntry[]>([]);
    const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionReason, setRevisionReason] = useState('');
    const [submittingRevision, setSubmittingRevision] = useState(false);

    useEffect(() => {
        fetchBudgetData();
    }, [requestId]);

    const fetchBudgetData = async () => {
        setLoading(true);
        try {
            // 1. Fetch budget request
            const { data: budgetData, error: budgetError } = await supabase
                .from('budget_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (budgetError) throw budgetError;

            const mappedRequest: BudgetRequest = {
                id: budgetData.id,
                clientId: budgetData.client_id,
                clientName: budgetData.client_name,
                clientEmail: budgetData.client_email,
                clientPhone: budgetData.client_phone,
                projectLocationFull: budgetData.project_location_full,
                projectCity: budgetData.project_city,
                projectState: budgetData.project_state,
                observations: budgetData.observations,
                status: budgetData.status,
                createdAt: budgetData.created_at,
            };

            setRequest(mappedRequest);

            // 2. Fetch services (via budget_request_items)
            const { data: itemsData, error: itemsError } = await supabase
                .from('budget_request_items')
                .select('service_id, services(id, name, category)')
                .eq('budget_request_id', requestId);

            if (itemsError) throw itemsError;

            const mappedServices = itemsData
                .map((item: any) => item.services)
                .filter(Boolean);

            setServices(mappedServices);

            // 3. Fetch history
            const { data: historyData, error: historyError } = await supabase
                .from('budget_history')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('created_at', { ascending: false });

            if (historyError) throw historyError;

            const mappedHistory: BudgetHistoryEntry[] = historyData.map((item: any) => ({
                id: item.id,
                budgetRequestId: item.budget_request_id,
                actionType: item.action_type,
                description: item.description,
                performedBy: item.performed_by,
                createdAt: item.created_at,
            }));

            setHistory(mappedHistory);

            // 4. Fetch revision requests
            const { data: revisionsData, error: revisionsError } = await supabase
                .from('budget_revision_requests')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('created_at', { ascending: false });

            if (revisionsError) throw revisionsError;

            setRevisionRequests(revisionsData || []);
        } catch (error) {
            console.error('Erro ao carregar orçamento:', error);
            showToast?.('Erro ao carregar detalhes do orçamento', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRevision = async () => {
        if (!revisionReason.trim()) {
            showToast?.('Por favor, descreva o motivo da revisão', 'error');
            return;
        }

        setSubmittingRevision(true);

        try {
            const { error } = await supabase
                .from('budget_revision_requests')
                .insert({
                    budget_request_id: requestId,
                    requested_by: clientId,
                    reason: revisionReason,
                    status: 'pending'
                });

            if (error) throw error;

            showToast?.('Solicitação de revisão enviada com sucesso!', 'success');
            setShowRevisionModal(false);
            setRevisionReason('');
            fetchBudgetData(); // Reload to show new revision
        } catch (error) {
            console.error('Erro ao solicitar revisão:', error);
            showToast?.('Erro ao enviar solicitação de revisão', 'error');
        } finally {
            setSubmittingRevision(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando detalhes...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Orçamento não encontrado</p>
                <button onClick={onBack} className="mt-4 text-sm text-blue-600 hover:underline">
                    Voltar
                </button>
            </div>
        );
    }

    const hasPendingRevision = revisionRequests.some(r => r.status === 'pending');

    return (
        <div className="animate-fadeIn">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-bold">Voltar para lista</span>
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Detalhes do Orçamento</h2>
                        <p className="text-sm text-gray-500">ID: {request.id.slice(0, 8)}...</p>
                    </div>
                    <span className={`text-xs font-bold uppercase px-4 py-2 rounded-full ${BUDGET_STATUS_COLORS[request.status]}`}>
                        {BUDGET_STATUS_LABELS[request.status]}
                    </span>
                </div>

                {hasPendingRevision && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-yellow-900">Revisão Solicitada</p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Você solicitou uma revisão deste orçamento. Aguarde a resposta de nossa equipe.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Info (READ-ONLY) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-gray-400" />
                            Informações de Contato
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">Nome</label>
                                <p className="mt-1 text-gray-800">{request.clientName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                                <p className="mt-1 text-gray-800">{request.clientEmail}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-500">Telefone</label>
                                <p className="mt-1 text-gray-800">{request.clientPhone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Project Location */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Localização do Projeto
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">Endereço Completo</label>
                                <p className="mt-1 text-gray-800">{request.projectLocationFull}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Cidade</label>
                                    <p className="mt-1 text-gray-800">{request.projectCity}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Estado</label>
                                    <p className="mt-1 text-gray-800">{request.projectState}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-400" />
                            Serviços Solicitados ({services.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-bold">{service.name}</p>
                                        <p className="text-xs text-gray-500">{service.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Observations */}
                    {request.observations && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Observações Iniciais
                            </h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                {request.observations}
                            </p>
                        </div>
                    )}

                    {/* Revision Requests */}
                    {revisionRequests.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                Solicitações de Revisão
                            </h3>
                            <div className="space-y-4">
                                {revisionRequests.map(revision => (
                                    <div key={revision.id} className="border border-gray-100 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-500">
                                                {new Date(revision.created_at).toLocaleDateString('pt-BR')} às{' '}
                                                {new Date(revision.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${revision.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    revision.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {revision.status === 'pending' ? 'Pendente' :
                                                    revision.status === 'approved' ? 'Aprovada' : 'Negada'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                            <span className="font-bold">Motivo:</span> {revision.reason}
                                        </p>
                                        {revision.admin_response && (
                                            <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                                <p className="text-xs font-bold text-blue-900 mb-1">Resposta da Equipe:</p>
                                                <p className="text-sm text-blue-800">{revision.admin_response}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - History */}
                <div className="space-y-6">
                    {/* History Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Histórico
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {history.length > 0 ? (
                                history.map((entry, index) => {
                                    const Icon = ACTION_TYPE_ICONS[entry.actionType] || FileText;
                                    return (
                                        <div key={entry.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Icon className="w-4 h-4 text-gray-600" />
                                                </div>
                                                {index < history.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-grow pb-4">
                                                <p className="text-sm font-medium text-gray-800">{entry.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(entry.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                                    {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">Nenhum histórico disponível</p>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => setShowRevisionModal(true)}
                        disabled={hasPendingRevision}
                        className={`w-full py-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${hasPendingRevision
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {hasPendingRevision ? 'Revisão Pendente' : 'Solicitar Revisão'}
                    </button>
                </div>
            </div>

            {/* Revision Modal */}
            <AnimatePresence>
                {showRevisionModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-serif font-bold">Solicitar Revisão</h3>
                                <button onClick={() => setShowRevisionModal(false)}>
                                    <X className="w-5 h-5 text-gray-400 hover:text-black transition" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Descreva o que você gostaria de revisar neste orçamento. Nossa equipe analisará e entrará em contato.
                            </p>

                            <textarea
                                value={revisionReason}
                                onChange={(e) => setRevisionReason(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition resize-none"
                                rows={6}
                                placeholder="Ex: Gostaria de adicionar o serviço de paisagismo, ou preciso mudar o endereço do projeto..."
                            />

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowRevisionModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitRevision}
                                    disabled={submittingRevision || !revisionReason.trim()}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submittingRevision ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Enviar Solicitação
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
