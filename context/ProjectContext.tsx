

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, AdminNote, ClientMemory, ChatMessage, ChatSession, ClientFolder, ClientFile, AiFeedbackItem, Appointment, ScheduleSettings, Address, ContentBlock } from '../types';
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
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
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
  blockedDates: []
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

// Default Blocks definition to be used in initialization
const DEFAULT_OFFICE_BLOCKS: ContentBlock[] = [
  { 
    id: 'hero', 
    type: 'image-full', 
    content: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop', 
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
    items: ['https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2340&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&auto=format&fit=crop']
  },
  {
    id: 'map-section',
    type: 'map',
    content: 'Localização'
  }
];

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
      const parsed = JSON.parse(saved);
      if (parsed.aiConfig && typeof parsed.aiConfig.useCustomSystemInstruction === 'undefined') {
        parsed.aiConfig.useCustomSystemInstruction = false;
      }
      if (parsed.aiConfig && typeof parsed.aiConfig.defaultGreeting === 'undefined') {
        parsed.aiConfig.defaultGreeting = DEFAULT_SETTINGS.aiConfig.defaultGreeting;
      }
      return parsed;
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
    const defaultContent: SiteContent = {
      about: {
        heroSubtitle: 'Quem Somos',
        heroTitle: 'Arquitetura com alma e propósito.',
        heroImage: 'https://images.unsplash.com/photo-1506097425191-7ad538b29cef?q=80&w=2340&auto=format&fit=crop',
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
        hoursDescription: 'Segunda a Sexta, 09h às 18h',
        blocks: DEFAULT_OFFICE_BLOCKS
      }
    };

    if (savedContent) {
      const parsed = JSON.parse(savedContent);
      // Migration: Ensure office blocks exist and are populated if empty/undefined in old data
      if (!parsed.office || !parsed.office.blocks || parsed.office.blocks.length === 0) {
        parsed.office = {
          ...(parsed.office || defaultContent.office),
          blocks: DEFAULT_OFFICE_BLOCKS
        };
      }
      // Migration: Ensure About data exists
      if (!parsed.about) {
        parsed.about = defaultContent.about;
      }
      return parsed;
    }
    return defaultContent;
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
      phone, // New