
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { Chatbot } from './Chatbot';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, settings } = useProjects();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Handle Search Typing (Mock Suggestion)
  const showSuggestions = searchQuery.length > 0;

  // Determine if the current page has a hero section that requires a transparent header
  const isTransparentNavPage = location.pathname === '/' || location.pathname === '/about' || location.pathname.startsWith('/project/');

  // Nav Classes
  const navClasses = isScrolled
    ? 'bg-white/80 backdrop-blur-md shadow-sm py-4 text-primary border-b border-white/20' 
    : isTransparentNavPage 
      ? 'bg-gradient-to-b from-black/60 to-transparent py-6 text-white' 
      : 'bg-white/80 backdrop-blur-md py-6 text-primary';

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
              <X className="w-8 h-8 text-black" />
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

      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${isMenuOpen ? 'bg-transparent pointer-events-none' : navClasses}`}>
        <div className="container mx-auto px-6 flex justify-between items-center relative">
          
          {/* Logo */}
          <Link to="/" className={`text-xl md:text-2xl font-serif tracking-tight font-bold z-[60] relative uppercase transition-colors duration-300 pointer-events-auto ${logoClasses}`}>
            FRAN<span className="text-accent">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Início</Link>
            <Link to="/about" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Sobre</Link>
            <Link to="/portfolio" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Portfólio</Link>
            {settings.enableShop && (
              <Link to="/services" className={`text-sm font-medium tracking-wide transition-colors duration-300 ${linkClasses}`}>Serviços</Link>
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
              <Link to="/budget" className="hover:scale-110 transition-transform relative">
                <ShoppingBag className="w-5 h-5" />
                {currentUser?.role === 'client' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full ring-2 ring-white"></span>}
              </Link>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className={`md:hidden z-[60] transition-colors duration-300 pointer-events-auto ${isMenuOpen ? 'text-black' : iconClasses}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white/98 backdrop-blur-xl z-[55] flex flex-col pt-24 pb-8 px-6 animate-fadeIn text-primary md:hidden overflow-y-auto pointer-events-auto">
          <div className="flex flex-col space-y-6 flex-grow">
            <Link to="/" className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-100 pb-4">Início</Link>
            <Link to="/about" className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-100 pb-4">Sobre</Link>
            <Link to="/portfolio" className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-100 pb-4">Portfólio</Link>
            {settings.enableShop && (
              <Link to="/services" className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-100 pb-4">Serviços</Link>
            )}
            <Link to="/contact" className="text-3xl font-serif font-light hover:text-accent transition border-b border-gray-100 pb-4">Contato</Link>
            
            <div className="pt-4 space-y-4">
              <Link to={currentUser ? "/profile" : "/auth"} className="flex items-center space-x-3 text-lg font-medium hover:text-accent transition">
                <User className="w-5 h-5" />
                <span>Minha Conta</span>
              </Link>
              <button onClick={() => { setIsMenuOpen(false); setSearchOpen(true); }} className="flex items-center space-x-3 text-lg font-medium hover:text-accent transition w-full text-left">
                <Search className="w-5 h-5" />
                <span>Buscar</span>
              </button>
              {settings.enableShop && (
                <Link to="/budget" className="flex items-center space-x-3 text-lg font-medium hover:text-accent transition">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Orçamento</span>
                </Link>
              )}
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="text-lg font-bold text-accent pt-2 block">Acessar Admin</Link>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-xs text-gray-400 uppercase tracking-widest text-center">
            Fran Siller Arquitetura
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Floating Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white pt-16 pb-10">
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
                {settings.enableShop && <li><Link to="/services" className="hover:text-white transition block">Serviços</Link></li>}
                <li><Link to="/about" className="hover:text-white transition block">Sobre o Escritório</Link></li>
                <li><Link to="/contact" className="hover:text-white transition block">Contato</Link></li>
              </ul>
            </div>
            <div>
               <h4 className="text-xs font-bold uppercase tracking-widest mb-8 text-accent">Newsletter</h4>
               <p className="text-xs text-gray-500 mb-4">Receba atualizações e inspirações.</p>
               <div className="flex border-b border-gray-600 pb-2">
                 <input type="email" placeholder="Seu email" className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-600" />
                 <button className="text-xs uppercase font-bold text-accent hover:text-white transition">Assinar</button>
               </div>
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
    </div>
  );
};
