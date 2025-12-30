

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
  const isOfficeActive = office?.isActive !== false;

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
        source: 'contact_form'
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

  // Get icon component for platform - Using official SVG icons
  const getSocialIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform) {
      case 'instagram': return <Instagram className={iconClass} />;
      case 'linkedin': return <Linkedin className={iconClass} />;
      case 'whatsapp': return <MessageCircle className={iconClass} />;
      case 'facebook':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        );
      case 'pinterest':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
        );
      case 'telegram':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        );
      default: return <ExternalLink className={iconClass} />;
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

              {/* Office address - only show when office is active */}
              {isOfficeActive && (
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
              )}
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
                      className={`w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-full transition-all active:scale-95 ${getSocialHoverClass(link.platform)}`}
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
                    className="w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-green-500 hover:text-white hover:border-transparent transition-all active:scale-95"
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
                      <p className="px-6 pb-6 text-secondary leading-relaxed whitespace-pre-line">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map Section - only show when office is active */}
        {isOfficeActive && office.mapQuery && (
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