import React from 'react';
import { X, Download, Star, Menu } from 'lucide-react';

interface DesktopInstallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md mx-4 p-5 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                            <Download className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Instalar App
                            </h3>
                            <p className="text-sm text-gray-500">Para Desktop</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                {/* Instructions */}
                <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Para instalar este app no seu computador, siga os passos:
                    </p>

                    {/* Step 1 */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                            1
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                                Localize o ícone de instalação na barra de endereços
                            </p>

                            {/* Visual representation */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border-2 border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-1">
                                        <span>🔒</span>
                                        <span>fransiller.othebaldi.me</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <div className="absolute -inset-2 bg-accent/20 rounded-lg animate-pulse"></div>
                                            <Download className="w-5 h-5 text-gray-700 dark:text-gray-300 relative z-10" />
                                        </div>
                                        <Star className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                O ícone fica ao lado do ícone de favoritos (⭐)
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                            2
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                                Clique no ícone de instalação
                            </p>

                            {/* Visual button */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border-2 border-gray-200 dark:border-gray-700 inline-flex items-center gap-2">
                                <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Instalar</span>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                Uma janela de confirmação irá aparecer
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                            3
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                                Confirme a instalação
                            </p>

                            {/* Confirm button */}
                            <div className="bg-accent rounded-lg p-2 inline-flex items-center justify-center shadow-lg">
                                <span className="text-sm font-bold text-black">Instalar</span>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                O app será adicionado à sua área de trabalho!
                            </p>
                        </div>
                    </div>

                    {/* Alternative method */}
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                            <Menu className="w-4 h-4 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-0.5">
                                    Alternativa: Via menu do navegador
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Menu (⋮) → "Instalar app..." ou "Criar atalho..."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
};

export default DesktopInstallModal;
