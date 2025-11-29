
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { ProjectDetails } from './pages/ProjectDetails';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { ClientArea } from './pages/ClientArea';
import { BudgetFlow } from './pages/BudgetFlow';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { ProjectForm } from './pages/Admin/ProjectForm';
import { ProjectProvider, useProjects } from './context/ProjectContext';

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
            backgroundColor: toast.type === 'success' ? 'rgba(20, 20, 20, 0.9)' : 
                            toast.type === 'error' ? 'rgba(153, 27, 27, 0.9)' : 'rgba(20, 20, 20, 0.9)'
          }}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          
          <span className="text-white text-sm font-medium flex-grow">{toast.message}</span>
          
          <button onClick={hideToast} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Wrapper to handle AnimatePresence Logic
const AnimatedRoutes = () => {
  const location = useLocation();
  const { settings } = useProjects();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes (No Layout) */}
        <Route path="/auth/*" element={
          <PageTransition>
            <Auth />
          </PageTransition>
        } />
        
        {/* Admin Routes (Custom Layout inside Dashboard) */}
        <Route path="/admin" element={
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        } />
        <Route path="/admin/project/new" element={<ProjectForm />} />
        <Route path="/admin/project/edit/:id" element={<ProjectForm />} />

        {/* Main Routes */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
              <Route path="/project/:id" element={<PageTransition><ProjectDetails /></PageTransition>} />
              
              {/* Conditional Shop Routes */}
              {settings.enableShop ? (
                <>
                  <Route path="/services" element={<PageTransition><BudgetFlow /></PageTransition>} /> 
                  <Route path="/budget" element={<PageTransition><BudgetFlow /></PageTransition>} />
                </>
              ) : (
                <>
                   <Route path="/services" element={<Navigate to="/" replace />} />
                   <Route path="/budget" element={<Navigate to="/" replace />} />
                </>
              )}
              
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><ClientArea /></PageTransition>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// Reusable Page Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onComplete={() => setLoading(false)} />;
  }

  return (
    <ProjectProvider>
      <Router>
        <ScrollToTop />
        <GlobalToast />
        <AnimatedRoutes />
      </Router>
    </ProjectProvider>
  );
};

export default App;
