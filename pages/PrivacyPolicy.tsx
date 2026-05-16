import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, MessageCircle, Cookie, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';

export const PrivacyPolicy: React.FC = () => {
    const { settings } = useProjects();
    return (
        <div className="min-h-screen pt-32 pb-24 bg-gray-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao início
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-black rounded-full">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif">Política de Privacidade</h1>
                                <p className="text-gray-500 text-sm mt-1">Última atualização: 31 de dezembro de 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                A <strong>{settings.branding?.brandName || 'nossa empresa'}</strong> está comprometida em proteger sua privacidade.
                                Esta política explica como coletamos, usamos e protegemos suas informações pessoais em
                                conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                            </p>

                            {/* Section 1 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-blue-50 rounded-lg mt-1">
                                    <Database className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">1. Dados que Coletamos</h2>
                                    <p className="text-gray-600 mb-3">Coletamos apenas os dados necessários para prestação dos serviços:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li><strong>Dados de cadastro:</strong> Nome, e-mail e telefone (fornecidos por você)</li>
                                        <li><strong>Dados de contato:</strong> Mensagens enviadas pelo formulário ou chat</li>
                                        <li><strong>Dados de projetos:</strong> Informações fornecidas para orçamentos e agendamentos</li>
                                    </ul>
                                    <p className="text-gray-600 mt-3 text-sm italic">
                                        Não coletamos dados de navegação nem utilizamos rastreadores de terceiros.
                                    </p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-green-50 rounded-lg mt-1">
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">2. Comunicações via WhatsApp</h2>
                                    <p className="text-gray-600 mb-3">
                                        Ao fornecer seu número de telefone e criar conta, você autoriza o envio de mensagens para:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Confirmação de cadastro e boas-vindas</li>
                                        <li>Confirmação de orçamentos solicitados</li>
                                        <li>Confirmação de reuniões e visitas agendadas</li>
                                        <li>Respostas às suas mensagens de contato</li>
                                    </ul>
                                    <p className="text-gray-600 mt-3 font-medium">
                                        ⚠️ Não enviamos mensagens promocionais ou de marketing.
                                    </p>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-amber-50 rounded-lg mt-1">
                                    <Cookie className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">3. Cookies</h2>
                                    <p className="text-gray-600 mb-3">Utilizamos apenas cookies essenciais para:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Manter você conectado à sua conta (sessão de login)</li>
                                        <li>Lembrar sua preferência sobre cookies</li>
                                    </ul>
                                    <p className="text-gray-600 mt-3 text-sm">
                                        O site funciona normalmente mesmo se você recusar cookies - apenas precisará fazer login novamente a cada visita.
                                    </p>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-purple-50 rounded-lg mt-1">
                                    <Lock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">4. Segurança dos Dados</h2>
                                    <p className="text-gray-600">
                                        Seus dados são armazenados de forma segura utilizando criptografia e protocolos
                                        de segurança modernos (Supabase). Apenas a equipe autorizada tem acesso às informações
                                        necessárias para prestação dos serviços.
                                    </p>
                                </div>
                            </div>

                            {/* Section 5 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-red-50 rounded-lg mt-1">
                                    <Shield className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">5. Seus Direitos (LGPD)</h2>
                                    <p className="text-gray-600 mb-3">Você tem direito a:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Acessar seus dados pessoais</li>
                                        <li>Corrigir dados incompletos ou desatualizados</li>
                                        <li>Solicitar a exclusão de seus dados</li>
                                        <li>Revogar consentimentos previamente fornecidos</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Section 6 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-gray-100 rounded-lg mt-1">
                                    <Mail className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">6. Contato</h2>
                                    <p className="text-gray-600">
                                        Para exercer seus direitos ou esclarecer dúvidas, entre em contato:
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        <strong>E-mail:</strong> contato@exemplo.com.br<br />
                                        <strong>WhatsApp:</strong> +55 (11) 99999-9999
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 pt-6 mt-8">
                                <p className="text-sm text-gray-500">
                                    Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
