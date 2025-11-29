
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MapPin, Phone, Instagram, Facebook, RefreshCw, CheckCircle, ExternalLink, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { ChatMessage, Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state for copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Use messages from Context to ensure persistence/sync across components
  const { sendMessageToAI, currentUser, projects, addAdminNote, showToast, currentChatMessages, createNewChat, logAiFeedback } = useProjects();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initial greeting if empty
  const displayMessages = currentChatMessages.length > 0 ? currentChatMessages : [{
    id: 'init',
    role: 'model',
    text: currentUser 
      ? `Olá ${currentUser.name.split(' ')[0]}. Sou o Concierge Digital Fran Siller. Como posso tornar seu dia melhor?`
      : "Olá. Bem-vindo à Fran Siller Arquitetura. Sou seu Concierge Digital. Deseja conhecer nosso portfólio ou falar sobre um projeto?"
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
            showToast("Recado enviado para a equipe.", "success");
          } 
          
          else if (action.type === 'navigate') {
            // Small delay for user to read message before redirect
            setTimeout(() => {
              navigate(action.payload.path);
              // Optional: close chat on navigate depending on UX preference, keep open for now
            }, 1500); 
          }

        });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Action Handlers ---
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msg: ChatMessage, type: 'like' | 'dislike', userMsgText?: string) => {
    if (msg.feedback === type) return; // Prevent double click

    // Find the user message that triggered this response (simple assumption: previous message)
    // In a robust system, we would link IDs properly.
    const msgIndex = currentChatMessages.findIndex(m => m.id === msg.id);
    const userMessage = msgIndex > 0 ? currentChatMessages[msgIndex - 1].text : "Contexto desconhecido";

    logAiFeedback({
      userMessage: userMessage || "N/A",
      aiResponse: msg.text || "N/A",
      type: type
    });

    // We manually update the local UI state for immediate feedback
    // Ideally logAiFeedback updates the context which triggers re-render, 
    // but context update logic might need to be explicit about updating the message array item.
    // For now, visual feedback relies on the button click effect or we assume context updates propagate.
    // To ensure immediate visual update without complex context reducers for this specific field:
    // We can rely on the fact that logAiFeedback in context doesn't deeply update the message array yet in the provided code.
    // So we just show Toast for now or rely on a simple local state approach if we were strictly local.
    // However, the best UX is updating the context. 
    // Let's assume logAiFeedback handles backend, we show a toast or rely on button active state if persisted.
    
    if (type === 'like') showToast("Obrigado pelo feedback positivo!", "success");
    else showToast("Obrigado. Vamos melhorar.", "info");
  };

  // --- GenUI Components ---
  
  const ProjectCarousel = ({ data }: { data: any }) => {
    const category = data?.category;
    const filtered = category 
      ? projects.filter(p => p.category.toLowerCase().includes(category.toLowerCase())).slice(0, 3)
      : projects.slice(0, 3);

    if (filtered.length === 0) return <div className="text-xs text-gray-500 mt-2">Nenhum projeto encontrado nesta categoria.</div>;

    return (
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 no-scrollbar pl-1">
        {filtered.map(p => (
          <Link to={`/project/${p.id}`} key={p.id} className="min-w-[200px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden block hover:border-accent transition group">
            <div className="relative">
              <img src={p.image} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
            </div>
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
    <div className="mt-4 space-y-3">
      <a 
        href="https://wa.me/5527996670426?text=Ol%C3%A1%2C%20visitei%20o%20site%20da%20Fran%20Siller%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es." 
        target="_blank" 
        rel="noreferrer"
        className="flex items-center justify-between bg-[#25D366] text-white p-3 rounded-lg hover:brightness-105 transition shadow-sm w-full group"
      >
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 fill-current" />
          <div className="text-left">
            <span className="font-bold text-sm block">WhatsApp Direto</span>
            <span className="text-[10px] opacity-90 block">Resposta rápida</span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
      </a>
      
      <div className="flex gap-2">
        <a 
          href="https://instagram.com/othebaldi" 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white p-3 rounded-lg hover:opacity-90 transition shadow-sm"
        >
          <Instagram className="w-5 h-5" />
          <span className="text-xs font-bold">@othebaldi</span>
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
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[90] flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111] text-white p-4 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-inner relative">
                   <Sparkles className="w-5 h-5 text-white" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full"></span>
                 </div>
                 <div>
                   <h3 className="font-serif font-bold text-sm tracking-wide">Concierge Fran Siller</h3>
                   <span className="text-[10px] text-gray-400 block">Sempre disponível para você.</span>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={createNewChat} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white" title="Reiniciar Conversa">
                   <RefreshCw className="w-4 h-4" />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-4 h-4 text-gray-400 hover:text-white" /></button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth">
              {displayMessages.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-black text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none text-gray-700'
                  }`}>
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    
                    {/* GenUI Rendering */}
                    {msg.uiComponent?.type === 'ProjectCarousel' && <ProjectCarousel data={msg.uiComponent.data} />}
                    {msg.uiComponent?.type === 'SocialLinks' && <SocialLinks />}
                  </div>
                  
                  {/* Bot Action Bar */}
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-2 mt-1 ml-2 opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCopy(msg.text || '', msg.id)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition"
                        title="Copiar"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <div className="h-3 w-[1px] bg-gray-200"></div>
                      <button 
                        onClick={() => handleFeedback(msg, 'like')}
                        className={`p-1 hover:bg-gray-200 rounded transition ${msg.feedback === 'like' ? 'text-green-500' : 'text-gray-400 hover:text-black'}`}
                        title="Gostei"
                      >
                         <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg, 'dislike')}
                        className={`p-1 hover:bg-gray-200 rounded transition ${msg.feedback === 'dislike' ? 'text-red-500' : 'text-gray-400 hover:text-black'}`}
                        title="Não gostei"
                      >
                         <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
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
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-base md:text-sm focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder-gray-400"
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
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
