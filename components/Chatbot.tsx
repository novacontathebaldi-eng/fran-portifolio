
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MapPin, Phone, Instagram, Facebook, RefreshCw, CheckCircle, ExternalLink, Copy, ThumbsUp, ThumbsDown, Check, Calendar, ChevronLeft, ChevronRight, Clock, Map, Video, ArrowRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { ChatMessage, Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  hideButton?: boolean;
}

const OFFICE_ADDRESS = "Rua José de Anchieta Fontana, 177, Centro, Santa Leopoldina - ES";

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen: externalIsOpen, onToggle, hideButton = false }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlled = externalIsOpen !== undefined && onToggle !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? onToggle : setInternalIsOpen;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { sendMessageToAI, currentUser, projects, addAdminNote, showToast, currentChatMessages, createNewChat, logAiFeedback, settings, checkAvailability, addAppointment } = useProjects();
  
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

  // --- GenUI Components ---
  
  const ProjectCarousel = ({ data }: { data: any }) => {
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
        href="https://wa.me/5527996670426" 
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

  const CalendarWidget = ({ data }: { data: any }) => {
    const [step, setStep] = useState<'login_check' | 'location' | 'calendar' | 'success'>('login_check');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewDate, setViewDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    
    // Booking Details
    const [meetingMode, setMeetingMode] = useState<'online' | 'office'>('online');
    const [visitAddress, setVisitAddress] = useState(data?.address || '');
    
    // Check login on mount
    useEffect(() => {
        if (!currentUser) {
            setStep('login_check');
        } else {
            // Determine start step
            if (data?.type === 'visit' && !data?.address) {
                setStep('location');
            } else if (data?.type === 'meeting') {
                setStep('location');
            } else {
                setStep('calendar');
            }
        }
    }, [currentUser, data]);

    // Helper to generate next 5 days
    const dates = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(viewDate);
            d.setDate(viewDate.getDate() + i);
            arr.push(d);
        }
        return arr;
    }, [viewDate]);

    const handleDateClick = (dateStr: string) => {
        setSelectedDate(dateStr);
        setAvailableSlots(checkAvailability(dateStr));
    };

    const confirmBooking = (time: string) => {
        if (!selectedDate || !currentUser) return;
        
        let finalLocation = 'Online (Link será enviado)';
        if (data?.type === 'meeting' && meetingMode === 'office') {
            finalLocation = OFFICE_ADDRESS;
        } else if (data?.type === 'visit') {
            finalLocation = visitAddress || 'Endereço a definir';
        }

        addAppointment({
            clientId: currentUser.id,
            clientName: currentUser.name,
            date: selectedDate,
            time: time,
            type: data?.type || 'meeting',
            location: finalLocation,
        });
        
        setStep('success');
        showToast("Agendamento confirmado!", "success");
    };

    const renderHeader = (title: string, backAction?: () => void) => (
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
            {backAction && (
                <button onClick={backAction} className="text-gray-400 hover:text-black">
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}
        </div>
    );

    if (step === 'login_check') {
        return (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-5 h-5 text-gray-600" />
                </div>
                <h4 className="font-bold text-sm mb-1">Identificação Necessária</h4>
                <p className="text-xs text-gray-500 mb-4">Para confirmar seu agendamento, precisamos que você acesse sua conta.</p>
                <button onClick={() => navigate('/auth')} className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-accent hover:text-black transition">
                    Fazer Login / Cadastro
                </button>
                <p className="text-[10px] text-gray-400 mt-2">Volte aqui após o login.</p>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 animate-fadeIn">
                <div className="flex items-center gap-3 mb-2">
                   <CheckCircle className="w-5 h-5" />
                   <p className="font-bold text-sm">Solicitação Enviada</p>
                </div>
                <p className="text-xs mb-3">Sua solicitação está em análise. Você receberá uma notificação assim que confirmada.</p>
                <button onClick={() => navigate('/profile')} className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition">
                    Acompanhar no Painel
                </button>
            </div>
        );
    }

    if (step === 'location') {
        return (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-fadeIn">
                {renderHeader("Detalhes do Local")}
                
                {data?.type === 'meeting' ? (
                    <div className="space-y-3">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${meetingMode === 'online' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                            <input type="radio" name="mode" className="hidden" checked={meetingMode === 'online'} onChange={() => setMeetingMode('online')} />
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Video className="w-4 h-4" /></div>
                            <div className="flex-grow">
                                <span className="block font-bold text-sm">Online (Google Meet)</span>
                                <span className="text-xs text-gray-500">Link enviado após confirmação</span>
                            </div>
                            {meetingMode === 'online' && <Check className="w-4 h-4 text-black" />}
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${meetingMode === 'office' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                            <input type="radio" name="mode" className="hidden" checked={meetingMode === 'office'} onChange={() => setMeetingMode('office')} />
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><MapPin className="w-4 h-4" /></div>
                            <div className="flex-grow">
                                <span className="block font-bold text-sm">Presencial (Escritório)</span>
                                <span className="text-xs text-gray-500">Santa Leopoldina - ES</span>
                            </div>
                            {meetingMode === 'office' && <Check className="w-4 h-4 text-black" />}
                        </label>
                        <button onClick={() => setStep('calendar')} className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold mt-2">Continuar</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500">Por favor, informe o endereço da obra/imóvel para a visita técnica.</p>
                        <input 
                            type="text" 
                            value={visitAddress} 
                            onChange={(e) => setVisitAddress(e.target.value)}
                            placeholder="Ex: Av. Beira Mar, 100..."
                            className="w-full border p-2 rounded text-sm focus:outline-none focus:border-black"
                        />
                        <button 
                            disabled={!visitAddress.trim()}
                            onClick={() => setStep('calendar')} 
                            className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold mt-2 disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Step: Calendar
    return (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-3 shadow-sm animate-fadeIn">
            {renderHeader("Selecione Data & Hora", () => setStep('location'))}

            <div className="flex justify-between items-center mb-3 px-1">
                 <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate()-5); setViewDate(d); }} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                 <span className="text-xs font-bold">{viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                 <button onClick={() => { const d = new Date(viewDate); d.setDate(d.getDate()+5); setViewDate(d); }} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
                {dates.map((d) => {
                   const dStr = d.toISOString().split('T')[0];
                   const isSelected = selectedDate === dStr;
                   const today = new Date().toISOString().split('T')[0];
                   const isPast = dStr < today;
                   
                   return (
                       <button 
                         key={dStr} 
                         disabled={isPast}
                         onClick={() => !isPast && handleDateClick(dStr)}
                         className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg border transition ${isSelected ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'} ${isPast ? 'opacity-30 cursor-not-allowed' : ''}`}
                       >
                           <span className="text-[10px] uppercase font-bold">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                           <span className="text-sm font-bold">{d.getDate()}</span>
                       </button>
                   );
                })}
            </div>

            {selectedDate && (
                <div className="animate-fadeIn">
                    <p className="text-xs text-gray-400 mb-2">Horários para {new Date(selectedDate).toLocaleDateString()}:</p>
                    {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                           {availableSlots.map(slot => (
                               <button 
                                 key={slot} 
                                 onClick={() => confirmBooking(slot)}
                                 className="py-1 px-2 bg-white border border-gray-200 rounded text-xs hover:border-accent hover:text-accent transition flex items-center justify-center gap-1"
                               >
                                   <Clock className="w-3 h-3" /> {slot}
                               </button>
                           ))}
                        </div>
                    ) : (
                        <p className="text-xs text-red-400 bg-red-50 p-2 rounded text-center">Indisponível.</p>
                    )}
                </div>
            )}
            {!selectedDate && <p className="text-center text-xs text-gray-400 py-4">Selecione um dia.</p>}
        </div>
    );
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
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth">
              {displayMessages.map((msg: any, idx: number) => (
                <div 
                  key={msg.id} 
                  ref={idx === displayMessages.length - 1 ? lastMessageRef : null}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-black text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none text-gray-700'
                  }`}>
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    
                    {/* GenUI Rendering */}
                    {msg.uiComponent?.type === 'ProjectCarousel' && <ProjectCarousel data={msg.uiComponent.data} />}
                    {msg.uiComponent?.type === 'SocialLinks' && <SocialLinks />}
                    {msg.uiComponent?.type === 'CalendarWidget' && <CalendarWidget data={msg.uiComponent.data} />}
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
