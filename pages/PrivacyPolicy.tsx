import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, MessageCircle, Cookie, Lock, Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';

export const PrivacyPolicy: React.FC = () => {
    const { siteContent } = useProjects();
    const { office } = siteContent;

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
                                <p className="text-gray-500 text-sm mt-1">Última atualização: 18 de maio de 2026</p>
                            </div>
                        </div>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                A <strong>Fran Siller Arquitetura</strong> está comprometida em proteger sua privacidade.
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

                            {/* Section 2 - Google User Data */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-sky-50 rounded-lg mt-1">
                                    <Globe className="w-5 h-5 text-sky-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">2. Dados do usuário do Google</h2>
                                    <p className="text-gray-600 mb-4">
                                        Quando você escolhe entrar na sua conta usando o <strong>Google Sign-In (Google OAuth)</strong>,
                                        o aplicativo pode receber os seguintes dados básicos da sua Conta Google, necessários exclusivamente
                                        para autenticação e identificação:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                                        <li>Nome</li>
                                        <li>Endereço de e-mail</li>
                                        <li>Foto de perfil / avatar (se disponibilizada pelo Google)</li>
                                        <li>Identificador único da conta Google</li>
                                    </ul>
                                    <p className="text-gray-600 mb-4">
                                        Esses dados são fornecidos pelo fluxo padrão de autenticação Google OAuth / Google Sign-In.
                                        O aplicativo solicita apenas os dados mínimos necessários para login e identificação do
                                        usuário — não são solicitados escopos adicionais além da autenticação básica.
                                    </p>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.1 Finalidade do uso</h3>
                                    <p className="text-gray-600 mb-3">Os dados do Google são usados exclusivamente para:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                                        <li>Autenticar o usuário no site</li>
                                        <li>Criar ou acessar a conta do usuário</li>
                                        <li>Identificar o usuário na área do cliente</li>
                                        <li>Permitir o uso dos recursos do site relacionados à conta e ao login</li>
                                        <li>Manter a segurança do acesso e evitar acessos não autorizados</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.2 O que o aplicativo NÃO acessa</h3>
                                    <p className="text-gray-600 mb-3">
                                        Este aplicativo <strong>não</strong> acessa, lê, coleta ou processa nenhum dado adicional
                                        da sua Conta Google além dos listados acima. Em particular, o aplicativo:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                                        <li>Não acessa o Gmail, mensagens ou caixa de entrada</li>
                                        <li>Não acessa o Google Drive ou arquivos pessoais</li>
                                        <li>Não acessa o Google Calendar ou eventos</li>
                                        <li>Não acessa contatos do Google</li>
                                        <li>Não lê documentos, fotos, vídeos ou dados privados da Conta Google</li>
                                        <li>Não publica nada em nome do usuário</li>
                                        <li>Não realiza nenhuma ação na Conta Google além da autenticação/login</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.3 Armazenamento</h3>
                                    <p className="text-gray-600 mb-4">
                                        Os dados necessários para autenticação e identificação da conta (nome, e-mail, foto de perfil
                                        e identificador) podem ser armazenados no sistema do aplicativo e nos provedores técnicos
                                        utilizados para autenticação e operação do site, como o Supabase.
                                        Os dados são mantidos apenas pelo tempo necessário para manter a conta ativa, fornecer o serviço,
                                        cumprir obrigações legais ou proteger a segurança da aplicação.
                                    </p>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.4 Compartilhamento e transferência</h3>
                                    <p className="text-gray-600 mb-3">
                                        A <strong>Fran Siller Arquitetura</strong> declara que:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                                        <li>Não vende dados de usuário do Google</li>
                                        <li>Não aluga dados de usuário do Google</li>
                                        <li>Não compartilha dados de usuário do Google para fins de publicidade</li>
                                        <li>Não usa dados de usuário do Google para anúncios personalizados</li>
                                        <li>Não transfere dados de usuário do Google para corretores de dados (data brokers)</li>
                                        <li>Não usa dados de usuário do Google para determinar crédito, empréstimos, elegibilidade financeira ou finalidades semelhantes</li>
                                    </ul>
                                    <p className="text-gray-600 mb-4">
                                        Os dados podem ser processados por provedores técnicos estritamente necessários para operar o site,
                                        incluindo serviços de autenticação, hospedagem, segurança, suporte e infraestrutura,
                                        sempre limitados à finalidade de prestação do serviço.
                                    </p>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.5 Publicidade, analytics e inteligência artificial</h3>
                                    <p className="text-gray-600 mb-4">
                                        Os dados de usuário do Google não são usados para publicidade, retargeting, venda de dados,
                                        criação de bases comerciais, treinamento de modelos de inteligência artificial ou qualquer
                                        finalidade não relacionada ao funcionamento do site.
                                    </p>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.6 Retenção e exclusão</h3>
                                    <p className="text-gray-600 mb-3">
                                        Os dados do Google são mantidos enquanto a conta do usuário estiver ativa ou enquanto forem
                                        necessários para fornecer o serviço. O usuário pode solicitar a exclusão dos seus dados a
                                        qualquer momento. Após solicitação válida, os dados serão excluídos ou anonimizados, exceto
                                        quando houver obrigação legal de retenção.
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        O pedido de exclusão pode ser feito pelo e-mail{' '}
                                        {office.email ? (
                                            <a href={`mailto:${office.email}`} className="text-black underline hover:text-gray-600">
                                                {office.email}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">disponível na página de Contato</span>
                                        )}.
                                    </p>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.7 Segurança</h3>
                                    <p className="text-gray-600 mb-4">
                                        O aplicativo adota medidas razoáveis de segurança para proteger os dados recebidos do Google,
                                        incluindo controle de acesso, autenticação, uso de provedores técnicos confiáveis, proteção
                                        contra acesso não autorizado e limitação de acesso aos dados ao que for estritamente necessário
                                        para operar o serviço.
                                    </p>

                                    <h3 className="text-lg font-semibold mb-2 mt-6">2.8 Conformidade com a Política de Dados do Google</h3>
                                    <p className="text-gray-600 mb-2">
                                        O uso e a transferência de informações recebidas das APIs do Google respeitam a{' '}
                                        <a
                                            href="https://developers.google.com/terms/api-services-user-data-policy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black underline hover:text-gray-600"
                                        >
                                            Google API Services User Data Policy
                                        </a>
                                        , incluindo os requisitos de Uso Limitado (Limited Use), quando aplicável.
                                    </p>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-green-50 rounded-lg mt-1">
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">3. Comunicações via WhatsApp</h2>
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

                            {/* Section 4 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-amber-50 rounded-lg mt-1">
                                    <Cookie className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">4. Cookies</h2>
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

                            {/* Section 5 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-teal-50 rounded-lg mt-1">
                                    <Lock className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">5. Segurança dos Dados</h2>
                                    <p className="text-gray-600">
                                        Seus dados são armazenados de forma segura utilizando criptografia e protocolos
                                        de segurança modernos (Supabase). Apenas a equipe autorizada tem acesso às informações
                                        necessárias para prestação dos serviços.
                                    </p>
                                </div>
                            </div>

                            {/* Section 6 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-red-50 rounded-lg mt-1">
                                    <Shield className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">6. Seus Direitos (LGPD)</h2>
                                    <p className="text-gray-600 mb-3">Você tem direito a:</p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Acessar seus dados pessoais</li>
                                        <li>Corrigir dados incompletos ou desatualizados</li>
                                        <li>Solicitar a exclusão de seus dados</li>
                                        <li>Revogar consentimentos previamente fornecidos</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Section 7 */}
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-2 bg-gray-100 rounded-lg mt-1">
                                    <Mail className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3">7. Contato</h2>
                                    <p className="text-gray-600">
                                        Para exercer seus direitos ou esclarecer dúvidas, entre em contato:
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        {office.email && (
                                            <><strong>E-mail:</strong> <a href={`mailto:${office.email}`} className="text-black underline hover:text-gray-600">{office.email}</a><br /></>
                                        )}
                                        {office.phone && (
                                            <><strong>WhatsApp / Telefone:</strong> {office.phone}<br /></>
                                        )}
                                        {!office.email && !office.phone && (
                                            <>Consulte os canais de contato disponíveis na <Link to="/contact" className="text-black underline hover:text-gray-600">página de contato</Link>.</>
                                        )}
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
