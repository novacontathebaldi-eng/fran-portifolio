import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { isIOS, isIOSChrome, isAndroid, isStandalone, isMobile } from '../utils/deviceDetection';
import IOSInstallModal from './IOSInstallModal';
import IOSChromeInstallModal from './IOSChromeInstallModal';
import DesktopInstallModal from './DesktopInstallModal';

const InstallButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [showIOSChromeModal, setShowIOSChromeModal] = useState(false);
    const [showDesktopModal, setShowDesktopModal] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (isStandalone()) {
            setIsInstalled(true);
            return;
        }

        // Not installed - show install button
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
        // iOS - show appropriate modal based on browser
        if (isIOS()) {
            if (isIOSChrome()) {
                setShowIOSChromeModal(true);
            } else {
                setShowIOSModal(true);
            }
            return;
        }

        // Android/PC - trigger install prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();

            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA installed successfully');
                setIsInstalled(true);
                setIsInstallable(false);
            }

            setDeferredPrompt(null);
        } else if (!isAndroid()) {
            // Desktop only - show visual instructions modal
            // Android should not show modal, installation happens via deferredPrompt
            setShowDesktopModal(true);
        }
        // On Android without deferredPrompt, do nothing (user may need to refresh or browser doesn't support PWA)
    };

    // Show "App Installed" indicator when already installed
    if (isInstalled) {
        return (
            <div
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full w-full md:w-auto cursor-default"
                aria-label="App Instalado"
            >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-green-400 uppercase tracking-wide">
                    App Instalado
                </span>
            </div>
        );
    }

    // Don't render if not installable
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

            <IOSChromeInstallModal
                isOpen={showIOSChromeModal}
                onClose={() => setShowIOSChromeModal(false)}
            />

            <DesktopInstallModal
                isOpen={showDesktopModal}
                onClose={() => setShowDesktopModal(false)}
            />
        </>
    );
};

export default InstallButton;
