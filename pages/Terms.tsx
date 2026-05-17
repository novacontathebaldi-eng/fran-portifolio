import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export const Terms: React.FC = () => {
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
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif">Termos de Uso</h1>
                                <p className="text-gray-500 text-sm mt-1">Última atualização: 31 de dezembro de 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Ao utilizar o site da <strong>Fran Siller Arquitetura</strong>, você concorda
                                com os termos descritos abaixo. Leia atentamente.
                            </p>

                            {/* Section 1 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-green-50 rounded-lg mt-1">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">1. Aceitação dos Termos</h2>
                                    <p className="text-gray-600">
                                        Ao criar uma conta, você declara ter lido e concordado com estes Termos e nossa
                                        Política de Privacidade. Se não concordar, não utilize nosso site.
                                    </p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-blue-50 rounded-lg mt-1">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">2. Serviços Oferecidos</h2>
                                    <p className="text-gray-600 mb-3">Através do site, você pode:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Conhecer nosso portfólio de projetos</li>
                                        <li>Solicitar orçamentos para projetos de arquitetura</li>
                                        <li>Agendar reuniões e visitas técnicas</li>
                                        <li>Entrar em contato com nossa equipe</li>
                                        <li>Acompanhar seus projetos (para clientes)</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-amber-50 rounded-lg mt-1">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">3. Suas Responsabilidades</h2>
                                    <p className="text-gray-600 mb-3">Ao utilizar nosso site, você se compromete a:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Fornecer informações verdadeiras e atualizadas</li>
                                        <li>Manter a confidencialidade de sua senha</li>
                                        <li>Não utilizar o site para fins ilegais</li>
                                        <li>Respeitar os direitos de propriedade intelectual</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-red-50 rounded-lg mt-1">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">4. Condutas Proibidas</h2>
                                    <p className="text-gray-600 mb-3">É proibido:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Copiar ou reproduzir conteúdo do site sem autorização</li>
                                        <li>Tentar acessar áreas restritas sem permissão</li>
                                        <li>Enviar conteúdo ofensivo ou difamatório</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Section 5 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-purple-50 rounded-lg mt-1">
                                    <Scale className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">5. Propriedade Intelectual</h2>
                                    <p className="text-gray-600">
                                        Todo o conteúdo do site, incluindo textos, imagens, logotipos e projetos,
                                        é de propriedade da Fran Siller Arquitetura e está protegido por direitos autorais.
                                    </p>
                                </div>
                            </div>

                            {/* Section 6 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-gray-100 rounded-lg mt-1">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">6. Disponibilidade</h2>
                                    <p className="text-gray-600">
                                        Nos esforçamos para manter o site sempre disponível e funcionando corretamente.
                                        Eventualmente, podem ocorrer manutenções programadas ou interrupções técnicas.
                                        Nestes casos, trabalharemos para restabelecer o serviço o mais rápido possível.
                                    </p>
                                </div>
                            </div>

                            {/* Section 7 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-green-50 rounded-lg mt-1">
                                    <Scale className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">7. Lei Aplicável</h2>
                                    <p className="text-gray-600">
                                        Estes termos são regidos pelas leis brasileiras. Para dúvidas ou questões,
                                        entre em contato conosco antes de qualquer medida: contato@fransiller.com.br
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 pt-6 mt-8">
                                <p className="text-sm text-gray-500">
                                    Estes termos podem ser atualizados. Recomendamos revisão periódica.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
