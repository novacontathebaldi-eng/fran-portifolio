import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LayoutDashboard, FolderOpen, Users, Settings, LogOut, FileText, Save, Brain, ShoppingBag, Menu, X, ChevronRight, MessageSquare, Check, Clock, Upload, ImageIcon, Folder, Download, ArrowLeft, Bot, ThumbsDown, Calendar, MapPin, Ban, Map, GripVertical, ArrowUp, ArrowDown, Type, Quote, LayoutGrid, Heading, Info, RefreshCw, Archive, Link as LinkIcon, ThumbsUp, ToggleLeft, ToggleRight, Search, Landmark, Loader2, History, Mail } from 'lucide-react';
import { SiteContent, GlobalSettings, StatItem, PillarItem, User, ClientFolder, Appointment, OfficeDetails, ContentBlock, ClientMemory, FaqItem, SocialLink, DashboardWidget, DashboardTabId } from '../../types';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { BudgetRequestsDashboard } from './BudgetRequestsDashboard';
import { BudgetRequestDetail } from './BudgetRequestDetail';
import { Receipt } from 'lucide-react';
import { MessagesDashboard } from './MessagesDashboard';
import { ShopManagement } from './ShopManagement';
import { ImageCropModal, useImageCropModal } from '../../components/ImageCropModal';

// Real Supabase Upload
const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('storage-Fran')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('storage-Fran')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const AdminDashboard: React.FC = () => {
    const { projects, deleteProject, culturalProjects, deleteCulturalProject, logout, siteContent, updateSiteContent, showToast, settings, updateSettings, persistAllSettings, messages, users, createClientFolder, renameClientFolder, deleteClientFolder, uploadFileToFolder, deleteClientFile, updateUser, aiFeedbacks, appointments, scheduleSettings, updateScheduleSettings, updateAppointmentStatus, updateAppointment, deleteAppointmentPermanently, currentUser, isLoadingData } = useProjects();
    const navigate = useNavigate();

    // TABS: Added 'cultural' and 'shop'
    const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'cultural' | 'content' | 'settings' | 'ai-config' | 'messages' | 'clients' | 'agenda' | 'office' | 'budgets' | 'shop'>('dashboard');

    // Contact Messages State Removed (Unified)

    // Mobile Menu State
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedBudgetRequestId, setSelectedBudgetRequestId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Message fetch logic moved to ProjectContext

    // Local forms
    const [contentForm, setContentForm] = useState<SiteContent>(siteContent);
    const [settingsForm, setSettingsForm] = useState<GlobalSettings>(settings);


    // Sync contentForm with siteContent when it loads from DB
    useEffect(() => {
        if (siteContent) {
            setContentForm(siteContent);
        }
    }, [siteContent]);

    // Sync settingsForm with settings when it loads from DB (ONLY after data is loaded)
    const settingsInitialized = React.useRef(false);
    useEffect(() => {
        // Wait for data to load from DB before syncing
        if (settings && !isLoadingData && !settingsInitialized.current) {
            setSettingsForm(settings);
            settingsInitialized.current = true;
        }
    }, [settings, isLoadingData]);

    // Client Details View
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [activeClientTab, setActiveClientTab] = useState<'info' | 'memories' | 'files'>('info');

    // Admin File Manager State
    const [currentAdminFolderId, setCurrentAdminFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);

    // Rename State
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');

    // AGENDA STATES
    const [showHistory, setShowHistory] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showEditDashboardModal, setShowEditDashboardModal] = useState(false); // Dashboard customization modal
    const [selectedWidgetsToAdd, setSelectedWidgetsToAdd] = useState<string[]>([]); // Multi-select for adding widgets
    const [localEditingWidgets, setLocalEditingWidgets] = useState<DashboardWidget[]>([]); // Local copy for editing before save
    const [blockForm, setBlockForm] = useState({ date: '', time: '' });
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    // Office Crop Modal States
    const [officeCropModalOpen, setOfficeCropModalOpen] = useState(false);
    const [officeCropImage, setOfficeCropImage] = useState('');
    const [officeCropFile, setOfficeCropFile] = useState<File | null>(null);
    const [pendingOfficeBlockId, setPendingOfficeBlockId] = useState<string | null>(null);
    const [pendingOfficeGridIndex, setPendingOfficeGridIndex] = useState<number | null>(null);

    // SYNC SELECTED CLIENT WITH GLOBAL USERS STATE
    // This ensures that when a folder is created/deleted/renamed via Context, the local view updates immediately.
    useEffect(() => {
        if (selectedClient) {
            const updatedUser = users.find(u => u.id === selectedClient.id);
            if (updatedUser) {
                setSelectedClient(updatedUser);
            }
        }
    }, [users]); // Trigger whenever users list changes in context

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            deleteProject(id);
            showToast('Projeto excluído.', 'info');
        }
    };

    const handleCulturalDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este projeto cultural?')) {
            deleteCulturalProject(id);
            showToast('Projeto cultural excluído.', 'info');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
        showToast('Logout realizado.', 'info');
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContentForm(prev => ({
            ...prev,
            about: {
                ...prev.about,
                [name]: value
            }
        }));
    };

    // Generic Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: 'about' | 'office', fieldName: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            const url = await uploadToSupabase(file);
            setContentForm(prev => ({
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [fieldName]: url
                }
            }));
            showToast('Imagem carregada com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao carregar imagem', 'error');
        } finally {
            setUploading(false);
        }
    };

    const updateStat = (id: string, field: keyof StatItem, value: string) => {
        setContentForm(prev => ({
            ...prev,
            about: {
                ...prev.about,
                stats: prev.about.stats.map(s => s.id === id ? { ...s, [field]: value } : s)
            }
        }));
    };

    const addStat = () => {
        const newStat: StatItem = { id: Date.now().toString(), value: '0', label: 'Novo Dado' };
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, stats: [...prev.about.stats, newStat] }
        }));
    };

    const removeStat = (id: string) => {
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, stats: prev.about.stats.filter(s => s.id !== id) }
        }));
    };

    const updatePillar = (id: string, field: keyof PillarItem, value: string) => {
        setContentForm(prev => ({
            ...prev,
            about: {
                ...prev.about,
                pillars: prev.about.pillars.map(p => p.id === id ? { ...p, [field]: value } : p)
            }
        }));
    };

    const addPillar = () => {
        const newPillar: PillarItem = { id: Date.now().toString(), title: 'Novo Pilar', description: 'Descrição...' };
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, pillars: [...prev.about.pillars, newPillar] }
        }));
    };

    const removePillar = (id: string) => {
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, pillars: prev.about.pillars.filter(p => p.id !== id) }
        }));
    };

    // Recognition
    const addRecognition = () => {
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, recognition: [...prev.about.recognition, 'Nova Mídia'] }
        }));
    }

    const updateRecognition = (index: number, value: string) => {
        const newRec = [...contentForm.about.recognition];
        newRec[index] = value;
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, recognition: newRec }
        }));
    }

    const removeRecognition = (index: number) => {
        const newRec = contentForm.about.recognition.filter((_, i) => i !== index);
        setContentForm(prev => ({
            ...prev,
            about: { ...prev.about, recognition: newRec }
        }));
    }

    const handleSettingsChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const parts = field.split('.');
            if (parts.length === 2) {
                const [parent, child] = parts;
                setSettingsForm(prev => {
                    const parentObj = (prev as any)[parent] || {};
                    return {
                        ...prev,
                        [parent]: {
                            ...parentObj,
                            [child]: value
                        }
                    };
                });
            }
        } else {
            setSettingsForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const saveContent = async () => {
        setSaving(true);
        try {
            // Usar a função do contexto que já trata o salvamento correto no banco
            updateSiteContent(contentForm);
            showToast('Conteúdo salvo com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao salvar:", err);
            showToast('Erro ao salvar.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // Use unified persist function with all local form values to avoid race condition
            const success = await persistAllSettings(contentForm, settingsForm, scheduleSettings);

            if (success) {
                showToast('Configurações salvas com sucesso!', 'success');
            } else {
                showToast('Erro ao salvar algumas configurações. Tente novamente.', 'error');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            showToast('Erro ao salvar configurações.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ... (Other handlers unchanged) ...
    const handleAdminDeleteMemory = (memoryId: string) => {
        if (!selectedClient) return;
        if (confirm('Tem certeza que deseja apagar esta memória do cliente?')) {
            const updatedMemories = (selectedClient.memories || []).filter(m => m.id !== memoryId);
            const updatedClient = { ...selectedClient, memories: updatedMemories };
            updateUser(updatedClient);
            showToast('Memória removida.', 'success');
        }
    }

    const handleCreateFolder = () => {
        if (newFolderName.trim() && selectedClient) {
            createClientFolder(selectedClient.id, newFolderName);
            setNewFolderName('');
            setShowNewFolderInput(false);
            showToast('Pasta criada.', 'success');
        }
    };

    const startRenaming = (folder: ClientFolder) => {
        setEditingFolderId(folder.id);
        setEditFolderName(folder.name);
    };

    const handleRenameFolder = () => {
        if (editingFolderId && editFolderName.trim() && selectedClient) {
            renameClientFolder(selectedClient.id, editingFolderId, editFolderName);
            setEditingFolderId(null);
            showToast('Pasta renomeada.', 'success');
        }
    };

    const handleDeleteFolder = (folderId: string) => {
        if (selectedClient && confirm('Excluir esta pasta e todos os arquivos?')) {
            deleteClientFolder(selectedClient.id, folderId);
            if (currentAdminFolderId === folderId) setCurrentAdminFolderId(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedClient || !currentAdminFolderId) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            await uploadFileToFolder(selectedClient.id, currentAdminFolderId, file);
            showToast('Arquivo enviado!', 'success');
        } catch (err) {
            showToast('Erro no envio.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = (fileId: string) => {
        if (selectedClient && currentAdminFolderId && confirm('Excluir arquivo?')) {
            deleteClientFile(selectedClient.id, currentAdminFolderId, fileId);
        }
    };

    const NavItem = ({ id, icon: Icon, label, count }: { id: typeof activeTab, icon: any, label: string, count?: number }) => (
        <button
            onClick={() => { setActiveTab(id); setMobileMenuOpen(false); setSelectedClient(null); setCurrentAdminFolderId(null); }}
            className={`flex items-center space-x-4 w-full p-4 rounded-xl transition duration-200 active:scale-95 relative ${activeTab === id ? 'bg-white text-black font-bold shadow-lg md:transform md:scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {count !== undefined && count > 0 && (
                <span className="absolute right-4 md:right-auto md:left-36 bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
            {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto md:hidden" />}
        </button>
    );

    const unreadMessagesCount = messages.filter(m => m.status === 'new').length;
    const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

    // Sorting appointments
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());

    // Filter Logic for Agenda View
    const isPast = (date: string) => {
        // Check if date is before TODAY (00:00:00)
        const d = new Date(date);
        // Adjust to local timezone date string comparison to avoid UTC issues
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(d.toISOString().split('T')[0]).getTime() < today.getTime();
    };

    const filteredAppointments = sortedAppointments.filter(a => {
        if (showHistory) {
            // History shows: Cancelled OR Past appointments
            return a.status === 'cancelled' || isPast(a.date);
        } else {
            // Active shows: Future/Today AND Not Cancelled
            return !isPast(a.date) && a.status !== 'cancelled';
        }
    });

    // Handle Office Change
    const handleOfficeChange = (field: keyof OfficeDetails, value: any) => {
        setContentForm(prev => ({
            ...prev,
            office: {
                ...prev.office,
                [field]: value
            }
        }));
    };

    // --- Office Block Logic ---
    const addOfficeBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: '',
            items: type === 'image-grid' ? ['', ''] : undefined,
        };
        const currentBlocks = contentForm.office.blocks || [];
        handleOfficeChange('blocks', [...currentBlocks, newBlock]);
    };

    const updateOfficeBlock = (id: string, field: keyof ContentBlock, value: any) => {
        const currentBlocks = contentForm.office.blocks || [];
        const updated = currentBlocks.map(b => b.id === id ? { ...b, [field]: value } : b);
        handleOfficeChange('blocks', updated);
    };

    const updateOfficeGridItem = (blockId: string, index: number, value: string) => {
        const currentBlocks = contentForm.office.blocks || [];
        const updated = currentBlocks.map(b => {
            if (b.id !== blockId) return b;
            const newItems = [...(b.items || [])];
            newItems[index] = value;
            return { ...b, items: newItems };
        });
        handleOfficeChange('blocks', updated);
    };

    const removeOfficeBlock = (id: string) => {
        const currentBlocks = contentForm.office.blocks || [];
        handleOfficeChange('blocks', currentBlocks.filter(b => b.id !== id));
    };

    const moveOfficeBlock = (index: number, direction: 'up' | 'down') => {
        const blocks = [...(contentForm.office.blocks || [])];
        if (direction === 'up' && index > 0) {
            [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        }
        handleOfficeChange('blocks', blocks);
    };

    const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
        setOfficeCropImage(dataUrl);
        setOfficeCropFile(file);
        setPendingOfficeBlockId(blockId);
        setPendingOfficeGridIndex(null);
        setOfficeCropModalOpen(true);
        e.target.value = '';
    };

    const handleCroppedOfficeImage = async (file: File) => {
        try {
            const url = await uploadToSupabase(file);
            if (pendingOfficeBlockId && pendingOfficeGridIndex === null) {
                updateOfficeBlock(pendingOfficeBlockId, 'content', url);
            } else if (pendingOfficeBlockId && pendingOfficeGridIndex !== null) {
                updateOfficeGridItem(pendingOfficeBlockId, pendingOfficeGridIndex, url);
            }
            showToast('Imagem otimizada e enviada!', 'success');
        } catch (err) {
            showToast('Erro ao enviar imagem', 'error');
        }
        setOfficeCropModalOpen(false);
        setPendingOfficeBlockId(null);
        setPendingOfficeGridIndex(null);
    };

    const handleGridImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, index: number) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
        setOfficeCropImage(dataUrl);
        setOfficeCropFile(file);
        setPendingOfficeBlockId(blockId);
        setPendingOfficeGridIndex(index);
        setOfficeCropModalOpen(true);
        e.target.value = '';
    };

    // --- Blocking Logic ---
    const handleAddBlock = () => {
        if (!blockForm.date) return;
        if (blockForm.time) {
            // Block specific slot
            updateScheduleSettings({
                ...scheduleSettings,
                blockedSlots: [...(scheduleSettings.blockedSlots || []), { date: blockForm.date, time: blockForm.time }]
            });
            showToast(`Horário ${blockForm.time} bloqueado.`, 'success');
        } else {
            // Block full day
            updateScheduleSettings({
                ...scheduleSettings,
                blockedDates: [...scheduleSettings.blockedDates, blockForm.date]
            });
            showToast(`Dia ${blockForm.date} bloqueado.`, 'success');
        }
        setBlockForm({ date: '', time: '' });
        setShowBlockModal(false);
    }

    const handleRemoveBlockDate = (date: string) => {
        updateScheduleSettings({
            ...scheduleSettings,
            blockedDates: scheduleSettings.blockedDates.filter(d => d !== date)
        });
    }

    const handleRemoveBlockSlot = (date: string, time: string) => {
        updateScheduleSettings({
            ...scheduleSettings,
            blockedSlots: (scheduleSettings.blockedSlots || []).filter(s => !(s.date === date && s.time === time))
        });
    }

    // --- Appointment Editing ---
    const handleSaveAppointment = () => {
        if (editingAppointment) {
            updateAppointment(editingAppointment);
            setEditingAppointment(null);
            showToast('Agendamento atualizado.', 'success');
        }
    }

    return (
        <div className="min-h-screen bg-[#111] flex font-sans text-gray-100">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-[#111] z-50 flex justify-between items-center p-4 border-b border-gray-800">
                <span className="text-xl font-serif font-bold">Fran Siller.</span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Overlay - Click to close sidebar */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:relative z-40 w-64 h-screen bg-[#111] border-r border-gray-800 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} pt-16 md:pt-0`}>
                <div className="p-8 hidden md:block shrink-0">
                    <h1 className="text-2xl font-serif font-bold tracking-wider">Fran Siller<span className="text-accent">.</span></h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Painel Administrativo</p>
                </div>

                <nav className="flex-grow px-4 space-y-2 overflow-y-auto pb-4">
                    <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
                    <NavItem id="agenda" icon={Calendar} label="Agenda" count={pendingAppointmentsCount} />
                    <NavItem id="projects" icon={FolderOpen} label="Projetos" />
                    <NavItem id="cultural" icon={Landmark} label="Cultura" />
                    <NavItem id="clients" icon={Users} label="Clientes & Arquivos" />
                    <NavItem id="ai-config" icon={Brain} label="Inteligência Artificial" />
                    <NavItem id="budgets" icon={Receipt} label="Orçamentos" />
                    <NavItem id="shop" icon={ShoppingBag} label="Loja" />
                    <NavItem id="messages" icon={MessageSquare} label="Mensagens" count={unreadMessagesCount} />
                    <NavItem id="office" icon={MapPin} label="Escritório (Site)" />
                    <NavItem id="content" icon={FileText} label="Conteúdo Site" />
                    <NavItem id="settings" icon={Settings} label="Configurações" />
                </nav>

                <div className="p-4 border-t border-gray-800 shrink-0">
                    <Link to="/" className="flex items-center space-x-3 w-full p-4 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition mb-1">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar ao Site</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-4 text-red-400 hover:bg-white/5 rounded-xl transition">
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-20 md:pt-0 bg-gray-50 text-gray-900">
                <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">

                    {/* Dashboard View */}
                    {activeTab === 'dashboard' && (() => {
                        // Icon map for dynamic rendering
                        const iconMap: Record<string, React.ElementType> = {
                            LayoutDashboard, FolderOpen, Landmark, Calendar, Users, Brain, Receipt, MessageSquare, Mail, MapPin, FileText, Settings, ShoppingBag
                        };

                        // Default widgets configuration
                        const defaultWidgets: DashboardWidget[] = [
                            { id: '1', tabId: 'projects', label: 'Projetos Publicados', icon: 'FolderOpen', bgColor: 'bg-black', order: 1, showCount: true, countKey: 'projects' },
                            { id: '2', tabId: 'cultural', label: 'Projetos Culturais', icon: 'Landmark', bgColor: 'bg-red-600', order: 2, showCount: true, countKey: 'culturalProjects' },
                            { id: '3', tabId: 'agenda', label: 'Agendamentos Ativos', icon: 'Calendar', bgColor: 'bg-purple-600', order: 3, showCount: true, countKey: 'appointments' },
                            { id: '4', tabId: 'messages', label: 'Mensagens', icon: 'MessageSquare', bgColor: 'bg-accent', order: 4, showCount: true, countKey: 'messages' },
                        ];

                        // Get widgets from settings or use defaults
                        const widgets = (settings.dashboardWidgets && settings.dashboardWidgets.length > 0)
                            ? settings.dashboardWidgets
                            : defaultWidgets;

                        // Count values mapping
                        const countValues: Record<string, number> = {
                            projects: projects.length,
                            culturalProjects: culturalProjects.length,
                            appointments: appointments.filter(a => a.status !== 'cancelled').length,
                            messages: messages.length,
                            budgets: 0, // Would need to fetch budget count
                        };

                        // Available sidebar items for adding widgets
                        const sidebarItems: { id: DashboardTabId; label: string; icon: string; bgColor: string; countKey?: string }[] = [
                            { id: 'projects', label: 'Projetos Publicados', icon: 'FolderOpen', bgColor: 'bg-black', countKey: 'projects' },
                            { id: 'cultural', label: 'Projetos Culturais', icon: 'Landmark', bgColor: 'bg-red-600', countKey: 'culturalProjects' },
                            { id: 'agenda', label: 'Agendamentos', icon: 'Calendar', bgColor: 'bg-purple-600', countKey: 'appointments' },
                            { id: 'messages', label: 'Mensagens', icon: 'MessageSquare', bgColor: 'bg-accent', countKey: 'messages' },
                            { id: 'budgets', label: 'Orçamentos', icon: 'Receipt', bgColor: 'bg-green-600', countKey: 'budgets' },
                            { id: 'shop', label: 'Loja', icon: 'ShoppingBag', bgColor: 'bg-amber-600' },
                            { id: 'clients', label: 'Clientes & Arquivos', icon: 'Users', bgColor: 'bg-indigo-600' },
                            { id: 'ai-config', label: 'Inteligência Artificial', icon: 'Brain', bgColor: 'bg-pink-600' },
                            { id: 'office', label: 'Escritório', icon: 'MapPin', bgColor: 'bg-orange-600' },
                            { id: 'content', label: 'Conteúdo Site', icon: 'FileText', bgColor: 'bg-teal-600' },
                            { id: 'settings', label: 'Configurações', icon: 'Settings', bgColor: 'bg-gray-600' },
                        ];

                        // Add widget handler
                        const handleAddWidget = (item: typeof sidebarItems[0]) => {
                            const newWidget: DashboardWidget = {
                                id: Date.now().toString(),
                                tabId: item.id,
                                label: item.label,
                                icon: item.icon,
                                bgColor: item.bgColor,
                                order: widgets.length + 1,
                                showCount: !!item.countKey,
                                countKey: item.countKey as any,
                            };
                            const newWidgets = [...widgets, newWidget];
                            handleSettingsChange('dashboardWidgets', newWidgets);
                        };

                        // Remove widget handler - moves widget from active to available
                        const handleLocalRemoveWidget = (widgetId: string) => {
                            setLocalEditingWidgets(prev => prev.filter(w => w.id !== widgetId));
                        };

                        // Add widget immediately (no selection needed)
                        const handleLocalAddWidget = (item: typeof sidebarItems[0]) => {
                            // Check if already exists
                            if (localEditingWidgets.some(w => w.tabId === item.id)) return;

                            const newWidget: DashboardWidget = {
                                id: Date.now().toString(),
                                tabId: item.id,
                                label: item.label,
                                icon: item.icon,
                                bgColor: item.bgColor,
                                order: localEditingWidgets.length + 1,
                                showCount: !!item.countKey,
                                countKey: item.countKey as any,
                            };
                            setLocalEditingWidgets(prev => [...prev, newWidget]);
                        };

                        // Save all changes at once
                        const handleSaveAllChanges = async () => {
                            const widgetsToSave = [...localEditingWidgets];
                            // Update settings with new widgets
                            const newSettings = { ...settings, dashboardWidgets: widgetsToSave };
                            const success = await updateSettings(newSettings);
                            if (success) {
                                setShowEditDashboardModal(false);
                                showToast('Widgets salvos com sucesso!', 'success');
                            } else {
                                showToast('Erro ao salvar widgets', 'error');
                            }
                        };

                        // Get badge info for pending items
                        const getBadge = (widget: DashboardWidget) => {
                            if (widget.tabId === 'agenda' && pendingAppointmentsCount > 0) {
                                return { text: 'Pendente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
                            }
                            if (widget.tabId === 'messages' && unreadMessagesCount > 0) {
                                return { text: 'Novas', bgColor: 'bg-red-100', textColor: 'text-red-800' };
                            }
                            return null;
                        };

                        return (
                            <div className="animate-fadeIn">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-3xl font-serif font-bold text-black">Bem-vinda, Fran.</h2>
                                    <button
                                        onClick={() => { setLocalEditingWidgets([...widgets]); setSelectedWidgetsToAdd([]); setShowEditDashboardModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Personalizar
                                    </button>
                                </div>

                                {/* Widgets Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                                    {widgets.sort((a, b) => a.order - b.order).map(widget => {
                                        const IconComponent = iconMap[widget.icon] || LayoutDashboard;
                                        const badge = getBadge(widget);
                                        const count = widget.showCount && widget.countKey ? countValues[widget.countKey] : null;

                                        return (
                                            <button
                                                key={widget.id}
                                                onClick={() => setActiveTab(widget.tabId)}
                                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left group cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 ${widget.bgColor} text-white rounded-xl group-hover:scale-105 transition-transform`}>
                                                        <IconComponent className="w-6 h-6" />
                                                    </div>
                                                    {badge && (
                                                        <span className={`text-xs font-bold ${badge.bgColor} ${badge.textColor} px-2 py-1 rounded`}>
                                                            {badge.text}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-4xl font-serif font-bold mb-1 text-black">
                                                    {count !== null ? count : '—'}
                                                </h3>
                                                <p className="text-gray-500 text-sm">{widget.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Edit Modal */}
                                <AnimatePresence>
                                    {showEditDashboardModal && (
                                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                                            >
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="font-bold text-xl">Personalizar Dashboard</h3>
                                                    <button onClick={() => setShowEditDashboardModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Current Widgets */}
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-bold uppercase text-gray-500 mb-3">Widgets Ativos</h4>
                                                    <div className="space-y-2">
                                                        {localEditingWidgets.length === 0 ? (
                                                            <p className="text-gray-400 text-sm text-center py-4">Nenhum widget ativo. Adicione abaixo.</p>
                                                        ) : (
                                                            [...localEditingWidgets].sort((a, b) => a.order - b.order).map(widget => {
                                                                const IconComponent = iconMap[widget.icon] || LayoutDashboard;
                                                                return (
                                                                    <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-2 ${widget.bgColor} text-white rounded-lg`}>
                                                                                <IconComponent className="w-4 h-4" />
                                                                            </div>
                                                                            <span className="font-medium">{widget.label}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleLocalRemoveWidget(widget.id)}
                                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Available Items - Click to add immediately */}
                                                <div>
                                                    <h4 className="text-sm font-bold uppercase text-gray-500 mb-3">Adicionar Widget</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {sidebarItems
                                                            .filter(item => !localEditingWidgets.some(w => w.tabId === item.id))
                                                            .map(item => {
                                                                const IconComponent = iconMap[item.icon] || LayoutDashboard;
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={item.id}
                                                                        onClick={() => handleLocalAddWidget(item)}
                                                                        className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition text-left group"
                                                                    >
                                                                        <div className={`p-2 ${item.bgColor} text-white rounded-lg group-hover:scale-105 transition-transform`}>
                                                                            <IconComponent className="w-4 h-4" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">{item.label}</span>
                                                                        <Plus className="w-4 h-4 ml-auto text-gray-300 group-hover:text-green-500 transition" />
                                                                    </button>
                                                                );
                                                            })}
                                                    </div>
                                                    {sidebarItems.filter(item => !localEditingWidgets.some(w => w.tabId === item.id)).length === 0 && (
                                                        <p className="text-gray-400 text-sm text-center py-4">Todos os widgets já foram adicionados.</p>
                                                    )}
                                                </div>

                                                {/* Save Button */}
                                                <div className="mt-6 pt-4 border-t border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveAllChanges}
                                                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Salvar Alterações
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })()}

                    {/* ... (Clients, Settings, AI Config, Projects, Cultural, Messages, Content, Office Views - Unchanged) ... */}
                    {/* I'm keeping the structure but focusing on the changed Agenda view below */}

                    {/* Agenda View */}
                    {activeTab === 'agenda' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-black">
                                    {showHistory ? 'Histórico de Agendamentos' : 'Próximos Compromissos'}
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowBlockModal(true)} className="bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-xs hover:bg-red-100 transition flex items-center gap-1">
                                        <Ban className="w-3 h-3" /> Bloquear Horário
                                    </button>
                                    <button onClick={() => setShowHistory(!showHistory)} className={`px-4 py-2 rounded-full font-bold text-xs transition flex items-center gap-1 ${showHistory ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-black'}`}>
                                        <History className="w-3 h-3" /> {showHistory ? 'Ver Ativos' : 'Histórico'}
                                    </button>
                                </div>
                            </div>

                            {/* Block Modal */}
                            <AnimatePresence>
                                {showBlockModal && (
                                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl p-6 max-w-sm w-full">
                                            <h3 className="font-bold text-lg mb-4">Bloquear Agenda</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-gray-500">Data</label>
                                                    <input type="date" value={blockForm.date} onChange={e => setBlockForm({ ...blockForm, date: e.target.value })} className="w-full border p-2 rounded mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-gray-500">Horário (Opcional - Dia Inteiro se vazio)</label>
                                                    <input type="time" value={blockForm.time} onChange={e => setBlockForm({ ...blockForm, time: e.target.value })} className="w-full border p-2 rounded mt-1" />
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button onClick={handleAddBlock} className="flex-1 bg-red-500 text-white py-2 rounded font-bold hover:bg-red-600">Bloquear</button>
                                                    <button onClick={() => setShowBlockModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded font-bold hover:bg-gray-200">Cancelar</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Appointments List */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map(appt => (
                                            <div key={appt.id} className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 ${appt.status === 'cancelled' ? 'opacity-70 bg-gray-50' : ''}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500'}`}>
                                                            {appt.status === 'confirmed' ? 'Confirmado' : appt.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{appt.type === 'visit' ? 'Visita Técnica' : 'Reunião'}</span>
                                                        {isPast(appt.date) && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Passado</span>}
                                                    </div>
                                                    <h4 className="font-bold text-lg">{new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appt.time}</h4>
                                                    <p className="text-gray-600">{appt.clientName}</p>
                                                    {appt.location && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {appt.location}</p>}
                                                </div>

                                                <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                                                    {appt.status === 'pending' && !showHistory && (
                                                        <button onClick={() => updateAppointmentStatus(appt.id, 'confirmed')} className="bg-green-500 text-white py-2 rounded font-bold text-xs hover:bg-green-600 transition">Aprovar</button>
                                                    )}
                                                    {appt.status !== 'cancelled' && !showHistory && (
                                                        <button onClick={() => { if (confirm('Ao cancelar, o agendamento irá para o histórico.')) updateAppointmentStatus(appt.id, 'cancelled'); }} className="bg-gray-100 text-gray-600 py-2 rounded font-bold text-xs hover:bg-gray-200 transition">Cancelar</button>
                                                    )}
                                                    <button onClick={() => { if (confirm('ATENÇÃO: Isso excluirá permanentemente o agendamento do banco de dados.')) deleteAppointmentPermanently(appt.id); }} className="text-red-300 text-xs hover:text-red-500 hover:underline flex items-center justify-center gap-1">
                                                        <Trash2 className="w-3 h-3" /> Excluir
                                                    </button>
                                                    {appt.status === 'confirmed' && appt.type === 'meeting' && !showHistory && (
                                                        <button onClick={() => { const link = prompt('Link da Reunião:', appt.meetingLink || ''); if (link) updateAppointment({ ...appt, meetingLink: link }) }} className="text-blue-500 text-xs font-bold hover:underline mt-1 text-center">
                                                            {appt.meetingLink ? 'Editar Link' : 'Adicionar Link'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                            {showHistory ? 'Nenhum histórico encontrado.' : 'Nenhum agendamento futuro.'}
                                        </div>
                                    )}
                                </div>

                                {/* Settings Side */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-lg mb-4">Configuração Semanal</h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        const newDays = scheduleSettings.workDays.includes(i)
                                                            ? scheduleSettings.workDays.filter(day => day !== i)
                                                            : [...scheduleSettings.workDays, i].sort();
                                                        updateScheduleSettings({ ...scheduleSettings, workDays: newDays });
                                                    }}
                                                    className={`w-10 h-10 rounded-full text-xs font-bold transition ${scheduleSettings.workDays.includes(i) ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Início</label>
                                                <input type="time" value={scheduleSettings.startHour} onChange={e => updateScheduleSettings({ ...scheduleSettings, startHour: e.target.value })} className="w-full border p-2 rounded text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Fim</label>
                                                <input type="time" value={scheduleSettings.endHour} onChange={e => updateScheduleSettings({ ...scheduleSettings, endHour: e.target.value })} className="w-full border p-2 rounded text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-lg mb-4">Bloqueios Ativos</h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {scheduleSettings.blockedDates.map(date => (
                                                <div key={date} className="flex justify-between items-center text-sm p-2 bg-red-50 text-red-700 rounded">
                                                    <span>Dia {new Date(date).toLocaleDateString()}</span>
                                                    <button onClick={() => handleRemoveBlockDate(date)}><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            {scheduleSettings.blockedSlots?.map((slot, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-yellow-50 text-yellow-700 rounded">
                                                    <span>{new Date(slot.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {slot.time}</span>
                                                    <button onClick={() => handleRemoveBlockSlot(slot.date, slot.time)}><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            {scheduleSettings.blockedDates.length === 0 && (!scheduleSettings.blockedSlots || scheduleSettings.blockedSlots.length === 0) && (
                                                <p className="text-gray-400 text-xs text-center">Nenhum bloqueio.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Budgets View */}
                    {activeTab === 'budgets' && (
                        <div className="animate-fadeIn">
                            {selectedBudgetRequestId ? (
                                <BudgetRequestDetail
                                    requestId={selectedBudgetRequestId}
                                    onBack={() => setSelectedBudgetRequestId(null)}
                                    showToast={showToast}
                                    currentUserId={currentUser?.id}
                                />
                            ) : (
                                <BudgetRequestsDashboard
                                    onViewDetails={(id) => setSelectedBudgetRequestId(id)}
                                    showToast={showToast}
                                />
                            )}
                        </div>
                    )}

                    {/* Shop Management View */}
                    {activeTab === 'shop' && (
                        <div className="animate-fadeIn">
                            <ShopManagement onShowToast={showToast} />
                        </div>
                    )}

                    {/* Other tabs rendering... (omitted for brevity as they are unchanged) */}
                    {/* Note: In a real update, we ensure all other tabs are included or the component structure is maintained. 
              Here I am just showing the updated Agenda tab logic and assuming the rest remains as provided in context or I can output full file if needed.
              Given the prompt says "Keep updates as minimal as you can", I will return the full file content to ensure no code is lost. */}

                    {/* ... (Rest of the component for Clients, Projects, etc is exactly as before) ... */}
                    {activeTab === 'clients' && (
                        <div className="animate-fadeIn">
                            {/* ... (Existing Clients Tab Content) ... */}
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-black">
                                    {selectedClient ? selectedClient.name : 'Clientes & Arquivos'}
                                </h2>
                                {selectedClient && (
                                    <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black">
                                        <ArrowLeft className="w-4 h-4" /> Voltar para Lista
                                    </button>
                                )}
                            </div>
                            {/* ... (Rest of Clients Logic - Same as before) ... */}
                            {!selectedClient ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="text-left p-6 text-xs font-bold uppercase text-gray-600">Nome</th>
                                                <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Email</th>
                                                <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Tipo</th>
                                                <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Pastas</th>
                                                <th className="text-right p-6 text-xs font-bold uppercase text-gray-600">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                                    <td className="p-6 font-bold flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                                                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                                        </div>
                                                        {user.name}
                                                    </td>
                                                    <td className="p-6 text-sm text-gray-600 hidden md:table-cell">{user.email}</td>
                                                    <td className="p-6 text-sm hidden md:table-cell">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-sm text-gray-600 hidden md:table-cell">{user.folders?.length || 0}</td>
                                                    <td className="p-6 text-right">
                                                        <button onClick={() => setSelectedClient(user)} className="text-blue-600 font-bold text-xs uppercase hover:underline">Gerenciar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col md:flex-row">
                                    <div className="w-full md:w-64 border-r border-gray-100 p-6 flex flex-col gap-2">
                                        <button onClick={() => setActiveClientTab('info')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeClientTab === 'info' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Informações</button>
                                        <button onClick={() => setActiveClientTab('memories')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeClientTab === 'memories' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Memória IA</button>
                                        <button onClick={() => setActiveClientTab('files')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeClientTab === 'files' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Arquivos</button>
                                    </div>
                                    <div className="flex-grow p-8">
                                        {activeClientTab === 'info' && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-3xl font-serif text-gray-400">
                                                        {selectedClient.avatar ? <img src={selectedClient.avatar} className="w-full h-full object-cover" /> : selectedClient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-serif font-bold">{selectedClient.name}</h3>
                                                        <p className="text-gray-500">{selectedClient.email}</p>
                                                        <p className="text-gray-500">{selectedClient.phone || 'Sem telefone'}</p>
                                                    </div>
                                                </div>
                                                <div className="border-t border-gray-100 pt-6">
                                                    <h4 className="font-bold mb-4">Endereços Cadastrados</h4>
                                                    {selectedClient.addresses && selectedClient.addresses.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {selectedClient.addresses.map(addr => (
                                                                <div key={addr.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <span className="text-xs font-bold uppercase block mb-1">{addr.label}</span>
                                                                    <p className="text-sm">{addr.street}, {addr.number}</p>
                                                                    <p className="text-xs text-gray-500">{addr.city} - {addr.state}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : <p className="text-gray-400 text-sm">Nenhum endereço.</p>}
                                                </div>
                                            </div>
                                        )}
                                        {activeClientTab === 'memories' && (
                                            <div>
                                                <h4 className="font-bold mb-4 flex items-center gap-2"><Brain className="w-5 h-5" /> O que a IA aprendeu sobre este cliente</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {selectedClient.memories && selectedClient.memories.length > 0 ? (
                                                        selectedClient.memories.map(mem => (
                                                            <div key={mem.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start group">
                                                                <div>
                                                                    <span className="text-xs font-bold uppercase text-accent block mb-1">{mem.topic}</span>
                                                                    <p className="text-sm">{mem.content}</p>
                                                                    <span className="text-[10px] text-gray-400 mt-2 block">{new Date(mem.createdAt).toLocaleDateString()} • {mem.type === 'system_detected' ? 'Automático' : 'Manual'}</span>
                                                                </div>
                                                                <button onClick={() => handleAdminDeleteMemory(mem.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                        ))
                                                    ) : <p className="text-gray-400">Nenhuma memória registrada.</p>}
                                                </div>
                                            </div>
                                        )}
                                        {activeClientTab === 'files' && (
                                            <div>
                                                {!currentAdminFolderId ? (
                                                    <>
                                                        <div className="flex justify-between items-center mb-6">
                                                            <h4 className="font-bold">Pastas do Cliente</h4>
                                                            <button onClick={() => setShowNewFolderInput(true)} className="text-xs bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Nova Pasta</button>
                                                        </div>

                                                        {showNewFolderInput && (
                                                            <div className="mb-6 flex gap-2 animate-fadeIn">
                                                                <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Nome da pasta" className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-black" />
                                                                <button onClick={handleCreateFolder} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">Criar</button>
                                                                <button onClick={() => setShowNewFolderInput(false)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs">Cancelar</button>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {selectedClient.folders && selectedClient.folders.length > 0 ? (
                                                                selectedClient.folders.map(folder => (
                                                                    <div key={folder.id} className="relative group">
                                                                        <button
                                                                            onClick={() => setCurrentAdminFolderId(folder.id)}
                                                                            className="w-full flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                                                                        >
                                                                            <div className="text-yellow-500 mb-3"><Folder className="w-12 h-12 fill-current" /></div>

                                                                            {editingFolderId === folder.id ? (
                                                                                <input
                                                                                    autoFocus
                                                                                    value={editFolderName}
                                                                                    onChange={e => setEditFolderName(e.target.value)}
                                                                                    onBlur={handleRenameFolder}
                                                                                    onKeyDown={e => e.key === 'Enter' && handleRenameFolder()}
                                                                                    className="text-center text-sm w-full bg-white border border-blue-300 rounded px-1"
                                                                                    onClick={e => e.stopPropagation()}
                                                                                />
                                                                            ) : (
                                                                                <>
                                                                                    <span className="font-bold text-sm text-center truncate w-full">{folder.name}</span>
                                                                                    <span className="text-[10px] text-gray-400 mt-1">{folder.files.length} arquivos</span>
                                                                                </>
                                                                            )}
                                                                        </button>

                                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                                            <button onClick={(e) => { e.stopPropagation(); startRenaming(folder); }} className="p-1 bg-white shadow rounded hover:text-blue-500"><Edit2 className="w-3 h-3" /></button>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="p-1 bg-white shadow rounded hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : <p className="col-span-full text-center text-gray-400 py-12">Nenhuma pasta.</p>}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="animate-fadeIn">
                                                        <div className="flex items-center gap-2 mb-6">
                                                            <button onClick={() => setCurrentAdminFolderId(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                                                            <h2 className="text-xl font-bold">{selectedClient.folders?.find(f => f.id === currentAdminFolderId)?.name}</h2>
                                                        </div>

                                                        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center mb-6 relative hover:bg-gray-100 transition">
                                                            {uploading ? <p className="text-sm font-bold text-gray-500 animate-pulse">Enviando arquivo...</p> : (
                                                                <>
                                                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                                    <p className="text-sm text-gray-500">Arraste arquivos ou clique para upload</p>
                                                                </>
                                                            )}
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                                                        </div>

                                                        <div className="space-y-2">
                                                            {selectedClient.folders?.find(f => f.id === currentAdminFolderId)?.files.map(file => (
                                                                <div key={file.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg group hover:shadow-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}><FileText className="w-4 h-4" /></div>
                                                                        <div>
                                                                            <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                                                                            <p className="text-[10px] text-gray-400">{file.size}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                                        <a href={file.url} download target="_blank" className="p-2 text-gray-400 hover:text-black"><Download className="w-4 h-4" /></a>
                                                                        <button onClick={() => handleDeleteFile(file.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-fadeIn max-w-4xl">
                            <h2 className="text-3xl font-serif font-bold mb-8 text-black">Configurações Globais</h2>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black border-b pb-2"><MapPin className="w-5 h-5" /> Dados do Escritório</h3>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Endereço Completo</label>
                                    <input value={contentForm.office.address} onChange={e => handleOfficeChange('address', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" placeholder="Rua..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">Cidade</label>
                                        <input value={contentForm.office.city} onChange={e => handleOfficeChange('city', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">Estado</label>
                                        <input value={contentForm.office.state} onChange={e => handleOfficeChange('state', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">CEP</label>
                                    <input value={contentForm.office.zipCode || ''} onChange={e => handleOfficeChange('zipCode', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" placeholder="00000-000" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Email Oficial</label>
                                    <input value={contentForm.office.email || ''} onChange={e => handleOfficeChange('email', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" placeholder="contato@fransiller.com.br" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Telefone / WhatsApp</label>
                                    <input value={contentForm.office.phone || ''} onChange={e => handleOfficeChange('phone', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" placeholder="+55 (11)..." />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Horário (Texto)</label>
                                    <input value={contentForm.office.hoursDescription} onChange={e => handleOfficeChange('hoursDescription', e.target.value)} className="w-full border p-2 rounded mt-1 bg-white" />
                                </div>
                            </div>

                            {/* Social Links Section - Dynamic */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 mt-8">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-black"><LinkIcon className="w-5 h-5" /> Redes Sociais</h3>
                                    <button onClick={() => {
                                        const newLink: SocialLink = { id: Date.now().toString(), platform: 'instagram', url: '' };
                                        const currentLinks = contentForm.office.socialLinks || [];
                                        handleOfficeChange('socialLinks', [...currentLinks, newLink]);
                                    }} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar Rede</button>
                                </div>
                                <div className="space-y-3">
                                    {(contentForm.office.socialLinks || []).length === 0 && (
                                        <p className="text-center text-gray-400 py-4">Nenhuma rede social cadastrada. Adicione suas redes sociais para aparecer na página de contato.</p>
                                    )}
                                    {(contentForm.office.socialLinks || []).map((social, idx) => (
                                        <div key={social.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                                            <select
                                                value={social.platform}
                                                onChange={(e) => {
                                                    const newLinks = [...(contentForm.office.socialLinks || [])];
                                                    newLinks[idx] = { ...newLinks[idx], platform: e.target.value as SocialLink['platform'] };
                                                    handleOfficeChange('socialLinks', newLinks);
                                                }}
                                                className="border rounded p-2 text-sm bg-white min-w-[130px]"
                                            >
                                                <option value="instagram">Instagram</option>
                                                <option value="linkedin">LinkedIn</option>
                                                <option value="facebook">Facebook</option>
                                                <option value="youtube">YouTube</option>
                                                <option value="twitter">Twitter/X</option>
                                                <option value="tiktok">TikTok</option>
                                                <option value="pinterest">Pinterest</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="telegram">Telegram</option>
                                                <option value="other">Outro</option>
                                            </select>
                                            <input
                                                value={social.url}
                                                onChange={(e) => {
                                                    const newLinks = [...(contentForm.office.socialLinks || [])];
                                                    newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                                    handleOfficeChange('socialLinks', newLinks);
                                                }}
                                                className="flex-grow border p-2 rounded bg-white text-sm"
                                                placeholder={social.platform === 'whatsapp' ? '5527999999999' : 'https://...'}
                                            />
                                            {social.platform === 'other' && (
                                                <input
                                                    value={social.label || ''}
                                                    onChange={(e) => {
                                                        const newLinks = [...(contentForm.office.socialLinks || [])];
                                                        newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                                        handleOfficeChange('socialLinks', newLinks);
                                                    }}
                                                    className="w-28 border p-2 rounded bg-white text-sm"
                                                    placeholder="Nome"
                                                />
                                            )}
                                            <button onClick={() => {
                                                const newLinks = (contentForm.office.socialLinks || []).filter(s => s.id !== social.id);
                                                handleOfficeChange('socialLinks', newLinks);
                                            }} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">As redes sociais serão exibidas automaticamente na página de contato após salvar.</p>
                            </div>

                            {/* Contact Form Subjects */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 mt-8">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-black"><MessageSquare className="w-5 h-5" /> Assuntos do Formulário</h3>
                                    <button onClick={() => {
                                        const newSubjects = [...(contentForm.office.contactSubjects || ['Orçamento de Projeto', 'Dúvidas Gerais', 'Imprensa / Mídia', 'Parcerias']), 'Novo Assunto'];
                                        handleOfficeChange('contactSubjects', newSubjects);
                                    }} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(contentForm.office.contactSubjects || ['Orçamento de Projeto', 'Dúvidas Gerais', 'Imprensa / Mídia', 'Parcerias']).map((subject, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 group">
                                            <input
                                                value={subject}
                                                onChange={(e) => {
                                                    const newSubjects = [...(contentForm.office.contactSubjects || ['Orçamento de Projeto', 'Dúvidas Gerais', 'Imprensa / Mídia', 'Parcerias'])];
                                                    newSubjects[idx] = e.target.value;
                                                    handleOfficeChange('contactSubjects', newSubjects);
                                                }}
                                                className="bg-transparent text-sm w-auto min-w-[100px] focus:outline-none"
                                            />
                                            <button onClick={() => {
                                                const newSubjects = (contentForm.office.contactSubjects || []).filter((_, i) => i !== idx);
                                                handleOfficeChange('contactSubjects', newSubjects);
                                            }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 mt-8">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-black"><Info className="w-5 h-5" /> FAQ - Perguntas Frequentes</h3>
                                    <button onClick={() => {
                                        const newFaq = { id: Date.now().toString(), question: 'Nova pergunta?', answer: 'Resposta...' };
                                        const currentFaq = contentForm.office.faqItems || [];
                                        handleOfficeChange('faqItems', [...currentFaq, newFaq]);
                                    }} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                                </div>
                                <div className="space-y-4">
                                    {(contentForm.office.faqItems || []).length === 0 && (
                                        <p className="text-center text-gray-400 py-8">Nenhuma FAQ cadastrada. Adicione perguntas frequentes para a página de contato.</p>
                                    )}
                                    {(contentForm.office.faqItems || []).map((faq, idx) => (
                                        <div key={faq.id} className="p-4 bg-gray-50 rounded-xl relative group border border-gray-100">
                                            <input
                                                value={faq.question}
                                                onChange={(e) => {
                                                    const newFaq = [...(contentForm.office.faqItems || [])];
                                                    newFaq[idx] = { ...newFaq[idx], question: e.target.value };
                                                    handleOfficeChange('faqItems', newFaq);
                                                }}
                                                className="w-full font-bold text-lg bg-transparent focus:outline-none mb-2"
                                                placeholder="Pergunta?"
                                            />
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => {
                                                    const newFaq = [...(contentForm.office.faqItems || [])];
                                                    newFaq[idx] = { ...newFaq[idx], answer: e.target.value };
                                                    handleOfficeChange('faqItems', newFaq);
                                                }}
                                                className="w-full text-sm text-gray-600 bg-transparent focus:outline-none h-20 resize-none"
                                                placeholder="Resposta..."
                                            />
                                            <button onClick={() => {
                                                const newFaq = (contentForm.office.faqItems || []).filter(f => f.id !== faq.id);
                                                handleOfficeChange('faqItems', newFaq);
                                            }} className="absolute top-2 right-2 p-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <button onClick={saveSettings} disabled={saving} className="w-full bg-black text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:bg-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai-config' && (
                        <div className="animate-fadeIn max-w-4xl">
                            <h2 className="text-3xl font-serif font-bold mb-8 text-black">Inteligência Artificial</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black border-b pb-2"><Bot className="w-5 h-5" /> Configuração do Modelo</h3>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Modelo LLM</label>
                                        <select
                                            value={settingsForm.aiConfig.model}
                                            onChange={(e) => handleSettingsChange('aiConfig.model', e.target.value)}
                                            className="w-full border p-3 rounded bg-white text-black focus:outline-none focus:border-black"
                                        >
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Padrão)</option>
                                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Avançado)</option>
                                            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Econômico)</option>
                                            <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Econômico)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold uppercase text-gray-500">Temperatura ({settingsForm.aiConfig.temperature || 0.7})</label>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={settingsForm.aiConfig.temperature || 0.7}
                                            onChange={(e) => handleSettingsChange('aiConfig.temperature', parseFloat(e.target.value))}
                                            className="w-full accent-black cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                            <span>Preciso (0.0)</span>
                                            <span>Criativo (1.0)</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Mensagem de Boas-vindas</label>
                                        <textarea
                                            value={settingsForm.aiConfig.defaultGreeting}
                                            onChange={(e) => handleSettingsChange('aiConfig.defaultGreeting', e.target.value)}
                                            className="w-full border p-3 rounded h-20 bg-white text-black focus:outline-none focus:border-black resize-none text-sm"
                                            placeholder="Olá {name}..."
                                        />
                                    </div>
                                    <div className="pt-4 border-t mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold uppercase text-gray-500">Atendimento Humano (Brevo)</label>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${settingsForm.chatbotConfig?.transferToHumanEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {settingsForm.chatbotConfig?.transferToHumanEnabled ? 'ATIVADO (ONLINE)' : 'DESATIVADO (OFFLINE)'}
                                                </span>
                                                <button
                                                    onClick={() => handleSettingsChange('chatbotConfig.transferToHumanEnabled', !settingsForm.chatbotConfig?.transferToHumanEnabled)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${settingsForm.chatbotConfig?.transferToHumanEnabled ? 'bg-black' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settingsForm.chatbotConfig?.transferToHumanEnabled ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Se ativado: IA aceita transferir para humano. <br />
                                            Se desativado: IA informa indisponibilidade.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2 text-black"><Brain className="w-5 h-5" /> Personalidade (Prompt)</h3>
                                        <button
                                            onClick={() => handleSettingsChange('aiConfig.useCustomSystemInstruction', !settingsForm.aiConfig.useCustomSystemInstruction)}
                                            className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full transition ${settingsForm.aiConfig.useCustomSystemInstruction ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                        >
                                            {settingsForm.aiConfig.useCustomSystemInstruction ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            {settingsForm.aiConfig.useCustomSystemInstruction ? 'Personalizado ON' : 'Padrão'}
                                        </button>
                                    </div>
                                    <textarea
                                        disabled={!settingsForm.aiConfig.useCustomSystemInstruction}
                                        value={settingsForm.aiConfig.systemInstruction}
                                        onChange={(e) => handleSettingsChange('aiConfig.systemInstruction', e.target.value)}
                                        className={`w-full border p-3 rounded h-64 focus:outline-none focus:border-black resize-none text-sm leading-relaxed ${!settingsForm.aiConfig.useCustomSystemInstruction ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-black'}`}
                                        placeholder="Defina como o bot deve se comportar..."
                                    />
                                </div>
                            </div>
                            <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-black border-b pb-2"><ThumbsDown className="w-5 h-5" /> Análise de Erros (Dislikes)</h3>
                                {aiFeedbacks.filter(f => f.type === 'dislike').length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                        {aiFeedbacks.filter(f => f.type === 'dislike').map((fb, idx) => (
                                            <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                <div className="flex gap-4">
                                                    <div className="w-1/2 border-r border-red-100 pr-4">
                                                        <span className="text-xs font-bold uppercase text-red-400 block mb-1">Usuário disse:</span>
                                                        <p className="text-sm text-gray-800 italic">"{fb.userMessage}"</p>
                                                    </div>
                                                    <div className="w-1/2 pl-2">
                                                        <span className="text-xs font-bold uppercase text-red-400 block mb-1">IA respondeu:</span>
                                                        <p className="text-sm text-gray-600 line-clamp-3">{fb.aiResponse}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">Nenhum feedback negativo registrado.</div>
                                )}
                            </div>

                            {/* Quick Actions Configuration */}
                            <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center border-b pb-4 mb-6">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-black"><MessageSquare className="w-5 h-5" /> Botões de Ação Rápida</h3>
                                    <button
                                        onClick={() => {
                                            const newAction = {
                                                id: Date.now().toString(),
                                                label: 'Novo Botão',
                                                message: 'Mensagem enviada ao clicar',
                                                icon: 'MessageSquare',
                                                order: (settingsForm.chatbotConfig?.quickActions?.length || 0) + 1,
                                                active: true
                                            };
                                            const currentActions = settingsForm.chatbotConfig?.quickActions || [];
                                            handleSettingsChange('chatbotConfig.quickActions', [...currentActions, newAction]);
                                        }}
                                        className="text-xs bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"
                                    ><Plus className="w-3 h-3" /> Adicionar Botão</button>
                                </div>

                                <div className="mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.chatbotConfig?.showQuickActionsOnOpen ?? true}
                                            onChange={(e) => handleSettingsChange('chatbotConfig.showQuickActionsOnOpen', e.target.checked)}
                                            className="w-4 h-4 accent-black"
                                        />
                                        <span className="text-sm">Mostrar botões ao abrir o chat</span>
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    {(!settingsForm.chatbotConfig?.quickActions || settingsForm.chatbotConfig.quickActions.length === 0) && (
                                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                            Nenhum botão configurado. Adicione botões de ação rápida para o chatbot.
                                        </div>
                                    )}
                                    {settingsForm.chatbotConfig?.quickActions?.sort((a, b) => a.order - b.order).map((action, idx) => (
                                        <div key={action.id} className={`flex items-center gap-4 p-4 rounded-xl border transition ${action.active ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'}`}>
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => {
                                                        if (idx > 0) {
                                                            const newActions = [...(settingsForm.chatbotConfig?.quickActions || [])];
                                                            const temp = newActions[idx].order;
                                                            newActions[idx].order = newActions[idx - 1].order;
                                                            newActions[idx - 1].order = temp;
                                                            handleSettingsChange('chatbotConfig.quickActions', newActions);
                                                        }
                                                    }}
                                                    disabled={idx === 0}
                                                    className="p-1 hover:bg-white rounded disabled:opacity-30"
                                                ><ArrowUp className="w-3 h-3" /></button>
                                                <button
                                                    onClick={() => {
                                                        const actions = settingsForm.chatbotConfig?.quickActions || [];
                                                        if (idx < actions.length - 1) {
                                                            const newActions = [...actions];
                                                            const temp = newActions[idx].order;
                                                            newActions[idx].order = newActions[idx + 1].order;
                                                            newActions[idx + 1].order = temp;
                                                            handleSettingsChange('chatbotConfig.quickActions', newActions);
                                                        }
                                                    }}
                                                    disabled={idx === (settingsForm.chatbotConfig?.quickActions?.length || 0) - 1}
                                                    className="p-1 hover:bg-white rounded disabled:opacity-30"
                                                ><ArrowDown className="w-3 h-3" /></button>
                                            </div>
                                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Texto do Botão</label>
                                                    <input
                                                        value={action.label}
                                                        onChange={(e) => {
                                                            const newActions = [...(settingsForm.chatbotConfig?.quickActions || [])];
                                                            const actionIdx = newActions.findIndex(a => a.id === action.id);
                                                            if (actionIdx !== -1) {
                                                                newActions[actionIdx] = { ...newActions[actionIdx], label: e.target.value };
                                                                handleSettingsChange('chatbotConfig.quickActions', newActions);
                                                            }
                                                        }}
                                                        className="w-full border p-2 rounded bg-white text-sm focus:outline-none focus:border-black"
                                                        placeholder="Agendar Reunião"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Mensagem Enviada</label>
                                                    <input
                                                        value={action.message}
                                                        onChange={(e) => {
                                                            const newActions = [...(settingsForm.chatbotConfig?.quickActions || [])];
                                                            const actionIdx = newActions.findIndex(a => a.id === action.id);
                                                            if (actionIdx !== -1) {
                                                                newActions[actionIdx] = { ...newActions[actionIdx], message: e.target.value };
                                                                handleSettingsChange('chatbotConfig.quickActions', newActions);
                                                            }
                                                        }}
                                                        className="w-full border p-2 rounded bg-white text-sm focus:outline-none focus:border-black"
                                                        placeholder="Gostaria de agendar uma reunião"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newActions = [...(settingsForm.chatbotConfig?.quickActions || [])];
                                                        const actionIdx = newActions.findIndex(a => a.id === action.id);
                                                        if (actionIdx !== -1) {
                                                            newActions[actionIdx] = { ...newActions[actionIdx], active: !newActions[actionIdx].active };
                                                            handleSettingsChange('chatbotConfig.quickActions', newActions);
                                                        }
                                                    }}
                                                    className={`p-2 rounded-full transition ${action.active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}
                                                    title={action.active ? 'Desativar' : 'Ativar'}
                                                >
                                                    {action.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newActions = (settingsForm.chatbotConfig?.quickActions || []).filter(a => a.id !== action.id);
                                                        handleSettingsChange('chatbotConfig.quickActions', newActions);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition"
                                                ><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-4">Os botões aparecem no início da conversa e desaparecem após o usuário interagir.</p>
                            </div>

                            <div className="mt-8">
                                <button onClick={saveSettings} disabled={saving} className="w-full bg-black text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:bg-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? 'Salvando...' : 'Salvar Configurações de IA'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-black">Projetos</h2>
                                <Link to="/admin/project/new" className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg">
                                    <Plus className="w-4 h-4" />
                                    <span>Novo Projeto</span>
                                </Link>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left p-6 text-xs font-bold uppercase text-gray-600">Projeto</th>
                                            <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Categoria</th>
                                            <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Local</th>
                                            <th className="text-right p-6 text-xs font-bold uppercase text-gray-600">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {projects.map(project => (
                                            <tr key={project.id} className="hover:bg-gray-50 transition">
                                                <td className="p-6">
                                                    <div className="flex items-center space-x-4">
                                                        <img src={project.image} alt="" className="w-12 h-12 rounded object-cover" />
                                                        <span className="font-bold font-serif text-gray-900">{project.title}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm text-gray-600 hidden md:table-cell">{project.category}</td>
                                                <td className="p-6 text-sm text-gray-600 hidden md:table-cell">{project.location}</td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link to={`/admin/project/edit/${project.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></Link>
                                                        <button onClick={() => handleDelete(project.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cultural' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-black">Projetos Culturais</h2>
                                <Link to="/admin/cultural/new" className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg">
                                    <Plus className="w-4 h-4" />
                                    <span>Novo Projeto Cultural</span>
                                </Link>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left p-6 text-xs font-bold uppercase text-gray-600">Projeto</th>
                                            <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Categoria</th>
                                            <th className="text-left p-6 text-xs font-bold uppercase text-gray-600 hidden md:table-cell">Parceiros</th>
                                            <th className="text-right p-6 text-xs font-bold uppercase text-gray-600">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {culturalProjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum projeto cultural cadastrado.</td>
                                            </tr>
                                        ) : (
                                            culturalProjects.map(project => (
                                                <tr key={project.id} className="hover:bg-gray-50 transition">
                                                    <td className="p-6">
                                                        <div className="flex items-center space-x-4">
                                                            <img src={project.image} alt="" className="w-12 h-12 rounded object-cover" />
                                                            <span className="font-bold font-serif text-gray-900">{project.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm text-gray-600 hidden md:table-cell">{project.category}</td>
                                                    <td className="p-6 text-sm text-gray-600 hidden md:table-cell">{project.partners || '-'}</td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link to={`/admin/cultural/edit/${project.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></Link>
                                                            <button onClick={() => handleCulturalDelete(project.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <MessagesDashboard />
                    )}



                    {activeTab === 'content' && (
                        <div className="animate-fadeIn max-w-4xl">
                            <h2 className="text-3xl font-serif font-bold mb-8 text-black">Conteúdo do Site</h2>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-12">
                                <div>
                                    <h3 className="font-bold text-xl mb-4 text-black border-b border-gray-100 pb-2">Página Sobre (Bio)</h3>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Bio Principal</label>
                                        <textarea name="bio" value={contentForm.about.bio} onChange={handleContentChange} className="w-full border p-3 rounded h-40 bg-white text-black" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h3 className="font-bold text-xl text-black">Estatísticas</h3>
                                        <button onClick={addStat} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {contentForm.about.stats.map(stat => (
                                            <div key={stat.id} className="p-4 bg-gray-50 rounded-xl relative group">
                                                <input value={stat.value} onChange={e => updateStat(stat.id, 'value', e.target.value)} className="w-full font-serif text-2xl bg-transparent focus:outline-none mb-1 text-accent font-bold" />
                                                <input value={stat.label} onChange={e => updateStat(stat.id, 'label', e.target.value)} className="w-full text-xs uppercase text-gray-500 bg-transparent focus:outline-none font-bold" />
                                                <button onClick={() => removeStat(stat.id)} className="absolute top-2 right-2 p-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h3 className="font-bold text-xl text-black">Nossos Pilares</h3>
                                        <button onClick={addPillar} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {contentForm.about.pillars.map(pillar => (
                                            <div key={pillar.id} className="p-4 bg-gray-50 rounded-xl relative group border border-gray-100">
                                                <input value={pillar.title} onChange={e => updatePillar(pillar.id, 'title', e.target.value)} className="w-full font-serif text-lg bg-transparent focus:outline-none mb-2 font-bold" />
                                                <textarea value={pillar.description} onChange={e => updatePillar(pillar.id, 'description', e.target.value)} className="w-full text-sm text-gray-500 bg-transparent focus:outline-none h-20 resize-none" />
                                                <button onClick={() => removePillar(pillar.id)} className="absolute top-2 right-2 p-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h3 className="font-bold text-xl text-black">Reconhecimento & Mídia</h3>
                                        <button onClick={addRecognition} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {contentForm.about.recognition.map((rec, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                                                <input value={rec} onChange={e => updateRecognition(idx, e.target.value)} className="bg-transparent text-sm font-bold w-32 focus:outline-none" />
                                                <button onClick={() => removeRecognition(idx)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <button onClick={saveContent} disabled={saving} className="w-full md:w-auto bg-green-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'office' && (
                        <div className="animate-fadeIn max-w-5xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-black">Página do Escritório (Visual)</h2>
                                <button onClick={saveContent} disabled={saving} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? 'Salvando...' : 'Salvar Página'}
                                </button>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-12">
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    <span className="text-sm">Para editar endereço e contatos, vá para a aba <strong>Configurações</strong>.</span>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-xl flex items-center gap-2"><LayoutDashboard className="w-5 h-5" /> Blocos de Conteúdo</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => addOfficeBlock('heading')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Título"><Heading className="w-4 h-4" /> Título</button>
                                            <button onClick={() => addOfficeBlock('text')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Texto"><Type className="w-4 h-4" /> Texto</button>
                                            <button onClick={() => addOfficeBlock('image-full')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Imagem"><ImageIcon className="w-4 h-4" /> Imagem</button>
                                            <button onClick={() => addOfficeBlock('image-grid')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Grid"><LayoutGrid className="w-4 h-4" /> Grid</button>
                                            <button onClick={() => addOfficeBlock('quote')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Citação"><Quote className="w-4 h-4" /> Citação</button>
                                            <button onClick={() => addOfficeBlock('details')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Infos"><Info className="w-4 h-4" /> Infos</button>
                                            <button onClick={() => addOfficeBlock('map')} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-xs font-bold" title="Mapa"><Map className="w-4 h-4" /> Mapa</button>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {(!contentForm.office.blocks || contentForm.office.blocks.length === 0) && (
                                            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                                                Nenhum bloco de conteúdo. Adicione acima.
                                            </div>
                                        )}
                                        {contentForm.office.blocks?.map((block, idx) => (
                                            <motion.div layout key={block.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition relative group">
                                                <div className="flex justify-between items-center mb-4 bg-gray-50 -m-4 mb-4 p-3 rounded-t-xl border-b border-gray-100">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <GripVertical className="w-4 h-4 cursor-move" />
                                                        <span className="text-xs font-bold uppercase">{block.type}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => moveOfficeBlock(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-white rounded disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                                        <button onClick={() => moveOfficeBlock(idx, 'down')} disabled={idx === (contentForm.office.blocks?.length || 0) - 1} className="p-1 hover:bg-white rounded disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                                                        <button onClick={() => removeOfficeBlock(block.id)} className="p-1 hover:bg-red-50 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                                {block.type === 'heading' && (
                                                    <input value={block.content} onChange={e => updateOfficeBlock(block.id, 'content', e.target.value)} className="w-full text-xl font-bold border-b border-gray-200 pb-2 focus:outline-none focus:border-black" placeholder="Título da Seção" />
                                                )}
                                                {block.type === 'text' && (
                                                    <textarea value={block.content} onChange={e => updateOfficeBlock(block.id, 'content', e.target.value)} className="w-full h-24 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black" placeholder="Texto descritivo..." />
                                                )}
                                                {block.type === 'quote' && (
                                                    <div className="flex gap-2">
                                                        <div className="w-1 bg-accent"></div>
                                                        <input value={block.content} onChange={e => updateOfficeBlock(block.id, 'content', e.target.value)} className="w-full text-lg italic bg-gray-50 p-2 focus:outline-none" placeholder="Frase de destaque" />
                                                    </div>
                                                )}
                                                {block.type === 'details' && (
                                                    <div className="p-4 bg-black text-white rounded text-center text-sm">
                                                        Bloco de Informações (Endereço, Horário, Contato). <br />
                                                        <span className="text-xs opacity-50">Os dados são puxados da aba Configurações.</span>
                                                    </div>
                                                )}
                                                {block.type === 'map' && (
                                                    <div className="h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                                                        Mapa do Google (Endereço Principal)
                                                    </div>
                                                )}
                                                {block.type === 'image-full' && (
                                                    <div className="space-y-3">
                                                        <div className="relative w-full h-40 bg-gray-100 rounded overflow-hidden group/img">
                                                            {block.content ? (
                                                                <img src={block.content} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                                                <label className="cursor-pointer bg-white text-black px-3 py-1 rounded text-xs font-bold">
                                                                    Upload
                                                                    <input type="file" className="hidden" onChange={(e) => handleBlockImageUpload(e, block.id)} accept="image/*" />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <input value={block.caption || ''} onChange={(e) => updateOfficeBlock(block.id, 'caption', e.target.value)} className="w-full text-xs text-center border-b border-gray-200 focus:outline-none" placeholder="Legenda (Opcional)" />
                                                    </div>
                                                )}
                                                {block.type === 'image-grid' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {block.items?.map((item, i) => (
                                                            <div key={i} className="relative h-24 bg-gray-100 rounded overflow-hidden group/img">
                                                                {item ? (
                                                                    <img src={item} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-gray-400"><Plus className="w-4 h-4" /></div>
                                                                )}
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                                                    <label className="cursor-pointer bg-white text-black px-2 py-1 rounded text-[10px] font-bold">
                                                                        Img {i + 1}
                                                                        <input type="file" className="hidden" onChange={(e) => handleGridImageUpload(e, block.id, i)} accept="image/*" />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Office Crop Modal */}
            <ImageCropModal
                image={officeCropImage}
                originalFile={officeCropFile || undefined}
                isOpen={officeCropModalOpen}
                onClose={() => {
                    setOfficeCropModalOpen(false);
                    setPendingOfficeBlockId(null);
                    setPendingOfficeGridIndex(null);
                }}
                onCropComplete={handleCroppedOfficeImage}
                aspect={null}
                preset="projectGallery"
                requireCrop={false}
                showAspectSelector={true}
                title="Ajustar Imagem do Escritório"
            />
        </div>
    );
};
