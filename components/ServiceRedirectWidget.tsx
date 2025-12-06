import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceRedirectProps {
    closeChat: () => void;
    data?: {
        message?: string;
    };
}

const ServiceRedirectWidget: React.FC<ServiceRedirectProps> = ({ closeChat, data }) => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/services'); // Correct route for services page
        closeChat();
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 my-2 max-w-[90%] ml-auto mr-auto">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-black text-white p-2 rounded-lg">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-black">Orçamento Detalhado</h3>
                    <p className="text-[10px] text-gray-500">Conheça nossos pacotes</p>
                </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {data?.message || "Para um orçamento preciso, recomendamos visualizar nossa página de serviços e selecionar o pacote ideal para você."}
            </p>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedirect}
                className="w-full bg-black text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
                <span>Ver Serviços e Valores</span>
                <ArrowRight className="w-3 h-3" />
            </motion.button>
        </div>
    );
};

export default ServiceRedirectWidget;
