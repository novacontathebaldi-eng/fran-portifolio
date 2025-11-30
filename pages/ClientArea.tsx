

import React, { useState, useRef } from 'react';
import { useProjects } from '../context/ProjectContext';
import { User, Settings, Package, Heart, LogOut, FileText, Download, Clock, CheckCircle, Brain, Trash2, Edit2, Plus, MessageSquare, Folder, Image, Video, ArrowLeft, X, Save, Calendar, MapPin, ExternalLink, Ban, UserCircle, Upload, Home, Briefcase, Video as VideoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ClientMemory, ClientFolder, Address } from '../types';
import { Navigate } from 'react-router-dom';

// Mock Upload
const uploadToStorage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
};

export const ClientArea: React.FC = () => {
  const { currentUser, logout, projects: allProjects, clientMemories, addClientMemory, updateClientMemory, deleteClientMemory, appointments, updateAppointmentStatus, updateUser, showToast, siteContent } = useProjects();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'docs' | 'settings' | 'favs' | 'memories' | 'schedule'>('projects');
  
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

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const currentFolder = currentUser.folders?.find(f => f.id === currentFolderId);
  const myAppointments = appointments.filter(a => a.clientId === currentUser.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- Handlers ---

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
    setUploadingAvatar(true);
    try {
      const url = await uploadToStorage(e.target.files[0]);
      updateUser({ ...currentUser, avatar: url });
      showToast('Foto de perfil atualizada.', 'success');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddAddress = () => {
    setAddressForm({ label: 'Casa', country: 'Brasil' } as any);
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!currentUser) return;
    const newAddress = {
      ...addressForm,
      id: addressForm.id || Math.random().toString(36).substr(2, 9)
    } as Address;

    let updatedAddresses = [...(currentUser.addresses || [])];
    if (addressForm.id) {
       updatedAddresses = updatedAddresses.map(a => a.id === addressForm.id ? newAddress : a);
    } else {
       updatedAddresses.push(newAddress);
    }

    updateUser({ ...currentUser, addresses: updatedAddresses });
    setShowAddressModal(false);
    showToast(addressForm.id ? 'Endereço atualizado.' : 'Endereço adicionado.', 'success');
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm(addr);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (!currentUser || !confirm('Excluir este endereço?')) return;
    const updatedAddresses = (currentUser.addresses || []).filter(a => a.id !== id);
    updateUser({ ...currentUser, addresses: updatedAddresses });
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

  return (
    <div className="min-h-screen pt-44 pb-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-serif mb-8">Portal do Cliente</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 h-fit lg:sticky lg:top-24 z-30">
            <div className="bg-white rounded-t-xl lg:rounded-xl shadow-sm p-6 lg:p-6 mb-0 lg:mb-0 border-b lg:border-b-0 border-gray-100 flex flex-col items-center text-center">
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
            
            <nav className="bg-white rounded-b-xl lg:rounded-xl shadow-sm lg:mt-6 p-2 lg:p-4 sticky top-[72px] lg:static z-30 overflow-x-auto no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-4 lg:overflow-visible border-b lg:border-0 border-gray-100">
               <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                  <button onClick={() => setActiveTab('projects')} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'projects' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Package className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Meus Projetos</span>
                  </button>
                  <button onClick={() => setActiveTab('schedule')} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'schedule' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Agendamentos</span>
                  </button>
                  <button onClick={() => setActiveTab('docs')} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'docs' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Arquivos</span>
                  </button>
                  <button onClick={() => setActiveTab('memories')} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'memories' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Brain className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Memórias & IA</span>
                  </button>
                  <button onClick={() => setActiveTab('profile')} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'profile' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <UserCircle className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Meus Dados</span>
                  </button>
               </div>
               
              <div className="hidden lg:block pt-4 mt-4 border-t border-gray-100">
                <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition text-sm">
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            </nav>
          </div>

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
                          // Logic to determine if it is Online or Physical for rendering
                          const isOnline = appt.type === 'meeting' && (appt.location.toLowerCase().includes('online') || !!appt.meetingLink);
                          
                          // Determine Map Query
                          let mapQuery = "";
                          if (!isOnline) {
                             if (appt.type === 'visit') {
                                mapQuery = appt.location;
                             } else {
                                // In-person meeting -> Office Address
                                mapQuery = siteContent.office.address;
                             }
                          }

                          return (
                          <div key={appt.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                             <div className={`p-4 flex justify-between items-center ${appt.status === 'confirmed' ? 'bg-green-50 text-green-800' : appt.status === 'pending' ? 'bg-yellow-50 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                                <div className="flex items-center gap-2">
                                   {appt.status === 'confirmed' && <CheckCircle className="w-5 h-5" />}
                                   {appt.status === 'pending' && <Clock className="w-5 h-5" />}
                                   {appt.status === 'cancelled' && <Ban className="w-5 h-5" />}
                                   <span className="font-bold uppercase text-xs tracking-wider">
                                      {appt.status === 'confirmed' ? 'Confirmado' : appt.status === 'pending' ? 'Aguardando Confirmação' : 'Cancelado'}
                                   </span>
                                </div>
                                <span className="text-sm font-bold">{new Date(appt.date).toLocaleDateString('pt-BR')} às {appt.time}</span>
                             </div>
                             
                             <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                   <div className="flex-grow space-y-3">
                                      <h3 className="font-serif text-xl">{appt.type === 'visit' ? 'Visita Técnica' : 'Reunião de Alinhamento'}</h3>
                                      <div className="flex items-start gap-2 text-gray-600">
                                         {isOnline ? <VideoIcon className="w-5 h-5 shrink-0 mt-0.5" /> : <MapPin className="w-5 h-5 shrink-0 mt-0.5" />}
                                         <p className="text-sm">{appt.location}</p>
                                      </div>
                                      
                                      {/* ACTION BUTTONS */}
                                      {appt.status !== 'cancelled' && (
                                         <div className="flex flex-wrap gap-4 mt-6">
                                            {/* Show Link Button if Online */}
                                            {isOnline && appt.meetingLink && (
                                               <a 
                                                 href={appt.meetingLink}
                                                 target="_blank"
                                                 rel="noreferrer"
                                                 className="flex items-center gap-2 text-xs font-bold text-white bg-black hover:bg-accent hover:text-black px-4 py-2 rounded-lg transition"
                                               >
                                                  <VideoIcon className="w-4 h-4" /> Entrar na Reunião
                                               </a>
                                            )}

                                            {/* Show Map Button if Physical */}
                                            {!isOnline && (
                                                <a 
                                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-lg"
                                                >
                                                   <ExternalLink className="w-4 h-4" /> Abrir no Maps
                                                </a>
                                            )}

                                            <button 
                                               onClick={() => { if(confirm('Deseja cancelar este agendamento?')) updateAppointmentStatus(appt.id, 'cancelled'); }}
                                               className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                                            >
                                               <X className="w-4 h-4" /> Cancelar
                                            </button>
                                         </div>
                                      )}
                                   </div>

                                   {/* EMBEDDED MAP FOR PHYSICAL MEETINGS/VISITS */}
                                   {!isOnline && appt.status !== 'cancelled' && (
                                      <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0 hidden md:block">
                                          <iframe 
                                            width="100%" 
                                            height="100%" 
                                            style={{ border: 0 }} 
                                            loading="lazy" 
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                            className="w-full h-full opacity-80 hover:opacity-100 transition"
                                          ></iframe>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       )})}
                    </div>
                 ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
                       <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                       <p>Nenhum agendamento futuro.</p>
                       <p className="text-xs mt-2">Use o Chatbot para marcar uma visita.</p>
                    </div>
                 )}
               </div>
            )}

            {activeTab === 'docs' && (
               <div className="animate-fadeIn">
                 {!currentFolder ? (
                   <>
                     <h2 className="text-2xl font-serif mb-6">Arquivos e Contratos</h2>
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
                             </button>
                           ))
                        ) : (
                           <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">Pasta vazia.</div>
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
                   <p className="text-gray-500 text-sm">Contexto aprendido pela IA.</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-accent" /> Contexto Pessoal</h3>
                       <button onClick={() => setShowAddMemory(!showAddMemory)} className="text-xs flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3" /> Adicionar</button>
                    </div>
                    {showAddMemory && (
                       <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200 animate-slideDown">
                          <input value={newMemory.topic} onChange={e => setNewMemory({...newMemory, topic: e.target.value})} className="w-full border p-2 rounded text-sm mb-2" placeholder="Tópico" />
                          <input value={newMemory.content} onChange={e => setNewMemory({...newMemory, content: e.target.value})} className="w-full border p-2 rounded text-sm mb-2" placeholder="Detalhe" />
                          <div className="flex justify-end gap-2"><button onClick={handleAddMemory} className="text-xs bg-black text-white px-4 py-2 rounded-full font-bold">Salvar</button></div>
                       </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {clientMemories.map(mem => (
                           <div key={mem.id} className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition relative group">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">{mem.topic}</span>
                              <p className="text-sm text-gray-700">{mem.content}</p>
                           </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* NEW PROFILE TAB */}
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
                             onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                             className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600" 
                           />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                              <input 
                                disabled={!isEditingProfile} 
                                value={isEditingProfile ? profileForm.email : currentUser.email} 
                                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black disabled:text-gray-600" 
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Telefone / WhatsApp</label>
                              <input 
                                disabled={!isEditingProfile} 
                                value={isEditingProfile ? (profileForm.phone || '') : (currentUser.phone || '')} 
                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
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
                                 onChange={e => setProfileForm({...profileForm, cpf: e.target.value})}
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
                                 onChange={e => setProfileForm({...profileForm, birthDate: e.target.value})}
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
                           <button onClick={handleAddAddress} className="text-xs bg-black text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-accent hover:text-black transition"><Plus className="w-3 h-3"/> Adicionar</button>
                        </div>
                        
                        {currentUser.addresses && currentUser.addresses.length > 0 ? (
                           <div className="space-y-4">
                              {currentUser.addresses.map(addr => (
                                 <div key={addr.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                                     <div className="flex items-center gap-2 mb-2">
                                        {addr.label.toLowerCase().includes('trabalho') ? <Briefcase className="w-4 h-4 text-gray-500"/> : <Home className="w-4 h-4 text-gray-500"/>}
                                        <span className="font-bold text-sm uppercase">{addr.label}</span>
                                     </div>
                                     <p className="text-sm text-gray-700">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                                     <p className="text-sm text-gray-500">{addr.district}, {addr.city} - {addr.state}</p>
                                     <p className="text-xs text-gray-400 mt-1">CEP: {addr.zipCode}</p>
                                     
                                     <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => handleEditAddress(addr)} className="p-1.5 bg-white border rounded hover:text-blue-500"><Edit2 className="w-3 h-3"/></button>
                                        <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 bg-white border rounded hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
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
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                       <motion.div 
                         initial={{ scale: 0.9, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.9, opacity: 0 }}
                         className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8"
                       >
                          <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-serif font-bold">{addressForm.id ? 'Editar Endereço' : 'Novo Endereço'}</h3>
                             <button onClick={() => setShowAddressModal(false)}><X className="w-5 h-5"/></button>
                          </div>
                          <div className="space-y-4">
                             <div>
                                <label className="text-xs font-bold uppercase text-gray-500">Rótulo (Ex: Casa, Escritório)</label>
                                <input value={addressForm.label || ''} onChange={e => setAddressForm({...addressForm, label: e.target.value})} className="w-full border p-2 rounded mt-1" placeholder="Casa"/>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-bold uppercase text-gray-500">CEP</label>
                                  <input value={addressForm.zipCode || ''} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} className="w-full border p-2 rounded mt-1"/>
                                </div>
                                <div>
                                  <label className="text-xs font-bold uppercase text-gray-500">Cidade/UF</label>
                                  <div className="flex gap-2">
                                     <input value={addressForm.city || ''} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full border p-2 rounded mt-1" placeholder="Cidade"/>
                                     <input value={addressForm.state || ''} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-20 border p-2 rounded mt-1" placeholder="UF"/>
                                  </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-[1fr_100px] gap-4">
                                <div>
                                  <label className="text-xs font-bold uppercase text-gray-500">Rua</label>
                                  <input value={addressForm.street || ''} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full border p-2 rounded mt-1"/>
                                </div>
                                <div>
                                  <label className="text-xs font-bold uppercase text-gray-500">Número</label>
                                  <input value={addressForm.number || ''} onChange={e => setAddressForm({...addressForm, number: e.target.value})} className="w-full border p-2 rounded mt-1"/>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-bold uppercase text-gray-500">Bairro</label>
                                  <input value={addressForm.district || ''} onChange={e => setAddressForm({...addressForm, district: e.target.value})} className="w-full border p-2 rounded mt-1"/>
                                </div>
                                <div>
                                  <label className="text-xs font-bold uppercase text-gray-500">Complemento</label>
                                  <input value={addressForm.complement || ''} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} className="w-full border p-2 rounded mt-1"/>
                                </div>
                             </div>
                             <button onClick={handleSaveAddress} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-accent hover:text-black transition mt-4">Salvar Endereço</button>
                          </div>
                       </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};