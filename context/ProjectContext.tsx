

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, AdminNote, ClientMemory, ChatMessage, ChatSession, ClientFolder, ClientFile, AiFeedbackItem, Appointment, ScheduleSettings, Address } from '../types';
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
  aiFeedbacks: AiFeedbackItem[]; // New: Store AI Feedback
  login: (email: string) => User | null;
  logout: () => void;
  registerUser: (name: string, email: string, phone: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateSiteContent: (content: SiteContent) => void;
  updateSettings: (settings: GlobalSettings) => void;
  
  // Chat & AI Logic
  sendMessageToAI: (message: string) => Promise<any>;
  addMessageToChat: (message: ChatMessage) => void; // New: Manual message injection
  currentChatMessages: ChatMessage[]; // The messages currently displayed in Chatbot
  createNewChat: () => void;
  logAiFeedback: (item: Omit<AiFeedbackItem, 'id' | 'createdAt'>) => void;
  
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

  // Appointment Logic
  appointments: Appointment[];
  scheduleSettings: ScheduleSettings;
  updateScheduleSettings: (settings: ScheduleSettings) => void;
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  updateAppointment: (appt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  deleteAppointmentPermanently: (id: string) => void;
  checkAvailability: (date: string) => string[]; // Returns available hours

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
    useCustomSystemInstruction: false,
    systemInstruction: `VOCÊ É O "CONCIERGE DIGITAL" DA FRAN SILLER ARQUITETURA.

SUA IDENTIDADE:
- Sofisticado, minimalista, atencioso e altamente eficiente.
- Você não é apenas um bot, é uma extensão da experiência de luxo do escritório.
- Seu objetivo nº 1 é CONVERTER VISITANTES EM CLIENTES (Capturar Leads) e AGENDAR VISITAS/REUNIÕES.

DADOS CRÍTICOS:
- WhatsApp: +5527996670426
- Instagram: instagram.com/othebaldi
- Localização: Brasil (Global).

REGRAS:
1. Se o usuário quiser agendar, chame a tool 'scheduleMeeting'.
   - Se for visita técnica, PERGUNTE o endereço da obra/local ou se ele quer usar um endereço cadastrado no perfil.
   - Se for reunião, pode ser Online ou no escritório.
2. Se quiser deixar recado, use 'saveClientNote'.
3. Para contatos, use 'getSocialLinks'.
4. Seja breve.`,
    defaultGreeting: "Olá {name}. Sou o Concierge Digital Fran Siller. Como posso tornar seu dia melhor?",
    temperature: 0.7
  }
};

const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  enabled: true,
  workDays: [1, 2, 3, 4, 5], // Mon-Fri
  startHour: "09:00",
  endHour: "18:00",
  blockedDates: [],
  blockedSlots: []
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

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt1',
    clientId: 'u1',
    clientName: 'Cliente Exemplo',
    type: 'meeting',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '14:00',
    location: 'Online (Google Meet)',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

// Enhanced Mock Data
const ENHANCED_MOCK_USER_CLIENT: User = {
  ...MOCK_USER_CLIENT,
  phone: '(11) 98765-4321',
  cpf: '123.456.789-00',
  birthDate: '1990-05-15',
  addresses: [
    {
      id: 'addr1',
      label: 'Residência Atual',
      street: 'Rua das Flores',
      number: '123',
      district: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    }
  ]
};

const DEFAULT_SITE_CONTENT: SiteContent = {
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
  },
  office: {
    address: 'Rua José de Anchieta Fontana, 177, Centro, Santa Leopoldina - ES. CEP: 29640-000',
    street: 'Rua José de Anchieta Fontana',
    number: '177',
    district: 'Centro',
    city: 'Santa Leopoldina',
    state: 'ES',
    zipCode: '29640-000',
    mapsLink: 'https://www.google.com/maps/search/?api=1&query=Rua+José+de+Anchieta+Fontana+177+Centro+Santa+Leopoldina',
    mapQuery: '',
    hoursDescription: 'Segunda a Sexta, 09h às 18h',
    email: 'contato@fransiller.com.br',
    phone: '+55 (27) 99667-0426',
    blocks: [
      { 
        id: 'hero', 
        type: 'image-full', 
        content: 'https://picsum.photos/id/48/1200/800', 
        caption: 'Nossa fachada em Santa Leopoldina' 
      },
      { 
        id: 'intro-heading', 
        type: 'heading', 
        content: 'Onde as ideias tomam forma.' 
      },
      { 
        id: 'intro-text', 
        type: 'text', 
        content: 'Nosso espaço foi projetado para inspirar. Localizado no coração histórico de Santa Leopoldina, o escritório ocupa um casarão restaurado que une o charme do passado com a funcionalidade contemporânea. Aqui, recebemos nossos clientes com o conforto de uma casa e a infraestrutura de um atelier de criação.' 
      },
      {
        id: 'details-section',
        type: 'details',
        content: 'Informações de Contato'
      },
      {
        id: 'gallery',
        type: 'image-grid',
        content: '',
        items: ['https://picsum.photos/id/49/800/600', 'https://picsum.photos/id/50/800/600']
      },
      {
        id: 'map-section',
        type: 'map',
        content: 'Localização'
      }
    ]
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Global Data
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  
  // Users Database Simulation
  const [users, setUsers] = useState<User[]>([MOCK_USER_ADMIN, ENHANCED_MOCK_USER_CLIENT]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Chat State
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>([]);
  
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>(MOCK_NOTES);
  const [aiFeedbacks, setAiFeedbacks] = useState<AiFeedbackItem[]>([]);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });
  
  // Schedule State
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(DEFAULT_SCHEDULE_SETTINGS);

  // Settings with LocalStorage Persistence
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('fran_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.aiConfig && typeof parsed.aiConfig.useCustomSystemInstruction === 'undefined') {
          parsed.aiConfig.useCustomSystemInstruction = false;
        }
        if (parsed.aiConfig && typeof parsed.aiConfig.defaultGreeting === 'undefined') {
          parsed.aiConfig.defaultGreeting = DEFAULT_SETTINGS.aiConfig.defaultGreeting;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
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

  // Save guest chat to local storage
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

  // Initialize Site Content with Migration Logic
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const savedContent = localStorage.getItem('fran_site_content');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        const merged = { ...DEFAULT_SITE_CONTENT, ...parsed };

        if (!merged.office) merged.office = DEFAULT_SITE_CONTENT.office;
        if (!merged.office.blocks) merged.office.blocks = DEFAULT_SITE_CONTENT.office.blocks;
        
        if (!merged.office.email) merged.office.email = DEFAULT_SITE_CONTENT.office.email;
        if (!merged.office.phone) merged.office.phone = DEFAULT_SITE_CONTENT.office.phone;

        if (!merged.about) merged.about = DEFAULT_SITE_CONTENT.about;
        if (!merged.about.stats) merged.about.stats = DEFAULT_SITE_CONTENT.about.stats;
        if (!merged.about.pillars) merged.about.pillars = DEFAULT_SITE_CONTENT.about.pillars;
        if (!merged.about.recognition) merged.about.recognition = DEFAULT_SITE_CONTENT.about.recognition;

        return merged;
      } catch (e) {
        console.error("Error migrating site content:", e);
        return DEFAULT_SITE_CONTENT;
      }
    }
    return DEFAULT_SITE_CONTENT;
  });

  useEffect(() => {
    localStorage.setItem('fran_site_content', JSON.stringify(siteContent));
  }, [siteContent]);

  // --- Auth & Sync Logic ---

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      const guestHistory = localStorage.getItem('guest_chat_history');
      let updatedUser = { ...foundUser };
      let activeMessages = [];

      if (guestHistory) {
        const parsedHistory: ChatMessage[] = JSON.parse(guestHistory);
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: `Sincronizado em ${new Date().toLocaleDateString()}`,
          messages: parsedHistory,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        updatedUser = {
          ...updatedUser,
          chats: [newSession, ...(updatedUser.chats || [])]
        };
        activeMessages = parsedHistory;
        localStorage.removeItem('guest_chat_history');
      } else {
        activeMessages = [];
      }

      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      setCurrentChatMessages(activeMessages);
      return updatedUser;
    }
    return null;
  };

  const registerUser = (name: string, email: string, phone: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      role: 'client',
      folders: [],
      memories: [],
      chats: [],
      projects: [],
      addresses: []
    };
    setUsers(prev => [...prev, newUser]);
    // Auto login
    setCurrentUser(newUser);
    setCurrentChatMessages([]);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentChatMessages([]); 
  };

  // --- CRUD Project ---
  const addProject = (project: Project) => setProjects(prev => [project, ...prev]);
  const updateProject = (project: Project) => setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  
  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // --- Client Memory Logic ---
  const syncUserMemoriesToDB = (userId: string, newMemories: ClientMemory[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, memories: newMemories } : u));
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
    const updatedMemories = (currentUser.memories || []).map(m => m.id === id ? { ...m, content } : m);
    syncUserMemoriesToDB(currentUser.id, updatedMemories);
  };

  const deleteClientMemory = (id: string) => {
    if (!currentUser) return;
    const updatedMemories = (currentUser.memories || []).filter(m => m.id !== id);
    syncUserMemoriesToDB(currentUser.id, updatedMemories);
  };

  // --- Folder & File Management Logic ---
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
    const updatedFolders = (user.folders || []).map(f => f.id === folderId ? { ...f, name: newName } : f);
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

  // --- Schedule & Appointment Logic ---
  
  const updateScheduleSettings = (newSettings: ScheduleSettings) => setScheduleSettings(newSettings);

  const addAppointment = (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppt]);
  };

  const updateAppointment = (appt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === appt.id ? appt : a));
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAppointmentPermanently = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const checkAvailability = (dateStr: string): string[] => {
    // 1. Check if blocked full day
    if (scheduleSettings.blockedDates.includes(dateStr)) return [];

    // 2. Check if workday
    const dateObj = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone edge cases
    const dayOfWeek = dateObj.getDay(); // 0-6
    if (!scheduleSettings.workDays.includes(dayOfWeek)) return [];

    // 3. Generate slots (hourly)
    const slots: string[] = [];
    let startH = parseInt(scheduleSettings.startHour.split(':')[0]);
    let endH = parseInt(scheduleSettings.endHour.split(':')[0]);

    for (let h = startH; h < endH; h++) {
      const timeSlot = `${h.toString().padStart(2, '0')}:00`;
      
      // 4. Check specific blocked slots
      const isBlockedSlot = scheduleSettings.blockedSlots?.some(
          b => b.date === dateStr && b.time === timeSlot
      );
      if (isBlockedSlot) continue;

      // 5. Check conflicts with existing appointments
      const isTaken = appointments.some(a => 
        a.date === dateStr && 
        a.time === timeSlot && 
        a.status !== 'cancelled'
      );

      if (!isTaken) {
        slots.push(timeSlot);
      }
    }
    return slots;
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

  const logAiFeedback = (item: Omit<AiFeedbackItem, 'id' | 'createdAt'>) => {
    const newItem: AiFeedbackItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setAiFeedbacks(prev => [newItem, ...prev]);
  };

  const addMessageToChat = (message: ChatMessage) => {
    setCurrentChatMessages(prev => [...prev, message]);
  };

  const sendMessageToAI = async (message: string) => {
    let updatedMessages = [...currentChatMessages];

    if (updatedMessages.length === 0) {
        const greetingRaw = settings.aiConfig.defaultGreeting || "Olá. Como posso ajudar?";
        let personalizedGreeting = greetingRaw;
        if (currentUser) {
            personalizedGreeting = greetingRaw.replace('{name}', currentUser.name.split(' ')[0]);
        } else {
            personalizedGreeting = greetingRaw.replace(' {name}', '').replace('{name}', '');
        }

        updatedMessages.push({
            id: 'init-greeting',
            role: 'model',
            text: personalizedGreeting
        });
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: message };
    updatedMessages.push(userMsg);
    setCurrentChatMessages(updatedMessages);

    try {
      // Pass office details and other context
      const responseData = await chatWithConcierge(updatedMessages, { 
        user: currentUser,
        memories: currentUser?.memories || [],
        office: siteContent.office // Inject Office Data
      }, settings.aiConfig);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseData.text,
        uiComponent: responseData.uiComponent,
        actions: responseData.actions
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
      aiFeedbacks,
      login, 
      logout, 
      registerUser,
      addProject, 
      updateProject, 
      deleteProject,
      updateSiteContent,
      updateSettings,
      sendMessageToAI,
      addMessageToChat,
      currentChatMessages,
      createNewChat,
      logAiFeedback,
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
      // Scheduling
      appointments,
      scheduleSettings,
      updateScheduleSettings,
      addAppointment,
      updateAppointment,
      updateAppointmentStatus,
      deleteAppointmentPermanently,
      checkAvailability,
      // Toast
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