// src/utils/logUtils.ts
// Utilitários para mascarar dados sensíveis em logs de desenvolvimento
// Mantém logs úteis para debug sem expor informações pessoais

/**
 * Mascara um UUID mantendo início e fim visíveis
 * Ex: 8216371b-3e6d-4eb2-8ad4-40a460258b09 → 8216***b09
 */
export const maskUserId = (userId: string | undefined | null): string => {
    if (!userId) return '***';
    if (userId.length < 8) return '***';
    return `${userId.slice(0, 4)}***${userId.slice(-3)}`;
};

/**
 * Mascara número de telefone mantendo DDD e últimos 2 dígitos
 * Ex: 352691214222 → 352***22
 * Ex: +5527999887766 → +55***66
 */
export const maskPhone = (phone: string | undefined | null): string => {
    if (!phone) return '***';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 6) return '***';

    // Mantém prefixo + se existir
    const prefix = phone.startsWith('+') ? '+' : '';
    return `${prefix}${cleaned.slice(0, 3)}***${cleaned.slice(-2)}`;
};

/**
 * Mascara email mantendo primeiros 2 chars e domínio
 * Ex: compras.thebaldi@gmail.com → co***@gmail.com
 */
export const maskEmail = (email: string | undefined | null): string => {
    if (!email) return '***';
    const atIndex = email.indexOf('@');
    if (atIndex < 2) return '***';

    const localPart = email.slice(0, 2);
    const domain = email.slice(atIndex);
    return `${localPart}***${domain}`;
};

/**
 * Verifica se estamos em modo de desenvolvimento
 */
export const isDev = (): boolean => {
    try {
        return (import.meta as any).env?.DEV === true;
    } catch {
        return false;
    }
};

/**
 * Log seguro que mascara dados sensíveis automaticamente
 * Só executa em modo de desenvolvimento
 */
export const secureLog = (
    prefix: string,
    message: string,
    data?: Record<string, any>
): void => {
    if (!isDev()) return;

    // Mascarar campos sensíveis automaticamente
    if (data) {
        const maskedData = { ...data };

        if ('userId' in maskedData) {
            maskedData.userId = maskUserId(maskedData.userId);
        }
        if ('user_id' in maskedData) {
            maskedData.user_id = maskUserId(maskedData.user_id);
        }
        if ('phone' in maskedData) {
            maskedData.phone = maskPhone(maskedData.phone);
        }
        if ('email' in maskedData) {
            maskedData.email = maskEmail(maskedData.email);
        }
        if ('client_id' in maskedData) {
            maskedData.client_id = maskUserId(maskedData.client_id);
        }

        console.log(`${prefix} ${message}`, maskedData);
    } else {
        console.log(`${prefix} ${message}`);
    }
};
