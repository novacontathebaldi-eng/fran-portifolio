import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import {
    Search, Book, ChevronDown, ChevronRight, ChevronUp,
    HelpCircle, MessageCircle, Phone, Mail, User, LogIn,
    Settings, FileText, Shield, Home, Briefcase, Calendar,
    ShoppingBag, FolderOpen, MapPin, Image, Clock, ArrowRight,
    ExternalLink, CheckCircle, XCircle, AlertTriangle, Info,
    Headphones, Send, Store, X, Menu
} from 'lucide-react';
import { openBrevoChat } from '../utils/brevoConversations';

// ============================================
// INTERFACES
// ============================================

interface HelpSectionProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    isActive?: boolean;
    onToggle?: (id: string) => void;
}

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'success' | 'warning';
}

interface TableOfContentsItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    category: string;
}

interface SearchResult {
    sectionId: string;
    sectionTitle: string;
    matchText: string;
    matchType: 'title' | 'content';
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const accordionVariants = {
    collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const drawerVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } }
};

// ============================================
// NEW INTERFACES FOR PROMPT 2
// ============================================

interface InteractiveStepProps {
    step: number;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    icon?: React.ReactNode;
    highlight?: boolean;
}

interface Problem {
    issue: string;
    solution: string;
    action?: { label: string; href: string };
}

interface TroubleshootingTableProps {
    problems: Problem[];
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    actionLabel?: string;
    actionHref?: string;
}

interface SiteMapItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    description?: string;
    children?: React.ReactNode;
    isConditional?: boolean;
    conditionMet?: boolean;
}

// ============================================
// INTERACTIVE STEP COMPONENT
// ============================================

const InteractiveStep: React.FC<InteractiveStepProps> = ({
    step,
    title,
    description,
    action,
    icon,
    highlight = false
}) => {
    const navigate = useNavigate();

    const handleAction = () => {
        if (action?.onClick) {
            action.onClick();
        } else if (action?.href) {
            navigate(action.href);
        }
    };

    return (
        <div className={`flex gap-4 p-4 rounded-xl transition-colors ${highlight ? 'bg-accent/10 border border-accent/20' : 'bg-gray-50'}`}>
            <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${highlight ? 'bg-accent text-black' : 'bg-black text-white'}`}>
                    {icon || step}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-black mb-1">{title}</h4>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                {action && (
                    <button
                        onClick={handleAction}
                        className="inline-flex items-center gap-2 text-sm font-medium text-black hover:text-accent transition-colors group"
                    >
                        {action.label}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================
// TROUBLESHOOTING TABLE COMPONENT
// ============================================

const TroubleshootingTable: React.FC<TroubleshootingTableProps> = ({ problems }) => {
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left p-4 font-bold text-gray-700 border-b">Problema</th>
                        <th className="text-left p-4 font-bold text-gray-700 border-b">Solução</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map((problem, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-600 align-top">
                                <div className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span>{problem.issue}</span>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600 align-top">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span>{problem.solution}</span>
                                        {problem.action && (
                                            <button
                                                onClick={() => navigate(problem.action!.href)}
                                                className="block mt-2 text-xs font-medium text-accent hover:underline"
                                            >
                                                {problem.action.label} →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ============================================
// FEATURE CARD COMPONENT
// ============================================

const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    features,
    actionLabel,
    actionHref
}) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-black">{title}</h4>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <ul className="space-y-2 mb-4">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>
            {actionLabel && actionHref && (
                <button
                    onClick={() => navigate(actionHref)}
                    className="text-sm font-medium text-black hover:text-accent transition-colors flex items-center gap-1"
                >
                    {actionLabel}
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// ============================================
// SITE MAP ITEM COMPONENT
// ============================================

const SiteMapItem: React.FC<SiteMapItemProps> = ({
    icon,
    label,
    href,
    description,
    children,
    isConditional = false,
    conditionMet = true
}) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    if (isConditional && !conditionMet) return null;

    return (
        <div className="relative">
            <button
                onClick={() => navigate(href)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left group"
            >
                <span className="text-gray-500">{icon}</span>
                <span className="font-medium text-gray-700 group-hover:text-black transition-colors">
                    {label}
                </span>
                {isConditional && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Condicional
                    </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
            </button>
            {description && isHovered && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-black text-white text-xs p-2 rounded-lg shadow-lg max-w-48 whitespace-normal">
                    {description}
                </div>
            )}
            {children && (
                <div className="ml-8 pl-4 border-l-2 border-gray-200 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
};

// ============================================
// QUICK ACTION CARD COMPONENT
// ============================================

const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    description,
    icon,
    href,
    onClick,
    variant = 'default'
}) => {
    const navigate = useNavigate();

    const variantStyles = {
        default: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md',
        primary: 'bg-black text-white border-black hover:bg-gray-800 hover:shadow-lg',
        success: 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-md',
        warning: 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-md'
    };

    const iconStyles = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-white/20 text-white',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-amber-100 text-amber-600'
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (href) {
            navigate(href);
        }
    };

    return (
        <motion.button
            variants={cardVariants}
            onClick={handleClick}
            className={`w-full p-5 rounded-xl border transition-all duration-200 text-left group ${variantStyles[variant]}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${iconStyles[variant]} transition-colors`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg mb-1 ${variant === 'primary' ? 'text-white' : 'text-black'}`}>
                        {title}
                    </h3>
                    <p className={`text-sm ${variant === 'primary' ? 'text-white/80' : 'text-gray-500'}`}>
                        {description}
                    </p>
                </div>
                <ArrowRight className={`w-5 h-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${variant === 'primary' ? 'text-white' : 'text-gray-400'}`} />
            </div>
        </motion.button>
    );
};

// ============================================
// HELP SECTION COMPONENT
// ============================================

const HelpSection: React.FC<HelpSectionProps> = ({
    id,
    title,
    icon,
    children,
    defaultOpen = false,
    isActive = false,
    onToggle
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const sectionRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onToggle?.(id);
    };

    // Handle hash navigation
    useEffect(() => {
        if (window.location.hash === `#${id}`) {
            setIsOpen(true);
            setTimeout(() => {
                sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [id]);

    return (
        <motion.div
            ref={sectionRef}
            id={id}
            variants={sectionVariants}
            className={`bg-white rounded-xl border transition-colors duration-200 ${isActive ? 'border-black ring-2 ring-black/5' : 'border-gray-200'}`}
        >
            <button
                onClick={handleToggle}
                className="w-full p-5 flex items-center justify-between text-left group hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={isOpen}
                aria-controls={`${id}-content`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}`}>
                        {icon}
                    </div>
                    <h2 className="text-lg font-bold text-black">{title}</h2>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={`${id}-content`}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionVariants}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================
// SEARCH BAR COMPONENT
// ============================================

interface SearchBarProps {
    onSearch: (query: string) => void;
    results: SearchResult[];
    onResultClick: (sectionId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, results, onResultClick }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut: Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                // Ensure the input is scrolled into view if needed
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (e.key === 'Escape') {
                inputRef.current?.blur();
                setQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleResultClick = (sectionId: string) => {
        onResultClick(sectionId);
        setQuery('');
        setIsFocused(false);
        inputRef.current?.blur();
    };

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <div className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${isFocused ? 'border-black shadow-lg' : 'border-gray-200'}`}>
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Buscar na Central de Ajuda..."
                    className="w-full py-4 px-4 bg-transparent outline-none text-black placeholder-gray-400"
                />
                <div className="hidden sm:flex items-center gap-1 mr-4 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">K</kbd>
                </div>
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {isFocused && query.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                    >
                        {results.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto">
                                {results.map((result, index) => (
                                    <button
                                        key={`${result.sectionId}-${index}`}
                                        onClick={() => handleResultClick(result.sectionId)}
                                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                    >
                                        <div className="font-medium text-black">{result.sectionTitle}</div>
                                        <div className="text-sm text-gray-500 truncate">{result.matchText}</div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Nenhum resultado encontrado</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================
// TABLE OF CONTENTS COMPONENT
// ============================================

interface TableOfContentsProps {
    items: TableOfContentsItem[];
    activeSection: string;
    onItemClick: (id: string) => void;
    enableShop: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
    items,
    activeSection,
    onItemClick,
    enableShop
}) => {
    // Group items by category
    const groupedItems = useMemo(() => {
        const groups: Record<string, TableOfContentsItem[]> = {};
        items.forEach(item => {
            // Skip shop items if shop is disabled
            if (item.category === 'Loja' && !enableShop) return;

            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        });
        return groups;
    }, [items, enableShop]);

    const categoryIcons: Record<string, React.ReactNode> = {
        'Navegação': <Home className="w-4 h-4" />,
        'Conta': <User className="w-4 h-4" />,
        'Serviços': <Briefcase className="w-4 h-4" />,
        'Loja': <ShoppingBag className="w-4 h-4" />,
        'Suporte': <MessageCircle className="w-4 h-4" />,
        'Legal': <Shield className="w-4 h-4" />
    };

    return (
        <nav className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 mb-3 px-2">
                        {categoryIcons[category]}
                        <span>{category}</span>
                    </div>
                    <ul className="space-y-1">
                        {categoryItems.map(item => (
                            <li key={item.id}>
                                <button
                                    ref={el => {
                                        if (activeSection === item.id && el) {
                                            // Scroll to keep active item visible in the container
                                            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                        }
                                    }}
                                    onClick={() => onItemClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === item.id
                                        ? 'bg-black text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                                        }`}
                                >
                                    <span className="opacity-70">{item.icon}</span>
                                    <span className="text-sm font-medium truncate">{item.title}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
};

// ============================================
// MOBILE TOC DRAWER
// ============================================

interface MobileTOCDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: TableOfContentsItem[];
    activeSection: string;
    onItemClick: (id: string) => void;
    enableShop: boolean;
}

const MobileTOCDrawer: React.FC<MobileTOCDrawerProps> = ({
    isOpen,
    onClose,
    items,
    activeSection,
    onItemClick,
    enableShop
}) => {
    const handleItemClick = (id: string) => {
        onItemClick(id);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 lg:hidden max-h-[70vh] overflow-hidden flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center py-3">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg">Índice</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <TableOfContents
                                items={items}
                                activeSection={activeSection}
                                onItemClick={handleItemClick}
                                enableShop={enableShop}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ============================================
// MAIN HELP PAGE COMPONENT
// ============================================

export const Help: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings, siteContent, currentUser } = useProjects();

    // State
    const [activeSection, setActiveSection] = useState('');
    const [showMobileTOC, setShowMobileTOC] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Refs for scroll tracking
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    // Check if shop is enabled
    const isShopEnabled = settings?.enableShop ?? false;
    const isOfficeActive = siteContent?.office?.isActive !== false;

    // Table of Contents Items
    const tocItems: TableOfContentsItem[] = useMemo(() => [
        { id: 'navegacao', title: 'Navegação do Site', icon: <Home className="w-4 h-4" />, category: 'Navegação' },
        { id: 'autenticacao', title: 'Login e Conta', icon: <LogIn className="w-4 h-4" />, category: 'Conta' },
        { id: 'area-cliente', title: 'Área do Cliente', icon: <User className="w-4 h-4" />, category: 'Conta' },
        { id: 'orcamento', title: 'Solicitar Orçamento', icon: <FileText className="w-4 h-4" />, category: 'Serviços' },
        { id: 'agendamento', title: 'Agendar Reunião', icon: <Calendar className="w-4 h-4" />, category: 'Serviços' },
        { id: 'loja', title: 'Loja Online', icon: <ShoppingBag className="w-4 h-4" />, category: 'Loja' },
        { id: 'suporte', title: 'Suporte e Contato', icon: <Headphones className="w-4 h-4" />, category: 'Suporte' },
        { id: 'politicas', title: 'Políticas e Termos', icon: <Shield className="w-4 h-4" />, category: 'Legal' },
        { id: 'faq', title: 'Perguntas Frequentes', icon: <HelpCircle className="w-4 h-4" />, category: 'Legal' },
    ], []);

    // Scroll tracking for active section
    useEffect(() => {
        const handleScroll = () => {
            // Calculate footer position to hide back to top button
            const footer = document.querySelector('footer');
            const footerRect = footer?.getBoundingClientRect();
            const isFooterVisible = footerRect ? footerRect.top < window.innerHeight : false;

            // Show back to top button if scrolled down AND footer is not fully overlapping
            setShowBackToTop(window.scrollY > 400 && !isFooterVisible);

            // Find active section based on scroll position
            const sections = tocItems.map(item => ({
                id: item.id,
                element: document.getElementById(item.id)
            })).filter(s => s.element);

            const scrollPosition = window.scrollY + 200;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.element && section.element.offsetTop <= scrollPosition) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [tocItems]);

    // Handle hash navigation on mount
    useEffect(() => {
        if (location.hash) {
            const sectionId = location.hash.slice(1);
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveSection(sectionId);
                }
            }, 100);
        }
    }, [location.hash]);

    // Navigate to section
    const handleNavigateToSection = useCallback((sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(sectionId);
            window.history.replaceState(null, '', `#/help#${sectionId}`);
        }
    }, []);

    // Search handler (placeholder - will be expanded in Prompt 2)
    const handleSearch = useCallback((query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const loweredQuery = query.toLowerCase();
        const results: SearchResult[] = tocItems
            .filter(item => {
                // Skip shop if disabled
                if (item.category === 'Loja' && !isShopEnabled) return false;
                return item.title.toLowerCase().includes(loweredQuery);
            })
            .map(item => ({
                sectionId: item.id,
                sectionTitle: item.title,
                matchText: `Seção: ${item.title}`,
                matchType: 'title' as const
            }));

        setSearchResults(results);
    }, [tocItems, isShopEnabled]);

    // Back to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-black text-white pt-32 pb-16 md:pt-40 md:pb-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                            <HelpCircle className="w-5 h-5 text-accent" />
                            <span className="text-sm font-medium">Central de Ajuda</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">
                            Como podemos ajudar?
                        </h1>
                        <p className="text-lg text-white/70 mb-8">
                            Encontre respostas, tutoriais e orientações sobre todos os recursos do site
                        </p>

                        {/* Search Bar */}
                        <SearchBar
                            onSearch={handleSearch}
                            results={searchResults}
                            onResultClick={handleNavigateToSection}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="flex gap-8">
                    {/* Desktop Sidebar - Table of Contents */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-28 bg-white rounded-xl border border-gray-200 p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Book className="w-5 h-5" />
                                Índice
                            </h2>
                            <TableOfContents
                                items={tocItems}
                                activeSection={activeSection}
                                onItemClick={handleNavigateToSection}
                                enableShop={isShopEnabled}
                            />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Quick Actions */}
                        <motion.section
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="mb-12"
                        >
                            <h2 className="text-2xl font-serif mb-6">Ações Rápidas</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <QuickActionCard
                                    title="Agendar Reunião"
                                    description="Marque uma conversa com nossa equipe"
                                    icon={<Calendar className="w-5 h-5" />}
                                    href="/schedule"
                                    variant="primary"
                                />
                                <QuickActionCard
                                    title="Solicitar Orçamento"
                                    description="Peça um orçamento para seu projeto"
                                    icon={<FileText className="w-5 h-5" />}
                                    href="/services"
                                    variant="default"
                                />
                                <QuickActionCard
                                    title={currentUser ? 'Minha Conta' : 'Fazer Login'}
                                    description={currentUser ? 'Acesse sua área do cliente' : 'Entre na sua conta ou cadastre-se'}
                                    icon={<User className="w-5 h-5" />}
                                    href={currentUser ? '/client' : '/auth'}
                                    variant="default"
                                />
                                <QuickActionCard
                                    title="Falar com Suporte"
                                    description="Entre em contato conosco"
                                    icon={<MessageCircle className="w-5 h-5" />}
                                    href="/contact"
                                    variant="success"
                                />
                            </div>
                        </motion.section>

                        {/* Help Sections */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {/* Section: Navegação do Site */}
                            <HelpSection
                                id="navegacao"
                                title="Como Navegar no Site"
                                icon={<Home className="w-5 h-5" />}
                                isActive={activeSection === 'navegacao'}
                                defaultOpen={false}
                            >
                                <div className="space-y-8">
                                    {/* Mapa do Site */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-accent" />
                                            Mapa do Site
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Confira todas as páginas disponíveis no site. Clique em qualquer item para navegar diretamente.
                                        </p>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                            <SiteMapItem
                                                icon={<Home className="w-4 h-4" />}
                                                label="Início"
                                                href="/"
                                                description="Página principal do site"
                                            />
                                            <SiteMapItem
                                                icon={<User className="w-4 h-4" />}
                                                label="Sobre a Fran Siller"
                                                href="/about"
                                                description="Conheça a arquiteta"
                                            />
                                            <SiteMapItem
                                                icon={<FolderOpen className="w-4 h-4" />}
                                                label="Portfólio"
                                                href="/portfolio"
                                                description="Projetos realizados"
                                            >
                                                <SiteMapItem
                                                    icon={<FileText className="w-4 h-4" />}
                                                    label="Detalhes do Projeto"
                                                    href="/portfolio"
                                                    description="Veja cada projeto em detalhes"
                                                />
                                            </SiteMapItem>
                                            <SiteMapItem
                                                icon={<Image className="w-4 h-4" />}
                                                label="Projetos Culturais"
                                                href="/cultural"
                                                description="Arte e cultura"
                                            />
                                            <SiteMapItem
                                                icon={<Briefcase className="w-4 h-4" />}
                                                label="Serviços"
                                                href="/services"
                                                description="Solicite um orçamento"
                                            />
                                            <SiteMapItem
                                                icon={<Calendar className="w-4 h-4" />}
                                                label="Agendar Reunião"
                                                href="/schedule"
                                                description="Marque uma conversa"
                                            />
                                            <SiteMapItem
                                                icon={<MapPin className="w-4 h-4" />}
                                                label="O Escritório"
                                                href="/office"
                                                description="Conheça nosso espaço"
                                                isConditional
                                                conditionMet={isOfficeActive}
                                            />
                                            <SiteMapItem
                                                icon={<ShoppingBag className="w-4 h-4" />}
                                                label="Loja"
                                                href="/shop"
                                                description="Produtos exclusivos"
                                                isConditional
                                                conditionMet={isShopEnabled}
                                            >
                                                {isShopEnabled && (
                                                    <>
                                                        <SiteMapItem
                                                            icon={<ShoppingBag className="w-4 h-4" />}
                                                            label="Carrinho"
                                                            href="/cart"
                                                        />
                                                        <SiteMapItem
                                                            icon={<ShoppingBag className="w-4 h-4" />}
                                                            label="Checkout"
                                                            href="/checkout"
                                                        />
                                                    </>
                                                )}
                                            </SiteMapItem>
                                            <SiteMapItem
                                                icon={<Mail className="w-4 h-4" />}
                                                label="Contato"
                                                href="/contact"
                                                description="Fale conosco"
                                            />
                                            <SiteMapItem
                                                icon={<LogIn className="w-4 h-4" />}
                                                label="Login / Cadastro"
                                                href="/auth"
                                                description="Acesse sua conta"
                                            />
                                            <SiteMapItem
                                                icon={<User className="w-4 h-4" />}
                                                label="Área do Cliente"
                                                href="/profile"
                                                description="Seu espaço exclusivo"
                                            />
                                            <SiteMapItem
                                                icon={<Shield className="w-4 h-4" />}
                                                label="Páginas Legais"
                                                href="/termos"
                                            >
                                                <SiteMapItem
                                                    icon={<FileText className="w-4 h-4" />}
                                                    label="Termos de Uso"
                                                    href="/termos"
                                                />
                                                <SiteMapItem
                                                    icon={<Shield className="w-4 h-4" />}
                                                    label="Política de Privacidade"
                                                    href="/politica-privacidade"
                                                />
                                                <SiteMapItem
                                                    icon={<HelpCircle className="w-4 h-4" />}
                                                    label="Central de Ajuda"
                                                    href="/help"
                                                />
                                            </SiteMapItem>
                                        </div>
                                    </div>

                                    {/* Navegação via Menu */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <Menu className="w-5 h-5 text-accent" />
                                            Navegação via Menu
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-bold text-black mb-2">💻 No Desktop</h4>
                                                <ul className="text-sm text-gray-600 space-y-2">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Menu fixo na parte superior da tela</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Links para todas as seções principais</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Ícones de busca, perfil e carrinho à direita</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-bold text-black mb-2">📱 No Mobile</h4>
                                                <ul className="text-sm text-gray-600 space-y-2">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Toque no ícone ☰ (hambúrguer) no canto superior direito</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Menu abre em tela cheia com todas as opções</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Toque no X para fechar o menu</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navegação via Chatbot */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5 text-accent" />
                                            Navegação via Assistente Virtual
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Nosso assistente virtual pode te ajudar a navegar pelo site de forma conversacional:
                                        </p>
                                        <div className="bg-gradient-to-r from-black/5 to-accent/5 rounded-xl p-5">
                                            <ul className="text-sm text-gray-600 space-y-3 mb-4">
                                                <li className="flex items-start gap-3">
                                                    <span className="bg-accent text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                                    <span>Mostrar projetos do portfólio com filtros personalizados</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="bg-accent text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                                    <span>Agendar reuniões diretamente pelo chat</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="bg-accent text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                                    <span>Tirar dúvidas sobre serviços e valores</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="bg-accent text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                                    <span>Navegar para qualquer página específica</span>
                                                </li>
                                            </ul>
                                            <button
                                                onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Experimentar o Assistente Virtual
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </HelpSection>

                            {/* Section: Login e Conta */}
                            <HelpSection
                                id="autenticacao"
                                title="Login e Criar Conta"
                                icon={<LogIn className="w-5 h-5" />}
                                isActive={activeSection === 'autenticacao'}
                            >
                                <div className="space-y-8">
                                    {/* Criar Conta */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-accent" />
                                            Como Criar uma Conta
                                        </h3>
                                        <div className="space-y-3">
                                            <InteractiveStep
                                                step={1}
                                                title="Acesse a página de registro"
                                                description="Clique no botão abaixo ou acesse através do menu superior."
                                                action={{
                                                    label: "Criar minha conta",
                                                    href: "/auth"
                                                }}
                                            />
                                            <InteractiveStep
                                                step={2}
                                                title="Preencha seus dados"
                                                description="Nome completo, e-mail válido, telefone (WhatsApp) para notificações, e senha (mínimo 6 caracteres)."
                                            />
                                            <InteractiveStep
                                                step={3}
                                                title="Confirme e pronto!"
                                                description="Você receberá uma mensagem de boas-vindas no WhatsApp e já pode acessar a área do cliente."
                                                icon={<CheckCircle className="w-5 h-5" />}
                                                highlight
                                            />
                                        </div>
                                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <div className="flex items-start gap-3">
                                                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-amber-800">
                                                    <strong>Dica:</strong> Use o mesmo e-mail e telefone que pretende usar para comunicações sobre projetos.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fazer Login */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <LogIn className="w-5 h-5 text-accent" />
                                            Como Fazer Login
                                        </h3>
                                        <div className="space-y-3">
                                            <InteractiveStep
                                                step={1}
                                                title="Acesse a página de login"
                                                description="Clique no ícone de usuário no menu ou use o botão abaixo."
                                                action={{
                                                    label: "Fazer Login",
                                                    href: "/auth"
                                                }}
                                            />
                                            <InteractiveStep
                                                step={2}
                                                title="Escolha como entrar"
                                                description="Digite seu e-mail e senha cadastrados. Se disponível, você também pode entrar com Google."
                                            />
                                            <InteractiveStep
                                                step={3}
                                                title="Acesse sua área"
                                                description="Após o login, você será redirecionado para a Área do Cliente."
                                                icon={<CheckCircle className="w-5 h-5" />}
                                                highlight
                                            />
                                        </div>
                                    </div>

                                    {/* Esqueci a Senha */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-accent" />
                                            Esqueci Minha Senha
                                        </h3>
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-800">
                                                    <strong>Atenção:</strong> O link de recuperação expira em 1 hora e só pode ser usado uma vez!
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <InteractiveStep
                                                step={1}
                                                title="Clique em 'Esqueceu a senha?'"
                                                description="Na página de login, encontre o link abaixo do formulário."
                                            />
                                            <InteractiveStep
                                                step={2}
                                                title="Digite seu e-mail cadastrado"
                                                description="Informe o e-mail que você usou para criar sua conta."
                                            />
                                            <InteractiveStep
                                                step={3}
                                                title="Verifique seu e-mail"
                                                description="Você receberá um link de recuperação. Verifique também a pasta de spam."
                                            />
                                            <InteractiveStep
                                                step={4}
                                                title="Crie uma nova senha"
                                                description="Escolha uma senha nova com no mínimo 6 caracteres e confirme."
                                                icon={<CheckCircle className="w-5 h-5" />}
                                                highlight
                                            />
                                        </div>
                                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-green-800">
                                                    <strong>Pronto!</strong> Você pode fazer login com a nova senha imediatamente.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Problemas Comuns */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-accent" />
                                            Problemas Comuns de Login
                                        </h3>
                                        <TroubleshootingTable
                                            problems={[
                                                {
                                                    issue: '"E-mail ou senha incorretos"',
                                                    solution: 'Verifique se digitou corretamente. Senhas diferenciam maiúsculas de minúsculas.',
                                                    action: { label: 'Recuperar senha', href: '/auth' }
                                                },
                                                {
                                                    issue: '"Email não confirmado"',
                                                    solution: 'Verifique sua caixa de entrada e pasta de spam. O e-mail de confirmação pode demorar alguns minutos.'
                                                },
                                                {
                                                    issue: 'Link de recuperação expirou',
                                                    solution: 'Solicite um novo link. Links de recuperação duram apenas 1 hora e só funcionam uma vez.',
                                                    action: { label: 'Solicitar novo link', href: '/auth' }
                                                },
                                                {
                                                    issue: 'Não recebo o e-mail',
                                                    solution: 'Verifique a pasta de spam. Aguarde alguns minutos e tente novamente. Certifique-se que o e-mail está correto.'
                                                },
                                                {
                                                    issue: 'Botão de login não funciona',
                                                    solution: 'Tente atualizar a página (F5) ou limpar o cache do navegador. Use um navegador atualizado.'
                                                }
                                            ]}
                                        />
                                    </div>

                                    {/* CTA para ajuda */}
                                    {!currentUser && (
                                        <div className="p-5 bg-black text-white rounded-xl">
                                            <h4 className="font-bold text-lg mb-2">Pronto para começar?</h4>
                                            <p className="text-white/70 text-sm mb-4">
                                                Crie sua conta agora e tenha acesso a recursos exclusivos.
                                            </p>
                                            <Link
                                                to="/auth"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-black rounded-full font-medium hover:bg-white transition-colors text-sm"
                                            >
                                                <User className="w-4 h-4" />
                                                Criar Minha Conta
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </HelpSection>

                            {/* Section: Área do Cliente */}
                            <HelpSection
                                id="area-cliente"
                                title="Área do Cliente"
                                icon={<User className="w-5 h-5" />}
                                isActive={activeSection === 'area-cliente'}
                            >
                                <div className="space-y-8">
                                    {/* Acesso Rápido */}
                                    {currentUser ? (
                                        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-100 rounded-full">
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-green-800">Você está logado!</h4>
                                                    <p className="text-sm text-green-600">
                                                        Acesse sua área do cliente para gerenciar seu perfil e acompanhar seus projetos.
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                                >
                                                    Acessar Minha Área
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-200 rounded-full">
                                                    <User className="w-6 h-6 text-gray-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800">Faça login para acessar</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Entre na sua conta ou crie uma nova para acessar todos os recursos exclusivos.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link
                                                        to="/auth"
                                                        className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                                    >
                                                        Fazer Login
                                                    </Link>
                                                    <Link
                                                        to="/auth"
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                                                    >
                                                        Criar Conta
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* O que é a Área do Cliente */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <HelpCircle className="w-5 h-5 text-accent" />
                                            O que é a Área do Cliente?
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            A Área do Cliente é seu espaço exclusivo para gerenciar tudo relacionado à sua conta e projetos:
                                        </p>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FileText className="w-5 h-5 text-accent" />
                                                <span className="text-sm text-gray-700">Acompanhar orçamentos</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-accent" />
                                                <span className="text-sm text-gray-700">Gerenciar agendamentos</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FolderOpen className="w-5 h-5 text-accent" />
                                                <span className="text-sm text-gray-700">Acessar arquivos de projetos</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <User className="w-5 h-5 text-accent" />
                                                <span className="text-sm text-gray-700">Atualizar seu perfil</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <MapPin className="w-5 h-5 text-accent" />
                                                <span className="text-sm text-gray-700">Gerenciar endereços</span>
                                            </div>
                                            {isShopEnabled && (
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <ShoppingBag className="w-5 h-5 text-accent" />
                                                    <span className="text-sm text-gray-700">Ver histórico de pedidos</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Abas da Área do Cliente */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-accent" />
                                            Funcionalidades Disponíveis
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FeatureCard
                                                icon={<User className="w-5 h-5" />}
                                                title="Perfil"
                                                description="Suas informações pessoais"
                                                features={[
                                                    "Foto de perfil personalizável",
                                                    "Nome e informações de contato",
                                                    "Dados para comunicação"
                                                ]}
                                                actionLabel="Editar Perfil"
                                                actionHref="/profile"
                                            />
                                            <FeatureCard
                                                icon={<MapPin className="w-5 h-5" />}
                                                title="Endereços"
                                                description="Locais para projetos e entregas"
                                                features={[
                                                    "Cadastre múltiplos endereços",
                                                    "Use para orçamentos",
                                                    "Facilite entregas da loja"
                                                ]}
                                                actionLabel="Ver Endereços"
                                                actionHref="/profile"
                                            />
                                            <FeatureCard
                                                icon={<FileText className="w-5 h-5" />}
                                                title="Orçamentos"
                                                description="Solicitações de projeto"
                                                features={[
                                                    "Lista de todos os orçamentos",
                                                    "Status atualizado em tempo real",
                                                    "Histórico completo"
                                                ]}
                                                actionLabel="Ver Orçamentos"
                                                actionHref="/profile"
                                            />
                                            <FeatureCard
                                                icon={<Calendar className="w-5 h-5" />}
                                                title="Agendamentos"
                                                description="Reuniões e visitas"
                                                features={[
                                                    "Próximos compromissos",
                                                    "Reagendar quando necessário",
                                                    "Notificações automáticas"
                                                ]}
                                                actionLabel="Ver Agendamentos"
                                                actionHref="/profile"
                                            />
                                            <FeatureCard
                                                icon={<FolderOpen className="w-5 h-5" />}
                                                title="Projetos"
                                                description="Arquivos compartilhados"
                                                features={[
                                                    "Pastas organizadas por projeto",
                                                    "Download de arquivos",
                                                    "Visualização de documentos"
                                                ]}
                                                actionLabel="Ver Projetos"
                                                actionHref="/profile"
                                            />
                                            {isShopEnabled && (
                                                <FeatureCard
                                                    icon={<ShoppingBag className="w-5 h-5" />}
                                                    title="Pedidos"
                                                    description="Compras na loja"
                                                    features={[
                                                        "Histórico de compras",
                                                        "Status de entrega",
                                                        "Detalhes das compras"
                                                    ]}
                                                    actionLabel="Ver Pedidos"
                                                    actionHref="/profile"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Dica */}
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <strong>Dica:</strong> Mantenha seus dados sempre atualizados para receber notificações importantes sobre seus projetos via WhatsApp e e-mail.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </HelpSection>

                            {/* Section: Solicitar Orçamento */}
                            <HelpSection
                                id="orcamento"
                                title="Como Solicitar Orçamento"
                                icon={<FileText className="w-5 h-5" />}
                                isActive={activeSection === 'orcamento'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 3.</p>
                                    <p className="text-sm text-gray-400">Inclui: Passo a passo, status, dúvidas frequentes.</p>
                                </div>
                            </HelpSection>

                            {/* Section: Agendar Reunião */}
                            <HelpSection
                                id="agendamento"
                                title="Como Agendar Reunião"
                                icon={<Calendar className="w-5 h-5" />}
                                isActive={activeSection === 'agendamento'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 3.</p>
                                    <p className="text-sm text-gray-400">Inclui: Tipos de reunião, processo, gerenciamento.</p>
                                </div>
                            </HelpSection>

                            {/* Section: Loja (Conditional) */}
                            {isShopEnabled && (
                                <HelpSection
                                    id="loja"
                                    title="Loja Online"
                                    icon={<ShoppingBag className="w-5 h-5" />}
                                    isActive={activeSection === 'loja'}
                                >
                                    <div className="text-gray-600 space-y-4">
                                        <p>Conteúdo desta seção será adicionado no Prompt 4.</p>
                                        <p className="text-sm text-gray-400">Inclui: Navegação, compras, carrinho, pedidos.</p>
                                    </div>
                                </HelpSection>
                            )}

                            {/* Section: Suporte e Contato */}
                            <HelpSection
                                id="suporte"
                                title="Suporte e Contato"
                                icon={<Headphones className="w-5 h-5" />}
                                isActive={activeSection === 'suporte'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 4.</p>
                                    <p className="text-sm text-gray-400">Inclui: Chat ao vivo, WhatsApp, e-mail, redes sociais.</p>
                                </div>
                            </HelpSection>

                            {/* Section: Políticas e Termos */}
                            <HelpSection
                                id="politicas"
                                title="Políticas e Termos"
                                icon={<Shield className="w-5 h-5" />}
                                isActive={activeSection === 'politicas'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 5.</p>
                                    <p className="text-sm text-gray-400">Inclui: Termos de uso, privacidade, cookies, LGPD.</p>
                                </div>
                            </HelpSection>

                            {/* Section: FAQ */}
                            <HelpSection
                                id="faq"
                                title="Perguntas Frequentes"
                                icon={<HelpCircle className="w-5 h-5" />}
                                isActive={activeSection === 'faq'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 5.</p>
                                    <p className="text-sm text-gray-400">Inclui: FAQ geral, dúvidas comuns sobre todos os serviços.</p>
                                </div>
                            </HelpSection>
                        </motion.div>

                        {/* Footer CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 text-center"
                        >
                            <h3 className="text-xl font-bold mb-2">Não encontrou o que procurava?</h3>
                            <p className="text-gray-500 mb-6">Nossa equipe está pronta para ajudar você</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                    Enviar Mensagem
                                </Link>
                                <button
                                    onClick={() => openBrevoChat()}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Iniciar Chat
                                </button>
                            </div>
                            <p className="mt-6 text-xs text-gray-400">
                                Desenvolvido por{' '}
                                <a
                                    href="https://othebaldi.me/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent transition-colors"
                                >
                                    Otávio Siller Thebaldi
                                </a>
                            </p>
                        </motion.div>
                    </main>
                </div>
            </div>

            {/* Mobile TOC Button */}
            <button
                onClick={() => setShowMobileTOC(true)}
                className="fixed bottom-24 left-4 z-40 lg:hidden w-12 h-12 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                aria-label="Abrir índice"
            >
                <Book className="w-5 h-5" />
            </button>

            {/* Mobile TOC Drawer */}
            <MobileTOCDrawer
                isOpen={showMobileTOC}
                onClose={() => setShowMobileTOC(false)}
                items={tocItems}
                activeSection={activeSection}
                onItemClick={handleNavigateToSection}
                enableShop={isShopEnabled}
            />

            {/* Back to Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="fixed bottom-40 right-4 z-30 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors lg:bottom-24 lg:right-6"
                        aria-label="Voltar ao topo"
                    >
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Help;
