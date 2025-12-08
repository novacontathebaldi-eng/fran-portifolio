/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas.
 * Útil para buscas que não diferenciam acentos.
 * 
 * @example
 * normalizeString('Mármore') // retorna 'marmore'
 * normalizeString('Açúcar') // retorna 'acucar'
 */
export const normalizeString = (str: string): string => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};
