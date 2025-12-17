import { useEffect, useRef } from 'react';

/**
 * Hook robusto para bloquear o scroll do body.
 * 
 * Funciona em todos os navegadores, incluindo iOS Safari, usando:
 * - position: fixed no body para bloquear scroll
 * - Salva e restaura a posição de scroll original
 * - Compensa a largura da scrollbar para evitar layout shift
 * 
 * @param isLocked - Se true, bloqueia o scroll do body
 */
export function useScrollLock(isLocked: boolean): void {
    const scrollYRef = useRef(0);

    useEffect(() => {
        if (!isLocked) return;

        // Salvar posição atual do scroll
        scrollYRef.current = window.scrollY;

        // Calcular largura da scrollbar para evitar layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Salvar estilos originais
        const originalStyles = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight,
            width: document.body.style.width,
        };

        // Aplicar estilos para bloquear scroll
        // position: fixed é o que realmente funciona no iOS Safari
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.width = '100%';

        // Compensar a largura da scrollbar apenas se existir
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Cleanup: restaurar estilos e posição de scroll
        return () => {
            document.body.style.position = originalStyles.position;
            document.body.style.top = originalStyles.top;
            document.body.style.left = originalStyles.left;
            document.body.style.right = originalStyles.right;
            document.body.style.overflow = originalStyles.overflow;
            document.body.style.paddingRight = originalStyles.paddingRight;
            document.body.style.width = originalStyles.width;

            // Restaurar posição de scroll
            window.scrollTo(0, scrollYRef.current);
        };
    }, [isLocked]);
}

export default useScrollLock;
