import React, { useState } from 'react';
import { MOCK_SERVICES } from '../data';
import { Check, MapPin, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';

const steps = ['Seleção', 'Detalhes', 'Revisão', 'Pagamento'];

export const BudgetFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(MOCK_SERVICES[0].id);
  const { showToast } = useProjects();

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    showToast('Solicitação enviada com sucesso!', 'success');
    nextStep();
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-gray-50">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Progress */}
        <div className="flex justify-between mb-8 md:mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
          {steps.map((s, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <motion.div 
                initial={false}
                animate={{ 
                  backgroundColor: step > idx + 1 ? '#22c55e' : step === idx + 1 ? '#000000' : '#ffffff',
                  borderColor: step === idx + 1 ? '#000000' : '#e5e7eb',
                  scale: step === idx + 1 ? 1.1 : 1
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${step > idx + 1 ? 'text-white' : step === idx + 1 ? 'text-white' : 'text-gray-400'}`}
              >
                 {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
              </motion.div>
              {/* Hide labels on very small screens or make them small */}
              <span className={`text-[10px] md:text-xs mt-2 font-medium ${step === idx + 1 ? 'text-black' : 'text-gray-400'} hidden sm:block`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-12">
          
          <AnimatePresence mode="wait">
            {/* Step 1: Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-serif mb-6">Selecione seu Pacote</h2>
                <div className="grid gap-4 md:gap-6">
                  {MOCK_SERVICES.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 md:p-6 transition flex flex-col md:flex-row justify-between md:items-center gap-4 ${selectedService === service.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div>
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        <p className="text-sm text-secondary mt-1">{service.description}</p>
                        <ul className="flex flex-wrap gap-2 mt-3">
                           {service.features.map(f => (
                             <span key={f} className="text-[10px] md:text-xs bg-white border border-gray-200 px-2 py-1 rounded">{f}</span>
                           ))}
                        </ul>
                      </div>
                      <div className="text-left md:text-right">
                         <span className="block text-lg md:text-xl font-serif font-bold">R$ {service.basePrice.toLocaleString('pt-BR')}</span>
                         <span className="text-xs text-gray-400">A partir de</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 border-t pt-8">
                   <h3 className="font-bold mb-4">Área Estimada</h3>
                   <input type="range" min="50" max="500" className="w-full accent-black mb-2" />
                   <div className="flex justify-between text-xs text-secondary">
                     <span>50m²</span>
                     <span>Aprox. 150m²</span>
                     <span>500m²+</span>
                   </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={nextStep} className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-full hover:bg-accent hover:text-black transition text-center active:scale-95 duration-200">Continuar</button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Addresses */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-serif mb-6">Localização do Projeto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Endereço</label>
                     <input type="text" className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black" placeholder="Rua da Arquitetura, 123" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cidade</label>
                     <input type="text" className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black" placeholder="São Paulo" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-wider text-gray-500">CEP</label>
                     <input type="text" className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black" placeholder="01234-567" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado</label>
                     <select className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black">
                       <option>São Paulo</option>
                       <option>Rio de Janeiro</option>
                       <option>Minas Gerais</option>
                       <option>Paraná</option>
                       <option>Outro</option>
                     </select>
                   </div>
                </div>
                
                <div className="mb-6">
                   <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Prévia do Mapa</label>
                   <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <span>Integração de Mapa (Mock)</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  <button onClick={prevStep} className="text-gray-500 hover:text-black">Voltar</button>
                  <button onClick={nextStep} className="bg-black text-white px-6 md:px-8 py-3 rounded-full hover:bg-accent hover:text-black transition flex-grow md:flex-grow-0 active:scale-95 duration-200">Revisar Detalhes</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment/Contract */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-serif mb-6">Revisão e Pagamento</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h3 className="font-bold mb-4 border-b border-gray-200 pb-2">Resumo do Pedido</h3>
                  <div className="flex justify-between mb-2 text-sm md:text-base">
                    <span>Estudo Preliminar</span>
                    <span>R$ 2.500,00</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm text-secondary">
                    <span>Despesas de Viagem (Est.)</span>
                    <span>R$ 250,00</span>
                  </div>
                  <div className="flex justify-between mt-4 font-bold text-lg pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>R$ 2.750,00</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold mb-4">Forma de Pagamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="border-2 border-black rounded-lg p-4 flex flex-row md:flex-col items-center justify-center md:justify-center gap-2 bg-gray-50 active:scale-95 transition duration-200">
                      <CreditCard className="w-6 h-6" />
                      <span className="text-sm font-bold">Cartão</span>
                    </button>
                    <button className="border border-gray-200 rounded-lg p-4 flex flex-row md:flex-col items-center justify-center md:justify-center gap-2 hover:border-gray-400 active:scale-95 transition duration-200">
                      <span className="text-sm font-bold">PIX</span>
                    </button>
                    <button className="border border-gray-200 rounded-lg p-4 flex flex-row md:flex-col items-center justify-center md:justify-center gap-2 hover:border-gray-400 active:scale-95 transition duration-200">
                      <span className="text-sm font-bold">Boleto</span>
                    </button>
                  </div>
                </div>

                {/* Mock Card Form */}
                <div className="space-y-4 max-w-md mx-auto mb-8">
                  <input type="text" placeholder="Número do Cartão" className="w-full border p-3 rounded focus:outline-none focus:border-black" />
                  <div className="flex gap-4">
                    <input type="text" placeholder="MM/AA" className="w-1/2 border p-3 rounded focus:outline-none focus:border-black" />
                    <input type="text" placeholder="CVC" className="w-1/2 border p-3 rounded focus:outline-none focus:border-black" />
                  </div>
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  <button onClick={prevStep} className="text-gray-500 hover:text-black">Voltar</button>
                  <button onClick={handleFinish} className="bg-black text-white px-6 md:px-8 py-3 rounded-full hover:bg-accent hover:text-black transition w-full md:w-auto text-sm md:text-base active:scale-95 duration-200">Confirmar Solicitação</button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                 <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring" }}
                   className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                 >
                   <Check className="w-10 h-10" />
                 </motion.div>
                 <h2 className="text-3xl md:text-4xl font-serif mb-4">Solicitação Enviada!</h2>
                 <p className="text-secondary max-w-md mx-auto mb-8">
                   Obrigado. Recebemos sua solicitação de projeto. Um gerente de projetos revisará os detalhes e entrará em contato em até 24 horas.
                 </p>
                 <div className="flex flex-col gap-4 items-center">
                   <Link to="/profile" className="bg-black text-white px-8 py-3 rounded-full hover:bg-accent hover:text-black transition w-full md:w-auto text-center active:scale-95">
                     Ir para Meu Painel
                   </Link>
                   <button className="text-sm text-gray-500 underline">Baixar Comprovante</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};