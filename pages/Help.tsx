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
            // Show back to top button
            setShowBackToTop(window.scrollY > 400);

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
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 2.</p>
                                    <p className="text-sm text-gray-400">Inclui: Mapa do site, menus, navegação via chatbot.</p>
                                </div>
                            </HelpSection>

                            {/* Section: Login e Conta */}
                            <HelpSection
                                id="autenticacao"
                                title="Login e Criar Conta"
                                icon={<LogIn className="w-5 h-5" />}
                                isActive={activeSection === 'autenticacao'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 2.</p>
                                    <p className="text-sm text-gray-400">Inclui: Registro, login, recuperação de senha, problemas comuns.</p>
                                </div>
                            </HelpSection>

                            {/* Section: Área do Cliente */}
                            <HelpSection
                                id="area-cliente"
                                title="Área do Cliente"
                                icon={<User className="w-5 h-5" />}
                                isActive={activeSection === 'area-cliente'}
                            >
                                <div className="text-gray-600 space-y-4">
                                    <p>Conteúdo desta seção será adicionado no Prompt 2.</p>
                                    <p className="text-sm text-gray-400">Inclui: Perfil, endereços, orçamentos, agendamentos, projetos.</p>
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
                                Desenvolvido com 💛 por Otávio Thebaldi
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
