
import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LayoutDashboard, FolderOpen, Users, Settings, LogOut, ExternalLink, FileText, Save, Brain, ShoppingBag, Menu, X, ChevronRight, MessageSquare, Check, Clock } from 'lucide-react';
import { SiteContent, GlobalSettings } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { projects, deleteProject, currentUser, logout, siteContent, updateSiteContent, showToast, settings, updateSettings, adminNotes, markNoteAsRead, deleteAdminNote } = useProjects();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'content' | 'settings' | 'messages'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Local forms
  const [contentForm, setContentForm] = useState<SiteContent>(siteContent);
  const [settingsForm, setSettingsForm] = useState<GlobalSettings>(settings);

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

  const NavItem = ({ id, icon: Icon, label, count }: { id: typeof activeTab, icon: any, label: string, count?: number }) => (
    <button 
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }} 
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header & Navigation */}
      <header className="bg-neutral-900 text-white shadow-md p-4 md:hidden sticky top-0 z-50">
         <div className="flex justify-between items-center relative z-40">
           <div className="flex items-center gap-2">
             <span className="font-serif font-bold text-lg">FRAN<span className="text-accent">.</span> Admin</span>
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 p-2 hover:bg-white/10 rounded-full transition">
             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
         </div>

         {/* Mobile Dropdown Menu (Accordion/Overlay) */}
         {mobileMenuOpen && (
           <div className="absolute top-full left-0 w-full bg-neutral-900 border-t border-neutral-800 shadow-2xl animate-slideDown z-30 px-4 pb-6 pt-2 flex flex-col gap-2 h-screen">
              <div className="py-4 border-b border-neutral-800 mb-2 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center font-serif font-bold overflow-hidden">
                   {currentUser?.name.charAt(0)}
                 </div>
                 <div>
                   <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                   <p className="text-xs text-gray-500">Administrador</p>
                 </div>
              </div>

              <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
              <NavItem id="messages" icon={MessageSquare} label="Recados & IA" count={unreadNotesCount} />
              <NavItem id="projects" icon={FolderOpen} label="Projetos" />
              <NavItem id="content" icon={FileText} label="Conteúdo" />
              <NavItem id="settings" icon={Settings} label="Configurações" />

              <div className="pt-4 mt-2 border-t border-neutral-800 space-y-3">
                <Link to="/" className="flex items-center space-x-4 p-4 text-gray-400 hover:text-white rounded-xl hover:bg-white/5">
                  <ExternalLink className="w-5 h-5" />
                  <span>Ver Site Online</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-4 p-4 text-red-400 hover:text-red-300 w-full rounded-xl hover:bg-red-900/10">
                  <LogOut className="w-5 h-5" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
           </div>
         )}
      </header>

      {/* Desktop Sidebar - High Contrast (Dark) */}
      <aside className="w-72 bg-neutral-900 text-gray-300 hidden md:flex flex-col shadow-2xl z-20 h-screen sticky top-0">
        <div className="p-8">
          <h2 className="text-2xl font-serif tracking-widest text-white">FRAN<span className="text-accent">.</span></h2>
          <div className="flex items-center space-x-2 mt-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Admin Conectado</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-3 mt-4">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem id="messages" icon={MessageSquare} label="Recados & IA" count={unreadNotesCount} />
          <NavItem id="projects" icon={FolderOpen} label="Projetos" />
          <NavItem id="content" icon={FileText} label="Conteúdo" />
          <NavItem id="settings" icon={Settings} label="Configurações" />
        </nav>

        <div className="p-6 border-t border-neutral-800 bg-black/20">
          <div className="flex items-center space-x-4 mb-6">
             <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center font-serif font-bold overflow-hidden">
               {currentUser?.name.charAt(0)}
             </div>
             <div>
               <p className="text-sm font-bold text-white max-w-[120px] truncate">{currentUser?.name}</p>
               <p className="text-xs text-gray-500">Administrador</p>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm w-full transition mb-4">
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
          <Link to="/" className="flex items-center justify-center space-x-2 text-xs text-center text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg py-3 transition w-full active:scale-95">
            <span>Ver Site Online</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 h-auto md:h-screen">
        <div className="p-6 md:p-12 max-w-7xl mx-auto pb-24 md:pb-12">
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2 text-gray-900">Olá, {currentUser?.name.split(' ')[0]}</h1>
                <p className="text-gray-500">Aqui está o resumo do seu escritório hoje.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-black text-white rounded-lg"><FolderOpen className="w-6 h-6" /></div>
                    <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded">+2 essa semana</span>
                  </div>
                  <h3 className="text-gray-500 text-sm uppercase font-bold mb-1">Total de Projetos</h3>
                  <p className="text-4xl md:text-5xl font-serif text-gray-900">{projects.length}</p>
                </div>
                
                <div onClick={() => setActiveTab('messages')} className="cursor-pointer bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-accent text-white rounded-lg group-hover:bg-black transition-colors"><MessageSquare className="w-6 h-6" /></div>
                     {unreadNotesCount > 0 && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
                  </div>
                  <h3 className="text-gray-500 text-sm uppercase font-bold mb-1">Recados da IA</h3>
                  <p className="text-4xl md:text-5xl font-serif text-gray-900">{unreadNotesCount}</p>
                </div>

                {settings.enableShop && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-gray-200 text-gray-700 rounded-lg"><ShoppingBag className="w-6 h-6" /></div>
                    </div>
                    <h3 className="text-gray-500 text-sm uppercase font-bold mb-1">Orçamentos Pendentes</h3>
                    <p className="text-4xl md:text-5xl font-serif text-gray-900">5</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
             <div className="animate-fadeIn">
               <div className="mb-8">
                 <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Recados & Inteligência</h1>
                 <p className="text-gray-500 mt-2 text-sm md:text-base">Leads e mensagens coletados pelo Concierge Digital.</p>
               </div>

               <div className="space-y-4">
                 {adminNotes.length === 0 ? (
                   <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                     <div className="inline-block p-4 bg-gray-50 rounded-full mb-4"><Brain className="w-8 h-8 text-gray-300" /></div>
                     <p className="text-gray-400">Nenhum recado recebido ainda.</p>
                   </div>
                 ) : (
                   adminNotes.map(note => (
                     <div key={note.id} className={`bg-white p-6 rounded-xl border transition ${note.status === 'new' ? 'border-l-4 border-l-accent border-y-gray-100 border-r-gray-100 shadow-md' : 'border-gray-100 opacity-80 hover:opacity-100'}`}>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-2">
                               <h3 className="font-bold text-lg">{note.userName}</h3>
                               {note.status === 'new' && <span className="bg-accent text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Novo</span>}
                               <span className="text-xs text-gray-400 border border-gray-200 px-2 rounded-full capitalize">{note.source}</span>
                             </div>
                             <p className="text-sm text-gray-500 font-mono mb-3">{note.userContact}</p>
                             <div className="bg-gray-50 p-4 rounded-lg text-gray-700 italic border-l-2 border-gray-200">
                               "{note.message}"
                             </div>
                             <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {new Date(note.date).toLocaleDateString()} às {new Date(note.date).toLocaleTimeString()}
                             </p>
                           </div>
                           <div className="flex md:flex-col gap-2 shrink-0">
                              {note.status === 'new' && (
                                <button onClick={() => markNoteAsRead(note.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2 transition" title="Marcar como lido">
                                   <Check className="w-5 h-5" />
                                   <span className="md:hidden text-sm font-bold">Marcar Lido</span>
                                </button>
                              )}
                              <button onClick={() => deleteAdminNote(note.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex items-center gap-2 transition" title="Excluir">
                                <Trash2 className="w-5 h-5" />
                                <span className="md:hidden text-sm font-bold">Excluir</span>
                              </button>
                           </div>
                        </div>
                     </div>
                   ))
                 )}
               </div>
             </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                   <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Gerenciar Portfólio</h1>
                   <p className="text-gray-500 mt-2 text-sm md:text-base">Adicione, edite ou remova projetos do site.</p>
                </div>
                <Link to="/admin/project/new" className="w-full md:w-auto bg-black text-white px-6 py-4 md:py-3 rounded-full flex items-center justify-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                  <Plus className="w-5 h-5" />
                  <span className="font-bold text-sm">Novo Projeto</span>
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-6 text-xs font-bold uppercase text-gray-400 tracking-wider">Capa</th>
                        <th className="p-6 text-xs font-bold uppercase text-gray-400 tracking-wider">Título do Projeto</th>
                        <th className="p-6 text-xs font-bold uppercase text-gray-400 tracking-wider">Categoria</th>
                        <th className="p-6 text-xs font-bold uppercase text-gray-400 tracking-wider">Ano</th>
                        <th className="p-6 text-xs font-bold uppercase text-gray-400 tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50 group transition">
                          <td className="p-4 md:p-6">
                            <div className="w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden shadow-sm">
                              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 md:p-6 font-medium text-gray-900 text-base md:text-lg">{project.title}</td>
                          <td className="p-4 md:p-6">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase whitespace-nowrap">
                              {project.category}
                            </span>
                          </td>
                          <td className="p-4 md:p-6 text-sm text-gray-500 font-mono">{project.year}</td>
                          <td className="p-4 md:p-6 text-right">
                            <div className="flex justify-end space-x-3">
                              <Link to={`/admin/project/edit/${project.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition active:scale-95" title="Editar">
                                <Edit className="w-5 h-5" />
                              </Link>
                              <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition active:scale-95" title="Excluir">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
             <div className="animate-fadeIn">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                 <div>
                   <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Gerenciar Conteúdo</h1>
                   <p className="text-gray-500 mt-2 text-sm md:text-base">Edite os textos das páginas principais.</p>
                 </div>
                 <button onClick={saveContent} className="w-full md:w-auto bg-black text-white px-6 py-4 md:py-3 rounded-full flex items-center justify-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                    <Save className="w-5 h-5" />
                    <span className="font-bold text-sm">Salvar Alterações</span>
                 </button>
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl">
                 <h2 className="text-2xl font-serif mb-6 border-b pb-4">Página: Sobre (Quem Somos)</h2>
                 <div className="space-y-6">
                   <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subtítulo (Label)</label>
                     <input name="heroSubtitle" value={contentForm.about.heroSubtitle} onChange={handleContentChange} className="w-full border p-3 rounded focus:outline-none focus:border-black" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Título Principal (Hero)</label>
                     <input name="heroTitle" value={contentForm.about.heroTitle} onChange={handleContentChange} className="w-full border p-3 rounded focus:outline-none focus:border-black text-lg" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Biografia Principal</label>
                     <textarea name="bio" value={contentForm.about.bio} onChange={handleContentChange} className="w-full border p-3 rounded focus:outline-none focus:border-black h-40" />
                   </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                 <div>
                   <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Configurações Globais</h1>
                   <p className="text-gray-500 mt-2 text-sm md:text-base">Definições do sistema, IA e recursos.</p>
                 </div>
                 <button onClick={saveSettings} className="w-full md:w-auto bg-black text-white px-6 py-4 md:py-3 rounded-full flex items-center justify-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                    <Save className="w-5 h-5" />
                    <span className="font-bold text-sm">Salvar Configurações</span>
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Feature Flags */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Recursos do Site</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div>
                        <span className="font-bold block">Loja / Orçamentos</span>
                        <span className="text-sm text-gray-500">Habilita a página de solicitação de orçamento.</span>
                      </div>
                      <button 
                        onClick={() => handleSettingsChange('enableShop', !settingsForm.enableShop)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settingsForm.enableShop ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settingsForm.enableShop ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                 </div>

                 {/* AI Config */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Brain className="w-5 h-5" /> Configuração Gemini AI</h3>
                    <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Modelo Gemini</label>
                         <select 
                            value={settingsForm.aiConfig.model} 
                            onChange={(e) => handleSettingsChange('aiConfig.model', e.target.value)}
                            className="w-full border p-2 rounded"
                         >
                           <option value="gemini-2.5-flash">Gemini 2.5 Flash (Rápido)</option>
                           <option value="gemini-1.5-pro">Gemini 1.5 Pro (Raciocínio)</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Instrução do Sistema</label>
                         <textarea 
                            value={settingsForm.aiConfig.systemInstruction} 
                            onChange={(e) => handleSettingsChange('aiConfig.systemInstruction', e.target.value)}
                            className="w-full border p-2 rounded h-32 text-sm"
                            placeholder="Como a IA deve se comportar..."
                         />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
