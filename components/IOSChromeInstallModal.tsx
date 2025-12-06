import React from 'react';
import { X, MoreVertical, Share } from 'lucide-react';

interface IOSChromeInstallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const IOSChromeInstallModal: React.FC<IOSChromeInstallModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Instalar App
                        </h3>
                        <p className="text-sm text-gray-500">via Chrome</p>
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
                <div className="space-y-6">
                    <p className="text-gray-700 dark:text-gray-300">
                        Para instalar este app no seu iPhone usando Chrome:
                    </p>

                    {/* Step 1 */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                            1
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium mb-2">
                                Toque no menu de compartilhamento
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Share className="w-5 h-5" />
                                <span>no canto superior direito</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                            2
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium mb-2">
                                Selecione "Adicionar à Tela Início"
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Role o menu até encontrar esta opção
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                            3
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium mb-2">
                                Toque em "Adicionar"
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Confirme para adicionar o ícone à sua tela inicial
                            </div>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-900 dark:text-amber-200">
                            💡 <strong>Dica:</strong> Para melhor experiência, recomendamos usar o Safari. No Safari, a instalação é mais simples e o app funciona em tela cheia!
                        </p>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
};

export default IOSChromeInstallModal;
