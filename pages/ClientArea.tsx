import React, { useState, useRef, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Settings, Package, Heart, LogOut, FileText, Download, Clock, CheckCircle, Brain, Trash2, Edit2, Plus, MessageSquare, Folder, Image, Video, ArrowLeft, X, Save, Calendar, MapPin, ExternalLink, Ban, UserCircle, Upload, Home, Briefcase, Video as VideoIcon, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Lock, Receipt, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ClientMemory, ClientFolder, Address, User, Appointment } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ClientBudgetsView } from './Client/ClientBudgetsView';
import { ClientBudgetDetail } from './Client/ClientBudgetDetail';
import { ClientOrdersView } from './Client/ClientOrdersView';
import { ImageCropModal, useImageCropModal } from '../components/ImageCropModal';

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

export const ClientArea: React.FC = () => {
  const { currentUser, logout, projects: allProjects, clientMemories, addClientMemory, updateClientMemory, deleteClientMemory, appointments, updateAppointmentStatus, updateAppointment, updateUser, showToast, siteContent, checkAvailability, settings, addAddress, updateAddress, deleteAddress } = useProjects();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'docs' | 'settings' | 'favs' | 'memories' | 'schedule' | 'budgets' | 'orders'>('projects');

  const navigate = useNavigate();

  // Profile & Address State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Memories State
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemory, setNewMemory] = useState({ topic: '', content: '' });

  // File Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Reschedule State
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string | null>(null);
  const [rescheduleViewDate, setRescheduleViewDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Budget Navigation State
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  // Image Crop Modal State for Avatar
  const avatarCropModal = useImageCropModal();


  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const currentFolder = currentUser.folders?.find(f => f.id === currentFolderId);
  const myAppointments = appointments.filter(a => a.clientId === currentUser.id).sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());

  // --- Handlers ---

  const handleLogout = async () => {
    await logout();
    showToast('Você saiu do sistema.', 'success');
    navigate('/auth', { replace: true });
  };

  const handleEditProfile = () => {
    setProfileForm({ ...currentUser });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (currentUser) {
      updateUser({ ...currentUser, ...profileForm } as User);
      setIsEditingProfile(false);
      showToast('Dados atualizados com sucesso!', 'success');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;
    // Open crop modal instead of direct upload
    avatarCropModal.openCropModal(e.target.files[0]);
    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  // Handle cropped avatar upload
  const handleCroppedAvatarUpload = async (file: File) => {
    if (!currentUser) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToSupabase(file);
      updateUser({ ...currentUser, avatar: url });
      showToast('Foto de perfil atualizada e otimizada!', 'success');
    } catch (err) {
      showToast('Erro ao atualizar foto.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddAddress = () => {
    setAddressForm({ label: 'Casa' });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!currentUser) return;

    // Validate label isn't duplicate
    const existingLabels = (currentUser.addresses || []).map(a => a.label.toLowerCase());
    const newLabel = (addressForm.label || 'Casa').toLowerCase();

    // If editing and same label, allow
    if (!addressForm.id && existingLabels.includes(newLabel)) {
      showToast(`Você já tem um endereço chamado "${addressForm.label}". Use outro nome.`, 'error');
      return;
    }

    if (addressForm.id) {
      // Update existing address in database using updateAddress
      const success = await updateAddress({
        id: addressForm.id,
        label: addressForm.label || 'Casa',
        street: addressForm.street || '',
        number: addressForm.number || '',
        complement: addressForm.complement || '',
        district: addressForm.district || '',
        city: addressForm.city || '',
        state: addressForm.state || '',
        zipCode: addressForm.zipCode || ''
      });
      if (success) {
        showToast('Endereço atualizado.', 'success');
      }
    } else {
      // Add new address to database
      const saved = await addAddress({
        label: addressForm.label || 'Casa',
        street: addressForm.street || '',
        number: addressForm.number || '',
        complement: addressForm.complement || '',
        district: addressForm.district || '',
        city: addressForm.city || '',
        state: addressForm.state || '',
        zipCode: addressForm.zipCode || ''
      });

      if (saved) {
        showToast('Endereço adicionado.', 'success');
      }
    }

    setShowAddressModal(false);
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm(addr);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!currentUser || !confirm('Excluir este endereço?')) return;
    const success = await deleteAddress(id);
    if (success) {
      showToast('Endereço excluído.', 'success');
    }
  };

  const handleAddMemory = () => {
    if (newMemory.topic && newMemory.content) {
      addClientMemory({
        topic: newMemory.topic,
        content: newMemory.content,
        type: 'user_defined'
      });
      setNewMemory({ topic: '', content: '' });
      setShowAddMemory(false);
    }
  };

  // --- Reschedule Logic ---
  const handleOpenReschedule = (appt: Appointment) => {
    setReschedulingAppt(appt);
    setRescheduleDate(null);
    setAvailableSlots([]);
    setRescheduleViewDate(new Date()); // Reset view to today
  };

  const handleDateClick = (dateStr: string) => {
    setRescheduleDate(dateStr);
    const slots = checkAvailability(dateStr);
    // If we are rescheduling to the SAME day, we must exclude the current slot if it's still occupied by the current appt (logic handled by checkAvailability usually, but context logic is simple)
    // For simplicity, checkAvailability returns free slots. We just use them.
    setAvailableSlots(slots);
  };

  const confirmReschedule = (newTime: string) => {
    if (!reschedulingAppt || !rescheduleDate) return;

    const updatedAppt: Appointment = {
      ...reschedulingAppt,
      date: rescheduleDate,
      time: newTime,
      status: 'pending' // Reset to pending for approval
    };

    updateAppointment(updatedAppt);
    setReschedulingAppt(null);
    showToast('Reagendamento solicitado. Aguarde confirmação.', 'success');
  };

  const nextDays = useMemo(() => {
    const arr = [];
    const start = new Date(rescheduleViewDate);
    // Ensure we don't show past dates if viewDate is today
    if (start < new Date() && start.getDate() !== new Date().getDate()) {
      start.setDate(new Date().getDate());
    }

    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [rescheduleViewDate]);


  return (
    <div className="min-h-screen pt-44 pb-24 bg-gray-50">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header com Botão de Logout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-serif">Portal do Cliente</h1>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition text-sm font-bold border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>

        {/* Barra de Abas - Estilo Portfólio Sticky */}
        <div className="sticky top-[80px] z-40 bg-white border-y border-gray-100 mb-8 -mx-6 px-6 md:mx-0 md:px-0 shadow-sm w-[calc(100%+3rem)] md:w-full">
          <nav className="flex items-center space-x-2 md:space-x-4 overflow-x-auto no-scrollbar py-3 md:py-4">
            <button onClick={() => setActiveTab('projects')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'projects' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
              <Package className="w-4 h-4" />
              <span className="whitespace-nowrap">Projetos</span>
            </button>
            <button onClick={() => setActiveTab('schedule')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'schedule' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
              <Calendar className="w-4 h-4" />
              <span className="whitespace-nowrap">Agendamentos</span>
            </button>
            <button onClick={() => setActiveTab('docs')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'docs' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
              <FileText className="w-4 h-4" />
              <span className="whitespace-nowrap">Arquivos</span>
            </button>
            <button onClick={() => setActiveTab('memories')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'memories' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
              <Brain className="w-4 h-4" />
              <span className="whitespace-nowrap">IA & Memórias</span>
            </button>
            <button onClick={() => setActiveTab('budgets')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'budgets' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
              <Receipt className="w-4 h-4" />
              <span className="whitespace-nowrap">Orçamentos</span>
            </button>
            {settings.enableShop && (
              <button onClick={() => setActiveTab('orders')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'orders' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
                <ShoppingBag className="w-4 h-4" />
                <span className="whitespace-nowrap">Pedidos</span>
              </button>
            )}
            <button onClick={() => setActiveTab('profile')} className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition text-sm border ${activeTab === 'profile' ? 'bg-black text-white border-black font-bold' : 'text-gray-500 hover:border-black hover:text-black border-transparent'}`}>
              <UserCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">Perfil</span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Apenas Perfil */}
          <div className="w-full lg:w-1/4 h-fit lg:sticky lg:top-44 z-30">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-accent rounded-full flex items-center justify-center text-2xl lg:text-3xl font-serif font-bold text-white shrink-0 overflow-hidden shadow-md">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
                {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span></div>}
              </div>

              <h3 className="font-bold truncate text-lg">{currentUser.name}</h3>
              <p className="text-xs text-secondary truncate mb-2">{currentUser.email}</p>
              <div className="text-xs bg-black text-white px-3 py-1 rounded-full uppercase font-bold tracking-wider">Cliente VIP</div>
            </div>
          </div>

          {/* Avatar Crop Modal */}
          <ImageCropModal
            image={avatarCropModal.imageSource}
            originalFile={avatarCropModal.selectedFile || undefined}
            isOpen={avatarCropModal.isOpen}
            onClose={avatarCropModal.closeCropModal}
            onCropComplete={handleCroppedAvatarUpload}
            aspect={1}
            cropShape="round"
            preset="avatar"
            requireCrop={true}
            title="Ajustar Foto de Perfil"
          />

          {/* Content Area */}
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm p-6 md:p-8 min-h-[500px]">

            {activeTab === 'projects' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-serif mb-6">Projetos Ativos</h2>
                {currentUser.projects && currentUser.projects.length > 0 ? (
                  <div className="space-y-8">
                    {currentUser.projects.map(p => (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-4 md:p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-48 h-48 shrink-0 overflow-hidden rounded shadow-sm">
                            <img src={p.image} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                              <h3 className="text-xl font-bold font-serif truncate w-full">{p.title}</h3>
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Em Andamento</span>
                            </div>
                            <p className="text-sm text-secondary mb-4">{p.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">Nenhum projeto ativo.</div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-serif mb-6">Meus Agendamentos</h2>
                <p className="text-gray-500 text-sm mb-6">Gerencie suas visitas técnicas e reuniões.</p>

                {myAppointments.length > 0 ? (
                  <div className="space-y-6">
                    {myAppointments.map(appt => {
                      // Logic: Online check
                      const isOnline = appt.type === 'meeting' && (appt.location.toLowerCase().includes('online') || !!appt.meetingLink);
                      const isVisit = appt.type === 'visit';
                      const mapQuery = isVisit ? appt.location : siteContent.office.address;
                      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

                      return (
                        <div key={appt.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                          {/* Header / Status Bar */}
                          <div className={`p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 ${appt.status === 'confirmed' ? 'bg-green-50 text-green-900' :
                            appt.status === 'pending' ? 'bg-yellow-50 text-yellow-900' : 'bg-gray-100 text-gray-500'
                            }`}>
                            <div className="flex items-center gap-2">
                              {appt.status === 'confirmed' && <CheckCircle className="w-5 h-5" />}
                              {appt.status === 'pending' && <Clock className="w-5 h-5" />}
                              {appt.status === 'cancelled' && <Ban className="w-5 h-5" />}
                              <div>
                                <span className="font-bold uppercase text-xs tracking-wider block">
                                  {appt.status === 'confirmed' ? 'Confirmado' : appt.status === 'pending' ? 'Solicitação Pendente' : 'Cancelado'}
                                </span>
                                {appt.status === 'pending' && <span className="text-[10px] opacity-75">Aguardando aprovação da equipe</span>}
                              </div>
                            </div>
                            <span className="text-sm font-bold bg-white/50 px-3 py-1 rounded-full">{new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appt.time}</span>
                          </div>

                          <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-grow space-y-4">
                                <div>
                                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                                    {appt.type === 'visit' ? 'Visita Técnica' : 'Reunião de Alinhamento'}
                                    {isOnline && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase">Online</span>}
                                  </h3>
                                  <p className="text-gray-500 text-sm mt-1">{isVisit ? 'Local da Obra' : (isOnline ? 'Videoconferência' : 'Escritório Fran Siller')}</p>
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                                  {isOnline ? <VideoIcon className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" /> : <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />}
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">
                                      {isOnline ? 'Link da Reunião' : 'Endereço'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {isOnline
                                        ? (appt.meetingLink ? 'Link disponível abaixo.' : 'O link será disponibilizado aqui após a confirmação.')
                                        : mapQuery
                                      }
                                    </p>
                                  </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                {appt.status !== 'cancelled' && (
                                  <div className="flex flex-wrap gap-3 pt-2">
                                    {/* Primary Action */}
                                    {isOnline ? (
                                      appt.status === 'confirmed' && appt.meetingLink ? (
                                        <a
                                          href={appt.meetingLink}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition shadow-sm hover:shadow-md"
                                        >
                                          <VideoIcon className="w-4 h-4" /> Entrar na Reunião
                                        </a>
                                      ) : (
                                        <button disabled className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-5 py-2.5 rounded-lg cursor-not-allowed">
                                          <Clock className="w-4 h-4" /> Aguardando Link
                                        </button>
                                      )
                                    ) : (
                                      <a
                                        href={mapsLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-xs font-bold text-white bg-black hover:bg-accent hover:text-black px-5 py-2.5 rounded-lg transition shadow-sm"
                                      >
                                        <ExternalLink className="w-4 h-4" /> Abrir no Maps / Waze
                                      </a>
                                    )}

                                    <button
                                      onClick={() => handleOpenReschedule(appt)}
                                      className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-lg transition"
                                    >
                                      <RefreshCw className="w-4 h-4" /> Reagendar
                                    </button>

                                    <button
                                      onClick={() => { if (confirm('Deseja cancelar este agendamento?')) updateAppointmentStatus(appt.id, 'cancelled'); }}
                                      className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 px-4 py-2.5 rounded-lg transition"
                                    >
                                      <X className="w-4 h-4" /> Cancelar
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* EMBEDDED MAP FOR PHYSICAL MEETINGS/VISITS */}
                              {!isOnline && appt.status !== 'cancelled' && (
                                <div className="w-full md:w-56 h-40 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-inner hidden md:block relative group">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition duration-500"
                                  ></iframe>
                                  <a href={mapsLink} target="_blank" rel="noreferrer" className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/10 transition"></a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-gray-500">Nenhum agendamento futuro.</p>
                    <p className="text-xs mt-2">Use o Chatbot (canto inferior direito) para marcar uma visita.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="animate-fadeIn">
                {!currentFolder ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-serif">Arquivos e Contratos</h2>
                      <div className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 font-bold flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Apenas Leitura
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {currentUser.folders && currentUser.folders.length > 0 ? (
                        currentUser.folders.map(folder => (
                          <button
                            key={folder.id}
                            onClick={() => setCurrentFolderId(folder.id)}
                            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition group border border-transparent hover:border-gray-200"
                          >
                            <div className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform"><Folder className="w-16 h-16 fill-current" /></div>
                            <span className="font-bold text-sm text-center">{folder.name}</span>
                            <span className="text-[10px] text-gray-400 mt-1">{folder.files.length} arquivos</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <Folder className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>Nenhuma pasta compartilhada.</p>
                          <p className="text-xs mt-1">Aguarde o administrador enviar arquivos.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 mb-6">
                      <button onClick={() => setCurrentFolderId(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                      <h2 className="text-2xl font-serif">{currentFolder.name}</h2>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                      {currentFolder.files.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                          {currentFolder.files.map(file => (
                            <div key={file.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg shrink-0 ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}><FileText className="w-6 h-6" /></div>
                                <div><p className="font-bold text-sm">{file.name}</p><p className="text-xs text-gray-400">{file.size}</p></div>
                              </div>
                              <a href={file.url} download target="_blank" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-accent hover:text-black transition"><Download className="w-4 h-4" /> Baixar</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-gray-400">Esta pasta está vazia.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'memories' && (
              <div className="animate-fadeIn space-y-8">
                <div>
                  <h2 className="text-2xl font-serif mb-2">Memórias do Assistente</h2>
                  <p className="text-gray-500 text-sm">O que o sistema aprendeu sobre suas preferências.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-accent" /> Contexto Pessoal</h3>
                    <button onClick={() => setShowAddMemory(!showAddMemory)} className="text-xs flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                  </div>
                  {showAddMemory && (
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200 animate-slideDown">
                      <input value={newMemory.topic} onChange={e => setNewMemory({ ...newMemory, topic: e.target.value })} className="w-full border p-2 rounded text-sm mb-2" placeholder="Tópico (ex: Estilo, Família)" />
                      <input value={newMemory.content} onChange={e => setNewMemory({ ...newMemory, content: e.target.value })} className="w-full border p-2 rounded text-sm mb-2" placeholder="Detalhe (ex: Prefiro minimalismo)" />
                      <div className="flex justify-end gap-2"><button onClick={handleAddMemory} className="text-xs bg-black text-white px-4 py-2 rounded-full font-bold">Salvar</button></div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientMemories.length > 0 ? (
                      clientMemories.map(mem => (
                        <div key={mem.id} className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition relative group">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">{mem.topic}</span>
                            <div className="flex gap-1">
                              {mem.type === 'system_detected' && <span title="Aprendido pela IA" className="text-[10px] bg-purple-100 text-purple-600 px-1.5 rounded">AUTO</span>}
                              <button onClick={() => { if (confirm('Apagar esta memória?')) deleteClientMemory(mem.id) }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{mem.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-gray-400 text-sm">Nenhuma memória registrada ainda.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BUDGETS TAB */}
            {activeTab === 'budgets' && (
              <div className="animate-fadeIn">
                {selectedBudgetId ? (
                  <ClientBudgetDetail
                    requestId={selectedBudgetId}
                    onBack={() => setSelectedBudgetId(null)}
                    showToast={showToast}
                    clientId={currentUser.id}
                  />
                ) : (
                  <ClientBudgetsView
                    onViewDetails={(id) => setSelectedBudgetId(id)}
                    showToast={showToast}
                    clientId={currentUser.id}
                  />
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && settings.enableShop && (
              <div className="animate-fadeIn">
                <ClientOrdersView
                  showToast={showToast}
                  clientId={currentUser.id}
                />
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Meus Dados</h2>
                  <button onClick={isEditingProfile ? handleSaveProfile : handleEditProfile} className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-accent hover:text-black transition flex items-center gap-2">
                    {isEditingProfile ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditingProfile ? 'Salvar Alterações' : 'Editar Dados'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold border-b border-gray-100 pb-2 mb-4">Informações Pessoais</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                        <input
                          disabled={!isEditingProfile}
                          value={isEditingProfile ? profileForm.name : currentUser.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                          <input
                            disabled={!isEditingProfile}
                            value={isEditingProfile ? profileForm.email : currentUser.email}
                            onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Telefone / WhatsApp</label>
                          <input
                            disabled={!isEditingProfile}
                            value={isEditingProfile ? (profileForm.phone || '') : (currentUser.phone || '')}
                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                            className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">CPF / CNPJ</label>
                          <input
                            disabled={!isEditingProfile}
                            value={isEditingProfile ? (profileForm.cpf || '') : (currentUser.cpf || '')}
                            onChange={e => setProfileForm({ ...profileForm, cpf: e.target.value })}
                            placeholder="000.000.000-00"
                            className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Data de Nascimento</label>
                          <input
                            type="date"
                            disabled={!isEditingProfile}
                            value={isEditingProfile ? (profileForm.birthDate || '') : (currentUser.birthDate || '')}
                            onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                            className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                        <h3 className="font-bold">Endereços Cadastrados</h3>
                        <button onClick={handleAddAddress} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                      </div>

                      {currentUser.addresses && currentUser.addresses.length > 0 ? (
                        <div className="space-y-4">
                          {currentUser.addresses.map(addr => (
                            <div key={addr.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                              <div className="flex items-center gap-2 mb-2">
                                {addr.label.toLowerCase().includes('trabalho') ? <Briefcase className="w-4 h-4 text-gray-500" /> : <Home className="w-4 h-4 text-gray-500" />}
                                <span className="font-bold text-sm uppercase">{addr.label}</span>
                              </div>
                              <p className="text-sm text-gray-700">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                              <p className="text-sm text-gray-500">{addr.district}, {addr.city} - {addr.state}</p>
                              <p className="text-xs text-gray-400 mt-1">CEP: {addr.zipCode}</p>

                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => handleEditAddress(addr)} className="p-1.5 bg-white border rounded hover:text-blue-500"><Edit2 className="w-3 h-3" /></button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 bg-white border rounded hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">Nenhum endereço cadastrado.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Modal */}
                <AnimatePresence>
                  {showAddressModal && (
                    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-serif font-bold">{addressForm.id ? 'Editar Endereço' : 'Novo Endereço'}</h3>
                          <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-5">
                          {/* Label Selection with Icons */}
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Tipo de Endereço</label>
                            <div className="grid grid-cols-3 gap-3">
                              <button
                                type="button"
                                onClick={() => setAddressForm({ ...addressForm, label: 'Casa' })}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${addressForm.label === 'Casa'
                                  ? 'border-black bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400'
                                  }`}
                              >
                                <Home className="w-6 h-6" />
                                <span className="text-sm font-bold">Casa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddressForm({ ...addressForm, label: 'Trabalho' })}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${addressForm.label === 'Trabalho'
                                  ? 'border-black bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400'
                                  }`}
                              >
                                <Briefcase className="w-6 h-6" />
                                <span className="text-sm font-bold">Trabalho</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddressForm({ ...addressForm, label: 'Outro' })}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${(addressForm.label !== 'Casa' && addressForm.label !== 'Trabalho' && addressForm.label)
                                  ? 'border-black bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400'
                                  }`}
                              >
                                <MapPin className="w-6 h-6" />
                                <span className="text-sm font-bold">Outro</span>
                              </button>
                            </div>
                            {/* Custom label input for "Outro" */}
                            {addressForm.label !== 'Casa' && addressForm.label !== 'Trabalho' && addressForm.label && (
                              <input
                                type="text"
                                value={addressForm.label === 'Outro' ? '' : addressForm.label}
                                onChange={e => setAddressForm({ ...addressForm, label: e.target.value || 'Outro' })}
                                placeholder="Nome personalizado (ex: Casa da Praia)"
                                className="w-full border border-gray-300 p-3 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-black/10"
                              />
                            )}
                          </div>

                          {/* CEP */}
                          <div>
                            <label className="text-xs font-bold uppercase text-gray-500">CEP *</label>
                            <input
                              value={addressForm.zipCode || ''}
                              onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                              className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                              placeholder="00000-000"
                            />
                          </div>

                          {/* Street and Number */}
                          <div className="grid grid-cols-[1fr_100px] gap-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Rua *</label>
                              <input
                                value={addressForm.street || ''}
                                onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                                className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                                placeholder="Nome da rua"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Número *</label>
                              <input
                                value={addressForm.number || ''}
                                onChange={e => setAddressForm({ ...addressForm, number: e.target.value })}
                                className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                                placeholder="123"
                              />
                            </div>
                          </div>

                          {/* District and Complement */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Bairro *</label>
                              <input
                                value={addressForm.district || ''}
                                onChange={e => setAddressForm({ ...addressForm, district: e.target.value })}
                                className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                                placeholder="Bairro"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Complemento</label>
                              <input
                                value={addressForm.complement || ''}
                                onChange={e => setAddressForm({ ...addressForm, complement: e.target.value })}
                                className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                                placeholder="Apto, bloco..."
                              />
                            </div>
                          </div>

                          {/* City and State */}
                          <div className="grid grid-cols-[1fr_80px] gap-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Cidade *</label>
                              <input
                                value={addressForm.city || ''}
                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                                placeholder="Cidade"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">UF *</label>
                              <input
                                value={addressForm.state || ''}
                                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                                placeholder="ES"
                                maxLength={2}
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleSaveAddress}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-black transition mt-2"
                          >
                            Salvar Endereço
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ... Reschedule Modal Code (kept the same, not shown to save space) ... */}
            <AnimatePresence>
              {reschedulingAppt && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-md p-6 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold font-serif">Reagendar Compromisso</h3>
                      <button onClick={() => setReschedulingAppt(null)}><X className="w-5 h-5 text-gray-400 hover:text-black" /></button>
                    </div>

                    <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="font-bold mb-1">Atual:</p>
                      <p>{new Date(reschedulingAppt.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {reschedulingAppt.time}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">Selecione nova data</span>
                        <div className="flex gap-1">
                          <button onClick={() => { const d = new Date(rescheduleViewDate); d.setDate(d.getDate() - 5); setRescheduleViewDate(d); }} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
                          <button onClick={() => { const d = new Date(rescheduleViewDate); d.setDate(d.getDate() + 5); setRescheduleViewDate(d); }} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {nextDays.map((d) => {
                          const dStr = d.toISOString().split('T')[0];
                          const isSelected = rescheduleDate === dStr;
                          return (
                            <button
                              key={dStr}
                              onClick={() => handleDateClick(dStr)}
                              className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg border transition ${isSelected ? 'bg-black text-white border-black shadow-md' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-600'}`}
                            >
                              <span className="text-[10px] uppercase font-bold">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                              <span className="text-sm font-bold">{d.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {rescheduleDate && (
                      <div className="animate-fadeIn">
                        <p className="text-xs font-bold uppercase text-gray-500 mb-2">Horários Disponíveis</p>
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                            {availableSlots.map(slot => (
                              <button
                                key={slot}
                                onClick={() => confirmReschedule(slot)}
                                className="py-2 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:border-black hover:bg-black hover:text-white transition active:scale-95"
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400">Sem horários livres nesta data.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!rescheduleDate && (
                      <div className="text-center py-8 text-gray-300 text-xs italic">Selecione uma data acima para ver horários.</div>
                    )}

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Avatar Crop Modal - Mandatory 1:1 circular crop */}
      <ImageCropModal
        image={avatarCropModal.imageSource}
        originalFile={avatarCropModal.selectedFile || undefined}
        isOpen={avatarCropModal.isOpen}
        onClose={avatarCropModal.closeCropModal}
        onCropComplete={handleCroppedAvatarUpload}
        aspect={1}
        cropShape="round"
        preset="avatar"
        requireCrop={true}
        showAspectSelector={false}
        title="Ajustar Foto de Perfil"
      />
    </div>
  );
};