import React, { useState, useEffect } from 'react';
import { X, Upload, Download, FileText, Trash2, Save, ArrowLeft, LinkIcon, UserPlus, Clock } from 'lucide-react';
import { BudgetRequest, BudgetAttachment, BudgetNote, BudgetHistoryEntry, Service, BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS, ACTION_TYPE_ICONS } from '../../types/budgetTypes';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';

interface BudgetRequestDetailProps {
    requestId: string;
    onBack: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    currentUserId?: string;
}

export const BudgetRequestDetail: React.FC<BudgetRequestDetailProps> = ({
    requestId,
    onBack,
    showToast,
    currentUserId
}) => {
    const [request, setRequest] = useState<BudgetRequest | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [attachments, setAttachments] = useState<BudgetAttachment[]>([]);
    const [notes, setNotes] = useState<BudgetNote[]>([]);
    const [history, setHistory] = useState<BudgetHistoryEntry[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [searchClient, setSearchClient] = useState('');

    useEffect(() => {
        fetchRequestDetails();
    }, [requestId]);

    const fetchRequestDetails = async () => {
        setLoading(true);
        try {
            // Fetch request
            const { data: requestData, error: requestError } = await supabase
                .from('budget_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (requestError) throw requestError;

            const mappedRequest: BudgetRequest = {
                id: requestData.id,
                clientId: requestData.client_id,
                clientName: requestData.client_name,
                clientEmail: requestData.client_email,
                clientPhone: requestData.client_phone,
                projectLocationFull: requestData.project_location_full,
                projectCity: requestData.project_city,
                projectState: requestData.project_state,
                observations: requestData.observations,
                status: requestData.status,
                createdAt: requestData.created_at,
            };

            // Fetch services for this request
            const { data: itemsData } = await supabase
                .from('budget_request_items')
                .select(`
          service_id,
          services (id, category, name, description, order_index, active, created_at)
        `)
                .eq('budget_request_id', requestId);

            const requestServices = itemsData?.map((item: any) => ({
                id: item.services.id,
                category: item.services.category,
                name: item.services.name,
                description: item.services.description,
                orderIndex: item.services.order_index,
                active: item.services.active,
                createdAt: item.services.created_at,
            })) || [];

            // Fetch attachments
            const { data: attachmentsData } = await supabase
                .from('budget_attachments')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('uploaded_at', { ascending: false });

            const mappedAttachments = attachmentsData?.map(a => ({
                id: a.id,
                budgetRequestId: a.budget_request_id,
                fileName: a.file_name,
                fileType: a.file_type,
                fileUrl: a.file_url,
                fileSize: a.file_size,
                uploadedBy: a.uploaded_by,
                uploadedAt: a.uploaded_at,
                description: a.description,
            })) || [];

            // Fetch notes
            const { data: notesData } = await supabase
                .from('budget_notes')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('created_at', { ascending: false });

            const mappedNotes = notesData?.map(n => ({
                id: n.id,
                budgetRequestId: n.budget_request_id,
                authorId: n.author_id,
                content: n.content,
                createdAt: n.created_at,
                updatedAt: n.updated_at,
            })) || [];

            // Fetch history
            const { data: historyData } = await supabase
                .from('budget_history')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('created_at', { ascending: false });

            const mappedHistory = historyData?.map(h => ({
                id: h.id,
                budgetRequestId: h.budget_request_id,
                actionType: h.action_type,
                description: h.description,
                performedBy: h.performed_by,
                performedByName: h.performed_by_name,
                metadata: h.metadata,
                createdAt: h.created_at,
            })) || [];

            setRequest(mappedRequest);
            setServices(requestServices);
            setAttachments(mappedAttachments);
            setNotes(mappedNotes);
            setHistory(mappedHistory);
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            showToast?.('Erro ao carregar detalhes do orçamento', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!request) return;

        try {
            const { error } = await supabase
                .from('budget_requests')
                .update({ status: newStatus })
                .eq('id', requestId);

            if (error) throw error;

            setRequest({ ...request, status: newStatus as any });
            showToast?.('Status atualizado com sucesso', 'success');
            fetchRequestDetails(); // Reload to get updated history
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showToast?.('Erro ao atualizar status', 'error');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploading(true);
        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${requestId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('budget-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('budget-attachments')
                .getPublicUrl(filePath);

            // Save to database
            const { error: dbError } = await supabase
                .from('budget_attachments')
                .insert({
                    budget_request_id: requestId,
                    file_name: file.name,
                    file_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'document',
                    file_url: urlData.publicUrl,
                    file_size: file.size,
                    uploaded_by: currentUserId,
                });

            if (dbError) throw dbError;

            showToast?.('Arquivo anexado com sucesso', 'success');
            fetchRequestDetails(); // Reload
        } catch (error) {
            console.error('Erro ao anexar arquivo:', error);
            showToast?.('Erro ao anexar arquivo', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!confirm('Excluir este anexo?')) return;

        try {
            const { error } = await supabase
                .from('budget_attachments')
                .delete()
                .eq('id', attachmentId);

            if (error) throw error;

            showToast?.('Anexo excluído', 'success');
            fetchRequestDetails();
        } catch (error) {
            console.error('Erro ao excluir anexo:', error);
            showToast?.('Erro ao excluir anexo', 'error');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            const { error } = await supabase
                .from('budget_notes')
                .insert({
                    budget_request_id: requestId,
                    author_id: currentUserId,
                    content: newNote,
                });

            if (error) throw error;

            setNewNote('');
            showToast?.('Nota adicionada', 'success');
            fetchRequestDetails();
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
            showToast?.('Erro ao adicionar nota', 'error');
        }
    };

    const fetchClients = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, name, email')
            .ilike('name', `%${searchClient}%`)
            .limit(10);

        setClients(data || []);
    };

    const handleLinkClient = async (clientId: string) => {
        try {
            const { error } = await supabase
                .from('budget_requests')
                .update({ client_id: clientId })
                .eq('id', requestId);

            if (error) throw error;

            showToast?.('Orçamento vinculado ao cliente', 'success');
            setShowLinkModal(false);
            fetchRequestDetails();
        } catch (error) {
            console.error('Erro ao vincular:', error);
            showToast?.('Erro ao vincular cliente', 'error');
        }
    };

    const handleCreateNewClient = async () => {
        if (!request) return;

        try {
            // Create new profile
            const { data: newClient, error: createError } = await supabase
                .from('profiles')
                .insert({
                    name: request.clientName,
                    email: request.clientEmail,
                    phone: request.clientPhone,
                    role: 'client',
                })
                .select()
                .single();

            if (createError) throw createError;

            // Link to this budget
            await handleLinkClient(newClient.id);

            showToast?.('Cliente criado e vinculado com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            showToast?.('Erro ao criar cliente', 'error');
        }
    };

    if (loading || !request) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando detalhes...</p>
                </div>
            </div>
        );
    }

    const groupedServices = services.reduce((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para lista
                    </button>
                    <h2 className="text-3xl font-serif font-bold text-black">{request.clientName}</h2>
                    <p className="text-gray-500 mt-1">
                        Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                </div>

                {/* Status Selector */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Status</label>
                    <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${request.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                                request.status === 'analyzing' ? 'border-blue-300 bg-blue-50' :
                                    request.status === 'quoted' ? 'border-purple-300 bg-purple-50' :
                                        request.status === 'completed' ? 'border-green-300 bg-green-50' :
                                            'border-gray-300 bg-gray-50'
                            }`}
                    >
                        <option value="pending">Pendente</option>
                        <option value="analyzing">Em Análise</option>
                        <option value="quoted">Orçado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Client Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            Informações do Cliente
                            {!request.clientId && (
                                <button
                                    onClick={() => setShowLinkModal(true)}
                                    className="ml-auto text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 flex items-center gap-1"
                                >
                                    <LinkIcon className="w-3 h-3" />
                                    Vincular Cliente
                                </button>
                            )}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400">Nome</label>
                                <p className="text-sm font-medium">{request.clientName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400">Email</label>
                                <p className="text-sm font-medium">{request.clientEmail}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400">Telefone</label>
                                <p className="text-sm font-medium">{request.clientPhone}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-400">Local do Projeto</label>
                                <p className="text-sm font-medium">{request.projectLocationFull}</p>
                                <p className="text-xs text-gray-500">{request.projectCity}, {request.projectState}</p>
                            </div>
                            {request.observations && (
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-gray-400">Observações</label>
                                    <p className="text-sm font-medium">{request.observations}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">Serviços Solicitados</h3>
                        {Object.entries(groupedServices).map(([category, categoryServices]) => (
                            <div key={category} className="mb-4">
                                <h4 className="font-bold text-sm text-gray-600 mb-2">{category}</h4>
                                <div className="space-y-1">
                                    {categoryServices.map(service => (
                                        <div key={service.id} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                            {service.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {services.length === 0 && (
                            <p className="text-gray-400 text-sm">Nenhum serviço selecionado</p>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Anexos</h3>
                            <label className={`bg-black text-white px-4 py-2 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-800 transition flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-3 h-3" />
                                {uploading ? 'Enviando...' : 'Anexar Arquivo'}
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="space-y-2">
                            {attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium">{attachment.fileName}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                                                {attachment.fileSize && ` • ${(attachment.fileSize / 1024).toFixed(1)} KB`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={attachment.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 p-2"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteAttachment(attachment.id)}
                                            className="text-red-600 hover:text-red-800 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {attachments.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">Nenhum anexo</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Histórico
                        </h3>
                        <div className="space-y-4">
                            {history.map(entry => (
                                <div key={entry.id} className="flex gap-3">
                                    <div className="text-lg">{ACTION_TYPE_ICONS[entry.actionType]}</div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium">{entry.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {entry.performedByName || 'Sistema'} • {new Date(entry.createdAt).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {history.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">Nenhum histórico</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">Notas Internas</h3>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Adicionar nota privada..."
                            className="w-full border border-gray-200 p-3 rounded-lg text-sm resize-none focus:outline-none focus:border-black mb-2"
                            rows={3}
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className="w-full bg-black text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Salvar Nota
                        </button>

                        <div className="mt-4 space-y-3">
                            {notes.map(note => (
                                <div key={note.id} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-sm mb-1">{note.content}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(note.createdAt).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            ))}
                            {notes.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">Nenhuma nota</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Client Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Vincular Cliente</h3>
                            <button onClick={() => setShowLinkModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchClient}
                                onChange={(e) => setSearchClient(e.target.value)}
                                onKeyUp={fetchClients}
                                placeholder="Buscar cliente por nome..."
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                            {clients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => handleLinkClient(client.id)}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{client.name}</p>
                                        <p className="text-xs text-gray-500">{client.email}</p>
                                    </div>
                                    <LinkIcon className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                            {clients.length === 0 && searchClient && (
                                <p className="text-gray-400 text-sm text-center py-4">Nenhum cliente encontrado</p>
                            )}
                        </div>

                        <button
                            onClick={handleCreateNewClient}
                            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Criar Novo Cliente com esses Dados
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
