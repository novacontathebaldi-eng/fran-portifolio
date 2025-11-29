
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MapPin, Phone, Instagram, Facebook, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { ChatMessage, Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use messages from Context to ensure persistence/sync across components
  const { sendMessageToAI, currentUser, projects, addAdminNote, showToast, currentChatMessages, createNewChat } = useProjects();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initial greeting if empty
  const displayMessages = currentChatMessages.length > 0 ? currentChatMessages : [{
    id: 'init',
    role: 'model',
    text: currentUser 
      ? `Olá ${currentUser.name.split(' ')[0]}. Sou o concierge digital. Como posso auxiliar hoje?`
      : "Olá. Sou o concierge digital da Fran Siller. Posso agendar uma reunião, mostrar projetos ou anotar um recado para a Fran."
  }];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userText);
      
      // Handle Actions returned by the API
      if (response.actions && response.actions.length > 0) {
        response.actions.forEach((action: any) => {
          
          if (action.type === 'saveNote') {
            addAdminNote(action.payload);
            // Optional: visual feedback handled by bot text already, but we could toast
            // showToast("Recado salvo com sucesso!", "success");
          } 
          
          else if (action.type === 'navigate') {
            setTimeout(() => {
              navigate(action.payload.path);
            }, 1000); // Small delay for user to read message
          }

        });
      }

    } catch (err) {
      // Error handling is mostly done in context, but we ensure loading stops
    } finally {
      setIsLoading(false);
    }
  };

  // --- GenUI Components ---
  
  const ProjectCarousel = ({ data }: { data: any }) => {
    const category = data?.category;
    const filtered = category 
      ? projects.filter(p => p.category.toLowerCase().includes(category.toLowerCase())).slice(0, 3)
      : projects.slice(0, 3);

    if (filtered.length === 0) return <div className="text-xs text-gray-500 mt-2">Nenhum projeto encontrado nesta categoria.</div>;

    return (
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {filtered.map(p => (
          <Link to={`/project/${p.id}`} key={p.id} className="min-w-[200px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden block hover:border-accent transition">
            <img src={p.image} className="w-full h-24 object-cover" />
            <div className="p-3">
              <h4 className="font-serif font-bold text-sm truncate">{p.title}</h4>
              <p className="text-xs text-gray-500">{p.category}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const SocialLinks = () => (
    <div className="mt-4 space-y-2">
      <a 
        href="https://wa.me/5527996670426?text=Olá,%20vim%20pelo%20site%20e%20gostaria%20de%20falar%20sobre%20um%20projeto." 
        target="_blank" 
        rel="noreferrer"
        className="flex items-center gap-3 bg-[#25D366] text-white p-3 rounded-lg hover:brightness-110 transition shadow-sm w-full"
      >
        <Phone className="w-5 h-5 fill-current" />
        <span className="font-bold text-sm">Chamar no WhatsApp</span>
      </a>
      <div className="flex gap-2">
        <a 
          href="https://instagram.com/othebaldi" 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white p-3 rounded-lg hover:opacity-90 transition shadow-sm"
        >
          <Instagram className="w-5 h-5" />
          <span className="text-xs font-bold">Instagram</span>
        </a>
        <a 
          href="https://fb.com/othebaldi" 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white p-3 rounded-lg hover:opacity-90 transition shadow-sm"
        >
          <Facebook className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold">Facebook</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[90] flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] text-white p-4 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-inner">
                   <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h3 className="font-serif font-bold text-sm tracking-wide">Concierge Fran Siller</h3>
                   <span className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online</span>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={createNewChat} className="p-1 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white" title="Nova Conversa">
                   <RefreshCw className="w-5 h-5" />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition"><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {displayMessages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none text-gray-700 shadow-sm'}`}>
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    
                    {/* GenUI Rendering */}
                    {msg.uiComponent?.type === 'ProjectCarousel' && <ProjectCarousel data={msg.uiComponent.data} />}
                    {msg.uiComponent?.type === 'SocialLinks' && <SocialLinks />}
                    {msg.uiComponent?.type === 'ContactCard' && <SocialLinks />} {/* Fallback to social links for contact */}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: Deixe um recado para Fran..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-base md:text-sm focus:outline-none focus:border-black focus:ring-0 transition-colors"
              />
              <button type="submit" disabled={isLoading} className="bg-black text-white p-3 rounded-full hover:bg-accent hover:text-black transition disabled:opacity-50 flex-shrink-0 shadow-lg">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-[80] hover:bg-accent hover:text-black transition-all group"
          >
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};