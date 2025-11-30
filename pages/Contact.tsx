

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Linkedin, Send } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion } from 'framer-motion';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const { showToast, siteContent } = useProjects();
  const { office } = siteContent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Mensagem enviada com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen pt-44 pb-24">
      <div className="container mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif mb-12 text-center md:text-left"
        >
          Fale Conosco
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-1/3 space-y-10"
          >
            <div>
              <p className="text-base md:text-lg text-secondary leading-relaxed mb-8">
                Estamos prontos para transformar sua visão em realidade. Entre em contato para agendar uma reunião inicial ou solicitar um orçamento.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-full">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Email</h3>
                  <p className="text-secondary break-all">{office.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-full">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Telefone / WhatsApp</h3>
                  <p className="text-secondary">{office.phone}</p>
                  <p className="text-secondary text-sm text-gray-400">{office.hoursDescription}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-full">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Ateliê</h3>
                  <p className="text-secondary">{office.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
               <h3 className="font-bold text-sm uppercase tracking-wide mb-4">Siga-nos</h3>
               <div className="flex space-x-4">
                 <button className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition active:scale-95"><Instagram className="w-5 h-5" /></button>
                 <button className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition active:scale-95"><Linkedin className="w-5 h-5" /></button>
               </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-2/3 bg-gray-50 p-6 md:p-12 rounded-2xl"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nome</label>
                    <input type="text" className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded focus:outline-none focus:border-black transition" placeholder="Seu nome completo" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Telefone</label>
                    <input type="tel" className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded focus:outline-none focus:border-black transition" placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email</label>
                  <input type="email" className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded focus:outline-none focus:border-black transition" placeholder="seu@email.com" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Assunto</label>
                  <select className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded focus:outline-none focus:border-black transition">
                    <option>Orçamento de Projeto</option>
                    <option>Dúvidas Gerais</option>
                    <option>Imprensa / Mídia</option>
                    <option>Parcerias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Mensagem</label>
                  <textarea className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded h-40 focus:outline-none focus:border-black transition" placeholder="Conte-nos um pouco sobre seu projeto..." required></textarea>
                </div>

                <button type="submit" className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition flex items-center justify-center space-x-2 active:scale-95 duration-200 shadow-lg">
                  <span>Enviar Mensagem</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-serif mb-4">Mensagem Enviada!</h2>
                <p className="text-secondary max-w-md">Obrigado pelo contato. Nossa equipe retornará seu email em até 24 horas úteis.</p>
                <button onClick={() => setSubmitted(false)} className="mt-8 text-sm font-bold underline">Enviar outra mensagem</button>
              </div>
            )}
          </motion.div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-24 pt-24 border-t border-gray-100">
           <h2 className="text-3xl font-serif mb-12 text-center">Perguntas Frequentes</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
              <div>
                <h4 className="font-bold text-lg mb-2">Vocês realizam projetos fora de São Paulo?</h4>
                <p className="text-secondary text-sm">Sim. Atuamos em todo o Brasil e realizamos consultorias online para o exterior. Para acompanhamento de obra presencial, é necessário consulta prévia.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Qual o prazo médio de um projeto?</h4>
                <p className="text-secondary text-sm">Um projeto completo de interiores leva em média 30 a 45 dias úteis. Projetos arquitetônicos (construção) variam de 3 a 6 meses dependendo da complexidade.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Vocês indicam mão de obra?</h4>
                <p className="text-secondary text-sm">Trabalhamos com uma lista de parceiros de confiança que indicamos aos clientes, mas o cliente tem total liberdade para escolher seus fornecedores.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Como funciona o orçamento?</h4>
                <p className="text-secondary text-sm">O orçamento é calculado com base na metragem quadrada e na complexidade do escopo. Você pode fazer uma simulação na nossa página de Serviços.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};