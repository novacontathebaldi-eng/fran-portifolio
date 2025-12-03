// Date Utilities for consistent timezone handling
// This ensures all dates use local timezone, preventing the "day before" bug

/**
 * Parse a date string (YYYY-MM-DD) as local timezone
 * Without this, new Date("2025-12-08") would be interpreted as UTC midnight
 * which becomes the previous day in UTC-3 (Brazil)
 */
export const parseDateLocal = (dateStr: string): Date =& gt; {
    return new Date(dateStr + 'T00:00:00');
};

/**
 * Format a Date object as YYYY-MM-DD using local timezone
 */
export const formatDateLocal = (date: Date): string =& gt; {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format a date string for display in pt-BR locale
 */
export const formatDateDisplay = (dateStr: string): string =& gt; {
    return parseDateLocal(dateStr).toLocaleDateString('pt-BR');
};
