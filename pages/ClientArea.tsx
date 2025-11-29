
import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { User, Settings, Package, Heart, LogOut, FileText, Download, Clock, CheckCircle, Brain, Trash2, Edit2, Plus, MessageSquare, Folder, Image, Video, ArrowLeft, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ClientMemory, ClientFolder } from '../types';
import { Navigate } from 'react-router-dom';

export const ClientArea: React.FC = () => {
  const { currentUser, logout, projects: allProjects, clientMemories, addClientMemory, updateClientMemory, deleteClientMemory } = useProjects();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'docs' | 'settings' | 'favs' | 'memories'>('projects');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemory, setNewMemory] = useState({ topic: '', content: '' });
  
  // Edit State for Memories
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editMemoryContent, setEditMemoryContent] = useState('');

  // File Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // CRITICAL FIX: Redirect to Auth if no user is logged in
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const currentFolder = currentUser.folders?.find(f => f.id === currentFolderId);

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

  const startEditingMemory = (mem: ClientMemory) => {
    setEditingMemoryId(mem.id);
    setEditMemoryContent(mem.content);
  };

  const saveEditedMemory = (id: string) => {
    if (editMemoryContent.trim()) {
      updateClientMemory(id, editMemoryContent);
      setEditingMemoryId(null);
    }
  };

  // Timeline Component
  const ProjectTimeline = () => {
    const stages = [
      { name: 'Contratação', status: 'completed', date: '15 Out' },
      { name: 'Levantamento', status: 'completed', date: '20 Out' },
      { name: 'Estudo Preliminar', status: 'current', date: '01 Nov' },
      { name: 'Anteprojeto', status: 'pending', date: 'Est. 15 Nov' },
      { name: 'Projeto Executivo', status: 'pending', date: 'Est. 10 Dez' },
      { name: 'Obra', status: 'pending', date: '2025' },
    ];

    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <h4 className="font-bold text-sm mb-4">Cronograma do Projeto</h4>
        <div className="space-y-0">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex gap-4 relative group">
              {/* Line */}
              {idx !== stages.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-100 h-full group-last:hidden"></div>
              )}
              
              <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${stage.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : stage.status === 'current' ? 'bg-white border-black' : 'bg-gray-100 border-gray-200'}`}>
                {stage.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {stage.status === 'current' && <div className="w-2 h-2 bg-black rounded-full animate-pulse" />}
              </div>
              
              <div className="pb-8">
                <p className={`font-medium text-sm ${stage.status === 'current' ? 'text-black' : 'text-gray-500'}`}>{stage.name}</p>
                <p className="text-xs text-gray-400">{stage.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-serif mb-8">Portal do Cliente</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Navigation Area */}
          <div className="w-full lg:w-1/4 h-fit lg:sticky lg:top-24 z-30">
            {/* Profile Info - Scrolls away on mobile */}
            <div className="bg-white rounded-t-xl lg:rounded-xl shadow-sm p-6 lg:p-6 mb-0 lg:mb-0 border-b lg:border-b-0 border-gray-100">
              <div className="flex items-center space-x-4 lg:mb-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-accent rounded-full flex items-center justify-center text-lg lg:text-xl font-serif font-bold text-white shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate text-sm lg:text-base">{currentUser.name}</h3>
                  <p className="text-xs text-secondary truncate">{currentUser.email}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs - Sticky on Mobile */}
            <nav className="bg-white rounded-b-xl lg:rounded-xl shadow-sm lg:mt-6 p-2 lg:p-4 sticky top-[72px] lg:static z-30 overflow-x-auto no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-4 lg:overflow-visible border-b lg:border-0 border-gray-100">
               <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                  <button onClick={() => { setActiveTab('projects'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'projects' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Package className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Meus Projetos</span>
                  </button>
                  <button onClick={() => { setActiveTab('docs'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'docs' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Arquivos</span>
                  </button>
                  <button onClick={() => { setActiveTab('memories'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'memories' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Brain className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Memórias & IA</span>
                  </button>
                  <button onClick={() => { setActiveTab('profile'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'profile' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <User className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Dados</span>
                  </button>
                  <button onClick={() => { setActiveTab('favs'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'favs' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Heart className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Inspirações</span>
                  </button>
               </div>
               
              <div className="hidden lg:block pt-4 mt-4 border-t border-gray-100">
                <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition text-sm">
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            </nav>
            <div className="lg:hidden mt-4 pt-4 px-2">
               <button onClick={logout} className="w-full flex items-center justify-center space-x-2 text-red-500 text-sm py-3 bg-white border border-red-100 rounded-lg shadow-sm">
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
               </button>
            </div>
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
                           <div className="w-full md:w-48 h-48 shrink-0">
                              <img src={p.image} className="w-full h-full object-cover rounded shadow-sm" />
                           </div>
                           <div className="flex-grow min-w-0">
                             <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                               <h3 className="text-xl font-bold font-serif truncate w-full">{p.title}</h3>
                               <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider whitespace-nowrap self-start md:self-auto">Em Andamento</span>
                             </div>
                             <p className="text-sm text-secondary mb-4 line-clamp-2">{p.description}</p>
                             
                             <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Atualizado há 2 dias</span>
                             </div>
                             
                             <ProjectTimeline />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">Nenhum projeto ativo vinculado à sua conta.</div>
                )}
              </div>
            )}

            {activeTab === 'docs' && (
               <div className="animate-fadeIn">
                 {!currentFolder ? (
                   <>
                     <h2 className="text-2xl font-serif mb-6">Arquivos e Contratos</h2>
                     <p className="text-gray-500 mb-6 text-sm md:text-base">Navegue pelas pastas para encontrar plantas, 3D e documentações.</p>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {currentUser.folders && currentUser.folders.length > 0 ? (
                           currentUser.folders.map(folder => (
                             <button 
                               key={folder.id} 
                               onClick={() => setCurrentFolderId(folder.id)}
                               className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition group border border-transparent hover:border-gray-200"
                             >
                               <div className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform">
                                 <Folder className="w-16 h-16 fill-current" />
                               </div>
                               <span className="font-bold text-sm text-center">{folder.name}</span>
                               <span className="text-xs text-gray-400 mt-1">{folder.files.length} arquivos</span>
                             </button>
                           ))
                        ) : (
                           <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                             Nenhuma pasta disponível.
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
                                     <div className={`p-3 rounded-lg shrink-0 ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : file.type === 'image' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-500'}`}>
                                       {file.type === 'image' ? <Image className="w-6 h-6" /> : file.type === 'video' ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                     </div>
                                     <div>
                                        <p className="font-bold text-sm">{file.name}</p>
                                        <p className="text-xs text-gray-400">{file.size} • {new Date(file.createdAt).toLocaleDateString()}</p>
                                     </div>
                                  </div>
                                  <a href={file.url} download={file.name} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-accent hover:text-black transition">
                                     <Download className="w-4 h-4" /> Baixar
                                  </a>
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
                   <p className="text-gray-500 text-sm">Estas são as informações que o Concierge Digital aprendeu sobre você para personalizar seu atendimento. Você tem total controle para editar ou apagar.</p>
                 </div>

                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-accent" /> Contexto Pessoal</h3>
                       <button onClick={() => setShowAddMemory(!showAddMemory)} className="text-xs flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full hover:bg-accent hover:text-black transition">
                          <Plus className="w-3 h-3" /> Adicionar
                       </button>
                    </div>

                    {showAddMemory && (
                       <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200 animate-slideDown">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                             <div>
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Tópico</label>
                                <input value={newMemory.topic} onChange={e => setNewMemory({...newMemory, topic: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Ex: Estilo, Cor, Horário" />
                             </div>
                             <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Detalhe</label>
                                <input value={newMemory.content} onChange={e => setNewMemory({...newMemory, content: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Ex: Gosto de tons pastéis." />
                             </div>
                          </div>
                          <div className="flex justify-end gap-2">
                             <button onClick={() => setShowAddMemory(false)} className="text-xs text-gray-500 hover:text-black">Cancelar</button>
                             <button onClick={handleAddMemory} className="text-xs bg-black text-white px-4 py-2 rounded-full font-bold">Salvar</button>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {clientMemories.length > 0 ? (
                         clientMemories.map(mem => (
                           <div key={mem.id} className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition relative group">
                              {/* Edit & Delete Actions */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                 {editingMemoryId === mem.id ? (
                                    <>
                                       <button onClick={() => saveEditedMemory(mem.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded"><Save className="w-3 h-3" /></button>
                                       <button onClick={() => setEditingMemoryId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X className="w-3 h-3" /></button>
                                    </>
                                 ) : (
                                    <>
                                       <button onClick={() => startEditingMemory(mem)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded"><Edit2 className="w-3 h-3" /></button>
                                       <button onClick={() => deleteClientMemory(mem.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                                    </>
                                 )}
                              </div>

                              <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">{mem.topic}</span>
                              
                              {editingMemoryId === mem.id ? (
                                 <input 
                                    autoFocus
                                    className="w-full border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-black"
                                    value={editMemoryContent}
                                    onChange={(e) => setEditMemoryContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEditedMemory(mem.id)}
                                 />
                              ) : (
                                 <p className="text-sm text-gray-700">{mem.content}</p>
                              )}
                              
                              <span className="text-[10px] text-gray-300 mt-2 block">{mem.type === 'system_detected' ? 'Aprendido pelo IA' : 'Adicionado por você'}</span>
                           </div>
                         ))
                       ) : (
                         <div className="col-span-full text-center py-8 text-gray-400 text-sm">Nenhuma memória salva ainda. Converse com o chatbot para gerar contexto.</div>
                       )}
                    </div>
                 </div>

                 {/* Chat History Section */}
                 <div>
                    <h3 className="font-bold flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5" /> Histórico de Conversas</h3>
                    <div className="space-y-3">
                       {currentUser.chats && currentUser.chats.length > 0 ? (
                          currentUser.chats.map(chat => (
                             <div key={chat.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-lg">
                                <div>
                                   <p className="font-bold text-sm">{chat.title}</p>
                                   <p className="text-xs text-gray-400">{new Date(chat.createdAt).toLocaleDateString()} • {chat.messages.length} mensagens</p>
                                </div>
                                <button className="text-xs text-accent hover:underline">Ver Conversa</button>
                             </div>
                          ))
                       ) : (
                          <p className="text-gray-400 text-sm">Nenhum histórico de conversa anterior.</p>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Informações Pessoais</h2>
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-sm underline text-accent">
                    {isEditingProfile ? 'Cancelar' : 'Editar Detalhes'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Nome Completo</label>
                    <input disabled={!isEditingProfile} type="text" defaultValue={currentUser.name} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Email</label>
                    <input disabled={!isEditingProfile} type="email" defaultValue={currentUser.email} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500">Bio / Notas</label>
                    <textarea disabled={!isEditingProfile} defaultValue={currentUser.bio} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50 h-32"></textarea>
                  </div>
                  {isEditingProfile && (
                    <div className="md:col-span-2">
                      <button className="w-full md:w-auto bg-black text-white px-6 py-3 rounded hover:bg-accent transition font-bold">Salvar Alterações</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'favs' && (
              <div className="animate-fadeIn">
                 <h2 className="text-2xl font-serif mb-6">Inspirações Salvas</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allProjects.slice(0, 2).map(p => (
                       <div key={p.id} className="group relative">
                          <img src={p.image} className="w-full h-48 object-cover rounded-lg" />
                          <div className="mt-2">
                            <h3 className="font-bold">{p.title}</h3>
                            <p className="text-xs text-gray-500">{p.category}</p>
                          </div>
                          <button className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 shadow-sm hover:scale-110 transition"><Heart className="w-4 h-4 fill-current" /></button>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
