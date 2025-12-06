

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useCart } from '../context/CartContext';
import { Chatbot } from './Chatbot';
import InstallButton from './InstallButton';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for Chatbot visibility controlled by Footer
  const [chatOpen, setChatOpen] = useState(false);
  const [hideChatButton, setHideChatButton] = useState(false);
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

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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

  const handleLinkClick = () => {
    setIsMenuOpen(false);
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
      <nav className={`fixed w-full z-50 transition-all duration-700 ease-in-out ${isMenuOpen ? 'bg-transparent' : navClasses}`}>
        <div className="container mx-auto px-6 flex justify-between items-center relative">

          {/* Logo */}
          <Link to="/" onClick={handleLinkClick} className={`text-xl md:text-2xl font-serif tracking-tight font-bold z-[60] relative uppercase transition-colors duration-300 pointer-events-auto ${logoClasses}`}>
            FRAN<span className="text-accent">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Início</Link>
            <Link to="/about" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Sobre</Link>
            <Link to="/portfolio" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Portfólio</Link>
            <Link to="/cultural" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Cultura</Link>
            {settings.enableShop && (
              <>
                <Link to="/shop" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Loja</Link>
                <Link to="/services" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Serviços</Link>
              </>
            )}
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

          {/* Mobile Toggle Button (Animated X) */}
          <button
            className={`md:hidden z-[60] relative w-12 h-12 flex items-center justify-center focus:outline-none transition-colors duration-300 pointer-events-auto ${isMenuOpen ? 'text-black' : iconClasses}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              {/* Top Line - Rotate to make one leg of X */}
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out absolute left-0 ${isMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0 rotate-0'
                  }`}
              />

              {/* Middle Line - Fade out */}
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out absolute left-0 top-1/2 -translate-y-1/2 ${isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
              />

              {/* Bottom Line - Rotate to make other leg of X */}
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out absolute left-0 ${isMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0 rotate-0'
                  }`}
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
          <div className="fixed inset-0 bg-white/40 backdrop-blur-xl z-[45] flex flex-col pt-24 pb-8 px-6 animate-fadeIn text-primary md:hidden overflow-y-auto pointer-events-auto">
            <div className="flex flex-col space-y-6 flex-grow">
              <Link to="/" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Início</Link>
              <Link to="/about" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Sobre</Link>
              <Link to="/office" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">O Escritório</Link>
              <Link to="/portfolio" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Portfólio</Link>
              <Link to="/cultural" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Cultura</Link>
              {settings.enableShop && (
                <>
                  <Link to="/shop" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Loja</Link>
                  <Link to="/services" onClick={handleLinkClick} className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-400/20 pb-4">Serviços</Link>
                </>
              )}
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

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Floating Chatbot */}
      <Chatbot isOpen={chatOpen} onToggle={setChatOpen} hideButton={hideChatButton} />

      {/* Footer */}
      <footer ref={footerRef} className="bg-[#1a1a1a] text-white pt-16 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-serif mb-6 uppercase tracking-wider">Fran Siller.</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Criando espaços que inspiram, funcionam e perduram. Baseada no Brasil, atuando globalmente.
              </p>
            </div>
            <div className="md:col-start-3">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-accent">Navegação</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/portfolio" className="hover:text-white transition block">Projetos</Link></li>
                <li><Link to="/cultural" className="hover:text-white transition block">Cultura</Link></li>
                {settings.enableShop && <li><Link to="/services" className="hover:text-white transition block">Serviços</Link></li>}
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
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>&copy; 2024 Fran Siller Arquitetura. Todos os direitos reservados.</p>
            <div className="flex space-x-6">
              <span className="hover:text-white cursor-pointer transition">Instagram</span>
              <span className="hover:text-white cursor-pointer transition">LinkedIn</span>
              <span className="hover:text-white cursor-pointer transition">Pinterest</span>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};