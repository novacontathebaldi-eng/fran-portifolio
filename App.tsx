import React, { useState, useEffect, ReactNode, ErrorInfo, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, RefreshCw, Loader2 } from 'lucide-react';
import { Layout } from './components/Layout';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { CartProvider } from './context/CartContext';
import { LoadingScreen } from './components/loading';

// Lazy load all pages for code-splitting
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Portfolio = lazy(() => import('./pages/Portfolio').then(module => ({ default: module.Portfolio })));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails').then(module => ({ default: module.ProjectDetails })));
const Cultural = lazy(() => import('./pages/Cultural').then(module => ({ default: module.Cultural })));
const CulturalDetails = lazy(() => import('./pages/CulturalDetails').then(module => ({ default: module.CulturalDetails })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Office = lazy(() => import('./pages/Office').then(module => ({ default: module.Office })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Auth = lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));
const ClientArea = lazy(() => import('./pages/ClientArea').then(module => ({ default: module.ClientArea })));
const BudgetFlow = lazy(() => import('./pages/BudgetFlow').then(module => ({ default: module.BudgetFlow })));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ProjectForm = lazy(() => import('./pages/Admin/ProjectForm').then(module => ({ default: module.ProjectForm })));
const CulturalProjectForm = lazy(() => import('./pages/Admin/CulturalProjectForm').then(module => ({ default: module.CulturalProjectForm })));

// Shop Pages (Lazy loaded)
const Shop = lazy(() => import('./pages/Shop/Shop').then(module => ({ default: module.Shop })));
const ProductDetails = lazy(() => import('./pages/Shop/ProductDetails').then(module => ({ default: module.ProductDetails })));
const Cart = lazy(() => import('./pages/Shop/Cart').then(module => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Shop/Checkout').then(module => ({ default: module.Checkout })));

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 CRITICAL ERROR:', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack, timestamp: new Date().toISOString() });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-primary p-6 text-center animate-fadeIn">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Algo deu errado.</h2>
          <p className="text-gray-500 mb-4 max-w-md">
            Ocorreu um erro inesperado ao carregar a página. Isso pode ser uma instabilidade temporária.
          </p>
          {/* DEBUG: Show actual error in development */}
          {import.meta.env.DEV && this.state.errorMessage && (
            <p className="text-red-500 text-xs mb-4 font-mono bg-red-50 p-2 rounded max-w-lg break-all">
              DEV: {this.state.errorMessage}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              window.location.href = '/';
            }}
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-accent hover:text-black transition flex items-center space-x-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar Início</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Splash Screen Component - Main Loading Screen
const PRELOAD_IMAGES = [
  "https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png",
  "https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/img-sobre-home.png"
];

const MIN_SPLASH_TIME = 2000; // Minimum time to show splash (2s)
const MAX_SPLASH_TIME = 10000; // Maximum time before forcing completion (10s safety)

interface SplashProps {
  isDataReady: boolean;
  areComponentsReady: boolean;
  onComplete: () => void;
}

const Splash: React.FC<SplashProps> = ({ isDataReady, areComponentsReady, onComplete }) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Preload images
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Minimum display time
    const minTimer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_TIME);

    // Safety timeout - force complete after MAX_SPLASH_TIME
    const maxTimer = setTimeout(() => {
      console.warn('[Splash] Force completing due to timeout');
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, MAX_SPLASH_TIME);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [onComplete]);

  // Complete when ALL conditions are met: data ready + components ready + min time passed
  useEffect(() => {
    if (minTimeElapsed && isDataReady && areComponentsReady && !isExiting) {
      setIsExiting(true);
      // Smooth fade out before completing
      setTimeout(onComplete, 500);
    }
  }, [minTimeElapsed, isDataReady, areComponentsReady, isExiting, onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-[#1a1a1a] flex items-center justify-center z-[100] text-white transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
      aria-label="Carregando site Fran Siller Arquitetura"
    >
      <div className="text-center animate-pulse">
        <h1 className="text-4xl font-serif tracking-widest mb-2 uppercase">Fran Siller</h1>
        <div className="h-0.5 w-16 bg-accent mx-auto"></div>
        <p className="text-xs uppercase tracking-widest mt-4 text-gray-400">Arquitetura & Design</p>
      </div>
    </div>
  );
};

// ScrollToTop - Respect back/forward navigation
const ScrollToTop = () => {
  const { pathname, key } = useLocation();

  useEffect(() => {
    // Quando key é 'default', geralmente significa navegação de histórico (back/forward)
    // Apenas rola para o topo em navegação para frente (push/replace)
    if (key !== 'default') {
      window.scrollTo(0, 0);
    }
  }, [pathname, key]);
  return null;
};

// RouteLogger - Logs navigation events for security audit
const RouteLogger = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if ((import.meta as any).env?.DEV) {
      console.log('🧭 ROUTE: User navigated to', { path: pathname, timestamp: new Date().toISOString() });
    }
  }, [pathname]);
  return null;
};

// Global Toast Component
const GlobalToast = () => {
  const { toast, hideToast } = useProjects();

  return (
    <AnimatePresence>
      {toast.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl backdrop-blur-md border border-white/20 min-w-[300px]"
          style={{
            backgroundColor: toast.type === 'success' ? 'rgba(20, 20, 20, 0.95)' :
              toast.type === 'error' ? 'rgba(153, 27, 27, 0.95)' : 'rgba(20, 20, 20, 0.95)'
          }}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}

          <span className="text-white text-sm font-medium flex-grow">{toast.message}</span>

          <button onClick={hideToast} className="text-white/50 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Protected Route Component ---
interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'admin' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { currentUser, isLoadingAuth } = useProjects();

  if (isLoadingAuth) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return <>{children}</>;
};

// Loading fallback component for Suspense
const PageLoader: React.FC = () => (
  <LoadingScreen message="Carregando página..." />
);

// Wrapper for Routes to allow useLocation hook
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const { currentUser, settings } = useProjects();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
          <Route path="/project/:id" element={<Layout><ProjectDetails /></Layout>} />
          <Route path="/cultural" element={<Layout><Cultural /></Layout>} />
          <Route path="/cultural/:id" element={<Layout><CulturalDetails /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/office" element={<Layout><Office /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Auth Routes - NO LAYOUT/HEADER */}
          <Route path="/auth/*" element={<Auth />} />

          {/* Client Protected Routes */}
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute>
                <Layout><ClientArea /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Budget/Services Routes (ALWAYS available - independent of shop status) */}
          <Route path="/services" element={<Layout><BudgetFlow /></Layout>} />
          <Route path="/budget" element={<Layout><BudgetFlow /></Layout>} />

          {/* Shop Routes (Conditional - only when shop enabled) */}
          {settings.enableShop && (
            <>
              <Route path="/shop" element={<Layout><Shop /></Layout>} />
              <Route path="/shop/product/:id" element={<Layout><ProductDetails /></Layout>} />
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Layout><Checkout /></Layout>
                  </ProtectedRoute>
                }
              />
            </>
          )}

          {/* Redirect shop routes when disabled */}
          {!settings.enableShop && (
            <>
              <Route path="/shop/*" element={<Navigate to="/" replace />} />
              <Route path="/cart" element={<Navigate to="/" replace />} />
              <Route path="/checkout" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/project/new"
            element={
              <ProtectedRoute role="admin">
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/project/edit/:id"
            element={
              <ProtectedRoute role="admin">
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          {/* Cultural Admin Routes */}
          <Route
            path="/admin/cultural/new"
            element={
              <ProtectedRoute role="admin">
                <CulturalProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cultural/edit/:id"
            element={
              <ProtectedRoute role="admin">
                <CulturalProjectForm />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  useEffect(() => {
    // Register service worker for PWA with update detection
    // ONLY in production to avoid cache conflicts during development
    const registerSW = async () => {
      // Skip SW in development mode
      if (import.meta.env.DEV) {
        console.log('[SW] Service Worker skipped in development mode');
        // Unregister any existing SW in dev mode to clear stale cache
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('[SW] Unregistered existing service worker');
          }
        }
        return;
      }

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Listen for new service worker waiting
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available - could show refresh prompt to user
                }
              });
            }
          });
        } catch {
          // SW registration failed silently
        }

        // Listen for messages from Service Worker
        navigator.serviceWorker.addEventListener('message', () => {
          // Handle SW messages silently
        });
      }
    };

    // Register immediately - don't wait for load event (it already fired)
    registerSW();

    // Console message
    console.log(
      '%c✨ Fran Siller Arquitetura ✨',
      'font-size: 20px; font-weight: bold; color: #D4AF37; text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.3);'
    );
    console.log(
      '%cCriando espaços que inspiram, funcionam e perduram.',
      'font-size: 12px; color: #efefefff; font-style: italic;'
    );
    console.log(
      '%c\n💼 Interessado em trabalhar conosco?\n📧 Entre em contato: https://fransiller.othebaldi.me/#/contact\n🌐 Portfólio: https://fransiller.othebaldi.me\n',
      'font-size: 11px; color: #efefefff; line-height: 1.8;'
    );
    console.log(
      '%c🏛️ Desenvolvido com excelência por oTHEBALDI\n📧 Contato: suporte@othebaldi.me\n🌐 Site: https://othebaldi.me',
      'font-size: 10px; color: #efefefff;'
    );
  }, []);

  return (
    <ProjectProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ProjectProvider>
  );
};

// AppContent - Has access to ProjectContext for Splash loading state
const AppContent: React.FC = () => {
  const { isLoadingData } = useProjects();
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Preload images
  useEffect(() => {
    const PRELOAD_IMAGES = [
      "https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png",
      "https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/img-sobre-home.png"
    ];
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Minimum display time
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 2000);

    // Safety timeout - force complete after 10s
    const maxTimer = setTimeout(() => {
      console.warn('[Splash] Force completing due to timeout');
      setIsExiting(true);
      setTimeout(() => setShowSplash(false), 500);
    }, 10000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Complete when data is ready AND min time has passed
  useEffect(() => {
    if (minTimeElapsed && !isLoadingData && !isExiting) {
      setIsExiting(true);
      // Smooth fade out before hiding
      setTimeout(() => setShowSplash(false), 500);
    }
  }, [minTimeElapsed, isLoadingData, isExiting]);

  return (
    <>
      {/* Router ALWAYS renders - loads in background behind Splash */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <ScrollToTop />
          <RouteLogger />
          <GlobalToast />
          <AnimatedRoutes />
        </ErrorBoundary>
      </Router>

      {/* Splash as OVERLAY - covers everything until ready */}
      {showSplash && (
        <div
          className={`fixed inset-0 bg-[#1a1a1a] flex items-center justify-center z-[9999] text-white transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
          role="status"
          aria-live="polite"
          aria-label="Carregando site Fran Siller Arquitetura"
        >
          <div className="text-center animate-pulse">
            <h1 className="text-4xl font-serif tracking-widest mb-2 uppercase">Fran Siller</h1>
            <div className="h-0.5 w-16 bg-accent mx-auto"></div>
            <p className="text-xs uppercase tracking-widest mt-4 text-gray-400">Arquitetura & Design</p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;