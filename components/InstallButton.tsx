import React, { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { isIOS, isAndroid, isStandalone, isMobile } from '../utils/deviceDetection';
import IOSInstallModal from './IOSInstallModal';
import DesktopInstallModal from './DesktopInstallModal';

const InstallButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [showDesktopModal, setShowDesktopModal] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        // Don't show install button if already installed
        if (isStandalone()) {
            return;
        }

        // Always show button (iOS, Android, PC)
        setIsInstallable(true);

        // For Android/PC, listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
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
        } else if (!isAndroid()) {
            // Desktop only - show visual instructions modal
            // Android should not show modal, installation happens via deferredPrompt
            setShowDesktopModal(true);
        }
        // On Android without deferredPrompt, do nothing (user may need to refresh or browser doesn't support PWA)
    };

    // Don't render if not installable or already installed
    if (!isInstallable) {
        return null;
    }

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 rounded-full transition-all duration-300 hover:scale-105 shadow-lg w-full md:w-auto"
                aria-label="Instalar App"
            >
                {isMobile() ? (
                    <Smartphone className="w-5 h-5 text-black" />
                ) : (
                    <Download className="w-5 h-5 text-black" />
                )}
                <span className="text-sm font-bold text-black uppercase tracking-wide">
                    Instalar App
                </span>
            </button>

            <IOSInstallModal
                isOpen={showIOSModal}
                onClose={() => setShowIOSModal(false)}
            />

            <DesktopInstallModal
                isOpen={showDesktopModal}
                onClose={() => setShowDesktopModal(false)}
            />
        </>
    );
};

export default InstallButton;
