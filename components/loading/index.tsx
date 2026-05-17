import React from 'react';

/**
 * LoadingSpinner - Spinner reutilizável com variantes de tamanho
 * Segue a identidade visual Fran Siller (accent #d4bbb0)
 */

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerVariant = 'primary' | 'accent' | 'white' | 'gray';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    className?: string;
    label?: string; // Aria label for accessibility
}

const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
};

const variantClasses: Record<SpinnerVariant, string> = {
    primary: 'border-primary/30 border-t-primary',
    accent: 'border-accent/30 border-t-accent',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-300 border-t-gray-500',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'gray',
    className = '',
    label = 'Carregando...',
}) => {
    return (
        <div
            role="status"
            aria-label={label}
            className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full
        animate-spin
        ${className}
      `.trim()}
        >
            <span className="sr-only">{label}</span>
        </div>
    );
};

/**
 * LoadingScreen - Tela de loading para seções ou páginas inteiras
 * Design elegante alinhado com identidade visual Fran Siller
 */
interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Carregando...',
    fullScreen = false,
    className = '',
}) => {
    const containerClass = fullScreen
        ? 'fixed inset-0 z-50 bg-white'
        : 'min-h-[400px]';

    return (
        <div
            className={`
        ${containerClass}
        flex flex-col items-center justify-center
        ${className}
      `.trim()}
            role="status"
            aria-live="polite"
        >
            {/* Logo-inspired loading animation */}
            <div className="relative mb-6">
                <div className="w-12 h-12 border-2 border-accent/20 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-spin"></div>
            </div>

            {/* Loading text */}
            <p className="text-sm text-gray-500 font-light tracking-wide animate-pulse">
                {message}
            </p>
        </div>
    );
};

/**
 * LoadingDots - Animação de pontos tipográfica (para chatbot/mensagens)
 */
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div
            className={`flex items-center space-x-1 ${className}`}
            role="status"
            aria-label="Digitando..."
        >
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    );
};

/**
 * LoadingOverlay - Overlay com loading para cobrir conteúdo enquanto carrega
 */
interface LoadingOverlayProps {
    isLoading: boolean;
    children: React.ReactNode;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    children,
    message = 'Carregando...',
}) => {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-300">
                    <div className="text-center">
                        <LoadingSpinner size="lg" variant="accent" className="mx-auto mb-2" />
                        <p className="text-xs text-gray-500">{message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Default export for convenience
export default LoadingSpinner;
