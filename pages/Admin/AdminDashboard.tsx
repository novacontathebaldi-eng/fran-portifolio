
import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LayoutDashboard, FolderOpen, Users, Settings, LogOut, FileText, Save, Brain, ShoppingBag, Menu, X, ChevronRight, MessageSquare, Check, Clock, Upload, ImageIcon, Folder, Download, ArrowLeft, Bot, ThumbsDown, MessageCircleWarning, CornerDownRight, ThumbsUp } from 'lucide-react';
import { SiteContent, GlobalSettings, StatItem, PillarItem, User, ClientFolder } from '../../types';

// Mock Supabase Upload Simulation
const uploadToSupabase = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
};

export const AdminDashboard: React.FC = () => {
  const { projects, deleteProject, logout, siteContent, updateSiteContent, showToast, settings, updateSettings, adminNotes, markNoteAsRead, deleteAdminNote, users, createClientFolder, renameClientFolder, deleteClientFolder, uploadFileToFolder, deleteClientFile, updateUser, aiFeedbacks } = useProjects();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'content' | 'settings' | 'messages' | 'clients'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Local forms
  const [contentForm, setContentForm] = useState<SiteContent>(siteContent);
  const [settingsForm, setSettingsForm] = useState<GlobalSettings>(settings);

  // Client Details View
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  
  // Admin File Manager State
  const [currentAdminFolderId, setCurrentAdminFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  
  // Rename State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(id);
      showToast('Projeto excluído.', 'info');
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

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'heroImage' | 'profileImage') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const url = await uploadToSupabase(file);
      setContentForm(prev => ({
        ...prev,
        about: {
          ...prev.about,
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

  // Stats Management
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

  // Pillars Management
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
  
  const handleSettingsChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettingsForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setSettingsForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const saveContent = () => {
    updateSiteContent(contentForm);
    showToast('Conteúdo atualizado com sucesso!', 'success');
  };

  const saveSettings = () => {
    updateSettings(settingsForm);
    showToast('Configurações salvas.', 'success');
  };

  // --- Client Memory Management (Admin) ---
  const handleAdminDeleteMemory = (memoryId: string) => {
    if (!selectedClient) return;
    if (confirm('Tem certeza que deseja apagar esta memória do cliente?')) {
        const updatedMemories = (selectedClient.memories || []).filter(m => m.id !== memoryId);
        const updatedClient = { ...selectedClient, memories: updatedMemories };
        updateUser(updatedClient);
        setSelectedClient(updatedClient);
        showToast('Memória removida.', 'success');
    }
  }

  // --- Folder Management Actions ---
  const handleCreateFolder = () => {
    if (newFolderName.trim() && selectedClient) {
      createClientFolder(selectedClient.id, newFolderName);
      setNewFolderName('');
      setShowNewFolderInput(false);
      showToast('Pasta criada.', 'success');
      // Refresh selected client to show new data
      const updatedUser = users.find(u => u.id === selectedClient.id);
      if (updatedUser) setSelectedClient(updatedUser);
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
      // Refresh
      const updatedUser = users.find(u => u.id === selectedClient.id);
      if (updatedUser) setSelectedClient(updatedUser);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (selectedClient && confirm('Excluir esta pasta e todos os arquivos?')) {
      deleteClientFolder(selectedClient.id, folderId);
      // Refresh selected client
      const updatedUser = users.find(u => u.id === selectedClient.id);
      if (updatedUser) setSelectedClient(updatedUser);
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
      // Refresh
      const updatedUser = users.find(u => u.id === selectedClient.id);
      if (updatedUser) setSelectedClient(updatedUser);
    } catch (err) {
      showToast('Erro no envio.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (selectedClient && currentAdminFolderId && confirm('Excluir arquivo?')) {
      deleteClientFile(selectedClient.id, currentAdminFolderId, fileId);
      // Refresh
      const updatedUser = users.find(u => u.id === selectedClient.id);
      if (updatedUser) setSelectedClient(updatedUser);
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

  const unreadNotesCount = adminNotes.filter(n => n.status === 'new').length;
  const dislikeFeedbacks = aiFeedbacks.filter(f => f.type === 'dislike');

  return (
    <div className="min-h-screen bg-[#111] flex font-sans text-gray-100">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-[#111] z-50 flex justify-between items-center p-4 border-b border-gray-800">
        <span className="text-xl font-serif font-bold">Fran Siller.</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 w-64 h-screen bg-[#111] border-r border-gray-800 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} pt-20 md:pt-0`}>
        <div className="p-8 hidden md:block">
          <h1 className="text-2xl font-serif font-bold tracking-wider">Fran Siller<span className="text-accent">.</span></h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Painel Administrativo</p>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem id="projects" icon={FolderOpen} label="Projetos" />
          <NavItem id="clients" icon={Users} label="Clientes & Arquivos" />
          <NavItem id="messages" icon={MessageSquare} label="Mensagens & IA" count={unreadNotesCount} />
          <NavItem id="content" icon={FileText} label="Conteúdo Site" />
          <NavItem id="settings" icon={Settings} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-4 text-red-400 hover:bg-white/5 rounded-xl transition">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0 bg-gray-50 text-black">
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-serif font-bold mb-8">Bem-vinda, Fran.</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-black text-white rounded-xl"><FolderOpen className="w-6 h-6" /></div>
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">Ativos</span>
                  </div>
                  <h3 className="text-4xl font-serif font-bold mb-1">{projects.length}</h3>
                  <p className="text-gray-400 text-sm">Projetos Publicados</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-accent text-black rounded-xl"><MessageSquare className="w-6 h-6" /></div>
                    {unreadNotesCount > 0 && <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded">Novas</span>}
                  </div>
                  <h3 className="text-4xl font-serif font-bold mb-1">{adminNotes.length}</h3>
                  <p className="text-gray-400 text-sm">Mensagens</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-100 text-black rounded-xl"><Users className="w-6 h-6" /></div>
                  </div>
                  <h3 className="text-4xl font-serif font-bold mb-1">{users.filter(u => u.role === 'client').length}</h3>
                  <p className="text-gray-400 text-sm">Clientes Registrados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><FolderOpen className="w-5 h-5" /> Projetos Recentes</h3>
                    <div className="space-y-4">
                      {projects.slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                          <img src={p.image} className="w-16 h-16 rounded object-cover" />
                          <div className="flex-grow">
                            <h4 className="font-bold font-serif">{p.title}</h4>
                            <p className="text-xs text-gray-500">{p.category} • {p.year}</p>
                          </div>
                          <Link to={`/admin/project/edit/${p.id}`} className="p-2 text-gray-400 hover:text-black"><Edit2 className="w-4 h-4" /></Link>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('projects')} className="w-full mt-6 text-center text-sm font-bold text-gray-500 hover:text-black">Ver Todos</button>
                 </div>
              </div>
            </div>
          )}

          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif font-bold">Projetos</h2>
                <Link to="/admin/project/new" className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg">
                  <Plus className="w-4 h-4" />
                  <span>Novo Projeto</span>
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-6 text-xs font-bold uppercase text-gray-500">Projeto</th>
                      <th className="text-left p-6 text-xs font-bold uppercase text-gray-500 hidden md:table-cell">Categoria</th>
                      <th className="text-left p-6 text-xs font-bold uppercase text-gray-500 hidden md:table-cell">Local</th>
                      <th className="text-right p-6 text-xs font-bold uppercase text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50 transition">
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <img src={project.image} alt="" className="w-12 h-12 rounded object-cover" />
                            <span className="font-bold font-serif">{project.title}</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-gray-500 hidden md:table-cell">{project.category}</td>
                        <td className="p-6 text-sm text-gray-500 hidden md:table-cell">{project.location}</td>
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

          {/* Clients & Files View */}
          {activeTab === 'clients' && (
             <div className="animate-fadeIn">
               {!selectedClient ? (
                 <>
                   <h2 className="text-3xl font-serif font-bold mb-8">Clientes Cadastrados</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {users.filter(u => u.role === 'client').map(client => (
                        <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition cursor-pointer group">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg group-hover:text-accent transition">{client.name}</h3>
                                <p className="text-xs text-gray-500">{client.email}</p>
                              </div>
                           </div>
                           <div className="flex justify-between text-sm text-gray-500 border-t border-gray-50 pt-4">
                              <span className="flex items-center gap-1"><Folder className="w-4 h-4" /> {client.folders?.length || 0} Pastas</span>
                              <span className="flex items-center gap-1"><Brain className="w-4 h-4" /> {client.memories?.length || 0} Memórias</span>
                           </div>
                        </div>
                      ))}
                      {users.filter(u => u.role === 'client').length === 0 && (
                        <p className="text-gray-400 col-span-full">Nenhum cliente cadastrado ainda.</p>
                      )}
                   </div>
                 </>
               ) : (
                 <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                       <button onClick={() => { setSelectedClient(null); setCurrentAdminFolderId(null); }} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                       <div>
                         <h2 className="text-2xl font-serif font-bold">{selectedClient.name}</h2>
                         <p className="text-sm text-gray-500">Gerenciamento de Arquivos e Dados</p>
                       </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
                       {/* Left: Folders */}
                       <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-xl flex flex-col">
                          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                             <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500">Pastas</h3>
                             <button onClick={() => setShowNewFolderInput(true)} className="p-1.5 bg-black text-white rounded hover:bg-accent hover:text-black transition"><Plus className="w-4 h-4" /></button>
                          </div>
                          
                          <div className="flex-grow overflow-y-auto p-2 space-y-1">
                             {showNewFolderInput && (
                               <div className="p-2 bg-gray-50 rounded border border-gray-200 mb-2 animate-fadeIn">
                                  <input 
                                    autoFocus
                                    className="w-full text-sm p-1 border border-gray-300 rounded mb-2"
                                    placeholder="Nome da pasta..."
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                                  />
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => setShowNewFolderInput(false)} className="text-xs text-gray-500">Cancelar</button>
                                     <button onClick={handleCreateFolder} className="text-xs bg-black text-white px-2 py-1 rounded">Criar</button>
                                  </div>
                               </div>
                             )}

                             {selectedClient.folders?.map(folder => (
                               <div 
                                 key={folder.id}
                                 onClick={() => setCurrentAdminFolderId(folder.id)}
                                 className={`p-3 rounded-lg flex items-center justify-between cursor-pointer group transition ${currentAdminFolderId === folder.id ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                               >
                                  <div className="flex items-center gap-3 overflow-hidden w-full">
                                     <Folder className={`w-5 h-5 shrink-0 ${currentAdminFolderId === folder.id ? 'text-accent' : 'text-yellow-500'}`} />
                                     
                                     {editingFolderId === folder.id ? (
                                        <div className="flex items-center gap-2 w-full pr-2" onClick={e => e.stopPropagation()}>
                                           <input 
                                              value={editFolderName}
                                              onChange={e => setEditFolderName(e.target.value)}
                                              className="w-full text-xs text-black border p-1 rounded"
                                              autoFocus
                                              onKeyDown={e => e.key === 'Enter' && handleRenameFolder()}
                                           />
                                           <button onClick={handleRenameFolder} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check className="w-3 h-3"/></button>
                                           <button onClick={() => setEditingFolderId(null)} className="p-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"><X className="w-3 h-3"/></button>
                                        </div>
                                     ) : (
                                        <span className="text-sm font-medium truncate">{folder.name}</span>
                                     )}
                                  </div>
                                  
                                  {editingFolderId !== folder.id && (
                                    <div className={`flex gap-1 ${currentAdminFolderId === folder.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
                                       <button onClick={(e) => { e.stopPropagation(); startRenaming(folder); }} className={`p-1.5 rounded ${currentAdminFolderId === folder.id ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}><Edit2 className="w-3 h-3" /></button>
                                       <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className={`p-1.5 rounded ${currentAdminFolderId === folder.id ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  )}
                               </div>
                             ))}
                             {(!selectedClient.folders || selectedClient.folders.length === 0) && !showNewFolderInput && (
                                <p className="text-center text-xs text-gray-400 py-8">Nenhuma pasta criada.</p>
                             )}
                          </div>
                       </div>

                       {/* Right: Files */}
                       <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-xl flex flex-col relative">
                          {!currentAdminFolderId ? (
                             <div className="flex-grow flex flex-col items-center justify-center text-gray-300">
                                <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
                                <p>Selecione uma pasta para gerenciar arquivos.</p>
                             </div>
                          ) : (
                            <>
                              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                                 <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500">Arquivos</h3>
                                 <label className="cursor-pointer bg-black text-white px-3 py-1.5 rounded hover:bg-accent hover:text-black transition flex items-center gap-2 text-xs font-bold shadow-sm">
                                    {uploading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Upload className="w-3 h-3" />}
                                    <span>Upload</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                 </label>
                              </div>
                              <div className="flex-grow p-4 overflow-y-auto">
                                 {users.find(u => u.id === selectedClient.id)?.folders?.find(f => f.id === currentAdminFolderId)?.files.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                       Pasta vazia. Faça upload de documentos.
                                    </div>
                                 ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                       {users.find(u => u.id === selectedClient.id)?.folders?.find(f => f.id === currentAdminFolderId)?.files.map(file => (
                                          <div key={file.id} className="group relative border border-gray-100 rounded-lg p-3 hover:shadow-md transition bg-gray-50 hover:bg-white">
                                             <button onClick={() => handleDeleteFile(file.id)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 hover:text-red-500 transition"><Trash2 className="w-3 h-3" /></button>
                                             <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">
                                                {file.type === 'image' ? <ImageIcon className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                                             </div>
                                             <p className="font-bold text-xs truncate" title={file.name}>{file.name}</p>
                                             <p className="text-[10px] text-gray-400">{file.size}</p>
                                             <a href={file.url} download target="_blank" className="mt-2 block text-center text-[10px] font-bold text-accent hover:underline">Baixar</a>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                            </>
                          )}
                       </div>
                    </div>
                    
                    {/* Memories Section */}
                    <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
                       <h3 className="font-bold mb-4 flex items-center gap-2"><Brain className="w-5 h-5" /> Memórias & Contexto IA</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedClient.memories && selectedClient.memories.length > 0 ? (
                             selectedClient.memories.map(mem => (
                                <div key={mem.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start group">
                                   <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">{mem.topic}</span>
                                      <p className="text-sm text-gray-700">{mem.content}</p>
                                      <span className="text-[10px] text-gray-400 mt-2 block capitalize">{mem.type === 'system_detected' ? 'Detectado por IA' : 'Inserido por Usuário'}</span>
                                   </div>
                                   <button onClick={() => handleAdminDeleteMemory(mem.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                             ))
                          ) : (
                             <p className="text-gray-400 text-sm">Sem memórias registradas.</p>
                          )}
                       </div>
                    </div>
                 </div>
               )}
             </div>
          )}

          {/* Messages View */}
          {activeTab === 'messages' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-serif font-bold mb-8">Central de Mensagens</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Admin Notes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-6 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Recados do Chatbot</h3>
                   </div>
                   <div className="divide-y divide-gray-100">
                      {adminNotes.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Nenhuma mensagem nova.</div>
                      ) : (
                        adminNotes.map(note => (
                          <div key={note.id} className={`p-6 hover:bg-gray-50 transition flex flex-col md:flex-row gap-4 ${note.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                             <div className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                   <div>
                                     <span className="font-bold text-lg">{note.userName}</span>
                                     <span className="text-sm text-gray-500 ml-2">({note.userContact})</span>
                                   </div>
                                   <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded">{new Date(note.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{note.message}</p>
                                <span className="text-xs text-gray-400 mt-2 block uppercase tracking-wide">Via {note.source === 'chatbot' ? 'Assistente Virtual' : 'Formulário'}</span>
                             </div>
                             <div className="flex items-center gap-2 md:flex-col">
                                {note.status === 'new' && (
                                  <button onClick={() => markNoteAsRead(note.id)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition" title="Marcar como lido"><Check className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => deleteAdminNote(note.id)} className="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 transition" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* AI Feedback Dislikes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-6 border-b border-gray-100 bg-red-50">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-red-700"><ThumbsDown className="w-5 h-5" /> Feedbacks Negativos (IA)</h3>
                   </div>
                   <div className="divide-y divide-gray-100">
                      {dislikeFeedbacks.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Nenhum feedback negativo registrado. Ótimo trabalho!</div>
                      ) : (
                        dislikeFeedbacks.map(feedback => (
                           <div key={feedback.id} className="p-6 hover:bg-gray-50 transition">
                              <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                                 <Clock className="w-3 h-3" /> {new Date(feedback.createdAt).toLocaleString()}
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                                 <span className="text-xs font-bold uppercase text-gray-500 mb-1 block">Usuário</span>
                                 <p className="text-gray-800">{feedback.userMessage}</p>
                              </div>
                              <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 relative">
                                 <Bot className="w-4 h-4 absolute top-4 right-4 text-red-300" />
                                 <span className="text-xs font-bold uppercase text-red-400 mb-1 block">Resposta IA</span>
                                 <p className="text-gray-700 italic">"{feedback.aiResponse}"</p>
                              </div>
                              <div className="mt-4 flex justify-end">
                                 <Link to="/admin" onClick={() => setActiveTab('settings')} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    Ajustar Prompt <Settings className="w-3 h-3" />
                                 </Link>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Editor View */}
          {activeTab === 'content' && (
            <div className="animate-fadeIn max-w-4xl">
              <h2 className="text-3xl font-serif font-bold mb-8">Conteúdo do Site</h2>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                 <h3 className="font-bold text-xl mb-6">Página Sobre (Hero & Bio)</h3>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subtítulo Hero</label>
                      <input name="heroSubtitle" value={contentForm.about.heroSubtitle} onChange={handleContentChange} className="w-full border p-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Título Hero</label>
                      <input name="heroTitle" value={contentForm.about.heroTitle} onChange={handleContentChange} className="w-full border p-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Bio Principal</label>
                      <textarea name="bio" value={contentForm.about.bio} onChange={handleContentChange} className="w-full border p-3 rounded h-40" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Imagem Hero</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'heroImage')} />
                             {uploading ? <span className="text-xs">Carregando...</span> : <span className="text-xs text-gray-500">Clique para alterar</span>}
                             <img src={contentForm.about.heroImage} className="mt-2 h-20 w-full object-cover rounded" />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Foto de Perfil</label>
                           <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'profileImage')} />
                             {uploading ? <span className="text-xs">Carregando...</span> : <span className="text-xs text-gray-500">Clique para alterar</span>}
                             <img src={contentForm.about.profileImage} className="mt-2 h-20 w-full object-contain rounded bg-gray-100" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-xl">Estatísticas</h3>
                   <button onClick={addStat} className="text-xs bg-black text-white px-3 py-1 rounded-full"><Plus className="w-3 h-3 inline mr-1" /> Adicionar</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contentForm.about.stats.map(stat => (
                      <div key={stat.id} className="p-4 border border-gray-200 rounded-lg relative group">
                         <button onClick={() => removeStat(stat.id)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                         <input value={stat.value} onChange={(e) => updateStat(stat.id, 'value', e.target.value)} className="font-serif text-2xl font-bold w-full border-none p-0 focus:ring-0 mb-1" placeholder="Valor" />
                         <input value={stat.label} onChange={(e) => updateStat(stat.id, 'label', e.target.value)} className="text-xs uppercase text-gray-500 w-full border-none p-0 focus:ring-0" placeholder="Rótulo" />
                      </div>
                    ))}
                 </div>
              </div>

               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-xl">Pilares</h3>
                   <button onClick={addPillar} className="text-xs bg-black text-white px-3 py-1 rounded-full"><Plus className="w-3 h-3 inline mr-1" /> Adicionar</button>
                 </div>
                 <div className="space-y-4">
                    {contentForm.about.pillars.map(pillar => (
                      <div key={pillar.id} className="p-4 border border-gray-200 rounded-lg relative group bg-gray-50">
                         <button onClick={() => removePillar(pillar.id)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                         <input value={pillar.title} onChange={(e) => updatePillar(pillar.id, 'title', e.target.value)} className="font-bold w-full bg-transparent border-none p-0 focus:ring-0 mb-2" placeholder="Título do Pilar" />
                         <textarea value={pillar.description} onChange={(e) => updatePillar(pillar.id, 'description', e.target.value)} className="text-sm text-gray-600 w-full bg-transparent border-none p-0 focus:ring-0 resize-none" placeholder="Descrição..." />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="fixed bottom-6 right-6 md:right-10 z-30">
                 <button onClick={saveContent} className="bg-green-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-green-600 transition flex items-center gap-2 transform hover:scale-105">
                    <Save className="w-5 h-5" /> Salvar Alterações
                 </button>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="animate-fadeIn max-w-2xl">
              <h2 className="text-3xl font-serif font-bold mb-8">Configurações Globais</h2>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                 
                 {/* AI Configuration */}
                 <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bot className="w-5 h-5" /> Inteligência Artificial (Chatbot)</h3>
                    
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Modelo LLM</label>
                          <select 
                            value={settingsForm.aiConfig.model} 
                            onChange={(e) => handleSettingsChange('aiConfig.model', e.target.value)} 
                            className="w-full border p-3 rounded bg-gray-50 focus:outline-none focus:border-black"
                          >
                             <option value="gemini-2.5-flash">Gemini 2.5 Flash (Padrão)</option>
                             <option value="gemini-1.5-pro">Gemini 1.5 Pro (Avançado)</option>
                             <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Econômico)</option>
                             <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Econômico)</option>
                          </select>
                       </div>

                       <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Criatividade (Temperatura)</label>
                          <div className="flex items-center gap-4">
                             <input 
                               type="range" 
                               min="0" 
                               max="1" 
                               step="0.1"
                               value={settingsForm.aiConfig.temperature || 0.7}
                               onChange={(e) => handleSettingsChange('aiConfig.temperature', parseFloat(e.target.value))}
                               className="w-full accent-black"
                             />
                             <span className="font-mono font-bold w-12 text-right">{settingsForm.aiConfig.temperature || 0.7}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Valores mais altos tornam o bot mais criativo, valores baixos mais preciso.</p>
                       </div>

                       <div className="border-t border-gray-100 pt-4 mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <label className="text-sm font-bold">Prompt do Sistema Personalizado</label>
                             <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${settingsForm.aiConfig.useCustomSystemInstruction ? 'text-black' : 'text-gray-300'}`}>
                                   {settingsForm.aiConfig.useCustomSystemInstruction ? 'ATIVADO' : 'DESATIVADO'}
                                </span>
                                <div 
                                   onClick={() => handleSettingsChange('aiConfig.useCustomSystemInstruction', !settingsForm.aiConfig.useCustomSystemInstruction)}
                                   className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${settingsForm.aiConfig.useCustomSystemInstruction ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settingsForm.aiConfig.useCustomSystemInstruction ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                             </div>
                          </div>
                          
                          <div className="relative">
                             {!settingsForm.aiConfig.useCustomSystemInstruction && (
                                <div className="absolute inset-0 bg-gray-50/80 z-10 flex items-center justify-center backdrop-blur-[1px] rounded border border-gray-200">
                                   <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">Usando Prompt Padrão do Sistema</span>
                                </div>
                             )}
                             <textarea 
                                value={settingsForm.aiConfig.systemInstruction} 
                                onChange={(e) => handleSettingsChange('aiConfig.systemInstruction', e.target.value)}
                                className="w-full border p-3 rounded h-48 font-mono text-xs leading-relaxed focus:outline-none focus:border-black"
                                placeholder="Descreva a personalidade e regras do bot aqui..."
                                disabled={!settingsForm.aiConfig.useCustomSystemInstruction}
                             />
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Instrua o bot sobre como se comportar, tom de voz e informações críticas.</p>
                       </div>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> E-commerce & Serviços</h3>
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                       <div>
                          <span className="font-bold block">Habilitar Loja/Orçamentos</span>
                          <span className="text-xs text-gray-500">Permite que clientes solicitem orçamentos pelo site.</span>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={settingsForm.enableShop} 
                         onChange={(e) => handleSettingsChange('enableShop', e.target.checked)}
                         className="w-6 h-6 accent-black"
                       />
                    </div>
                 </div>

                 <button onClick={saveSettings} className="w-full bg-black text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:bg-accent hover:text-black transition flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Salvar Configurações
                 </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
