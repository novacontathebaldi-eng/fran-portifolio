import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MagneticLetterProps {
    letter: string;
    index: number;
    isItalic?: boolean;
}

const MagneticLetter: React.FC<MagneticLetterProps> = ({ letter, isItalic }) => {
    const letterRef = useRef<HTMLSpanElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!letterRef.current) return;

        const rect = letterRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        // Efeito magnético - letras se afastam do cursor (repulsão)
        const maxOffset = 15;
        const distance = Math.sqrt(distX * distX + distY * distY);
        const maxDistance = 100;

        if (distance < maxDistance) {
            const factor = (1 - distance / maxDistance) * maxOffset;
            setOffset({
                x: (distX / distance) * factor * -0.5,
                y: (distY / distance) * factor * -0.5
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setOffset({ x: 0, y: 0 });
    }, []);

    if (letter === ' ') {
        return <span className="inline-block w-[0.3em]">&nbsp;</span>;
    }

    if (letter === '\n') {
        return <br />;
    }

    return (
        <motion.span
            ref={letterRef}
            className={`magnetic-letter inline-block cursor-default ${isItalic ? 'italic text-accent font-serif' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                x: offset.x,
                y: offset.y,
            }}
            transition={{
                type: "spring",
                stiffness: 350,
                damping: 25,
                mass: 0.5
            }}
            style={{
                display: 'inline-block',
            }}
        >
            {letter}
        </motion.span>
    );
};

interface MagneticTitleProps {
    children: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'span';
    italicWords?: string[]; // Palavras que devem ser itálicas com cor accent
}

export const MagneticTitle: React.FC<MagneticTitleProps> = ({
    children,
    className = '',
    as: Tag = 'h1',
    italicWords = []
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Detectar mobile para desabilitar efeito
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dividir texto em linhas (suporta <br> ou \n)
    const lines = children.split(/(<br\s*\/?>|\n)/gi).filter(Boolean);

    const renderContent = () => {
        return lines.map((line, lineIndex) => {
            if (line.match(/<br\s*\/?>/i) || line === '\n') {
                return <br key={`br-${lineIndex}`} />;
            }

            const words = line.split(' ');

            return words.map((word, wordIndex) => {
                // Checa se a palavra deve ser itálica
                const isItalicWord = italicWords.some(
                    iw => word.toLowerCase().includes(iw.toLowerCase())
                );

                const letters = word.split('').map((letter, letterIndex) => {
                    const globalIndex = lineIndex * 1000 + wordIndex * 100 + letterIndex;

                    // Se for mobile ou não estiver em hover, renderiza sem efeito
                    if (isMobile || !isHovering) {
                        return (
                            <span
                                key={globalIndex}
                                className={`inline-block transition-transform duration-300 ${isItalicWord ? 'italic text-accent font-serif' : ''}`}
                            >
                                {letter}
                            </span>
                        );
                    }

                    // Com efeito magnético
                    return (
                        <MagneticLetter
                            key={globalIndex}
                            letter={letter}
                            index={globalIndex}
                            isItalic={isItalicWord}
                        />
                    );
                });

                return (
                    <span key={`word-${lineIndex}-${wordIndex}`} className="inline-block">
                        {letters}
                        {wordIndex < words.length - 1 && <span className="inline-block w-[0.3em]">&nbsp;</span>}
                    </span>
                );
            });
        });
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative"
        >
            <Tag className={className}>
                {renderContent()}
            </Tag>
        </div>
    );
};

export default MagneticTitle;
