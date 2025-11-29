
import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LayoutDashboard, FolderOpen, Users, Settings, LogOut, ExternalLink, FileText, Save, Brain, ShoppingBag } from 'lucide-react';
import { SiteContent, GlobalSettings } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { projects, deleteProject, currentUser, logout, siteContent, updateSiteContent, showToast, settings, updateSettings } = useProjects();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'content' | 'settings'>('dashboard');
  
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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar - High Contrast (Dark) */}
      <aside className="w-72 bg-neutral-900 text-gray-300 hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <h2 className="text-2xl font-serif tracking-widest text-white">FRAN<span className="text-accent">.</span></h2>
          <div className="flex items-center space-x-2 mt-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Admin Conectado</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-3 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-4 w-full p-4 rounded-xl transition duration-200 active:scale-95 ${activeTab === 'dashboard' ? 'bg-white text-black font-bold shadow-lg transform scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Visão Geral</span>
          </button>
          <button onClick={() => setActiveTab('projects')} className={`flex items-center space-x-4 w-full p-4 rounded-xl transition duration-200 active:scale-95 ${activeTab === 'projects' ? 'bg-white text-black font-bold shadow-lg transform scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FolderOpen className="w-5 h-5" />
            <span>Projetos</span>
          </button>
          <button onClick={() => setActiveTab('content')} className={`flex items-center space-x-4 w-full p-4 rounded-xl transition duration-200 active:scale-95 ${activeTab === 'content' ? 'bg-white text-black font-bold shadow-lg transform scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FileText className="w-5 h-5" />
            <span>Conteúdo</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center space-x-4 w-full p-4 rounded-xl transition duration-200 active:scale-95 ${activeTab === 'settings' ? 'bg-white text-black font-bold shadow-lg transform scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
        </nav>

        <div className="p-6 border-t border-neutral-800 bg-black/20">
          <div className="flex items-center space-x-4 mb-6">
             <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center font-serif font-bold overflow-hidden">
               {currentUser?.name.charAt(0)}
             </div>
             <div>
               <p className="text-sm font-bold text-white">{currentUser?.name}</p>
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
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-neutral-900 text-white shadow-md p-4 md:hidden flex justify-between items-center sticky top-0 z-10">
           <span className="font-serif font-bold text-lg">FRAN. Admin</span>
           <button onClick={handleLogout} className="text-gray-300"><LogOut className="w-5 h-5" /></button>
        </header>

        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h1 className="text-4xl font-serif mb-2 text-gray-900">Olá, {currentUser?.name.split(' ')[0]}</h1>
                <p className="text-gray-500">Aqui está o resumo do seu escritório hoje.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-black text-white rounded-lg"><FolderOpen className="w-6 h-6" /></div>
                    <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded">+2 essa semana</span>
                  </div>
                  <h3 className="text-gray-500 text-sm uppercase font-bold mb-1">Total de Projetos</h3>
                  <p className="text-5xl font-serif text-gray-900">{projects.length}</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-accent text-white rounded-lg"><Users className="w-6 h-6" /></div>
                  </div>
                  <h3 className="text-gray-500 text-sm uppercase font-bold mb-1">Visitas do Site</h3>
                  <p className="text-5xl font-serif text-gray-900">1.2k</p>
                </div>
                {settings.enableShop && (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-gray-200 text-gray-700 rounded-lg"><ShoppingBag className="w-6 h-6" /></div>
                    </div>
                    <h3 className="text-gray-500 text-sm uppercase font-bold mb-1">Orçamentos Pendentes</h3>
                    <p className="text-5xl font-serif text-gray-900">5</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                <div>
                   <h1 className="text-4xl font-serif text-gray-900">Gerenciar Portfólio</h1>
                   <p className="text-gray-500 mt-2">Adicione, edite ou remova projetos do site.</p>
                </div>
                <Link to="/admin/project/new" className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                  <Plus className="w-5 h-5" />
                  <span className="font-bold text-sm">Novo Projeto</span>
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
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
                          <td className="p-6">
                            <div className="w-20 h-14 rounded-lg overflow-hidden shadow-sm">
                              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-6 font-medium text-gray-900 text-lg">{project.title}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase">
                              {project.category}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-gray-500 font-mono">{project.year}</td>
                          <td className="p-6 text-right">
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
               <div className="flex justify-between items-center mb-10">
                 <div>
                   <h1 className="text-4xl font-serif text-gray-900">Gerenciar Conteúdo</h1>
                   <p className="text-gray-500 mt-2">Edite os textos das páginas principais.</p>
                 </div>
                 <button onClick={saveContent} className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                    <Save className="w-5 h-5" />
                    <span className="font-bold text-sm">Salvar Alterações</span>
                 </button>
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
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
              <div className="flex justify-between items-center mb-10">
                 <div>
                   <h1 className="text-4xl font-serif text-gray-900">Configurações Globais</h1>
                   <p className="text-gray-500 mt-2">Definições do sistema, IA e recursos.</p>
                 </div>
                 <button onClick={saveSettings} className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-accent hover:text-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 duration-200">
                    <Save className="w-5 h-5" />
                    <span className="font-bold text-sm">Salvar Configurações</span>
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Feature Flags */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
