
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, AdminNote } from '../types';
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
  adminNotes: AdminNote[];
  login: (email: string) => User | null;
  logout: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateSiteContent: (content: SiteContent) => void;
  updateSettings: (settings: GlobalSettings) => void;
  sendMessageToAI: (message: string) => Promise<any>;
  
  // Admin Notes Logic
  addAdminNote: (note: Omit<AdminNote, 'id' | 'date' | 'status'>) => void;
  markNoteAsRead: (id: string) => void;
  deleteAdminNote: (id: string) => void;

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
    systemInstruction: `Você é o Concierge Digital da Fran Siller Arquitetura. 
    Seu tom é sofisticado, acolhedor e altamente eficiente.
    
    Seus objetivos principais:
    1. Converter visitantes em leads (coletando nome e contato).
    2. Direcionar para canais oficiais (WhatsApp, Instagram).
    3. Apresentar o portfólio de forma contextual.
    
    Dados de Contato Oficiais:
    - WhatsApp: +55 (27) 99667-0426
    - Instagram: @othebaldi
    - Facebook: fb.com/othebaldi
    
    Regras de Comportamento:
    - Se o cliente demonstrar interesse comercial, tente gentilmente pegar o contato ou oferecer o WhatsApp.
    - Se perguntarem sobre preços, explique que depende da complexidade e ofereça uma reunião ou o link de Orçamento.
    - Use emojis com moderação, mantendo a elegância.`,
    temperature: 0.7
  }
};

const MOCK_NOTES: AdminNote[] = [
  {
    id: '1',
    userName: 'Carlos Mendes',
    userContact: '(11) 99999-9999',
    message: 'Interesse em projeto comercial para escritório de advocacia.',
    date: new Date().toISOString(),
    status: 'new',
    source: 'contact_form'
  }
];

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>(MOCK_NOTES);
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

  // Admin Notes Actions
  const addAdminNote = (note: Omit<AdminNote, 'id' | 'date' | 'status'>) => {
    const newNote: AdminNote = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'new'
    };
    setAdminNotes(prev => [newNote, ...prev]);
    // Optionally alert via toast only if current user is NOT admin (avoid noise)
    if (currentUser?.role !== 'admin') {
       console.log("Nota salva internamente:", newNote);
    }
  };

  const markNoteAsRead = (id: string) => {
    setAdminNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
  };

  const deleteAdminNote = (id: string) => {
    setAdminNotes(prev => prev.filter(n => n.id !== id));
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
      adminNotes,
      login, 
      logout, 
      addProject, 
      updateProject, 
      deleteProject,
      updateSiteContent,
      updateSettings,
      sendMessageToAI,
      addAdminNote,
      markNoteAsRead,
      deleteAdminNote,
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
