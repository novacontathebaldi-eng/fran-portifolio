
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { ProjectProvider } from './context/ProjectContext';

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

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onComplete={() => setLoading(false)} />;
  }

  return (
    <ProjectProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Routes (No Layout) */}
          <Route path="/auth/*" element={<Auth />} />
          
          {/* Admin Routes (Custom Layout inside Dashboard) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/project/new" element={<ProjectForm />} />
          <Route path="/admin/project/edit/:id" element={<ProjectForm />} />

          {/* Main Routes */}
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/services" element={<BudgetFlow />} /> 
                <Route path="/budget" element={<BudgetFlow />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<ClientArea />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </ProjectProvider>
  );
};

export default App;
