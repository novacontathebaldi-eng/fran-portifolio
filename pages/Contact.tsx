

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Linkedin, Send, MessageCircle, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { notifyNewContactMessage } from '../utils/emailService';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { showToast, siteContent, addMessage } = useProjects();
  const { office } = siteContent;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  // Default FAQ items if not set in admin
  const defaultFaqItems = [
    { id: '1', question: 'Vocês realizam projetos fora de Santa Leopoldina?', answer: 'Sim. Atuamos em todo o estado e realizamos consultorias online para todo o Brasil. Para acompanhamento de obra presencial, é necessário consulta prévia.' },
    { id: '2', question: 'Qual o prazo médio de um projeto?', answer: 'Um projeto completo de interiores leva em média 30 a 45 dias úteis. Projetos arquitetônicos (construção) variam de 3 a 6 meses dependendo da complexidade.' },
    { id: '3', question: 'Vocês indicam mão de obra?', answer: 'Trabalhamos com uma lista de parceiros de confiança que indicamos aos clientes, mas o cliente tem total liberdade para escolher seus fornecedores.' },
    { id: '4', question: 'Como funciona o orçamento?', answer: 'O orçamento é calculado com base na metragem quadrada e na complexidade do escopo. Você pode fazer uma simulação na nossa página de Serviços.' }
  ];

  // Default subjects if not set in admin
  const defaultSubjects = ['Orçamento de Projeto', 'Dúvidas Gerais', 'Imprensa / Mídia', 'Parcerias'];

  const faqItems = office.faqItems?.length ? office.faqItems : defaultFaqItems;
  const subjects = office.contactSubjects?.length ? office.contactSubjects : defaultSubjects;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save to database via unified messages
      await addMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || subjects[0],
        message: formData.message,
        source: 'contact_form',
        status: 'new'
      });

      // 2. Send email notification via Brevo
      await notifyNewContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || subjects[0],
        message: formData.message
      });

      setSubmitted(true);
      showToast('Mensagem enviada com sucesso!', 'success');

    } catch (error) {
      console.error('[Contact] Error:', error);
      showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    setSubmitted(false);
  };

  // Helper to ensure URL has protocol
  const normalizeUrl = (url: string | undefined): string => {
    if (!url || url.trim() === '') return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // WhatsApp link generator - from socialLinks or fallback to phone
  const getWhatsAppLink = () => {
    // First try to find WhatsApp in socialLinks
    const whatsappLink = office.socialLinks?.find(s => s.platform === 'whatsapp');
    const number = whatsappLink?.url || office.whatsapp || office.phone?.replace(/\D/g, '') || '';
    const cleanNumber = number.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.');
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  // Get icon component for platform
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
      case 'facebook': return <span className="w-5 h-5 font-bold text-sm">f</span>;
      case 'youtube': return <span className="w-5 h-5 text-xs">▶</span>;
      case 'twitter': return <span className="w-5 h-5 font-bold text-sm">𝕏</span>;
      case 'tiktok': return <span className="w-5 h-5 font-bold text-sm">♪</span>;
      case 'telegram': return <Send className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  // Get hover class for platform
  const getSocialHoverClass = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'hover:bg-gradient-to-tr hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white hover:border-transparent';
      case 'linkedin': return 'hover:bg-blue-600 hover:text-white hover:border-transparent';
      case 'whatsapp': return 'hover:bg-green-500 hover:text-white hover:border-transparent';
      case 'facebook': return 'hover:bg-blue-700 hover:text-white hover:border-transparent';
      case 'youtube': return 'hover:bg-red-600 hover:text-white hover:border-transparent';
      case 'twitter': return 'hover:bg-black hover:text-white hover:border-transparent';
      case 'tiktok': return 'hover:bg-black hover:text-white hover:border-transparent';
      case 'telegram': return 'hover:bg-sky-500 hover:text-white hover:border-transparent';
      default: return 'hover:bg-gray-800 hover:text-white hover:border-transparent';
    }
  };

  // Get social links from database or use default WhatsApp with phone
  const socialLinks = office.socialLinks || [];
  const hasWhatsApp = socialLinks.some(s => s.platform === 'whatsapp');

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

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <a
                href={`mailto:${office.email}`}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Email</h3>
                  <p className="text-secondary break-all group-hover:text-black transition">{office.email}</p>
                </div>
              </a>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-all group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1 text-green-800">WhatsApp</h3>
                  <p className="text-green-700 group-hover:text-green-900 transition">{office.phone}</p>
                  <p className="text-xs text-green-600 mt-1">Clique para iniciar conversa</p>
                </div>
              </a>

              <a
                href={`tel:${office.phone?.replace(/\D/g, '')}`}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Telefone</h3>
                  <p className="text-secondary group-hover:text-black transition">{office.phone}</p>
                  <p className="text-sm text-gray-400">{office.hoursDescription}</p>
                </div>
              </a>

              <a
                href={office.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Ateliê</h3>
                  <p className="text-secondary group-hover:text-black transition">{office.address}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    Ver no mapa <ExternalLink className="w-3 h-3" />
                  </p>
                </div>
              </a>
            </div>

            {/* Social Links - Dynamic from Database */}
            {(socialLinks.length > 0 || office.phone) && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-4">Siga-nos</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Render all social links from database */}
                  {socialLinks.filter(link => link.platform !== 'whatsapp').map((link) => (
                    <a
                      key={link.id}
                      href={normalizeUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                      className={`p-3 border border-gray-200 rounded-full transition-all active:scale-95 ${getSocialHoverClass(link.platform)}`}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                  {/* WhatsApp button - always show if in socialLinks or has phone */}
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    className="p-3 border border-gray-200 rounded-full hover:bg-green-500 hover:text-white hover:border-transparent transition-all active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-2/3 bg-gray-50 p-6 md:p-12 rounded-2xl"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nome *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Telefone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Assunto</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                    >
                      {subjects.map((subject, idx) => (
                        <option key={idx} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Mensagem *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 p-3 md:p-4 rounded-lg h-40 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition resize-none"
                      placeholder="Conte-nos um pouco sobre seu projeto..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition flex items-center justify-center space-x-2 active:scale-95 duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Mensagem</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                  >
                    <Send className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-3xl font-serif mb-4">Mensagem Enviada!</h2>
                  <p className="text-secondary max-w-md mb-2">Obrigado pelo contato. Nossa equipe retornará seu email em até 24 horas úteis.</p>
                  <p className="text-sm text-gray-400 mb-8">Você também pode nos contatar diretamente pelo WhatsApp para respostas mais rápidas.</p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 rounded-full font-bold hover:bg-gray-100 transition"
                    >
                      Enviar outra mensagem
                    </button>
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 pt-24 border-t border-gray-100"
        >
          <h2 className="text-3xl font-serif mb-12 text-center">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq) => (
              <motion.div
                key={faq.id}
                initial={false}
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-100 transition"
                >
                  <h4 className="font-bold text-lg pr-4">{faq.question}</h4>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-secondary leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map Section */}
        {office.mapQuery && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-24"
          >
            <h2 className="text-3xl font-serif mb-8 text-center">Nossa Localização</h2>
            <div className="rounded-2xl overflow-hidden shadow-lg h-[400px]">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(office.mapQuery || office.address)}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};