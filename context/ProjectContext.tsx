
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings } from '../types';
import { MOCK_PROJECTS, MOCK_USER_CLIENT, MOCK_USER_ADMIN } from '../data';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

interface ProjectContextType {
  projects: Project[];
  currentUser: User | null;
  siteContent: SiteContent;
  settings: GlobalSettings;
  login: (email: string) => User | null;
  logout: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateSiteContent: (content: SiteContent) => void;
  updateSettings: (settings: GlobalSettings) => void;
  sendMessageToAI: (message: string) => Promise<any>;
  
  // Toast Logic
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_SETTINGS: GlobalSettings = {
  enableShop: true,
  aiConfig: {
    model: 'gemini-2.5-flash',
    systemInstruction: 'Você é um assistente virtual sofisticado para o escritório Fran Siller Arquitetura. Seu tom é elegante, minimalista e profissional. Você ajuda clientes a encontrar projetos, entender serviços e agendar reuniões.',
    temperature: 0.7
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });
  
  // Settings with LocalStorage Persistence
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('fran_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('fran_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const [siteContent, setSiteContent] = useState<SiteContent>({
    about: {
      heroSubtitle: 'Quem Somos',
      heroTitle: 'Arquitetura com alma e propósito.',
      bio: 'Com mais de 15 anos de experiência no mercado de arquitetura de alto padrão, Fran Siller fundou seu escritório com uma premissa clara: criar espaços que não sejam apenas visualmente impactantes, mas que melhorem a qualidade de vida de quem os habita.'
    }
  });

  const login = (email: string) => {
    if (email.includes('admin')) {
      setCurrentUser(MOCK_USER_ADMIN);
      return MOCK_USER_ADMIN;
    } else {
      // Enrich client mock with docs for demo
      const clientWithDocs = {
        ...MOCK_USER_CLIENT,
        documents: [
            { name: 'Contrato de Prestação de Serviços.pdf', date: '2023-10-15', url: '#', type: 'pdf' as const },
            { name: 'Planta Baixa - Estudo Preliminar.dwg', date: '2023-11-01', url: '#', type: 'dwg' as const },
            { name: 'Memorial Descritivo.pdf', date: '2023-11-20', url: '#', type: 'pdf' as const },
        ]
      };
      setCurrentUser(clientWithDocs);
      return clientWithDocs;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateSiteContent = (content: SiteContent) => {
    setSiteContent(content);
  };

  const updateSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
  };

  const sendMessageToAI = async (message: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: { user: currentUser },
          config: settings.aiConfig
        })
      });
      if (!res.ok) throw new Error('Falha na comunicação com IA');
      return await res.json();
    } catch (error) {
      console.error(error);
      // Fallback response if API fails (e.g., in development without serverless env)
      return { 
        role: 'model', 
        text: "Desculpe, o serviço de IA está indisponível no momento. Por favor, tente novamente mais tarde." 
      };
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      currentUser, 
      siteContent, 
      settings,
      login, 
      logout, 
      addProject, 
      updateProject, 
      deleteProject,
      updateSiteContent,
      updateSettings,
      sendMessageToAI,
      toast,
      showToast,
      hideToast
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
