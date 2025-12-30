

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useCart } from '../context/CartContext';
import { Chatbot } from './Chatbot';
import InstallButton from './InstallButton';
import { useScrollLock } from '../hooks/useScrollLock';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for Chatbot visibility controlled by Footer
  const [chatOpen, setChatOpen] = useState(false);
  const [hideChatButton, setHideChatButton] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, settings, siteContent } = useProjects();
  const { cartCount } = useCart();

  useEffect(() => {
    // Increased threshold to 50px for a more deliberate transition
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Lock body scroll when menu is open - using robust hook for iOS Safari support
  useScrollLock(isMenuOpen || isClosing);

  // Scroll listener to detect Hero section visibility on Home page
  useEffect(() => {
    const handleHeroDetection = () => {
      // Only apply hero detection on the Home page
      if (location.pathname !== '/') {
        setIsHeroVisible(false);
        return;
      }

      // Hero is considered visible when scroll is less than 85% of viewport height
      const heroThreshold = window.innerHeight * 0.85;
      setIsHeroVisible(window.scrollY < heroThreshold);
    };

    // Initial check
    handleHeroDetection();

    window.addEventListener('scroll', handleHeroDetection, { passive: true });
    return () => window.removeEventListener('scroll', handleHeroDetection);
  }, [location.pathname]);

  // Intersection Observer to hide Chatbot button near Footer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHideChatButton(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1, // Trigger when 10% of the footer is visible
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  // Handle menu close with animation
  const closeMenu = () => {
    setIsClosing(true);
    // Wait for fadeOut animation to complete before closing
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 300); // Slightly shorter than fadeOut (350ms) for smoother transition
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  // Handle Search Typing (Mock Suggestion)
  const showSuggestions = searchQuery.length > 0;

  // Determine if the current page has a hero section that requires a transparent header
  const isOfficeWithHero = location.pathname === '/office' && siteContent?.office?.blocks?.[0]?.type === 'image-full';

  const isTransparentNavPage =
    location.pathname === '/' ||
    location.pathname === '/about' ||
    isOfficeWithHero ||
    location.pathname.startsWith('/project/') ||
    location.pathname.startsWith('/cultural/'); // Assuming Cultural Details might want transparency too

  // Refactored Nav Logic for Smooth Transitions
  // Logic: 
  // 1. Scrolled: Compact (py-4), White/Blur, Shadow.
  // 2. Top + Transparent Page: Tall (py-8), Transparent Gradient, White Text.
  // 3. Top + Standard Page: Tall (py-8), White Background, Black Text.

  const navClasses = isScrolled
    ? 'bg-white/90 backdrop-blur-md shadow-sm py-4 text-primary'
    : isTransparentNavPage
      ? 'bg-gradient-to-b from-black/60 to-transparent py-8 text-white'
      : 'bg-white/95 py-8 text-primary';

  // Text color condition logic maintained for child elements
  const textColorCondition = isScrolled || !isTransparentNavPage;

  const logoClasses = isMenuOpen
    ? 'text-primary'
    : textColorCondition ? 'text-primary' : 'text-white';

  const linkClasses = textColorCondition
    ? 'text-primary hover:text-accent'
    : 'text-white/90 hover:text-white';

  const iconClasses = isMenuOpen
    ? 'text-primary'
    : textColorCondition ? 'text-primary' : 'text-white';

  return (
    <div className="min-h-screen flex flex-col font-sans text-primary bg-white">
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white/98 backdrop-blur-xl z-[70] animate-fadeIn flex flex-col justify-start md:justify-center pt-24 md:pt-0">
          <div className="container mx-auto px-6 py-8 relative">
            <button onClick={() => setSearchOpen(false)} className="absolute top-4 right-4 md:-top-20 md:right-0 p-2 hover:bg-gray-100 rounded-full transition">
              <span className="sr-only">Fechar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center text-gray-400">Buscar Projeto</h2>
            <input
              autoFocus
              type="text"
              placeholder="Digite..."
              className="w-full text-4xl md:text-6xl font-serif text-center border-b-2 border-gray-100 py-4 md:py-8 focus:outline-none focus:border-black bg-transparent placeholder-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {showSuggestions && (
              <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp max-w-4xl mx-auto">
                <div className="p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition border border-gray-100">
                  <span className="text-xs text-secondary uppercase tracking-wider font-bold">Sugestão de Projeto</span>
                  <p className="font-serif text-xl md:text-2xl mt-2">Villa Serenity</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Bar - Added transition-all duration-700 ease-in-out */}
      {/* When menu is open, add transform to force GPU and keep nav fixed at viewport top */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ease-out ${isMenuOpen ? 'bg-transparent !fixed !top-0 !left-0 !right-0 translate-z-0 will-change-transform' : navClasses}`}
        style={{ transform: 'translate3d(0, 0, 0)', position: 'fixed', top: 0, left: 0, right: 0 }}
      >
        <div className="container mx-auto px-6 flex justify-between items-center relative">

          {/* Logo */}
          <Link to="/" onClick={handleLinkClick} className={`z-[60] relative transition-colors duration-300 pointer-events-auto flex items-center gap-2 ${logoClasses}`}>
            <span className="text-3xl md:text-4xl font-serif font-bold tracking-tight">FS</span>
            <span className="w-px h-6 bg-current opacity-30"></span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-light">Arquitetura</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Início</Link>
            <Link to="/about" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Sobre</Link>
            <Link to="/portfolio" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Portfólio</Link>
            <Link to="/cultural" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Cultura</Link>
            {settings.enableShop && (
              <Link to="/shop" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Loja</Link>
            )}
            <Link to="/services" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Serviços</Link>
            <Link to="/contact" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Contato</Link>
            {currentUser?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold text-accent hover:text-white bg-black/80 px-3 py-1.5 rounded-full transition flex items-center space-x-1 backdrop-blur-sm">
                <LayoutDashboard className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Desktop Icons */}
          <div className={`hidden md:flex items-center space-x-6 transition-colors duration-300 ${linkClasses}`}>
            <button onClick={() => setSearchOpen(true)} className="hover:scale-110 transition-transform"><Search className="w-5 h-5" /></button>
            <Link to={currentUser ? "/profile" : "/auth"} className="hover:scale-110 transition-transform"><User className="w-5 h-5" /></Link>
            {settings.enableShop && (
              <Link to="/cart" className="hover:scale-110 transition-transform relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-black text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Mobile Toggle Button (Animated X) - Optimized for 60fps with GPU acceleration */}
          <button
            className={`md:hidden z-[60] relative w-12 h-12 flex items-center justify-center focus:outline-none pointer-events-auto ${isMenuOpen ? 'text-primary' : iconClasses}`}
            onClick={() => isMenuOpen ? closeMenu() : setIsMenuOpen(true)}
            aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
          >
            <div className="w-6 h-5 relative flex flex-col justify-center items-center">
              {/* Top Line - Moves to center then rotates to form one leg of X */}
              <span
                className="w-full h-0.5 bg-current rounded-full absolute will-change-transform"
                style={{
                  transform: isMenuOpen
                    ? 'translateY(0) rotate(45deg)'
                    : 'translateY(-8px) rotate(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
                }}
              />

              {/* Middle Line - Scales to 0 width with fade */}
              <span
                className="w-full h-0.5 bg-current rounded-full absolute will-change-transform"
                style={{
                  transform: isMenuOpen ? 'scaleX(0)' : 'scaleX(1)',
                  opacity: isMenuOpen ? 0 : 1,
                  transition: isMenuOpen
                    ? 'transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s cubic-bezier(0.4, 0, 1, 1)'
                    : 'transform 0.3s cubic-bezier(0, 0, 0.2, 1) 0.12s, opacity 0.3s cubic-bezier(0, 0, 0.2, 1) 0.12s',
                }}
              />

              {/* Bottom Line - Moves to center then rotates to form other leg of X */}
              <span
                className="w-full h-0.5 bg-current rounded-full absolute will-change-transform"
                style={{
                  transform: isMenuOpen
                    ? 'translateY(0) rotate(-45deg)'
                    : 'translateY(8px) rotate(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
                }}
              />
            </div>
          </button>
        </div>
      </nav >

      {/* Mobile Menu Overlay */}
      {/* FIXED: Z-Index lowered to 45 so it sits BELOW the Nav (z-50) but ABOVE content. 
          This ensures the close button inside Nav is clickable and visible. */}
      {
        isMenuOpen && (
          <div className={`fixed inset-0 bg-white/40 backdrop-blur-xl z-[45] flex flex-col pt-24 pb-8 px-6 text-primary md:hidden touch-none ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            <div className="flex flex-col space-y-6 flex-grow overflow-y-auto overscroll-contain">
              <Link to="/" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Início</Link>
              <Link to="/about" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Sobre</Link>
              <Link to="/office" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">O Escritório</Link>
              <Link to="/portfolio" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Portfólio</Link>
              <Link to="/cultural" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Cultura</Link>
              {settings.enableShop && (
                <Link to="/shop" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Loja</Link>
              )}
              <Link to="/services" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Serviços</Link>
              <Link to="/contact" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Contato</Link>

              <div className="pt-4 space-y-4">
                <Link to={currentUser ? "/profile" : "/auth"} onClick={handleLinkClick} className="flex items-center space-x-3 text-lg font-medium hover:text-accent transition">
                  <User className="w-5 h-5" />
                  <span>Minha Conta</span>
                </Link>
                <button onClick={() => { setIsMenuOpen(false); setSearchOpen(true); }} className="flex items-center space-x-3 text-lg font-medium hover:text-accent transition w-full text-left">
                  <Search className="w-5 h-5" />
                  <span>Buscar</span>
                </button>
                {settings.enableShop && (
                  <Link to="/cart" onClick={handleLinkClick} className="flex items-center space-x-3 text-lg font-medium hover:text-accent transition relative">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Carrinho</span>
                    {cartCount > 0 && (
                      <span className="ml-2 bg-accent text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                {currentUser?.role === 'admin' && (
                  <Link to="/admin" onClick={handleLinkClick} className="text-lg font-bold text-accent pt-2 block">Acessar Admin</Link>
                )}
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 uppercase tracking-widest text-center">
              Fran Siller Arquitetura
            </div>
          </div>
        )
      }

      {/* Main Content - Added min-h-0 to prevent flex issues with sticky children */}
      <main className="flex-grow min-h-0">
        {children}
      </main>

      {/* Floating Chatbot */}
      <Chatbot
        isOpen={chatOpen}
        onToggle={setChatOpen}
        hideButton={hideChatButton || isHeroVisible}
        forceShow={isMenuOpen}
      />

      {/* Footer */}
      <footer ref={footerRef} className="bg-[#1a1a1a] text-white pt-16 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="mb-6 flex flex-col items-start leading-none group cursor-default">
                <span className="text-2xl font-serif font-bold tracking-normal flex">
                  {/* F - sempre visível */}
                  <span>F</span>
                  {/* "ran" - aparece no hover */}
                  <span className="inline-block overflow-hidden transition-all duration-300 ease-out max-w-0 opacity-0 group-hover:max-w-[1.5em] group-hover:opacity-100">ran</span>
                  {/* Espaço entre palavras - aparece no hover */}
                  <span className="inline-block overflow-hidden transition-all duration-300 ease-out max-w-0 group-hover:max-w-[0.25em]">&nbsp;</span>
                  {/* S - sempre visível */}
                  <span>S</span>
                  {/* "iller" - aparece no hover */}
                  <span className="inline-block overflow-hidden transition-all duration-300 ease-out max-w-0 opacity-0 group-hover:max-w-[2em] group-hover:opacity-100">iller</span>
                </span>
                <span className="text-xs uppercase tracking-[0.25em] font-medium text-gray-500">Arquitetura</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Arquitetura que escuta o lugar e respeita quem o habita.
                <br /><br />
                Fran Siller atua com projetos residenciais, comerciais e culturais, valorizando o contexto regional e a identidade de cada cliente. Do conceito à execução, com envolvimento em cada etapa.
              </p>
            </div>
            <div className="md:col-start-3">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-accent">Navegação</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/portfolio" className="hover:text-white transition block">Projetos</Link></li>
                <li><Link to="/cultural" className="hover:text-white transition block">Cultura</Link></li>
                <li><Link to="/services" className="hover:text-white transition block">Serviços</Link></li>
                <li><Link to="/office" className="hover:text-white transition block">Nosso Espaço</Link></li>
                <li><Link to="/about" className="hover:text-white transition block">Filosofia</Link></li>
                <li><Link to="/contact" className="hover:text-white transition block">Contato</Link></li>
                <li><button onClick={() => setChatOpen(true)} className="hover:text-white transition block text-left w-full">Ajuda e Suporte</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-accent">Instalar App</h4>
              <p className="text-xs text-gray-500 mb-4">Adicione à tela inicial do seu dispositivo.</p>
              <InstallButton />
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p>&copy; 2026 Fran Siller Arquitetura. Todos os direitos reservados.</p>
              <span className="hidden md:inline text-gray-700">•</span>
              <p className="text-gray-500">
                Desenvolvido por{' '}
                <a
                  href="https://othebaldi.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-accent transition-colors"
                >
                  Otávio Siller Thebaldi
                </a>
              </p>
            </div>
            <div className="flex space-x-6">
              {(siteContent.office.socialLinks || []).length > 0 ? (
                (siteContent.office.socialLinks || []).map((link) => {
                  // Tratamento especial para WhatsApp
                  let href = link.url;
                  if (link.platform === 'whatsapp') {
                    const cleanNumber = link.url.replace(/\D/g, '');
                    const message = encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.');
                    href = `https://wa.me/${cleanNumber}?text=${message}`;
                  } else if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
                    // Adiciona protocolo se não tiver
                    href = `https://${link.url}`;
                  }

                  return (
                    <a
                      key={link.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white cursor-pointer transition capitalize"
                    >
                      {link.label || link.platform}
                    </a>
                  );
                })
              ) : (
                <>
                  <span className="text-gray-600">Nenhuma rede social configurada</span>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};