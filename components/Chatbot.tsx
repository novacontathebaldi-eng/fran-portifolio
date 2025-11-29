
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { ChatMessage, Project } from '../types';
import { Link } from 'react-router-dom';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessageToAI, currentUser, projects } = useProjects();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Greeting
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: currentUser 
          ? `Olá ${currentUser.name.split(' ')[0]}. Como posso ajudar com seu projeto hoje?`
          : "Olá. Sou a assistente virtual da Fran Siller. Posso ajudar você a encontrar o projeto ideal ou tirar dúvidas."
      }]);
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(input);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        uiComponent: response.uiComponent
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Desculpe, tive um erro de conexão." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GenUI Components ---
  
  const ProjectCarousel = ({ data }: { data: any }) => {
    // Filter projects based on AI criteria (mock logic)
    const category = data?.category;
    const filtered = category 
      ? projects.filter(p => p.category.toLowerCase().includes(category.toLowerCase())).slice(0, 3)
      : projects.slice(0, 3);

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

  const ContactCard = () => (
    <div className="mt-4 bg-black text-white p-4 rounded-lg">
      <h4 className="font-serif text-lg mb-2">Fale Conosco</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /> (11) 99999-9999</div>
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Av. Paulista, SP</div>
      </div>
      <Link to="/contact" className="block text-center mt-4 bg-white text-black py-2 rounded text-xs font-bold uppercase">Agendar Reunião</Link>
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
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[90] flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] text-white p-4 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                   <Sparkles className="w-4 h-4 text-white" />
                 </div>
                 <div>
                   <h3 className="font-serif font-bold text-sm">Assistente Fran Siller</h3>
                   <span className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online (Gemini 2.5)</span>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition"><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none text-gray-700 shadow-sm'}`}>
                    {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    
                    {/* GenUI Rendering */}
                    {msg.uiComponent?.type === 'ProjectCarousel' && <ProjectCarousel data={msg.uiComponent.data} />}
                    {msg.uiComponent?.type === 'ContactCard' && <ContactCard />}
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
                placeholder="Pergunte sobre projetos..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black focus:ring-0"
              />
              <button type="submit" disabled={isLoading} className="bg-black text-white p-2 rounded-full hover:bg-accent transition disabled:opacity-50 flex-shrink-0">
                <Send className="w-5 h-5" />
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
            className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center z-[80] hover:bg-accent transition-colors group"
          >
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
