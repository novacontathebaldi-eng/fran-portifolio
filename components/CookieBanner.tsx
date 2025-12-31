import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'fran_siller_cookie_consent';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            setTimeout(() => setIsVisible(true), 2000);
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
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9999]"
                >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <Cookie className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-gray-800">Cookies</span>
                        </div>

                        {/* Text */}
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                            Usamos cookies para manter você conectado.{' '}
                            <Link
                                to="/politica-privacidade"
                                className="underline hover:text-black"
                            >
                                Saiba mais
                            </Link>
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleDecline}
                                className="flex-1 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                            >
                                Recusar
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 px-3 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
                            >
                                Aceitar
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
