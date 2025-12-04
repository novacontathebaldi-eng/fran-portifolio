/**
 * Utility functions for device detection and PWA capabilities
 */

/**
 * Detect if the device is iOS (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Detect if the device is Android
 */
export function isAndroid(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
}

/**
 * Detect if the app is already running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }

    // Check iOS standalone
    if ((window.navigator as any).standalone === true) {
        return true;
    }

    return false;
}

/**
 * Check if the browser supports PWA installation
 */
export function canInstallPWA(): boolean {
    // PWA installation is supported via beforeinstallprompt event
    // This will be set by the InstallButton component when the event fires
    return !isIOS() && !isStandalone();
}

/**
 * Get the device type for analytics or conditional rendering
 */
export function getDeviceType(): 'ios' | 'android' | 'desktop' {
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    return 'desktop';
}

/**
 * Check if device is mobile (iOS or Android)
 */
export function isMobile(): boolean {
    return isIOS() || isAndroid();
}
