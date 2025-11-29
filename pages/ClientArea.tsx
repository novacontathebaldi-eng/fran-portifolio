
import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { User, Settings, Package, Heart, LogOut, FileText, Download, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Project } from '../types';

export const ClientArea: React.FC = () => {
  const { currentUser, logout, projects: allProjects } = useProjects();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'docs' | 'settings' | 'favs'>('projects');
  const [isEditing, setIsEditing] = useState(false);

  if (!currentUser) return null;

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
                  <button onClick={() => { setActiveTab('profile'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'profile' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <User className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Dados</span>
                  </button>
                  <button onClick={() => { setActiveTab('favs'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'favs' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Heart className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Inspirações</span>
                  </button>
                  <button onClick={() => { setActiveTab('settings'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`flex-shrink-0 snap-start flex items-center space-x-3 px-4 py-2 lg:py-3 rounded-full lg:rounded-lg transition text-sm ${activeTab === 'settings' ? 'bg-black text-white lg:bg-gray-100 lg:text-black font-bold' : 'text-gray-500 hover:bg-gray-50 bg-gray-100 lg:bg-transparent'}`}>
                    <Settings className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <span className="whitespace-nowrap">Config</span>
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
                 <h2 className="text-2xl font-serif mb-6">Arquivos e Contratos</h2>
                 <p className="text-gray-500 mb-6 text-sm md:text-base">Acesse plantas, contratos e memorias descritivos do seu projeto.</p>
                 
                 <div className="grid grid-cols-1 gap-4">
                    {currentUser.documents?.map((doc, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 hover:border-accent rounded-lg transition group bg-white hover:shadow-sm">
                          <div className="flex items-center gap-4 min-w-0">
                             <div className={`p-3 rounded-lg shrink-0 ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                <FileText className="w-6 h-6" />
                             </div>
                             <div className="min-w-0">
                               <p className="font-bold text-sm text-gray-800 group-hover:text-accent transition truncate pr-4">{doc.name}</p>
                               <p className="text-xs text-gray-400">{doc.date}</p>
                             </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition shrink-0">
                             <Download className="w-5 h-5" />
                          </button>
                       </div>
                    ))}
                    {(!currentUser.documents || currentUser.documents.length === 0) && (
                       <p className="text-gray-400 text-center py-8">Nenhum documento disponível.</p>
                    )}
                 </div>
               </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Informações Pessoais</h2>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-sm underline text-accent">
                    {isEditing ? 'Cancelar' : 'Editar Detalhes'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Nome Completo</label>
                    <input disabled={!isEditing} type="text" defaultValue={currentUser.name} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Email</label>
                    <input disabled={!isEditing} type="email" defaultValue={currentUser.email} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500">Bio / Notas</label>
                    <textarea disabled={!isEditing} defaultValue={currentUser.bio} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50 h-32"></textarea>
                  </div>
                  {isEditing && (
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
