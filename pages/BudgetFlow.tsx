import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';


// Categorias de Serviços
const SERVICE_CATEGORIES = {
  'Interiores e Detalhamento': [
    'Projeto de Interiores',
    'Projeto Luminotécnico',
    'Paginação de Pisos e Revestimentos',
    'Projeto de Marcenaria',
    'Projeto de Forro (Gesso)',
    'Consultoria de Decoração'
  ],
  'Projetos Executivos': [
    'Plantas de Demolição e Construção',
    'Detalhamento de Áreas Molhadas',
    'Detalhamento de Marmoraria e Vidraçaria'
  ],
  'Projetos Legais e Regularização': [
    'Aprovação na Prefeitura',
    'Levantamento Cadastral (As-Built)',
    'Regularização de Imóvel',
    'Desmembramento / Remembramento',
    'Estudo de Viabilidade',
    'Projeto de Acessibilidade (NBR 9050)',
    'PPCI (Combate a Incêndio)'
  ],
  'Arquitetura e Complementares': [
    'Projeto de Fachada (Retrofit)',
    'Projeto de Paisagismo',
    'Projeto de Restauro'
  ],
  'Visualização 3D': [
    'Maquete Eletrônica / Renderização'
  ],
  'Assessoria': [
    'Assessoria Técnica'
  ]
};

interface FormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocationFull: string;
  projectCity: string;
  projectState: string;
  observations: string;
  selectedServices: string[];
}

export const BudgetFlow: React.FC = () => {
  const { currentUser, showToast } = useProjects();
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

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
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
          <Link
            to="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-accent hover:text-black transition"
          >
            Voltar para Início
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 pb-24 bg-gray-50">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Solicite seu Orçamento</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Preencha o formulário abaixo selecionando os serviços que precisa. Analisaremos sua solicitação e retornaremos com um orçamento personalizado.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">

          {/* Dados Pessoais */}
          <div className="mb-10">
            <h2 className="text-2xl font-serif mb-6 pb-3 border-b border-gray-200">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Localização do Projeto */}
          <div className="mb-10">
            <h2 className="text-2xl font-serif mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Localização do Projeto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectLocationFull}
                  onChange={(e) => setFormData({ ...formData, projectLocationFull: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition"
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectCity}
                  onChange={(e) => setFormData({ ...formData, projectCity: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Estado *
                </label>
                <select
                  required
                  value={formData.projectState}
                  onChange={(e) => setFormData({ ...formData, projectState: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition"
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seleção de Serviços */}
          <div className="mb-10">
            <h2 className="text-2xl font-serif mb-6 pb-3 border-b border-gray-200">
              Serviços Desejados *
            </h2>
            <p className="text-sm text-secondary mb-6">Selecione todos os serviços que você precisa:</p>

            {Object.entries(SERVICE_CATEGORIES).map(([category, services]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-black">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map(service => (
                    <label
                      key={service}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition transform hover:scale-[1.02] ${formData.selectedServices.includes(service)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-5 h-5 text-black focus:ring-black focus:ring-2 rounded"
                      />
                      <span className="text-sm font-medium">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Observações */}
          <div className="mb-10">
            <h2 className="text-2xl font-serif mb-6 pb-3 border-b border-gray-200">Observações</h2>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 p-4 rounded focus:outline-none focus:border-black transition resize-none"
              placeholder="Conte-nos mais sobre seu projeto, prazos, orçamento estimado ou qualquer detalhe relevante..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-secondary">
              {formData.selectedServices.length} serviço(s) selecionado(s)
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-black text-white px-12 py-4 rounded-full hover:bg-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span className="font-bold uppercase tracking-wider">Solicitar Orçamento</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};