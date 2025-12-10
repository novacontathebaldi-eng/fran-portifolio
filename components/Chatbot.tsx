import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Sparkles, User, MapPin, Phone, Instagram, Facebook, RefreshCw, CheckCircle, ExternalLink, Copy, ThumbsUp, ThumbsDown, Check, Calendar, ChevronLeft, ChevronRight, Clock, LogIn, ArrowRight, Archive, History, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { ChatMessage, Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { loadBrevoConversations, openBrevoChat } from '../utils/brevoConversations';
import ServiceRedirectWidget from './ServiceRedirectWidget';
import { normalizeString } from '../utils/stringUtils';


// --- Helper for Markdown ---
const renderFormattedText = (text: string) => {
  if (!text) return null;

  // Regex to match [text](url) OR **bold**
  // Group 1: Link text, Group 2: Link URL
  // Group 3: Bold text
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.*?)\*\*/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // It's a link
      const isInternal = match[2].startsWith('/');
      if (isInternal) {
        parts.push(
          <Link key={match.index} to={match[2]} className="text-blue-600 hover:underline font-medium">
            {match[1]}
          </Link>
        );
      } else {
        parts.push(
          <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
            {match[1]}
          </a>
        );
      }
    } else if (match[3]) {
      // It's bold
      parts.push(<strong key={match.index} className="font-bold">{match[3]}</strong>);
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

// --- GenUI Components (Extracted to prevent re-mounting) ---

const ProjectCarousel = ({ data }: { data: any }) => {
  const { projects } = useProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const category = data?.category;
  // Try to filter by category, but fallback to all projects if no matches
  const categoryFiltered = category
    ? projects.filter(p => normalizeString(p.category).includes(normalizeString(category)))
    : [];
  // Use filtered if found, otherwise show all projects
  const filtered = (category && categoryFiltered.length > 0)
    ? categoryFiltered.slice(0, 4)
    : projects.slice(0, 4);
  const showingFallback = category && categoryFiltered.length === 0 && projects.length > 0;

  // Detect touch device on mount
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
  }, []);

  // Update scroll button visibility
  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [filtered]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 220; // Slightly more than card width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  if (filtered.length === 0) return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
      <p className="text-sm text-gray-600">Carregando projetos...</p>
      <p className="text-xs text-gray-400 mt-1">Se o problema persistir, tente recarregar a página.</p>
    </div>
  );

  return (
    <div className="mt-4 relative">
      {showingFallback && (
        <p className="text-xs text-gray-500 mb-2 italic">
          Não temos projetos "{category}" no momento. Veja nossos outros projetos:
        </p>
      )}
      {/* Left scroll button - Desktop only */}
      {!isTouchDevice && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all -ml-2"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar pl-1 pr-1"
      >
        {filtered.map(p => (
          <Link to={`/project/${p.id}`} key={p.id} className="min-w-[200px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden block hover:border-accent transition group">
            <div className="relative">
              <img src={p.image} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
            </div>
            <div className="p-3">
              <h4 className="font-serif font-bold text-sm truncate">{p.title}</h4>
              <p className="text-xs text-gray-500">{p.category}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Right scroll button - Desktop only */}
      {!isTouchDevice && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all -mr-2"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// --- Cultural Projects Carousel ---
const CulturalCarousel = ({ data }: { data: any }) => {
  const { culturalProjects } = useProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const category = data?.category;
  const filtered = category
    ? culturalProjects.filter(p => normalizeString(p.category || '').includes(normalizeString(category))).slice(0, 4)
    : culturalProjects.slice(0, 4);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
  }, []);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [filtered]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  if (filtered.length === 0) return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
      <p className="text-sm text-gray-600">Ainda não temos projetos culturais cadastrados.</p>
      <p className="text-xs text-gray-400 mt-1">Mas fique à vontade para ver nosso portfólio de arquitetura!</p>
    </div>
  );

  return (
    <div className="mt-4 relative">
      {!isTouchDevice && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all -ml-2"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar pl-1 pr-1"
      >
        {filtered.map(p => (
          <Link to={`/cultural/${p.id}`} key={p.id} className="min-w-[180px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden block hover:border-black transition group">
            <div className="relative">
              <img src={p.image} className="w-full h-28 object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{p.category}</span>
            </div>
            <div className="p-3">
              <h4 className="font-serif font-bold text-sm truncate">{p.title}</h4>
              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {p.location}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!isTouchDevice && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all -mr-2"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// --- Product Carousel (Shop) ---
const ProductCarousel = () => {
  const { shopProducts, settings, fetchShopProducts } = useProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      await fetchShopProducts();
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Filter only active products
  const activeProducts = shopProducts.filter(p => p.status === 'active').slice(0, 5);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
  }, []);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [activeProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 170;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  // Mensagens variadas para loja fechada
  const closedShopMessages = [
    "Nossa loja está fechada no momento, mas logo teremos novidades!",
    "A loja não está disponível agora. Em breve teremos produtos incríveis!",
    "Por ora a loja está em pausa, mas estamos preparando coisas boas!"
  ];

  // Mensagens variadas para sem produtos
  const noProductsMessages = [
    "No momento não temos produtos cadastrados, mas isso pode mudar em breve!",
    "A loja ainda não tem produtos disponíveis. Fique ligado nas novidades!"
  ];

  // If shop is disabled - Show nice styled card
  if (!settings.enableShop) {
    const randomMsg = closedShopMessages[Math.floor(Math.random() * closedShopMessages.length)];
    return (
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center animate-fadeIn">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Archive className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{randomMsg}</p>
        <p className="text-xs text-gray-400">Posso ajudar com outras dúvidas ou você pode deixar uma mensagem.</p>
      </div>
    );
  }

  // Still loading
  if (isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando produtos...
      </div>
    );
  }

  // No active products - Show nice styled card
  if (activeProducts.length === 0) {
    const randomMsg = noProductsMessages[Math.floor(Math.random() * noProductsMessages.length)];
    return (
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center animate-fadeIn">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Archive className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{randomMsg}</p>
        <p className="text-xs text-gray-400">Se precisar de algo mais, é só falar.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 relative">
      {!isTouchDevice && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all -ml-2"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar pl-1 pr-1"
      >
        {activeProducts.map(product => (
          <Link to={`/shop/product/${product.id}`} key={product.id} className="min-w-[150px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden block hover:border-black transition group">
            <div className="relative">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                className="w-full h-28 object-cover"
                loading="lazy"
                decoding="async"
              />
              {product.stock <= 3 && product.stock > 0 && (
                <span className="absolute top-2 right-2 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Últimas!</span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Esgotado</span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h4 className="font-medium text-sm truncate">{product.title}</h4>
              <p className="text-black font-bold text-sm mt-1">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!isTouchDevice && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all -mr-2"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <Link
        to="/shop"
        className="mt-3 w-full block text-center text-xs font-bold text-gray-600 hover:text-black transition py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-black"
      >
        Ver Todos os Produtos →
      </Link>
    </div>
  );
};

// --- Office Map Widget ---
const OfficeMapWidget = () => {
  const { siteContent } = useProjects();
  const [isOpening, setIsOpening] = useState(false);

  const office = siteContent.office;
  const mapQuery = office.mapQuery || office.address || 'Fran Siller Arquitetura';
  const mapsUrl = office.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const handleOpenMaps = () => {
    if (isOpening) return; // Prevent double-click
    setIsOpening(true);
    window.open(mapsUrl, '_blank');
    setTimeout(() => setIsOpening(false), 2000);
  };

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Map Embed */}
      <div className="w-full h-40 bg-gray-100 relative">
        <iframe
          title="Localização do Escritório"
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Office Info */}
      <div className="p-4">
        <h4 className="font-serif font-bold text-sm mb-2">📍 Nosso Escritório</h4>
        <p className="text-xs text-gray-600 leading-relaxed mb-1">{office.address}</p>
        <p className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {office.hoursDescription}
        </p>

        <button
          onClick={handleOpenMaps}
          disabled={isOpening}
          className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${isOpening
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-black text-white hover:bg-accent hover:text-black'
            }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {isOpening ? 'Abrindo...' : 'Abrir no Google Maps'}
        </button>
      </div>
    </div>
  );
};

// Dynamic Social Links Component - reads from database
const SocialLinks = () => {
  const { siteContent } = useProjects();
  const socialLinks = siteContent.office.socialLinks || [];

  // Platform configurations with icons, colors, and URL formatters
  const platformConfig: Record<string, { icon: any; color: string; gradient?: string; urlFormatter?: (url: string) => string; label: string }> = {
    whatsapp: {
      icon: Phone,
      color: '#25D366',
      urlFormatter: (url) => url.startsWith('http') ? url : `https://wa.me/${url.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais.`,
      label: 'WhatsApp'
    },
    instagram: {
      icon: Instagram,
      gradient: 'from-yellow-500 via-red-500 to-purple-600',
      color: '',
      urlFormatter: (url) => url.startsWith('http') ? url : `https://instagram.com/${url.replace('@', '')}`,
      label: 'Instagram'
    },
    facebook: {
      icon: Facebook,
      color: '#1877F2',
      urlFormatter: (url) => url.startsWith('http') ? url : `https://facebook.com/${url}`,
      label: 'Facebook'
    },
    linkedin: {
      icon: ExternalLink,
      color: '#0A66C2',
      urlFormatter: (url) => url.startsWith('http') ? url : `https://linkedin.com/in/${url}`,
      label: 'LinkedIn'
    },
    telegram: {
      icon: Send,
      color: '#0088CC',
      urlFormatter: (url) => url.startsWith('http') ? url : `https://t.me/${url}`,
      label: 'Telegram'
    },
  };

  // Fallback if no social links configured
  if (socialLinks.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-500">Nenhum canal de contato configurado.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {socialLinks.map((link) => {
        const config = platformConfig[link.platform] || { icon: ExternalLink, color: '#666', label: link.platform, gradient: undefined, urlFormatter: undefined };
        const Icon = config.icon;
        const finalUrl = config.urlFormatter ? config.urlFormatter(link.url) : link.url;

        return (
          <a
            key={link.id}
            href={finalUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-between text-white p-3 rounded-lg hover:brightness-105 transition shadow-sm w-full ${config.gradient ? `bg-gradient-to-tr ${config.gradient}` : ''
              }`}
            style={!config.gradient ? { backgroundColor: config.color } : undefined}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <span className="font-bold text-sm block">{link.label || config.label}</span>
                <span className="text-[10px] opacity-90 block">
                  {link.platform === 'whatsapp' ? 'Resposta rápida' : 'Clique para acessar'}
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 opacity-50" />
          </a>
        );
      })}
    </div>
  );
};

// New Success Component
const BookingSuccess = ({ data, closeChat }: { data: any, closeChat: () => void }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-5 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
      <div className="flex items-start gap-3 mb-3">
        <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">Solicitação Enviada</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {data.time}
          </p>
          {data.location && (
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {data.location}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed mb-4">
        <strong>Atenção:</strong> Seu horário está pré-reservado, mas aguarda confirmação da nossa equipe. Você receberá uma notificação assim que aprovarmos.
      </p>

      <button
        onClick={() => { closeChat(); navigate('/profile'); }}
        className="w-full bg-white border border-gray-200 text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
      >
        Acompanhar em Agendamentos <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

const CalendarWidget = ({ data, messageId, closeChat }: { data: any, messageId: string, closeChat: () => void }) => {
  const { currentUser, checkAvailability, siteContent, addAppointment, updateMessageUI, showToast } = useProjects();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);

  // Search ahead for next 5 AVAILABLE days
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    let current = new Date(today);
    // Move to tomorrow if late in the day
    if (today.getHours() > 17) {
      current.setDate(today.getDate() + 1);
    }

    // Look ahead 30 days to find at least 5 available days
    for (let i = 0; i < 30; i++) {
      // Use local timezone instead of UTC to prevent day-before bug
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const slots = checkAvailability(dateStr);

      if (slots.length > 0) {
        dates.push({
          dateObj: new Date(current),
          dateStr: dateStr,
          slots: slots
        });
      }

      if (dates.length >= 5) break;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [checkAvailability]);

  // Auto select first day if available and none selected
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].dateStr);
    }
  }, [availableDates]);

  // Login Check
  if (!currentUser) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center space-y-3 animate-fadeIn">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-500">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Identificação Necessária</h4>
          <p className="text-xs text-gray-500 mt-1">Para confirmar o agendamento, precisamos que você acesse sua conta.</p>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="w-full bg-black text-white py-2.5 rounded-lg text-xs font-bold hover:bg-accent hover:text-black transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-3 h-3" /> Entrar para Agendar
        </button>
      </div>
    );
  }

  const isVisit = data?.type === 'visit';
  const locationText = isVisit
    ? (data?.address || "Endereço da Obra")
    : (data?.location || siteContent.office.address);

  const activeDaySlots = availableDates.find(d => d.dateStr === selectedDate)?.slots || [];

  const handleSlotClick = async (time: string) => {
    if (!selectedDate || !currentUser || loadingSlot) return;

    setLoadingSlot(time);

    const appointmentData = {
      clientId: currentUser.id,
      clientName: currentUser.name,
      date: selectedDate,
      time: time,
      type: data.type || 'meeting',
      location: locationText,
      meetingLink: data.type === 'meeting' && data.modality === 'online' ? null : undefined,
      notes: data.notes
    };

    try {
      await addAppointment(appointmentData);

      // Update UI permanently with Success Component
      updateMessageUI(messageId, {
        type: 'BookingSuccess',
        data: appointmentData
      });

      showToast("Solicitação enviada com sucesso!", "success");

    } catch (error) {
      setLoadingSlot(null);
      showToast("Erro ao realizar agendamento.", "error");
    }
  };

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
            {isVisit ? 'Visita Técnica' : 'Reunião'}
          </span>
          <span className="text-xs text-gray-400 truncate max-w-[200px]" title={locationText}>
            {locationText}
          </span>
        </div>
      </div>

      {availableDates.length > 0 ? (
        <>
          {/* Date Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
            {availableDates.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg border transition ${isSelected ? 'bg-black text-white border-black shadow-md scale-105' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-600'}`}
                >
                  <span className="text-[10px] uppercase font-bold">{d.dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                  <span className="text-sm font-bold">{d.dateObj.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="animate-fadeIn min-h-[100px]">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Horários Livres</p>
            <div className="grid grid-cols-3 gap-2">
              {activeDaySlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => handleSlotClick(slot)}
                  disabled={loadingSlot !== null}
                  className={`py-2 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${loadingSlot === slot ? 'bg-black text-white' : 'hover:border-black hover:bg-black hover:text-white active:scale-95'}`}
                >
                  {loadingSlot === slot ? <Loader2 className="w-3 h-3 animate-spin" /> : slot}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-[100px] flex flex-col items-center justify-center text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Calendar className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Sem datas disponíveis.</p>
          <p className="text-[10px] text-gray-400">Entre em contato via WhatsApp.</p>
        </div>
      )}
    </div>
  );
};

// --- Chatbot Component ---

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  hideButton?: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen: externalIsOpen, onToggle, hideButton = false }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true); // NEW: Show quick action buttons

  const isControlled = externalIsOpen !== undefined && onToggle !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? onToggle : setInternalIsOpen;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { sendMessageToAI, currentUser, addMessage, showToast, currentChatMessages, logAiFeedback, settings, addAppointment, siteContent, archiveCurrentChat, addClientMemory, restoreChatSession, updateMessageUI, clearCurrentChat, shopProducts } = useProjects();

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll Lock for Mobile Logic
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (!isOpen || !isMobile) return;

    document.body.style.overflow = 'hidden';

    const preventScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.chatbot-scroll-view')) {
        return;
      }
      e.preventDefault();
    };

    document.body.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = 'unset';
      document.body.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  const defaultMessages = useMemo<ChatMessage[]>(() => {
    const rawGreeting = settings.aiConfig.defaultGreeting || "Olá. Como posso ajudar?";
    let processedGreeting = rawGreeting;
    if (currentUser) {
      processedGreeting = rawGreeting.replace('{name}', currentUser.name.split(' ')[0]);
    } else {
      processedGreeting = rawGreeting.replace(' {name}', '').replace('{name}', '');
    }

    return [{
      id: 'init',
      role: 'model',
      text: processedGreeting
    }];
  }, [currentUser, settings.aiConfig.defaultGreeting]);

  // Safe display list avoiding crashes if array is undefined during transitions
  const displayMessages = (currentChatMessages && currentChatMessages.length > 0) ? currentChatMessages : defaultMessages;

  // NOTE: Brevo script is loaded ON-DEMAND via openBrevoChat() when user requests human agent
  // This prevents the floating button from appearing before it's needed

  useEffect(() => {
    if (isOpen && !showHistory && lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [displayMessages.length, isOpen, showHistory]);

  const processUserMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userText);

      // Handle Actions - Centralized here to ensure execution
      if (response.actions && response.actions.length > 0) {
        for (const action of response.actions) {
          if (action.type === 'saveNote') {
            const isEmail = action.payload.userContact?.includes('@');
            addMessage({
              name: action.payload.userName,
              email: isEmail ? action.payload.userContact : undefined,
              phone: !isEmail ? action.payload.userContact : undefined,
              message: action.payload.message,
              source: 'chatbot',
              status: 'new'
            });
            showToast("Recado enviado para a equipe.", "success");
          }
          else if (action.type === 'navigate') {
            setTimeout(() => {
              navigate(action.payload.path);
            }, 1500);
          }
          else if (action.type === 'learnMemory') {
            if (currentUser) {
              addClientMemory(action.payload);
              showToast("Preferência registrada com sucesso!", "success");
            }
          }
          else if (action.type === 'requestHuman') {
            openBrevoChat();
            showToast("Abrindo chat com especialista...", "info");
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    setShowQuickActions(false); // Hide quick actions when user sends a message
    processUserMessage(text);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msg: ChatMessage, type: 'like' | 'dislike') => {
    if (msg.feedback === type) return;
    const msgIndex = currentChatMessages.findIndex(m => m.id === msg.id);
    const userMessage = msgIndex > 0 ? currentChatMessages[msgIndex - 1].text : "Contexto desconhecido";

    logAiFeedback({
      userMessage: userMessage || "N/A",
      aiResponse: msg.text || "N/A",
      type: type
    });

    if (type === 'like') showToast("Obrigado pelo feedback positivo!", "success");
    else showToast("Obrigado. Vamos melhorar.", "info");
  };

  const handleArchive = async () => {
    const result = await archiveCurrentChat();

    if (result === 'success') {
      setShowQuickActions(true); // Restore quick actions
      showToast("Conversa arquivada com sucesso.", "success");
    } else if (result === 'guest') {
      // Logic Fix: Do not redirect guests. Just clear the chat.
      clearCurrentChat();
      setShowQuickActions(true); // Restore quick actions
      showToast("Chat limpo. Faça login para salvar o histórico.", "info");
    } else {
      showToast("Erro ao arquivar.", "error");
    }
  };

  const handleRestoreChat = (chatId: string) => {
    restoreChatSession(chatId);
    setShowHistory(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl z-[90] flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111] text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-inner relative">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wide">Concierge Fran Siller</h3>
                  <span className="text-[10px] text-gray-400 block">Sempre disponível para você.</span>
                </div>
              </div>
              <div className="flex gap-2">
                {currentUser && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-full transition ${showHistory ? 'bg-white text-black' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    title="Histórico"
                  >
                    <History className="w-4 h-4" />
                  </button>
                )}
                <button onClick={handleArchive} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white" title="Arquivar e Limpar">
                  <Archive className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-4 h-4 text-gray-400 hover:text-white" /></button>
              </div>
            </div>

            {/* Content Area */}
            {showHistory && currentUser ? (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 chatbot-scroll-view">
                <h4 className="font-bold text-sm mb-4">Conversas Anteriores</h4>
                {currentUser.chats && currentUser.chats.length > 0 ? (
                  <div className="space-y-3">
                    {currentUser.chats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => handleRestoreChat(chat.id)}
                        className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-black transition group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-bold uppercase text-gray-400">{new Date(chat.createdAt).toLocaleDateString()}</p>
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 font-bold">Restaurar</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-2">{chat.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{chat.messages[chat.messages.length - 1]?.text || 'Sem mensagens'}"</p>
                        <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                          {chat.messages.length} mensagens
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">Nenhum histórico salvo.</div>
                )}
                <button onClick={() => setShowHistory(false)} className="mt-4 w-full bg-black text-white py-2 rounded-full text-xs font-bold">Voltar ao Chat Atual</button>
              </div>
            ) : (
              /* Chat Messages */
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6 scroll-smooth chatbot-scroll-view">
                {displayMessages.map((msg: any, idx: number) => (
                  <div
                    key={msg.id}
                    ref={idx === displayMessages.length - 1 ? lastMessageRef : null}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === 'user'
                      ? 'bg-black text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none text-gray-700'
                      }`}>
                      {msg.text && (
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {renderFormattedText(msg.text)}
                        </p>
                      )}

                      {/* GenUI Rendering */}
                      {msg.uiComponent?.type === 'ProjectCarousel' && <ProjectCarousel data={msg.uiComponent.data} />}
                      {msg.uiComponent?.type === 'SocialLinks' && <SocialLinks />}
                      {msg.uiComponent?.type === 'CalendarWidget' && <CalendarWidget data={msg.uiComponent.data} messageId={msg.id} closeChat={() => setIsOpen(false)} />}
                      {msg.uiComponent?.type === 'BookingSuccess' && <BookingSuccess data={msg.uiComponent.data} closeChat={() => setIsOpen(false)} />}
                      {msg.uiComponent?.type === 'ServiceRedirect' && <ServiceRedirectWidget data={msg.uiComponent.data} closeChat={() => setIsOpen(false)} />}
                      {msg.uiComponent?.type === 'CulturalCarousel' && <CulturalCarousel data={msg.uiComponent.data} />}
                      {msg.uiComponent?.type === 'ProductCarousel' && <ProductCarousel />}
                      {msg.uiComponent?.type === 'OfficeMap' && <OfficeMapWidget />}
                    </div>

                    {msg.role === 'model' && (
                      <div className="flex items-center gap-2 mt-1 ml-2 opacity-100 transition-opacity">
                        <button onClick={() => handleCopy(msg.text || '', msg.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition">{copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}</button>
                        <div className="h-3 w-[1px] bg-gray-200"></div>
                        <button onClick={() => handleFeedback(msg, 'like')} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black"><ThumbsUp className="w-3 h-3" /></button>
                        <button onClick={() => handleFeedback(msg, 'dislike')} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black"><ThumbsDown className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                ))}
                {/* Quick Action Buttons - Show only when config allows and no interaction yet */}
                {showQuickActions && settings.chatbotConfig?.showQuickActionsOnOpen && displayMessages.length <= 1 && !isLoading && (
                  <div className="mt-2 mb-4 animate-fadeIn">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-3 text-center">Sugestões Rápidas</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {settings.chatbotConfig.quickActions
                        .filter(qa => qa.active)
                        .filter(qa => !qa.label.includes('Atendente') || settings.chatbotConfig?.transferToHumanEnabled)
                        .sort((a, b) => a.order - b.order)
                        .map((action) => (
                          <button
                            key={action.id}
                            onClick={() => {
                              setShowQuickActions(false); // Hide buttons after click
                              processUserMessage(action.message);
                            }}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm active:scale-95"
                          >
                            {action.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            {!showHistory && (
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-base md:text-sm focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder-gray-400"
                />
                <button type="submit" disabled={isLoading} className="bg-black text-white p-3 rounded-full hover:bg-accent hover:text-black transition disabled:opacity-50 flex-shrink-0 shadow-lg">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && !hideButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-[80] hover:bg-accent hover:text-black transition-all group"
          >
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};