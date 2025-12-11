import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MagneticLetterProps {
    letter: string;
    index: number;
}

const MagneticLetter: React.FC<MagneticLetterProps> = ({ letter, index }) => {
    const letterRef = useRef<HTMLSpanElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!letterRef.current) return;

        const rect = letterRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        // Efeito magnético - letras se afastam do cursor
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
            className="magnetic-letter inline-block cursor-default"
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
    italicWord?: string; // Palavra que deve ser itálica com cor accent
}

export const MagneticTitle: React.FC<MagneticTitleProps> = ({
    children,
    className = '',
    as: Tag = 'h1',
    italicWord
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Detectar mobile para desabilitar efeito
    const isMobile = typeof window !== 'undefined' &&
        (window.innerWidth < 768 || 'ontouchstart' in window);

    // Dividir texto em linhas e depois em palavras
    const lines = children.split(/(<br\s*\/?>|\n)/gi).filter(Boolean);

    const renderContent = () => {
        return lines.map((line, lineIndex) => {
            if (line.match(/<br\s*\/?>/i) || line === '\n') {
                return <br key={`br-${lineIndex}`} />;
            }

            const words = line.split(' ');

            return words.map((word, wordIndex) => {
                const isItalicWord = italicWord && word.toLowerCase().includes(italicWord.toLowerCase());

                const letters = word.split('').map((letter, letterIndex) => {
                    const globalIndex = lineIndex * 1000 + wordIndex * 100 + letterIndex;

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

                    return (
                        <span key={globalIndex} className={isItalicWord ? 'italic text-accent font-serif' : ''}>
                            <MagneticLetter letter={letter} index={globalIndex} />
                        </span>
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
