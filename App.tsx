import React, { useState, useEffect, ReactNode, ErrorInfo } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, RefreshCw } from 'lucide-react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { ProjectDetails } from './pages/ProjectDetails';
import { Cultural } from './pages/Cultural';
import { CulturalDetails } from './pages/CulturalDetails';
import { About } from './pages/About';
import { Office } from './pages/Office';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { ClientArea } from './pages/ClientArea';
import { BudgetFlow } from './pages/BudgetFlow';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { ProjectForm } from './pages/Admin/ProjectForm';
import { CulturalProjectForm } from './pages/Admin/CulturalProjectForm';
import { ProjectProvider, useProjects } from './context/ProjectContext';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-primary p-6 text-center animate-fadeIn">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
             <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Algo deu errado.</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Ocorreu um erro inesperado ao carregar a página. Isso pode ser uma instabilidade temporária.
          </p>
          <button 
            onClick={() => { 
              this.setState({ hasError: false }); 
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

// Splash Screen Component
const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] flex items-center justify-center z-[100] text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-4xl font-serif tracking-widest mb-2 uppercase">Fran Siller</h1>
        <div className="h-0.5 w-16 bg-accent mx-auto"></div>
        <p className="text-xs uppercase tracking-widest mt-4 text-gray-400">Arquitetura & Design</p>
      </div>
    </div>
  );
};

// ScrollToTop
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
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

// Wrapper for Routes to allow useLocation hook
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const { currentUser, settings } = useProjects();

  return (
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
          element={currentUser ? <Layout><ClientArea /></Layout> : <Navigate to="/auth" />} 
        />

        {/* Shop/Budget Routes (Conditional) */}
        {settings.enableShop && (
          <>
            <Route path="/services" element={<Layout><BudgetFlow /></Layout>} />
            <Route path="/budget" element={<Layout><BudgetFlow /></Layout>} />
          </>
        )}

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={currentUser?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/admin/project/new" 
          element={currentUser?.role === 'admin' ? <ProjectForm /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/admin/project/edit/:id" 
          element={currentUser?.role === 'admin' ? <ProjectForm /> : <Navigate to="/auth" />} 
        />
        {/* Cultural Admin Routes */}
        <Route 
          path="/admin/cultural/new" 
          element={currentUser?.role === 'admin' ? <CulturalProjectForm /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/admin/cultural/edit/:id" 
          element={currentUser?.role === 'admin' ? <CulturalProjectForm /> : <Navigate to="/auth" />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onComplete={() => setLoading(false)} />;
  }

  return (
    <ProjectProvider>
      <Router>
        <ErrorBoundary>
          <ScrollToTop />
          <GlobalToast />
          <AnimatedRoutes />
        </ErrorBoundary>
      </Router>
    </ProjectProvider>
  );
};

export default App;