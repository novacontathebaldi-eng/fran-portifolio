import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, AdminNote, ClientMemory, ChatMessage, ChatSession, ClientFolder, ClientFile } from '../types';
import { MOCK_PROJECTS, MOCK_USER_CLIENT, MOCK_USER_ADMIN } from '../data';
import { chatWithConcierge } from '../api/chat';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

interface ProjectContextType {
  projects: Project[];
  currentUser: User | null;
  users: User[]; // All users (for admin)
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
  
  // Chat & AI Logic
  sendMessageToAI: (message: string) => Promise<any>;
  currentChatMessages: ChatMessage[]; // The messages currently displayed in Chatbot
  createNewChat: () => void;
  
  // Client Memory Logic (Backend Simulation)
  clientMemories: ClientMemory[]; // Only for currently logged in user
  addClientMemory: (memory: Omit<ClientMemory, 'id' | 'createdAt'>) => void;
  updateClientMemory: (id: string, content: string) => void;
  deleteClientMemory: (id: string) => void;

  // Folder & File Management Logic
  createClientFolder: (userId: string, folderName: string) => void;
  renameClientFolder: (userId: string, folderId: string, newName: string) => void;
  deleteClientFolder: (userId: string, folderId: string) => void;
  uploadFileToFolder: (userId: string, folderId: string, file: File) => Promise<void>;
  deleteClientFile: (userId: string, folderId: string, fileId: string) => void;

  // Admin Client Management
  updateUser: (user: User) => void;
  
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
  // Global Data
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  
  // Users Database Simulation
  // In a real app, this would be in Supabase/Firebase. 
  // We initialize with our mock users.
  const [users, setUsers] = useState<User[]>([MOCK_USER_ADMIN, MOCK_USER_CLIENT]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Chat State
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>([]);
  
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

  // Load guest chat from local storage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem('guest_chat_history');
    if (savedChat) {
      setCurrentChatMessages(JSON.parse(savedChat));
    }
  }, []);

  // Save guest chat to local storage whenever it changes (if not logged in)
  useEffect(() => {
    if (!currentUser && currentChatMessages.length > 0) {
      localStorage.setItem('guest_chat_history', JSON.stringify(currentChatMessages));
    }
  }, [currentChatMessages, currentUser]);


  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Initialize Site Content
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const savedContent = localStorage.getItem('fran_site_content');
    if (savedContent) return JSON.parse(savedContent);
    return {
      about: {
        heroSubtitle: 'Quem Somos',
        heroTitle: 'Arquitetura com alma e propósito.',
        heroImage: 'https://picsum.photos/seed/architect_portrait/1920/1080',
        profileImage: 'https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/378557752_597176842380637_7080388795805736658_n..jpg',
        bio: `Com mais de 15 anos de experiência no mercado de arquitetura de alto padrão, Fran Siller fundou seu escritório com uma premissa clara: criar espaços que não sejam apenas visualmente impactantes, mas que melhorem a qualidade de vida de quem os habita.\n\nFormada pela FAU-USP com especialização em Design de Interiores em Milão, Fran traz uma abordagem que mescla o rigor técnico da arquitetura brasileira com a sensibilidade estética e o cuidado nos detalhes do design italiano.\n\n"Acredito que a casa é uma extensão da nossa identidade. Meu trabalho é traduzir a essência de cada cliente em formas, texturas e luz."`,
        stats: [
          { id: '1', value: '15+', label: 'Anos de Exp.' },
          { id: '2', value: '80+', label: 'Projetos' },
          { id: '3', value: '12', label: 'Prêmios' }
        ],
        pillars: [
          { id: 'p1', title: 'Sustentabilidade', description: 'Priorizamos materiais naturais, ventilação cruzada e eficiência energética. Respeitar o meio ambiente é respeitar o futuro do morar.' },
          { id: 'p2', title: 'Atemporalidade', description: 'Fugimos de tendências passageiras. Buscamos uma estética que permaneça relevante e bela ao longo das décadas.' },
          { id: 'p3', title: 'Experiência Humana', description: 'A arquitetura deve servir às pessoas. O conforto, a ergonomia e o bem-estar sensorial são nossas prioridades máximas.' }
        ],
        recognition: ['CASA VOGUE', 'ARCHDAILY', 'ELLE DECOR', 'CASACOR']
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('fran_site_content', JSON.stringify(siteContent));
  }, [siteContent]);

  // --- Auth & Sync Logic ---

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      // SYNC LOGIC: Check for guest history in localStorage
      const guestHistory = localStorage.getItem('guest_chat_history');
      let updatedUser = { ...foundUser };
      
      // Determine what to show in the chat window
      let activeMessages = [];

      if (guestHistory) {
        const parsedHistory: ChatMessage[] = JSON.parse(guestHistory);
        
        // 1. Create a persistent session record for this guest history
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: `Sincronizado em ${new Date().toLocaleDateString()}`,
          messages: parsedHistory,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        // 2. Attach to user history
        updatedUser = {
          ...updatedUser,
          chats: [newSession, ...(updatedUser.chats || [])]
        };

        // 3. Keep the conversation ALIVE in the UI (User Experience)
        // Instead of clearing currentChatMessages, we maintain it so the user feels continuity.
        activeMessages = parsedHistory;

        // Clear LocalStorage now that it's safe in "DB"
        localStorage.removeItem('guest_chat_history');
      } else {
        // If no guest history, we could optionally load the last active chat, 
        // but for now we start fresh or keep existing UI state empty
        activeMessages = [];
      }

      // Update DB (Mock)
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      setCurrentUser(updatedUser);
      setCurrentChatMessages(activeMessages);
      return updatedUser;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentChatMessages([]); // Reset chat view
    // Do NOT clear localStorage here, as the new guest session starts blank.
  };

  // --- CRUD Project ---
  const addProject = (project: Project) => setProjects(prev => [project, ...prev]);
  const updateProject = (project: Project) => setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  
  // --- Admin User Management ---
  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // --- Client Memory Logic (Secured by currentUser check) ---
  const syncUserMemoriesToDB = (userId: string, newMemories: ClientMemory[]) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, memories: newMemories } : u
    ));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, memories: newMemories } : null);
    }
  };

  const addClientMemory = (memory: Omit<ClientMemory, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const newMemory: ClientMemory = {
      ...memory,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const updatedMemories = [...(currentUser.memories || []), newMemory];
    syncUserMemoriesToDB(currentUser.id, updatedMemories);
  };

  const updateClientMemory = (id: string, content: string) => {
    if (!currentUser) return;
    const updatedMemories = (currentUser.memories || []).map(m => 
      m.id === id ? { ...m, content } : m
    );
    syncUserMemoriesToDB(currentUser.id, updatedMemories);
  };

  const deleteClientMemory = (id: string) => {
    if (!currentUser) return;
    const updatedMemories = (currentUser.memories || []).filter(m => m.id !== id);
    syncUserMemoriesToDB(currentUser.id, updatedMemories);
  };

  // --- Folder & File Management Logic ---
  
  // Helper to sync folders to DB and Current User
  const syncUserFoldersToDB = (userId: string, newFolders: ClientFolder[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, folders: newFolders } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, folders: newFolders } : null);
    }
  };

  const createClientFolder = (userId: string, folderName: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newFolder: ClientFolder = {
      id: Math.random().toString(36).substr(2, 9),
      name: folderName,
      createdAt: new Date().toISOString(),
      files: []
    };
    
    const updatedFolders = [...(user.folders || []), newFolder];
    syncUserFoldersToDB(userId, updatedFolders);
  };

  const renameClientFolder = (userId: string, folderId: string, newName: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedFolders = (user.folders || []).map(f => 
      f.id === folderId ? { ...f, name: newName } : f
    );
    syncUserFoldersToDB(userId, updatedFolders);
  };

  const deleteClientFolder = (userId: string, folderId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const updatedFolders = (user.folders || []).filter(f => f.id !== folderId);
    syncUserFoldersToDB(userId, updatedFolders);
  };

  const uploadFileToFolder = async (userId: string, folderId: string, file: File) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Simulate upload delay and URL generation
    const mockUrl = URL.createObjectURL(file); 
    const fileType = file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'other';
    const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const newFile: ClientFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: mockUrl,
      type: fileType as any,
      size: fileSize,
      createdAt: new Date().toISOString()
    };

    const updatedFolders = (user.folders || []).map(f => {
      if (f.id === folderId) {
        return { ...f, files: [...f.files, newFile] };
      }
      return f;
    });

    syncUserFoldersToDB(userId, updatedFolders);
  };

  const deleteClientFile = (userId: string, folderId: string, fileId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedFolders = (user.folders || []).map(f => {
      if (f.id === folderId) {
        return { ...f, files: f.files.filter(file => file.id !== fileId) };
      }
      return f;
    });
    
    syncUserFoldersToDB(userId, updatedFolders);
  };

  // --- Chat Logic ---

  const createNewChat = () => {
    if (currentUser && currentChatMessages.length > 0) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: `Conversa em ${new Date().toLocaleDateString()}`,
        messages: [...currentChatMessages],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      const updatedChats = [newSession, ...(currentUser.chats || [])];
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, chats: updatedChats } : u));
      setCurrentUser(prev => prev ? { ...prev, chats: updatedChats } : null);
    }
    setCurrentChatMessages([]);
    if (!currentUser) {
      localStorage.removeItem('guest_chat_history');
    }
  };

  const sendMessageToAI = async (message: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: message };
    const updatedMessages = [...currentChatMessages, userMsg];
    setCurrentChatMessages(updatedMessages);

    try {
      // Direct client-side call to the AI logic
      const responseData = await chatWithConcierge(updatedMessages, { 
        user: currentUser,
        memories: currentUser?.memories || []
      }, settings.aiConfig);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseData.text,
        uiComponent: responseData.uiComponent
      };
      
      setCurrentChatMessages(prev => [...prev, botMsg]);
      return responseData;

    } catch (error) {
      console.error(error);
      return { 
        role: 'model', 
        text: "Desculpe, o serviço de IA está indisponível no momento. Por favor, tente novamente mais tarde." 
      };
    }
  };

  // --- Admin Notes ---
  const addAdminNote = (note: Omit<AdminNote, 'id' | 'date' | 'status'>) => {
    const newNote: AdminNote = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'new'
    };
    setAdminNotes(prev => [newNote, ...prev]);
  };
  const markNoteAsRead = (id: string) => setAdminNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
  const deleteAdminNote = (id: string) => setAdminNotes(prev => prev.filter(n => n.id !== id));

  const updateSiteContent = (content: SiteContent) => setSiteContent(content);
  const updateSettings = (newSettings: GlobalSettings) => setSettings(newSettings);

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      currentUser,
      users,
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
      currentChatMessages,
      createNewChat,
      clientMemories: currentUser?.memories || [],
      addClientMemory,
      updateClientMemory,
      deleteClientMemory,
      createClientFolder,
      renameClientFolder,
      deleteClientFolder,
      uploadFileToFolder,
      deleteClientFile,
      updateUser,
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