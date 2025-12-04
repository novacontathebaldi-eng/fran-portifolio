import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Upload, FileText, Download, Clock, User, MapPin, Phone, Mail, Paperclip, MessageSquare, Save, Link as LinkIcon, UserPlus, Search, X, Check, Trash2 } from 'lucide-react';
import { BudgetRequest, BudgetAttachment, BudgetNote, BudgetHistoryEntry, Service, BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS, BudgetStatus } from '../../budgetTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { User as UserProfile } from '../../types';

interface BudgetRequestDetailProps {
    requestId: string;
    onBack: () => void;
}

export const BudgetRequestDetail: React.FC<BudgetRequestDetailProps> = ({ requestId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [request, setRequest] = useState<BudgetRequest | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [attachments, setAttachments] = useState<BudgetAttachment[]>([]);
    const [notes, setNotes] = useState<BudgetNote[]>([]);
    const [history, setHistory] = useState<BudgetHistoryEntry[]>([]);

    const [activeTab, setActiveTab] = useState<'general' | 'attachments' | 'history'>('general');
    const [newNote, setNewNote] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    // Modal states
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [creatingClient, setCreatingClient] = useState(false);

    // Fetch all data
    useEffect(() => {
        fetchRequestData();
    }, [requestId]);

    const fetchRequestData = async () => {
        setLoading(true);
        try {
            // Fetch main request
            const { data: requestData, error: requestError } = await supabase
                .from('budget_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (requestError) throw requestError;

            // Fetch services for this request
            const { data: itemsData } = await supabase
                .from('budget_request_items')
                .select('service_id')
                .eq('budget_request_id', requestId);

            if (itemsData && itemsData.length > 0) {
                const serviceIds = itemsData.map(item => item.service_id);
                const { data: servicesData } = await supabase
                    .from('services')
                    .select('*')
                    .in('id', serviceIds);

                if (servicesData) {
                    setServices(servicesData.map(s => ({
                        id: s.id,
                        category: s.category,
                        name: s.name,
                        description: s.description,
                        orderIndex: s.order_index,
                        active: s.active,
                        createdAt: s.created_at
                    })));
                }
            }

            setRequest({
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
                services: []
            });

            // Fetch attachments
            const { data: attachmentsData } = await supabase
                .from('budget_attachments')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('uploaded_at', { ascending: false });

            if (attachmentsData) {
                setAttachments(attachmentsData.map(a => ({
                    id: a.id,
                    budgetRequestId: a.budget_request_id,
                    fileName: a.file_name,
                    fileType: a.file_type,
                    fileUrl: a.file_url,
                    fileSize: a.file_size,
                    uploadedBy: a.uploaded_by,
                    uploadedAt: a.uploaded_at,
                    description: a.description
                })));
            }

            // Fetch notes
            const { data: notesData } = await supabase
                .from('budget_notes')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('created_at', { ascending: false });

            if (notesData) {
                setNotes(notesData.map(n => ({
                    id: n.id,
                    budgetRequestId: n.budget_request_id,
                    authorId: n.author_id,
                    content: n.content,
                    createdAt: n.created_at,
                    updatedAt: n.updated_at
                })));
            }

            // Fetch history
            const { data: historyData } = await supabase
                .from('budget_history')
                .select('*')
                .eq('budget_request_id', requestId)
                .order('created_at', { ascending: false });

            if (historyData) {
                setHistory(historyData.map(h => ({
                    id: h.id,
                    budgetRequestId: h.budget_request_id,
                    actionType: h.action_type,
                    description: h.description,
                    performedBy: h.performed_by,
                    performedByName: h.performed_by_name,
                    metadata: h.metadata,
                    createdAt: h.created_at
                })));
            }

        } catch (error) {
            console.error('Error fetching request:', error);
            alert('Erro ao carregar dados do orçamento');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: BudgetStatus) => {
        if (!request) return;

        setSaving(true);
        try {
            // Update status
            const { error } = await supabase
                .from('budget_requests')
                .update({ status: newStatus })
                .eq('id', requestId);

            if (error) throw error;

            // Add history entry (trigger should do this, but add manually as backup)
            await supabase.rpc('add_budget_history_entry', {
                p_budget_request_id: requestId,
                p_action_type: 'status_changed',
                p_description: `Status alterado para "${BUDGET_STATUS_LABELS[newStatus]}"`,
                p_metadata: { old_status: request.status, new_status: newStatus }
            });

            setRequest({ ...request, status: newStatus });
            fetchRequestData(); // Refresh to get new history
            alert('Status atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar status');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploadingFile(true);

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${requestId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('budget-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('budget-attachments')
                .getPublicUrl(filePath);

            // Save to database
            const { data: { user } } = await supabase.auth.getUser();

            const { error: dbError } = await supabase
                .from('budget_attachments')
                .insert({
                    budget_request_id: requestId,
                    file_name: file.name,
                    file_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'document',
                    file_url: data.publicUrl,
                    file_size: file.size,
                    uploaded_by: user?.id
                });

            if (dbError) throw dbError;

            // Add history entry
            await supabase.rpc('add_budget_history_entry', {
                p_budget_request_id: requestId,
                p_action_type: 'file_attached',
                p_description: `Arquivo "${file.name}" anexado`,
                p_metadata: { file_name: file.name, file_size: file.size }
            });

            alert('Arquivo enviado com sucesso!');
            fetchRequestData();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Erro ao enviar arquivo');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSaveNote = async () => {
        if (!newNote.trim()) return;

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('budget_notes')
                .insert({
                    budget_request_id: requestId,
                    author_id: user?.id,
                    content: newNote
                });

            if (error) throw error;

            // Add history entry
            await supabase.rpc('add_budget_history_entry', {
                p_budget_request_id: requestId,
                p_action_type: 'note_added',
                p_description: 'Nova nota interna adicionada',
                p_metadata: {}
            });

            setNewNote('');
            alert('Nota salva!');
            fetchRequestData();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Erro ao salvar nota');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!confirm('Excluir este anexo permanentemente?')) return;

        try {
            const { error } = await supabase
                .from('budget_attachments')
                .delete()
                .eq('id', attachmentId);

            if (error) throw error;

            alert('Anexo excluído!');
            fetchRequestData();
        } catch (error) {
            console.error('Error deleting attachment:', error);
            alert('Erro ao excluir anexo');
        }
    };

    const searchClients = async () => {
        if (!searchTerm.trim()) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('name', `%${searchTerm}%`)
                .or(`email.ilike.%${searchTerm}%`)
                .limit(10);

            if (error) throw error;

            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching clients:', error);
        }
    };

    const handleLinkClient = async (clientId: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('budget_requests')
                .update({ client_id: clientId })
                .eq('id', requestId);

            if (error) throw error;

            // Add history
            await supabase.rpc('add_budget_history_entry', {
                p_budget_request_id: requestId,
                p_action_type: 'linked_to_client',
                p_description: 'Orçamento vinculado a cliente existente',
                p_metadata: { client_id: clientId }
            });

            alert('Cliente vinculado com sucesso!');
            setShowLinkModal(false);
            fetchRequestData();
        } catch (error) {
            console.error('Error linking client:', error);
            alert('Erro ao vincular cliente');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateClient = async () => {
        if (!request) return;

        setCreatingClient(true);
        try {
            // Create profile in database
            const { data: newProfile, error } = await supabase
                .from('profiles')
                .insert({
                    name: request.clientName,
                    email: request.clientEmail,
                    phone: request.clientPhone,
                    role: 'client'
                })
                .select()
                .single();

            if (error) throw error;

            // Link to this request
            await handleLinkClient(newProfile.id);

            // Add history
            await supabase.rpc('add_budget_history_entry', {
                p_budget_request_id: requestId,
                p_action_type: 'client_created',
                p_description: `Novo cliente "${request.clientName}" criado e vinculado`,
                p_metadata: { client_id: newProfile.id }
            });

            alert('Novo cliente criado e vinculado!');
        } catch (error) {
            console.error('Error creating client:', error);
            alert('Erro ao criar cliente');
        } finally {
            setCreatingClient(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando orçamento...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Orçamento não encontrado</p>
                    <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Voltar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-black">{request.clientName}</h2>
                        <p className="text-gray-500 text-sm">
                            Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Status:</span>
                    <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(e.target.value as BudgetStatus)}
                        disabled={saving}
                        className={`px-4 py-2 rounded-full font-bold text-xs border-2 focus:outline-none transition ${BUDGET_STATUS_COLORS[request.status]} border-transparent`}
                    >
                        <option value="pending">Pendente</option>
                        <option value="analyzing">Em Análise</option>
                        <option value="quoted">Orçado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {[
                    { id: 'general' as const, label: 'Geral', icon: FileText },
                    { id: 'attachments' as const, label: 'Anexos', icon: Paperclip, count: attachments.length },
                    { id: 'history' as const, label: 'Histórico', icon: Clock, count: history.length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition border-b-2 ${activeTab === tab.id
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                    <motion.div
                        key="general"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Column 1: Client Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg">Informações do Cliente</h3>
                                    {!request.clientId && (
                                        <button
                                            onClick={() => setShowLinkModal(true)}
                                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <LinkIcon className="w-3 h-3" />
                                            Vincular Cliente
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{request.clientName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${request.clientEmail}`} className="text-sm text-blue-600 hover:underline">
                                            {request.clientEmail}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <a href={`tel:${request.clientPhone}`} className="text-sm text-blue-600 hover:underline">
                                            {request.clientPhone}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="text-sm">
                                            <p>{request.projectLocationFull}</p>
                                            <p className="text-gray-500">{request.projectCity}, {request.projectState}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4">Serviços Solicitados</h3>
                                {services.length > 0 ? (
                                    <div className="space-y-2">
                                        {services.map(service => (
                                            <div key={service.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-sm">{service.name}</p>
                                                    <p className="text-xs text-gray-500">{service.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">Nenhum serviço selecionado</p>
                                )}
                            </div>

                            {/* Observations */}
                            {request.observations && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-lg mb-4">Observações do Cliente</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.observations}</p>
                                </div>
                            )}
                        </div>

                        {/* Column 2: Notes */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Notas Internas
                                </h3>

                                {/* New Note Form */}
                                <div className="mb-4">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Adicionar nota interna..."
                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black transition"
                                        rows={4}
                                    />
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={saving || !newNote.trim()}
                                        className="mt-2 w-full bg-black text-white py-2 rounded-lg font-bold text-xs hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-3 h-3" />
                                        Salvar Nota
                                    </button>
                                </div>

                                {/* Notes List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {notes.map(note => (
                                        <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(note.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    ))}
                                    {notes.length === 0 && (
                                        <p className="text-gray-400 text-xs text-center py-4">Nenhuma nota ainda</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'attachments' && (
                    <motion.div
                        key="attachments"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Arquivos Anexados</h3>
                            <label className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition cursor-pointer flex items-center gap-2">
                                <Upload className="w-3 h-3" />
                                {uploadingFile ? 'Enviando...' : 'Anexar Arquivo'}
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploadingFile}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attachments.map(attachment => (
                                <div key={attachment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-start justify-between mb-2">
                                        <Paperclip className="w-5 h-5 text-gray-400" />
                                        <button
                                            onClick={() => handleDeleteAttachment(attachment.id)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="font-bold text-sm mb-1 truncate">{attachment.fileName}</p>
                                    <p className="text-xs text-gray-400 mb-3">
                                        {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                                    </p>
                                    <a
                                        href={attachment.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Download className="w-3 h-3" />
                                        Baixar
                                    </a>
                                </div>
                            ))}
                        </div>

                        {attachments.length === 0 && (
                            <div className="text-center py-12">
                                <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400">Nenhum arquivo anexado ainda</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    >
                        <h3 className="font-bold text-lg mb-6">Linha do Tempo</h3>
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            {/* Timeline Items */}
                            <div className="space-y-6">
                                {history.map(entry => (
                                    <div key={entry.id} className="relative pl-14">
                                        {/* Icon */}
                                        <div className="absolute left-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                                            {entry.actionType === 'created' && <FileText className="w-5 h-5 text-green-600" />}
                                            {entry.actionType === 'status_changed' && <Edit2 className="w-5 h-5 text-blue-600" />}
                                            {entry.actionType === 'file_attached' && <Paperclip className="w-5 h-5 text-purple-600" />}
                                            {entry.actionType === 'note_added' && <MessageSquare className="w-5 h-5 text-orange-600" />}
                                            {entry.actionType === 'linked_to_client' && <LinkIcon className="w-5 h-5 text-indigo-600" />}
                                            {entry.actionType === 'client_created' && <UserPlus className="w-5 h-5 text-teal-600" />}
                                        </div>

                                        {/* Content */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm font-bold mb-1">{entry.description}</p>
                                            <p className="text-xs text-gray-500">
                                                {entry.performedByName || 'Sistema'} · {new Date(entry.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {history.length === 0 && (
                                <div className="text-center py-12">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400">Nenhum histórico registrado</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Link Client Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Vincular a Cliente</h3>
                                <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchClients()}
                                        placeholder="Buscar por nome ou email..."
                                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black"
                                    />
                                    <button
                                        onClick={searchClients}
                                        className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-800"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="space-y-2 mb-4">
                                {searchResults.map(client => (
                                    <div
                                        key={client.id}
                                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                                        onClick={() => handleLinkClient(client.id)}
                                    >
                                        <p className="font-bold text-sm">{client.name}</p>
                                        <p className="text-xs text-gray-500">{client.email}</p>
                                    </div>
                                ))}
                                {searchTerm && searchResults.length === 0 && (
                                    <p className="text-gray-400 text-sm text-center py-4">Nenhum cliente encontrado</p>
                                )}
                            </div>

                            {/* Create New */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleCreateClient}
                                    disabled={creatingClient}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {creatingClient ? 'Criando...' : 'Criar Novo Cliente com estes Dados'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
