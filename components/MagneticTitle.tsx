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

        const maxOffset = 20;
        const distance = Math.sqrt(distX * distX + distY * distY);
        const maxDistance = 120;

        if (distance < maxDistance) {
            const factor = (1 - distance / maxDistance) * maxOffset;
            setOffset({
                x: (distX / distance) * factor * -0.6,
                y: (distY / distance) * factor * -0.6
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
                stiffness: 400,
                damping: 20,
                mass: 0.4
            }}
            whileHover={{
                textShadow: "0 0 20px rgba(212, 187, 176, 0.8)",
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
    italicWords?: string[];
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

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const lines = children.split(/(<br\s*\/?>|\n)/gi).filter(Boolean);

    const renderContent = () => {
        return lines.map((line, lineIndex) => {
            if (line.match(/<br\s*\/?>/i) || line === '\n') {
                return <br key={`br-${lineIndex}`} />;
            }

            const words = line.split(' ');

            return words.map((word, wordIndex) => {
                const isItalicWord = italicWords.some(
                    iw => word.toLowerCase().includes(iw.toLowerCase())
                );

                const letters = word.split('').map((letter, letterIndex) => {
                    const globalIndex = lineIndex * 1000 + wordIndex * 100 + letterIndex;

                    if (isMobile || !isHovering) {
                        return (
                            <span
                                key={globalIndex}
                                className={`inline-block transition-all duration-500 ${isItalicWord ? 'italic text-accent font-serif' : ''}`}
                            >
                                {letter}
                            </span>
                        );
                    }

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
        <motion.div
            ref={containerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
            <Tag className={className}>
                {renderContent()}
            </Tag>
        </motion.div>
    );
};

export default MagneticTitle;
