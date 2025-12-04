import React, { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { isIOS, isAndroid, isStandalone, isMobile } from '../utils/deviceDetection';
import IOSInstallModal from './IOSInstallModal';

const InstallButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        // Don't show install button if already installed
        if (isStandalone()) {
            return;
        }

        // For iOS, always show the button (will open modal)
        if (isIOS()) {
            setIsInstallable(true);
            return;
        }

        // For Android/PC, listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        // iOS - show instructions modal
        if (isIOS()) {
            setShowIOSModal(true);
            return;
        }

        // Android/PC - trigger install prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();

            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA installed successfully');
            }

            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    // Don't render if not installable or already installed
    if (!isInstallable) {
        return null;
    }

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-all duration-300 hover:scale-105"
                aria-label="Instalar App"
            >
                {isMobile() ? (
                    <Smartphone className="w-4 h-4 text-white" />
                ) : (
                    <Download className="w-4 h-4 text-white" />
                )}
                <span className="text-sm font-medium text-white hidden sm:inline">
                    Instalar App
                </span>
            </button>

            <IOSInstallModal
                isOpen={showIOSModal}
                onClose={() => setShowIOSModal(false)}
            />
        </>
    );
};

export default InstallButton;
