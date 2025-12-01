import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MapPin, Phone, Instagram, Facebook, RefreshCw, CheckCircle, ExternalLink, Copy, ThumbsUp, ThumbsDown, Check, Calendar, ChevronLeft, ChevronRight, Clock, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { ChatMessage, Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';

// --- Helper for Markdown ---
const renderFormattedText = (text: string) => {
  if (!text) return null;
  // Splits by **text** keeping the content in the capturing group
  const parts = text.split(/\*\*(.*?)\*\*/g);
  
  return parts.map((part, index) => {
    // Odd indices are the captured bold text
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold">{part}</strong>;
    }
    return part;
  });
};

// --- GenUI Components (Extracted to prevent re-mounting) ---

const ProjectCarousel = ({ data }: { data: any }) => {
  const { projects } = useProjects();
  const category = data?.category;
  const filtered = category 
    ? projects.filter(p => p.category.toLowerCase().includes(category.toLowerCase())).slice(0, 3)
    : projects.slice(0, 3);

  if (filtered.length === 0) return <div className="text-xs text-gray-500 mt-2">Nenhum projeto encontrado.</div>;

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
      href="https://wa.me/5527996670426?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais." 
      target="_blank" 
      rel="noreferrer"
      className="flex items-center justify-between bg-[#25D366] text-white p-3 rounded-lg hover:brightness-105 transition shadow-sm w-full"
    >
      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 fill-current" />
        <div className="text-left">
          <span className="font-bold text-sm block">WhatsApp Direto</span>
          <span className="text-[10px] opacity-90 block">Resposta rápida</span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 opacity-50" />
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
    </div>
  </div>
);

// New Success Component
const BookingSuccess = ({ data, closeChat }: { data: any, closeChat: () => void }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-5 animate-slideUp relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
        <div className="flex items-start gap-3 mb-3">
            <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5">
                <CheckCircle className="w-4 h-4" />
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-sm">Solicitação Enviada</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(data.date).toLocaleDateString()} às {data.time}
                </p>
                {data.location && (
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                     <MapPin className="w-3 h-3"/> {data.location}
                  </p>
                )}
            </div>
        </div>
        
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
            <strong>Atenção:</strong> Seu horário está pré-reservado, mas aguarda confirmação da nossa equipe. Você receberá uma notificação assim que aprovarmos.
        </p>

        <button 
          onClick={() => { closeChat(); navigate('/profile'); }}
          className="w-full bg-white border border-gray-200 text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
            Acompanhar em Agendamentos <ArrowRight className="w-3 h-3" />
        </button>
    </div>
  );
};

const CalendarWidget = ({ data, closeChat, messageId }: { data: any, closeChat: () => void, messageId: string }) => {
  const { currentUser, checkAvailability, addAppointment, siteContent, showToast, addMessageToChat, updateMessageUI } = useProjects();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Check
  if (!currentUser) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center space-y-3 animate-fadeIn">
         <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-500">
            <User className="w-5 h-5" />
         </div>
         <div>
           <h4 className="font-bold text-sm">Identificação Necessária</h4>
           <p className="text-xs text-gray-500 mt-1">Para confirmar o agendamento, precisamos que você acesse sua conta.</p>
         </div>
         <button 
           onClick={() => navigate('/auth')}
           className="w-full bg-black text-white py-2.5 rounded-lg text-xs font-bold hover:bg-accent hover:text-black transition flex items-center justify-center gap-2"
         >
           <LogIn className="w-3 h-3" /> Entrar para Agendar
         </button>
      </div>
    );
  }

  // FIXED: Logic for Location Display
  // meeting + Presencial (Implied by lack of explicit "online" flag usually, so we default to Office Address)
  // meeting + Online (If user asks, bot explains, but address card shows office address as HQ)
  // visit -> Construction site address
  const isVisit = data?.type === 'visit';
  const locationText = isVisit 
      ? (data?.address || "Endereço da Obra") 
      : siteContent.office.address; // Use Office Address for meetings

  const dates = useMemo(() => {
      const arr = [];
      const start = new Date(viewDate);
      if (start < new Date()) start.setDate(new Date().getDate() + 1);
      
      for (let i = 0; i < 5; i++) { 
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          arr.push(d);
      }
      return arr;
  }, [viewDate]);

  const handleDateClick = (dateStr: string) => {
      if (isSubmitting) return;
      setSelectedDate(dateStr);
      setAvailableSlots(checkAvailability(dateStr));
  };

  const confirmBooking = async (time: string) => {
      if (!selectedDate || isSubmitting) return;
      setIsSubmitting(true);
      
      await new Promise(r => setTimeout(r, 600));

      addAppointment({
          clientId: currentUser.id,
          clientName: currentUser.name,
          date: selectedDate,
          time: time,
          type: data?.type || 'meeting',
          location: locationText,
      });
      
      showToast('Solicitação enviada com sucesso!', 'success');
      
      // Update UI PERMANENTLY in Context
      updateMessageUI(messageId, {
          type: 'BookingSuccess',
          data: {
              date: selectedDate,
              time,
              location: locationText
          }
      });

      // Add success message text bubble
      if (addMessageToChat) {
        addMessageToChat({
            id: Date.now().toString(),
            role: 'model',
            text: `Agendamento pré-confirmado para ${new Date(selectedDate).toLocaleDateString()} às ${time}. Você pode acompanhar o status no seu painel.`
        });
      }
      
      setIsSubmitting(false);
  };

  return (
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative">
          {isSubmitting && <div className="absolute inset-0 bg-white/50 z-10 cursor-wait"></div>}
          
          <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    {isVisit ? 'Visita Técnica' : 'Reunião'}
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-[200px]" title={locationText}>
                    {locationText}
                </span>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate()-5); setViewDate(d); }} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
                 <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate()+5); setViewDate(d); }} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight className="w-4 h-4" /></button>
              </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
              {dates.map((d) => {
                 const dStr = d.toISOString().split('T')[0];
                 const isSelected = selectedDate === dStr;
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

          {selectedDate ? (
              <div className="animate-fadeIn min-h-[100px]">
                  <p className="text-xs text-gray-400 mb-3 font-medium">Horários disponíveis:</p>
                  {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                         {availableSlots.map(slot => (
                             <button 
                               key={slot} 
                               onClick={() => confirmBooking(slot)}
                               className="py-2 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:border-black hover:bg-black hover:text-white transition flex items-center justify-center gap-1 active:scale-95"
                             >
                                 {slot}
                             </button>
                         ))}
                      </div>
                  ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                         <p className="text-xs text-gray-400">Sem horários livres.</p>
                      </div>
                  )}
              </div>
          ) : (
             <div className="min-h-[100px] flex items-center justify-center text-gray-300 text-xs italic">
                Selecione um dia acima
             </div>
          )}
      </div>
  );
};

// --- Chatbot Component ---

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  hideButton?: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen: externalIsOpen, onToggle, hideButton = false }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlled = externalIsOpen !== undefined && onToggle !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? onToggle : setInternalIsOpen;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { sendMessageToAI, currentUser, projects, addAdminNote, showToast, currentChatMessages, createNewChat, logAiFeedback, settings } = useProjects();
  
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initial greeting
  const defaultMessages = useMemo<ChatMessage[]>(() => {
    const rawGreeting = settings.aiConfig.defaultGreeting || "Olá. Como posso ajudar?";
    let processedGreeting = rawGreeting;
    if (currentUser) {
        processedGreeting = rawGreeting.replace('{name}', currentUser.name.split(' ')[0]);
    } else {
        processedGreeting = rawGreeting.replace(' {name}', '').replace('{name}', '');
    }

    return [{
        id: 'init',
        role: 'model',
        text: processedGreeting
    }];
  }, [currentUser, settings.aiConfig.defaultGreeting]);

  const displayMessages = currentChatMessages.length > 0 ? currentChatMessages : defaultMessages;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [displayMessages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userText);
      
      if (response.actions && response.actions.length > 0) {
        response.actions.forEach((action: any) => {
          if (action.type === 'saveNote') {
            addAdminNote(action.payload);
            showToast("Recado enviado para a equipe.", "success");
          } else if (action.type === 'navigate') {
            setTimeout(() => {
              navigate(action.payload.path);
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

  const handleFeedback = (msg: ChatMessage, type: 'like' | 'dislike') => {
    if (msg.feedback === type) return; 
    const msgIndex = currentChatMessages.findIndex(m => m.id === msg.id);
    const userMessage = msgIndex > 0 ? currentChatMessages[msgIndex - 1].text : "Contexto desconhecido";

    logAiFeedback({
      userMessage: userMessage || "N/A",
      aiResponse: msg.text || "N/A",
      type: type
    });

    if (type === 'like') showToast("Obrigado pelo feedback positivo!", "success");
    else showToast("Obrigado. Vamos melhorar.", "info");
  };

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
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6 scroll-smooth">
              {displayMessages.map((msg: any, idx: number) => (
                <div 
                  key={msg.id} 
                  ref={idx === displayMessages.length - 1 ? lastMessageRef : null}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-black text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none text-gray-700'
                  }`}>
                    {/* Render with Markdown support */}
                    {msg.text && (
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(msg.text)}
                      </p>
                    )}
                    
                    {/* GenUI Rendering */}
                    {msg.uiComponent?.type === 'ProjectCarousel' && <ProjectCarousel data={msg.uiComponent.data} />}
                    {msg.uiComponent?.type === 'SocialLinks' && <SocialLinks />}
                    {/* Pass messageId to CalendarWidget for UI updates */}
                    {msg.uiComponent?.type === 'CalendarWidget' && <CalendarWidget data={msg.uiComponent.data} closeChat={() => setIsOpen(false)} messageId={msg.id} />}
                    {/* Render new Success Component */}
                    {msg.uiComponent?.type === 'BookingSuccess' && <BookingSuccess data={msg.uiComponent.data} closeChat={() => setIsOpen(false)} />}
                  </div>
                  
                  {/* Bot Action Bar */}
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-2 mt-1 ml-2 opacity-100 transition-opacity">
                      <button onClick={() => handleCopy(msg.text || '', msg.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition">{copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}</button>
                      <div className="h-3 w-[1px] bg-gray-200"></div>
                      <button onClick={() => handleFeedback(msg, 'like')} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black"><ThumbsUp className="w-3 h-3" /></button>
                      <button onClick={() => handleFeedback(msg, 'dislike')} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black"><ThumbsDown className="w-3 h-3" /></button>
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
        {!isOpen && !hideButton && (
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