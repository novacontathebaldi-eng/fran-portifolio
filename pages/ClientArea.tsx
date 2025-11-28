
import React, { useState } from 'react';
import { MOCK_USER_CLIENT as MOCK_USER, MOCK_PROJECTS } from '../data';
import { User, Settings, Package, Heart, LogOut } from 'lucide-react';

export const ClientArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'settings' | 'favs'>('projects');
  
  // Mock editing state
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-serif mb-8">Minha Conta</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6 h-fit">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-xl font-serif font-bold text-white shrink-0">
                {MOCK_USER.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold truncate">{MOCK_USER.name}</h3>
                <p className="text-xs text-secondary truncate">{MOCK_USER.email}</p>
              </div>
            </div>
            
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 no-scrollbar">
              <button 
                onClick={() => setActiveTab('projects')}
                className={`flex-shrink-0 lg:w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'projects' ? 'bg-gray-100 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Package className="w-5 h-5" />
                <span className="whitespace-nowrap">Meus Projetos</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-shrink-0 lg:w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'profile' ? 'bg-gray-100 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <User className="w-5 h-5" />
                <span className="whitespace-nowrap">Dados Pessoais</span>
              </button>
              <button 
                onClick={() => setActiveTab('favs')}
                className={`flex-shrink-0 lg:w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'favs' ? 'bg-gray-100 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Heart className="w-5 h-5" />
                <span className="whitespace-nowrap">Inspirações</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-shrink-0 lg:w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-gray-100 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Settings className="w-5 h-5" />
                <span className="whitespace-nowrap">Configurações</span>
              </button>
              <div className="hidden lg:block pt-4 mt-4 border-t border-gray-100">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition">
                  <LogOut className="w-5 h-5" />
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
                {MOCK_USER.projects && MOCK_USER.projects.length > 0 ? (
                  <div className="space-y-6">
                    {MOCK_USER.projects.map(p => (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row gap-6">
                        <img src={p.image} className="w-full md:w-32 h-48 md:h-32 object-cover rounded" />
                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                            <h3 className="text-xl font-bold">{p.title}</h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Em Andamento</span>
                          </div>
                          <p className="text-sm text-secondary mb-4">Fase: Estudo Preliminar - 40% Concluído</p>
                          <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                            <div className="bg-accent h-2 rounded-full w-[40%]"></div>
                          </div>
                          <button className="text-sm font-bold text-black border-b border-black pb-0.5">Ver Cronograma e Arquivos</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">Nenhum projeto ativo.</div>
                )}
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
                    <input disabled={!isEditing} type="text" defaultValue={MOCK_USER.name} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Email</label>
                    <input disabled={!isEditing} type="email" defaultValue={MOCK_USER.email} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500">Bio / Notas</label>
                    <textarea disabled={!isEditing} defaultValue={MOCK_USER.bio} className="w-full border border-gray-200 p-3 rounded disabled:bg-gray-50 h-32"></textarea>
                  </div>
                  {isEditing && (
                    <div className="md:col-span-2">
                      <button className="bg-black text-white px-6 py-2 rounded hover:bg-accent transition">Salvar Alterações</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-fadeIn">
                 <h2 className="text-2xl font-serif mb-6">Configurações da Conta</h2>
                 <div className="space-y-8 max-w-lg">
                   <div>
                     <h3 className="font-bold mb-4">Segurança</h3>
                     <button className="block w-full text-left border p-4 rounded mb-4 hover:bg-gray-50">Alterar Senha</button>
                     <button className="block w-full text-left border p-4 rounded hover:bg-gray-50">Alterar Email de Recuperação</button>
                   </div>
                   <div>
                     <h3 className="font-bold mb-4">Preferências</h3>
                     <div className="flex items-center justify-between p-4 border rounded">
                       <span>Notificações por Email</span>
                       <div className="w-10 h-6 bg-green-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div></div>
                     </div>
                   </div>
                 </div>
              </div>
            )}
            
            {activeTab === 'favs' && (
              <div className="animate-fadeIn">
                 <h2 className="text-2xl font-serif mb-6">Inspirações Salvas</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_PROJECTS.slice(0, 2).map(p => (
                       <div key={p.id} className="group relative">
                          <img src={p.image} className="w-full h-48 object-cover rounded-lg" />
                          <h3 className="mt-2 font-bold">{p.title}</h3>
                          <button className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500"><Heart className="w-4 h-4 fill-current" /></button>
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
