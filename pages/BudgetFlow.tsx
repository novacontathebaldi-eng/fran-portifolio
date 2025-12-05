import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { notifyNewBudgetRequest } from '../src/utils/emailService';

interface Service {
  id: string;
  category: string;
  name: string;
}

interface FormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocationFull: string;
  projectCity: string;
  projectState: string;
  observations: string;
  selectedServices: string[]; // IDs dos serviços
}

export const BudgetFlow: React.FC = () => {
  const { showToast, currentUser } = useProjects();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectLocationFull: '',
    projectCity: '',
    projectState: '',
    observations: '',
    selectedServices: []
  });

  // Buscar serviços do Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, category, name, order_index')
          .eq('active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        showToast('Erro ao carregar serviços', 'error');
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Auto-preencher dados se usuário estiver logado
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        clientName: currentUser.name || '',
        clientEmail: currentUser.email || '',
        clientPhone: currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(s => s !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar autenticação
    if (!currentUser) {
      showToast('Por favor, faça login para solicitar um orçamento.', 'error');
      navigate('/auth');
      return;
    }

    // Validação básica
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      showToast('Por favor, preencha todos os dados pessoais.', 'error');
      return;
    }

    if (!formData.projectLocationFull || !formData.projectCity || !formData.projectState) {
      showToast('Por favor, informe a localização completa do projeto.', 'error');
      return;
    }

    if (formData.selectedServices.length === 0) {
      showToast('Por favor, selecione pelo menos um serviço.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 1. Criar o budget_request
      const { data: budgetRequest, error: requestError } = await supabase
        .from('budget_requests')
        .insert({
          client_id: currentUser?.id || null,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          project_location_full: formData.projectLocationFull,
          project_city: formData.projectCity,
          project_state: formData.projectState,
          observations: formData.observations || null,
          status: 'pending'
        })
        .select()
        .single();


      if (requestError) throw requestError;

      // 2. Criar os budget_request_items (relação com serviços)
      const items = formData.selectedServices.map(serviceId => ({
        budget_request_id: budgetRequest.id,
        service_id: serviceId
      }));

      const { error: itemsError } = await supabase
        .from('budget_request_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Send email notification to admin (Lista 7)
      notifyNewBudgetRequest({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        services: formData.selectedServices.map(id => {
          const service = services.find(s => s.id === id);
          return service?.name || 'Serviço não encontrado';
        }),
        projectDescription: formData.observations || 'Não informada',
        date: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }).catch(error => {
        console.error('[Brevo] Erro ao enviar email de orçamento:', error);
        // Não interrompe o fluxo se o e-mail falhar
      });

      setSubmitted(true);
      showToast('Solicitação enviada com sucesso! Entraremos em contato em breve.', 'success');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      showToast('Erro ao enviar solicitação. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }

  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-44 pb-24 bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Solicitação Enviada!</h2>
          <p className="text-secondary text-lg mb-8">
            Recebemos sua solicitação de orçamento. Nossa equipe analisará os detalhes e entrará em contato em até 24 horas.
          </p>
          <Link to="/" className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition">
            Voltar para Início
          </Link>
        </motion.div>
      </div>
    );
  }

  // Agrupar serviços por categoria
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen pt-44 pb-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Solicitar Orçamento</h1>
          <p className="text-secondary text-lg">
            Conte-nos sobre o seu projeto e nossa equipe entrará em contato.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Dados Pessoais */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif mb-6">Seus Dados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Localização do Projeto */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização do Projeto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Endereço Completo *</label>
                <input
                  type="text"
                  value={formData.projectLocationFull}
                  onChange={(e) => setFormData({ ...formData, projectLocationFull: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                  placeholder="Rua, número, bairro..."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.projectCity}
                  onChange={(e) => setFormData({ ...formData, projectCity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                  placeholder="Cidade"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Estado *</label>
                <input
                  type="text"
                  value={formData.projectState}
                  onChange={(e) => setFormData({ ...formData, projectState: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                  placeholder="UF"
                  maxLength={2}
                  required
                />
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif mb-6">Serviços Desejados *</h2>

            {loadingServices ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Carregando serviços...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                  <div key={category}>
                    <h3 className="font-bold text-lg mb-4 text-gray-700">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryServices.map(service => (
                        <label
                          key={service.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${formData.selectedServices.includes(service.id)
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="w-5 h-5 text-black focus:ring-black rounded"
                          />
                          <span className="text-sm font-medium">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif mb-6">Observações</h2>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition resize-none"
              rows={5}
              placeholder="Conte-nos mais sobre seu projeto, prazos, orçamento estimado ou qualquer detalhe relevante..."
            />
          </div>

          {/* Counter e Submit */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <p className="text-sm text-gray-500">
              {formData.selectedServices.length} serviço(s) selecionado(s)
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-black text-white px-12 py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'SOLICITAR ORÇAMENTO'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};