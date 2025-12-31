import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'fran_siller_cookie_consent';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verifica se já aceitou (só aparece 1x)
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Pequeno delay para não aparecer instantaneamente
            setTimeout(() => setIsVisible(true), 1500);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            {/* Icon */}
                            <div className="hidden md:flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full flex-shrink-0">
                                <Cookie className="w-6 h-6 text-amber-600" />
                            </div>

                            {/* Text */}
                            <div className="flex-1">
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
                                    <Link
                                        to="/politica-privacidade"
                                        className="text-black font-semibold underline hover:text-gray-600 transition"
                                    >
                                        Política de Privacidade
                                    </Link>
                                    {' '}e{' '}
                                    <Link
                                        to="/termos"
                                        className="text-black font-semibold underline hover:text-gray-600 transition"
                                    >
                                        Termos de Uso
                                    </Link>.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                                >
                                    Recusar
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition active:scale-95"
                                >
                                    Aceitar
                                </button>
                            </div>

                            {/* Close button mobile */}
                            <button
                                onClick={handleDecline}
                                className="absolute top-3 right-3 md:hidden p-1"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
