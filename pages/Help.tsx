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
    Headphones, Send, Store, X, Menu, Video, RefreshCw
} from 'lucide-react';
import { openBrevoChat } from '../utils/brevoConversations';
import { sendWhatsAppMessage } from '../utils/whatsappService';

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
    const isOfficeEnabled = isOfficeActive; // Alias for clarity
    const hoursDescription = siteContent?.office?.hoursDescription || '';
    // Check if human support (Brevo live chat) is enabled
    const isHumanSupportEnabled = settings?.chatbotConfig?.transferToHumanEnabled ?? false;

    // Estados do modal WhatsApp
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsAppPhone, setWhatsAppPhone] = useState('');
    const [whatsAppStep, setWhatsAppStep] = useState<'confirm' | 'input' | 'sending' | 'success' | 'error'>('confirm');
    const [useOtherNumber, setUseOtherNumber] = useState(false);

    // Formatar telefone para display
    const formatPhoneDisplay = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    // Handler para abrir modal WhatsApp
    const handleWhatsAppClick = () => {
        const userPhone = (currentUser as any)?.user_metadata?.phone || (currentUser as any)?.phone || '';
        setWhatsAppPhone(userPhone);
        setUseOtherNumber(false);
        setWhatsAppStep(currentUser ? 'confirm' : 'input');
        setShowWhatsAppModal(true);
    };

    // Handler para enviar mensagem via WuzAPI
    const handleSendWhatsAppSupport = async (phone: string) => {
        setWhatsAppStep('sending');
        const userName = (currentUser as any)?.user_metadata?.name || (currentUser as any)?.email?.split('@')[0] || 'visitante';
        const message = `Olá ${userName}! 👋\n\nSou da equipe Fran Siller Arquitetura e recebi sua solicitação de atendimento.\n\nComo posso ajudá-lo(a) hoje?\n\n_Atendimento iniciado via site._`;

        try {
            const success = await sendWhatsAppMessage(phone, message);
            setWhatsAppStep(success ? 'success' : 'error');
        } catch {
            setWhatsAppStep('error');
        }
    };

    // Handler para abrir WhatsApp diretamente
    const openWhatsAppDirect = () => {
        const whatsappNumber = siteContent?.office?.phone?.replace(/\D/g, '');
        const message = encodeURIComponent('Olá! Vim pelo site e gostaria de atendimento.');
        window.open(`https://wa.me/55${whatsappNumber}?text=${message}`, '_blank');
        setShowWhatsAppModal(false);
    };

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
                                                actionHref="/profile/settings"
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
                                                actionHref="/profile/settings"
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
                                                actionHref="/profile/budgets"
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
                                                actionHref="/profile/schedule"
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
                                                actionHref="/profile/projects"
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
                                                    actionHref="/profile/orders"
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

                                    {/* Detalhes Expandidos das Funcionalidades */}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                            <Book className="w-5 h-5 text-accent" />
                                            Guia Detalhado por Seção
                                        </h3>

                                        <div className="space-y-4">
                                            {/* 6.1 Perfil */}
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                                <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-accent" />
                                                    Perfil - Seus Dados
                                                </h4>
                                                <div className="space-y-3 text-sm text-gray-600">
                                                    <div>
                                                        <strong className="text-black">📷 Foto de Perfil:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Clique na foto atual (ou ícone padrão)</li>
                                                            <li>• Selecione uma imagem do seu dispositivo</li>
                                                            <li>• Ajuste o recorte se necessário</li>
                                                            <li>• A foto é salva automaticamente</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong className="text-black">📝 Informações Pessoais:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Nome completo</li>
                                                            <li>• E-mail (não editável - é o login)</li>
                                                            <li>• Telefone/WhatsApp</li>
                                                            <li>• CPF/CNPJ (opcional)</li>
                                                            <li>• Data de nascimento (opcional)</li>
                                                            <li>• Bio/Descrição pessoal</li>
                                                        </ul>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Salvar Alterações</span>
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Sair da Conta</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6.2 Endereços */}
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                                <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-accent" />
                                                    Endereços
                                                </h4>
                                                <div className="space-y-3 text-sm text-gray-600">
                                                    <div>
                                                        <strong className="text-black">Por que cadastrar endereços?</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Agiliza o preenchimento de orçamentos</li>
                                                            <li>• Usado para visitas técnicas</li>
                                                            {isShopEnabled && <li>• Endereço de entrega para loja</li>}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong className="text-black">Como adicionar:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>1. Clique em "+ Novo Endereço"</li>
                                                            <li>2. Dê um apelido (ex: "Casa", "Trabalho")</li>
                                                            <li>3. Digite o CEP (preenche automático)</li>
                                                            <li>4. Complete os dados e clique em "Salvar"</li>
                                                        </ul>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">✏️ Editar</span>
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">🗑️ Excluir</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6.3 Orçamentos */}
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                                <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-accent" />
                                                    Orçamentos (Meus Orçamentos)
                                                </h4>
                                                <div className="space-y-3 text-sm text-gray-600">
                                                    <div>
                                                        <strong className="text-black">Visualização:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Lista com todos os orçamentos solicitados</li>
                                                            <li>• Ordenados por data (mais recentes primeiro)</li>
                                                            <li>• Filtro por status</li>
                                                            <li>• Busca por serviço</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong className="text-black">Cada orçamento mostra:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Data da solicitação</li>
                                                            <li>• Serviços selecionados</li>
                                                            <li>• Localização do projeto</li>
                                                            <li>• Status atual</li>
                                                            <li>• Botão "Ver Detalhes"</li>
                                                        </ul>
                                                    </div>
                                                    {currentUser && (
                                                        <Link
                                                            to="/profile/budgets"
                                                            className="inline-flex items-center gap-2 mt-2 text-sm text-accent font-medium hover:underline"
                                                        >
                                                            Acessar Meus Orçamentos <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 6.4 Agendamentos */}
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                                <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-accent" />
                                                    Agendamentos (Minha Agenda)
                                                </h4>
                                                <div className="space-y-3 text-sm text-gray-600">
                                                    <div>
                                                        <strong className="text-black">Visualização:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Próximos agendamentos em destaque</li>
                                                            <li>• Histórico de reuniões passadas</li>
                                                            <li>• Filtro por tipo e status</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong className="text-black">Ações disponíveis:</strong>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>🔄 <strong>Reagendar:</strong> Escolha nova data e aguarde confirmação</li>
                                                            <li>❌ <strong>Cancelar:</strong> Com antecedência, informe o motivo</li>
                                                            <li>📝 <strong>Ver detalhes:</strong> Notas e informações completas</li>
                                                        </ul>
                                                    </div>
                                                    {currentUser && (
                                                        <Link
                                                            to="/profile/schedule"
                                                            className="inline-flex items-center gap-2 mt-2 text-sm text-accent font-medium hover:underline"
                                                        >
                                                            Acessar Minha Agenda <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 6.5 Projetos */}
                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                                <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                                                    <FolderOpen className="w-4 h-4 text-accent" />
                                                    Projetos (Meus Arquivos)
                                                </h4>
                                                <div className="space-y-3 text-sm text-gray-600">
                                                    <div>
                                                        <strong className="text-black">O que são as pastas de projeto?</strong>
                                                        <p className="mt-1">O escritório pode compartilhar arquivos com você:</p>
                                                        <ul className="mt-1 ml-4 space-y-1">
                                                            <li>• Plantas baixas</li>
                                                            <li>• Renders 3D</li>
                                                            <li>• Documentos técnicos</li>
                                                            <li>• Memoriais descritivos</li>
                                                            <li>• Fotos de acompanhamento</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong className="text-black">Tipos de arquivo suportados:</strong>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">📄 PDF</span>
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">🖼️ JPG/PNG</span>
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">🎥 MP4</span>
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">📐 DWG/CAD</span>
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">🏗️ RVT/IFC</span>
                                                        </div>
                                                    </div>
                                                    {currentUser && (
                                                        <Link
                                                            to="/profile/projects"
                                                            className="inline-flex items-center gap-2 mt-2 text-sm text-accent font-medium hover:underline"
                                                        >
                                                            Acessar Meus Arquivos <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 6.6 Pedidos (Condicional) */}
                                            {isShopEnabled && (
                                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                                    <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                                                        <ShoppingBag className="w-4 h-4 text-accent" />
                                                        Pedidos (Minhas Compras)
                                                    </h4>
                                                    <div className="space-y-3 text-sm text-gray-600">
                                                        <div>
                                                            <strong className="text-black">Visualização:</strong>
                                                            <ul className="mt-1 ml-4 space-y-1">
                                                                <li>• Lista de todos os pedidos</li>
                                                                <li>• Status de cada pedido</li>
                                                                <li>• Valor total</li>
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <strong className="text-black">Status do Pedido:</strong>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">🟡 Pendente</span>
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">🟢 Pago</span>
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">📦 Enviado</span>
                                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">✅ Entregue</span>
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">⚫ Cancelado</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <strong className="text-black">Detalhes do pedido incluem:</strong>
                                                            <ul className="mt-1 ml-4 space-y-1">
                                                                <li>• Itens comprados</li>
                                                                <li>• Endereço de entrega</li>
                                                                <li>• Método de pagamento</li>
                                                                <li>• Código de rastreio (quando enviado)</li>
                                                            </ul>
                                                        </div>
                                                        {currentUser && (
                                                            <Link
                                                                to="/profile/orders"
                                                                className="inline-flex items-center gap-2 mt-2 text-sm text-accent font-medium hover:underline"
                                                            >
                                                                Acessar Minhas Compras <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
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
                                <div className="space-y-8">
                                    {/* Visão Geral */}
                                    <div className="bg-gradient-to-r from-accent/10 to-transparent p-6 rounded-xl border border-accent/20">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-accent" />
                                            Visão Geral do Sistema de Orçamentos
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            O sistema de orçamentos permite que você solicite propostas de forma rápida e organizada.
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span>Selecione os serviços desejados por categoria</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span>Informe a localização do projeto</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span>Adicione observações específicas</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span>Acompanhe o status em tempo real</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/50 px-3 py-2 rounded-lg w-fit">
                                            <Clock className="w-4 h-4" />
                                            <span>Tempo estimado: 3-5 minutos</span>
                                        </div>
                                    </div>

                                    {/* Passo a Passo */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Passo a Passo</h3>
                                        <div className="space-y-4">
                                            <InteractiveStep
                                                step={1}
                                                title="Acesse a página de Serviços"
                                                description="Clique em 'Serviços' no menu principal ou use o botão 'Solicitar Orçamento' na página inicial."
                                                action={{ label: "Ver Serviços", href: "/services" }}
                                            />
                                            <InteractiveStep
                                                step={2}
                                                title="Selecione os Serviços"
                                                description="Os serviços são organizados por categoria. Clique nos que deseja incluir - você pode selecionar múltiplos serviços. Categorias disponíveis: Projetos Residenciais, Comerciais, Interiores, Paisagismo, Reformas e Consultoria."
                                            />
                                            <InteractiveStep
                                                step={3}
                                                title="Informe a Localização"
                                                description="Digite o endereço completo do projeto. Cidade e Estado são extraídos automaticamente. Essa informação é importante para cálculo de deslocamento."
                                            />
                                            <InteractiveStep
                                                step={4}
                                                title="Preencha seus Dados"
                                                description={currentUser
                                                    ? "✅ Você está logado! Seus dados serão preenchidos automaticamente."
                                                    : "Como visitante, preencha seu nome, e-mail e telefone. Se estiver logado, os dados são preenchidos automaticamente."}
                                                action={!currentUser ? { label: "Fazer Login", href: "/auth" } : undefined}
                                            />
                                            <InteractiveStep
                                                step={5}
                                                title="Adicione Observações (Opcional)"
                                                description="Use o campo livre para detalhar seu projeto, informar prazos ou necessidades especiais."
                                            />
                                            <InteractiveStep
                                                step={6}
                                                title="Envie e Acompanhe"
                                                description="Clique em 'Solicitar Orçamento'. Você receberá confirmação por e-mail e WhatsApp (se configurado). Acompanhe o andamento na sua Área do Cliente."
                                                action={{ label: "Meus Orçamentos", href: "/profile/budgets" }}
                                            />
                                        </div>
                                    </div>

                                    {/* Status do Orçamento */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Status do Orçamento</h3>
                                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="text-left px-4 py-3 font-bold">Status</th>
                                                        <th className="text-left px-4 py-3 font-bold">Significado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                                                                🟡 Pendente
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Aguardando análise da equipe</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                                                🔵 Analisando
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Em avaliação pelo escritório</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                                                🟢 Orçado
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Proposta pronta - verifique os detalhes</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                                ✅ Concluído
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Orçamento finalizado</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                                                                ⚫ Cancelado
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Cancelado pelo cliente ou escritório</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* FAQ */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Dúvidas Frequentes</h3>
                                        <TroubleshootingTable
                                            problems={[
                                                {
                                                    issue: "Quanto tempo demora para receber o orçamento?",
                                                    solution: "Geralmente 2-5 dias úteis, dependendo da complexidade do projeto."
                                                },
                                                {
                                                    issue: "Posso alterar meu pedido depois de enviar?",
                                                    solution: "Sim! Entre em contato pelo chat ou WhatsApp para solicitar alterações."
                                                },
                                                {
                                                    issue: "O orçamento é gratuito?",
                                                    solution: "Sim, a solicitação inicial é sem compromisso."
                                                }
                                            ]}
                                        />
                                    </div>

                                    {/* CTA */}
                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            to="/services"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Solicitar Orçamento
                                        </Link>
                                        {currentUser && (
                                            <Link
                                                to="/profile/budgets"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                Meus Orçamentos
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </HelpSection>

                            {/* Section: Agendar Reunião */}
                            <HelpSection
                                id="agendamento"
                                title="Como Agendar Reunião"
                                icon={<Calendar className="w-5 h-5" />}
                                isActive={activeSection === 'agendamento'}
                            >
                                <div className="space-y-8">
                                    {/* Tipos de Reunião */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Tipos de Reunião Disponíveis</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {/* Videochamada */}
                                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Video className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">Videochamada</h4>
                                                        <span className="text-xs text-blue-600">~30 minutos (estimado)</span>
                                                    </div>
                                                </div>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    <li>• Via Google Meet</li>
                                                    <li>• Conheça o escritório virtualmente</li>
                                                    <li>• Ideal para consultoria inicial</li>
                                                </ul>
                                            </div>

                                            {/* Reunião Presencial - Condicional */}
                                            {isOfficeEnabled && (
                                                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <MapPin className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold">Reunião Presencial</h4>
                                                            <span className="text-xs text-purple-600">~45 minutos (estimado)</span>
                                                        </div>
                                                    </div>
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        <li>• No escritório Fran Siller</li>
                                                        <li>• Conheça o espaço pessoalmente</li>
                                                        <li>• Ideal para apresentação de projetos</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Ligação Telefônica */}
                                            <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <Phone className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">Ligação Telefônica</h4>
                                                        <span className="text-xs text-green-600">~15 minutos (estimado)</span>
                                                    </div>
                                                </div>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    <li>• Conversa rápida por telefone</li>
                                                    <li>• Para dúvidas específicas</li>
                                                    <li>• Resolução ágil</li>
                                                </ul>
                                            </div>

                                            {/* Visita Técnica */}
                                            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                        <Home className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">Visita Técnica</h4>
                                                        <span className="text-xs text-orange-600">varia conforme projeto</span>
                                                    </div>
                                                </div>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    <li>• No local do seu projeto</li>
                                                    <li>• Análise presencial do espaço</li>
                                                    <li>• Ideal para reformas e construções</li>
                                                </ul>
                                            </div>
                                        </div>
                                        {/* Nota sobre tempos */}
                                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                            <div className="flex items-start gap-2">
                                                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800">
                                                    <strong>Sobre os tempos:</strong> As durações indicadas são estimativas e podem variar conforme a complexidade do projeto e as necessidades de cada reunião.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Link
                                                to="/schedule"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Agendar Agora
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Processo de Agendamento */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Processo de Agendamento</h3>
                                        <div className="space-y-4">
                                            <InteractiveStep
                                                step={1}
                                                title="Escolha o Tipo de Reunião"
                                                description="Selecione uma das opções disponíveis: Videochamada, Ligação Telefônica ou Visita Técnica."
                                            />
                                            <InteractiveStep
                                                step={2}
                                                title="Para Visita Técnica: Informe o Endereço"
                                                description="Digite o endereço do local a ser visitado. Se estiver logado, pode usar um endereço já cadastrado na sua conta."
                                            />
                                            <InteractiveStep
                                                step={3}
                                                title="Escolha a Data"
                                                description={`Veja o calendário com dias disponíveis. Dias bloqueados aparecem desabilitados. ${hoursDescription ? `Horário de funcionamento: ${hoursDescription}.` : ''}`}
                                            />
                                            <InteractiveStep
                                                step={4}
                                                title="Selecione o Horário"
                                                description="Horários disponíveis aparecem em destaque. Horários ocupados ficam indisponíveis."
                                            />
                                            <InteractiveStep
                                                step={5}
                                                title="Confirme seus Dados"
                                                description={currentUser
                                                    ? "✅ Você está logado! Confirme seus dados de contato."
                                                    : "Será solicitado login ou registro para confirmar o agendamento."}
                                                action={!currentUser ? { label: "Fazer Login", href: "/auth" } : undefined}
                                            />
                                            <InteractiveStep
                                                step={6}
                                                title="Receba a Confirmação"
                                                description="Você receberá confirmação por e-mail e WhatsApp. O status será 'Pendente' até confirmação do escritório."
                                            />
                                        </div>
                                    </div>

                                    {/* Gerenciar Agendamentos */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Gerenciar seus Agendamentos</h3>
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                            <p className="text-gray-600 mb-4">Na sua Área do Cliente, você pode:</p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span>Ver todos os agendamentos</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <RefreshCw className="w-4 h-4 text-blue-500" />
                                                    <span>Solicitar reagendamento</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <X className="w-4 h-4 text-red-500" />
                                                    <span>Cancelar (com antecedência)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                    <span>Ver notas e detalhes</span>
                                                </div>
                                            </div>
                                            {currentUser && (
                                                <Link
                                                    to="/profile/schedule"
                                                    className="inline-flex items-center gap-2 mt-4 text-sm text-black font-medium hover:text-accent transition-colors"
                                                >
                                                    Acessar Meus Agendamentos <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status do Agendamento */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Status do Agendamento</h3>
                                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="text-left px-4 py-3 font-bold">Status</th>
                                                        <th className="text-left px-4 py-3 font-bold">Significado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                                                                🟡 Pendente
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Aguardando confirmação do escritório</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                                                🟢 Confirmado
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Data e horário confirmados</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                                                🔵 Reagendando
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Alteração de horário em andamento</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                                                                ⚫ Cancelado
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">Agendamento cancelado</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            to="/schedule"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Agendar Reunião
                                        </Link>
                                        {currentUser && (
                                            <Link
                                                to="/profile/schedule"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                Meus Agendamentos
                                            </Link>
                                        )}
                                    </div>
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
                                    <div className="space-y-8">
                                        {/* Navegando na Loja */}
                                        <div>
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                <Store className="w-5 h-5 text-accent" />
                                                Navegando na Loja
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                    <h4 className="font-bold text-black mb-3">Como Acessar</h4>
                                                    <ul className="text-sm text-gray-600 space-y-2">
                                                        <li className="flex items-center gap-2">
                                                            <ArrowRight className="w-4 h-4 text-accent" />
                                                            Menu principal → "Loja"
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <ArrowRight className="w-4 h-4 text-accent" />
                                                            Footer → "Loja Online"
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <ArrowRight className="w-4 h-4 text-accent" />
                                                            Chatbot pode mostrar produtos
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                    <h4 className="font-bold text-black mb-3">Recursos de Navegação</h4>
                                                    <div className="grid sm:grid-cols-2 gap-3">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            Grade ou lista de produtos
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            Filtro por categoria
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            Ordenação por preço
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            Busca por nome
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                    <h4 className="font-bold text-black mb-3">Cada Produto Mostra</h4>
                                                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div>📸 Foto principal</div>
                                                        <div>📝 Nome e descrição</div>
                                                        <div>💰 Preço</div>
                                                        <div>✅ Disponibilidade</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Link
                                                    to="/shop"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                                >
                                                    <Store className="w-4 h-4" />
                                                    Visitar a Loja
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Comprando um Produto */}
                                        <div>
                                            <h3 className="font-bold text-lg mb-4">Comprando um Produto</h3>
                                            <div className="space-y-4">
                                                <InteractiveStep
                                                    step={1}
                                                    title="Escolha o Produto"
                                                    description="Clique no produto para ver detalhes. Veja todas as fotos e leia a descrição completa."
                                                    action={{ label: "Ver Loja", href: "/shop" }}
                                                />
                                                <InteractiveStep
                                                    step={2}
                                                    title="Adicione ao Carrinho"
                                                    description="Selecione a quantidade desejada e clique em 'Adicionar ao Carrinho'. Continue comprando ou vá para o carrinho."
                                                />
                                                <InteractiveStep
                                                    step={3}
                                                    title="Revise o Carrinho"
                                                    description="Veja todos os itens, ajuste quantidades, remova itens se necessário e confira o total."
                                                />
                                                <InteractiveStep
                                                    step={4}
                                                    title="Finalize o Checkout"
                                                    description="É necessário fazer login para finalizar. Confirme o endereço de entrega, escolha o método de pagamento e finalize o pedido."
                                                />
                                                <InteractiveStep
                                                    step={5}
                                                    title="Acompanhe seu Pedido"
                                                    description="Você receberá um e-mail de confirmação. Acompanhe o status do pedido na sua Área do Cliente."
                                                    action={currentUser ? { label: "Meus Pedidos", href: "/profile/orders" } : undefined}
                                                />
                                            </div>
                                        </div>

                                        {/* FAQ Compacto */}
                                        <div>
                                            <h3 className="font-bold text-lg mb-4">Dúvidas sobre Compras</h3>
                                            <TroubleshootingTable
                                                problems={[
                                                    {
                                                        issue: "Como rastrear meu pedido?",
                                                        solution: "Na Área do Cliente, seção 'Pedidos'. Você verá o status e código de rastreio quando disponível.",
                                                        action: currentUser ? { label: "Ver Pedidos", href: "/profile/orders" } : undefined
                                                    },
                                                    {
                                                        issue: "Posso cancelar um pedido?",
                                                        solution: "Sim, entre em contato pelo chat ou WhatsApp o mais rápido possível."
                                                    },
                                                    {
                                                        issue: "Quais formas de pagamento?",
                                                        solution: "Pix e Cartão de Crédito."
                                                    },
                                                    {
                                                        issue: "Qual o prazo de entrega?",
                                                        solution: "Varia conforme o produto e sua localização. Calculado no checkout."
                                                    }
                                                ]}
                                            />
                                        </div>

                                        {/* CTA */}
                                        <div className="flex flex-wrap gap-3">
                                            <Link
                                                to="/shop"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                Ver Loja
                                            </Link>
                                            {currentUser && (
                                                <Link
                                                    to="/profile/orders"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
                                                >
                                                    Meus Pedidos
                                                </Link>
                                            )}
                                        </div>
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
                                <div className="space-y-8">
                                    {/* Atendimento - Condicional baseado em isHumanSupportEnabled */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5 text-accent" />
                                            Atendimento
                                        </h3>

                                        {isHumanSupportEnabled ? (
                                            /* ATENDIMENTO ATIVADO */
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 mb-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="font-medium text-green-800">🟢 Atendentes disponíveis</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Como você prefere conversar?
                                                </p>

                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {/* Chat ao Vivo */}
                                                    <button
                                                        onClick={() => openBrevoChat()}
                                                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent hover:shadow-md transition-all group"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                                                            <MessageCircle className="w-6 h-6 text-blue-600 group-hover:text-white" />
                                                        </div>
                                                        <span className="font-bold text-black">Chat ao Vivo</span>
                                                        <span className="text-xs text-gray-500">Resposta imediata</span>
                                                    </button>

                                                    {/* WhatsApp */}
                                                    <button
                                                        onClick={handleWhatsAppClick}
                                                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-500 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                                                            <Phone className="w-6 h-6 text-green-600 group-hover:text-white" />
                                                        </div>
                                                        <span className="font-bold text-black">WhatsApp</span>
                                                        <span className="text-xs text-gray-500">Conversar pelo app</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ATENDIMENTO DESATIVADO */
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 mb-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                                    <span className="font-medium text-gray-600">🔴 Atendentes indisponíveis no momento</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Nosso horário: {siteContent.office?.hoursDescription || 'Segunda a Sexta, 09h às 17h'}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Enquanto isso, você pode:
                                                </p>

                                                <div className="grid gap-3">
                                                    {/* Enviar Mensagem */}
                                                    <Link
                                                        to="/contact"
                                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent hover:shadow-md transition-all group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-accent transition-colors">
                                                            <Send className="w-5 h-5 text-blue-600 group-hover:text-black" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-black block">✉️ Enviar uma mensagem</span>
                                                            <span className="text-xs text-gray-500">Responderemos assim que possível</span>
                                                        </div>
                                                    </Link>

                                                    {/* Enviar E-mail */}
                                                    <a
                                                        href={`mailto:${siteContent.office?.email || 'contato@fransiller.com.br'}`}
                                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-400 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                                            <Mail className="w-5 h-5 text-purple-600 group-hover:text-white" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-black block">📧 Enviar e-mail</span>
                                                            <span className="text-xs text-gray-500">{siteContent.office?.email || 'contato@fransiller.com.br'}</span>
                                                        </div>
                                                    </a>

                                                    {/* Usar o Assistente Virtual */}
                                                    <button
                                                        onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
                                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent hover:shadow-md transition-all group text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent transition-colors">
                                                            <HelpCircle className="w-5 h-5 text-accent group-hover:text-black" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-black block">🤖 Usar o Assistente Virtual</span>
                                                            <span className="text-xs text-gray-500">Disponível 24 horas</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Informação sobre horário - Sempre visível */}
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <strong className="text-blue-800">Horário de Atendimento:</strong>
                                                    <p className="text-blue-700 mt-1">
                                                        {siteContent.office?.hoursDescription || 'Segunda a Sexta, 09h às 17h'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outras Formas de Contato */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Outras Formas de Contato</h3>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* E-mail */}
                                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <Mail className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <h4 className="font-bold">E-mail</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {siteContent.office?.email || 'contato@fransiller.com.br'}
                                                </p>
                                                <a
                                                    href={`mailto:${siteContent.office?.email || 'contato@fransiller.com.br'}`}
                                                    className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
                                                >
                                                    Enviar e-mail <ArrowRight className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* Telefone */}
                                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <Phone className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <h4 className="font-bold">Telefone</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {siteContent.office?.phone || '+55 (27) 99667-0426'}
                                                </p>
                                                <a
                                                    href={`tel:${siteContent.office?.phone?.replace(/\D/g, '')}`}
                                                    className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
                                                >
                                                    Ligar agora <ArrowRight className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* WhatsApp */}
                                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <h4 className="font-bold">WhatsApp</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {siteContent.office?.phone || '+55 (27) 99667-0426'}
                                                </p>
                                                <a
                                                    href={`https://wa.me/${siteContent.office?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
                                                >
                                                    Abrir WhatsApp <ArrowRight className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* Escritório (Condicional) */}
                                            {isOfficeEnabled && (
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <MapPin className="w-5 h-5 text-orange-600" />
                                                        </div>
                                                        <h4 className="font-bold">Escritório</h4>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {siteContent.office?.address || 'Santa Leopoldina, ES'}
                                                    </p>
                                                    {siteContent.office?.mapsLink && (
                                                        <a
                                                            href={siteContent.office.mapsLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
                                                        >
                                                            Ver no mapa <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Redes Sociais */}
                                    {siteContent.office?.socialLinks && siteContent.office.socialLinks.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-lg mb-4">Redes Sociais</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {siteContent.office.socialLinks.map((social, index) => {
                                                    const iconClass = "w-4 h-4";
                                                    const getSocialIcon = (platform: string) => {
                                                        switch (platform) {
                                                            case 'instagram': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
                                                            case 'facebook': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
                                                            case 'linkedin': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
                                                            case 'youtube': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
                                                            case 'twitter': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
                                                            case 'tiktok': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
                                                            case 'pinterest': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" /></svg>;
                                                            case 'telegram': return <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>;
                                                            case 'whatsapp': return <MessageCircle className={iconClass} />;
                                                            default: return <ExternalLink className={iconClass} />;
                                                        }
                                                    };

                                                    const getHoverClass = (platform: string) => {
                                                        switch (platform) {
                                                            case 'instagram': return 'hover:bg-gradient-to-tr hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white hover:border-transparent';
                                                            case 'facebook': return 'hover:bg-blue-700 hover:text-white hover:border-transparent';
                                                            case 'linkedin': return 'hover:bg-blue-600 hover:text-white hover:border-transparent';
                                                            case 'youtube': return 'hover:bg-red-600 hover:text-white hover:border-transparent';
                                                            case 'twitter': return 'hover:bg-black hover:text-white hover:border-transparent';
                                                            case 'tiktok': return 'hover:bg-black hover:text-white hover:border-transparent';
                                                            case 'telegram': return 'hover:bg-sky-500 hover:text-white hover:border-transparent';
                                                            case 'whatsapp': return 'hover:bg-green-500 hover:text-white hover:border-transparent';
                                                            default: return 'hover:bg-gray-800 hover:text-white hover:border-transparent';
                                                        }
                                                    };

                                                    // Link correto para WhatsApp (wa.me em vez de rota local)
                                                    const getLink = () => {
                                                        if (social.platform === 'whatsapp') {
                                                            return `https://wa.me/55${social.url?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim pelo site.')}`;
                                                        }
                                                        return social.url;
                                                    };

                                                    return (
                                                        <a
                                                            key={index}
                                                            href={getLink()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full transition-all text-sm font-medium ${getHoverClass(social.platform)}`}
                                                        >
                                                            {getSocialIcon(social.platform)}
                                                            {social.label || social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assistente Virtual 24h */}
                                    <div className="p-5 bg-gradient-to-r from-accent/10 to-transparent rounded-xl border border-accent/20">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                                <HelpCircle className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-black mb-1">🤖 Assistente Virtual 24h</h4>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Nosso assistente virtual está disponível 24 horas para tirar suas dúvidas,
                                                    mostrar projetos e ajudar você a navegar pelo site.
                                                </p>
                                                <button
                                                    onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Falar com o Assistente
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Formulário de Contato */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Enviar Mensagem</h3>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-600 mb-3">
                                                Prefere enviar uma mensagem por escrito? Use nosso formulário de contato
                                                e responderemos o mais breve possível.
                                            </p>
                                            <Link
                                                to="/contact"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                                            >
                                                <Send className="w-4 h-4" />
                                                Ir para Contato
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </HelpSection>

                            {/* Modal WhatsApp */}
                            <AnimatePresence>
                                {showWhatsAppModal && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                        onClick={() => setShowWhatsAppModal(false)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <Phone className="w-5 h-5 text-green-500" />
                                                    📱 Continuar pelo WhatsApp
                                                </h3>
                                                <button
                                                    onClick={() => setShowWhatsAppModal(false)}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Conteúdo baseado no estado */}
                                            {whatsAppStep === 'confirm' && currentUser && !useOtherNumber && (
                                                <div className="space-y-4">
                                                    <p className="text-gray-600">Vamos usar o número da sua conta:</p>
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                                        <Phone className="w-5 h-5 text-green-500" />
                                                        <span className="font-medium text-lg">
                                                            +55 {formatPhoneDisplay(whatsAppPhone)}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleSendWhatsAppSupport(whatsAppPhone)}
                                                            className="w-full py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                            Continuar com este número
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setUseOtherNumber(true);
                                                                setWhatsAppStep('input');
                                                                setWhatsAppPhone('');
                                                            }}
                                                            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            ✏️ Usar outro número
                                                        </button>
                                                        <button
                                                            onClick={openWhatsAppDirect}
                                                            className="w-full py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            💬 Prefiro mandar mensagem eu mesmo
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {(whatsAppStep === 'input' || (!currentUser && whatsAppStep === 'confirm')) && (
                                                <div className="space-y-4">
                                                    <p className="text-gray-600">
                                                        {currentUser ? 'Digite o número que deseja usar:' : 'Digite seu número de WhatsApp:'}
                                                    </p>
                                                    <input
                                                        type="tel"
                                                        value={whatsAppPhone}
                                                        onChange={(e) => setWhatsAppPhone(e.target.value)}
                                                        placeholder="(27) 99999-9999"
                                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg"
                                                    />
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleSendWhatsAppSupport(whatsAppPhone)}
                                                            disabled={!whatsAppPhone || whatsAppPhone.replace(/\D/g, '').length < 10}
                                                            className="w-full py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                            {currentUser ? 'Continuar com este número' : 'Receber mensagem neste número'}
                                                        </button>
                                                        <button
                                                            onClick={openWhatsAppDirect}
                                                            className="w-full py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            💬 Prefiro mandar mensagem eu mesmo
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {whatsAppStep === 'sending' && (
                                                <div className="text-center py-8">
                                                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                                    <p className="text-gray-600">Enviando mensagem...</p>
                                                </div>
                                            )}

                                            {whatsAppStep === 'success' && (
                                                <div className="text-center py-8">
                                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                                    </div>
                                                    <h4 className="font-bold text-lg mb-2">✅ Mensagem enviada!</h4>
                                                    <p className="text-gray-600 mb-4">
                                                        Em breve você receberá uma mensagem no seu WhatsApp.
                                                        <br />
                                                        Fique de olho no seu celular! 📱
                                                    </p>
                                                    <button
                                                        onClick={() => setShowWhatsAppModal(false)}
                                                        className="py-2 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                                                    >
                                                        Fechar
                                                    </button>
                                                </div>
                                            )}

                                            {whatsAppStep === 'error' && (
                                                <div className="text-center py-8">
                                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <XCircle className="w-8 h-8 text-red-500" />
                                                    </div>
                                                    <h4 className="font-bold text-lg mb-2">❌ Erro ao enviar</h4>
                                                    <p className="text-gray-600 mb-4">
                                                        Não foi possível enviar a mensagem. Tente novamente ou envie você mesmo.
                                                    </p>
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            onClick={() => setWhatsAppStep(currentUser ? 'confirm' : 'input')}
                                                            className="py-2 px-4 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
                                                        >
                                                            Tentar novamente
                                                        </button>
                                                        <button
                                                            onClick={openWhatsAppDirect}
                                                            className="py-2 px-4 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
                                                        >
                                                            Enviar eu mesmo
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
