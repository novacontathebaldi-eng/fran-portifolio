

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, AdminNote, ClientMemory, ChatMessage, ChatSession, ClientFolder, ClientFile, AiFeedbackItem, Appointment, ScheduleSettings, Address, CulturalProject } from '../types';
import { MOCK_PROJECTS, MOCK_CULTURAL_PROJECTS } from '../data';
import { chatWithConcierge } from '../api/chat';
import { supabase } from '../supabaseClient';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

interface ProjectContextType {
  projects: Project[];
  culturalProjects: CulturalProject[];
  currentUser: User | null;
  users: User[]; // Restored for Admin Dashboard
  siteContent: SiteContent;
  settings: GlobalSettings;
  adminNotes: AdminNote[];
  aiFeedbacks: AiFeedbackItem[];
  
  // Auth (Updated for Supabase)
  login: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  logout: () => Promise<void>;
  registerUser: (name: string, email: string, phone: string, password: string) => Promise<{ user: User | null; error: any }>;
  
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  
  addCulturalProject: (project: CulturalProject) => void;
  updateCulturalProject: (project: CulturalProject) => void;
  deleteCulturalProject: (id: string) => void;

  updateSiteContent: (content: SiteContent) => void;
  updateSettings: (settings: GlobalSettings) => void;
  
  sendMessageToAI: (message: string) => Promise<any>;
  addMessageToChat: (message: ChatMessage) => void;
  updateMessageUI: (id: string, uiComponent: any) => void;
  currentChatMessages: ChatMessage[];
  createNewChat: () => void;
  logAiFeedback: (item: Omit<AiFeedbackItem, 'id' | 'createdAt'>) => void;
  
  clientMemories: ClientMemory[];
  addClientMemory: (memory: Omit<ClientMemory, 'id' | 'createdAt'>) => void;
  updateClientMemory: (id: string, content: string) => void;
  deleteClientMemory: (id: string) => void;

  createClientFolder: (userId: string, folderName: string) => void;
  renameClientFolder: (userId: string, folderId: string, newName: string) => void;
  deleteClientFolder: (userId: string, folderId: string) => void;
  uploadFileToFolder: (userId: string, folderId: string, file: File) => Promise<void>;
  deleteClientFile: (userId: string, folderId: string, fileId: string) => void;

  updateUser: (user: User) => void;
  
  addAdminNote: (note: Omit<AdminNote, 'id' | 'date' | 'status'>) => void;
  markNoteAsRead: (id: string) => void;
  deleteAdminNote: (id: string) => void;

  appointments: Appointment[];
  scheduleSettings: ScheduleSettings;
  updateScheduleSettings: (settings: ScheduleSettings) => void;
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  updateAppointment: (appt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  deleteAppointmentPermanently: (id: string) => void;
  checkAvailability: (date: string) => string[];

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
    systemInstruction: `VOCÊ É O "CONCIERGE DIGITAL" DA FRAN SILLER ARQUITETURA...`,
    defaultGreeting: "Olá {name}. Sou o Concierge Digital Fran Siller. Como posso tornar seu dia melhor?",
    temperature: 0.7
  }
};

const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  enabled: true,
  workDays: [1, 2, 3, 4, 5],
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
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:00',
    location: 'Online (Google Meet)',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SITE_CONTENT: SiteContent = {
  about: {
    heroSubtitle: 'Quem Somos',
    heroTitle: 'Arquitetura com alma e propósito.',
    heroImage: 'https://picsum.photos/seed/architect_portrait/1920/1080',
    profileImage: 'https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/378557752_597176842380637_7080388795805736658_n..jpg',
    bio: `Com mais de 15 anos de experiência no mercado de arquitetura de alto padrão, Fran Siller fundou seu escritório com uma premissa clara...`,
    stats: [
      { id: '1', value: '15+', label: 'Anos de Exp.' },
      { id: '2', value: '80+', label: 'Projetos' },
      { id: '3', value: '12', label: 'Prêmios' }
    ],
    pillars: [
      { id: 'p1', title: 'Sustentabilidade', description: 'Priorizamos materiais naturais...' },
      { id: 'p2', title: 'Atemporalidade', description: 'Fugimos de tendências passageiras...' },
      { id: 'p3', title: 'Experiência Humana', description: 'A arquitetura deve servir às pessoas...' }
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
        content: 'Nosso espaço foi projetado para inspirar...' 
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
  const [culturalProjects, setCulturalProjects] = useState<CulturalProject[]>(MOCK_CULTURAL_PROJECTS);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
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

  // --- Auth & Sync Logic (SUPABASE) ---

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data) {
        // Map Supabase profile to App User Type
        const mappedUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as 'admin' | 'client',
          phone: data.phone,
          avatar: data.avatar,
          bio: data.bio,
          // Initialize mock relational data to avoid crashes
          folders: [], 
          memories: [],
          chats: [],
          projects: [], 
          favorites: [],
          appointments: [],
          addresses: []
        };
        setCurrentUser(mappedUser);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Only fetch if we don't have the user or it's a different user
        if (!currentUser || currentUser.id !== session.user.id) {
            fetchProfile(session.user.id);
        }
      } else {
        setCurrentUser(null);
        setCurrentChatMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []); 

  // Fetch Users for Admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchAllUsers = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) {
           const mapped: User[] = data.map((d: any) => ({
             id: d.id,
             name: d.name,
             email: d.email,
             role: d.role,
             phone: d.phone,
             avatar: d.avatar,
             bio: d.bio,
             folders: [],
             memories: [],
             chats: [],
             projects: [],
             favorites: [],
             appointments: [],
             addresses: []
           }));
           setUsers(mapped);
        }
      };
      fetchAllUsers();
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<{ user: User | null; error: any }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Login Error:", error);
      return { user: null, error };
    }

    if (data.user) {
       return { user: null, error: null }; 
    }

    return { user: null, error: 'Unknown error' };
  };

  const registerUser = async (name: string, email: string, phone: string, password: string): Promise<{ user: User | null; error: any }> => {
    // 1. Sign Up in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone } // Metadata used by triggers if configured
      }
    });

    if (authError) return { user: null, error: authError };

    if (authData.user) {
      // 2. Create Profile Entry manually
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id, // Linked to auth.users.id
            name: name,
            email: email,
            phone: phone,
            role: 'client', // Default role
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        return { user: null, error: profileError };
      }

      return { user: null, error: null }; 
    }
    
    return { user: null, error: 'Unknown error' };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error", error);
  };

  // --- CRUD Project ---
  const addProject = (project: Project) => setProjects(prev => [project, ...prev]);
  const updateProject = (project: Project) => setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  
  // --- CRUD Cultural Project ---
  const addCulturalProject = (project: CulturalProject) => setCulturalProjects(prev => [project, ...prev]);
  const updateCulturalProject = (project: CulturalProject) => setCulturalProjects(prev => prev.map(p => p.id === project.id ? project : p));
  const deleteCulturalProject = (id: string) => setCulturalProjects(prev => prev.filter(p => p.id !== id));

  const updateUser = (updatedUser: User) => {
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    // Update users list as well
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  // --- Client Memory Logic ---
  const addClientMemory = (memory: Omit<ClientMemory, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const newMemory: ClientMemory = {
      ...memory,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const updatedMemories = [...(currentUser.memories || []), newMemory];
    setCurrentUser({ ...currentUser, memories: updatedMemories });
    // Update in users list too
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, memories: updatedMemories } : u));
  };

  const updateClientMemory = (id: string, content: string) => {
    if (!currentUser) return;
    const updatedMemories = (currentUser.memories || []).map(m => m.id === id ? { ...m, content } : m);
    setCurrentUser({ ...currentUser, memories: updatedMemories });
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, memories: updatedMemories } : u));
  };

  const deleteClientMemory = (id: string) => {
    if (!currentUser) return;
    const updatedMemories = (currentUser.memories || []).filter(m => m.id !== id);
    setCurrentUser({ ...currentUser, memories: updatedMemories });
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, memories: updatedMemories } : u));
  };

  // --- Folder & File Management Logic (Mocked in Local State for now) ---
  const createClientFolder = (userId: string, folderName: string) => {
     const newFolder: ClientFolder = {
          id: Math.random().toString(36).substr(2, 9),
          name: folderName,
          createdAt: new Date().toISOString(),
          files: []
     };

     if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, folders: [...(currentUser.folders || []), newFolder] });
     }
     
     setUsers(prev => prev.map(u => u.id === userId ? { ...u, folders: [...(u.folders || []), newFolder] } : u));
  };

  const renameClientFolder = (userId: string, folderId: string, newName: string) => {
     if (currentUser && currentUser.id === userId) {
        const updatedFolders = (currentUser.folders || []).map(f => f.id === folderId ? { ...f, name: newName } : f);
        setCurrentUser({ ...currentUser, folders: updatedFolders });
     }
     
     setUsers(prev => prev.map(u => u.id === userId ? { 
       ...u, 
       folders: (u.folders || []).map(f => f.id === folderId ? { ...f, name: newName } : f) 
     } : u));
  };

  const deleteClientFolder = (userId: string, folderId: string) => {
     if (currentUser && currentUser.id === userId) {
        const updatedFolders = (currentUser.folders || []).filter(f => f.id !== folderId);
        setCurrentUser({ ...currentUser, folders: updatedFolders });
     }

     setUsers(prev => prev.map(u => u.id === userId ? { 
       ...u, 
       folders: (u.folders || []).filter(f => f.id !== folderId) 
     } : u));
  };

  const uploadFileToFolder = async (userId: string, folderId: string, file: File) => {
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

    if (currentUser && currentUser.id === userId) {
        const updatedFolders = (currentUser.folders || []).map(f => {
          if (f.id === folderId) {
            return { ...f, files: [...f.files, newFile] };
          }
          return f;
        });
        setCurrentUser({ ...currentUser, folders: updatedFolders });
    }

    setUsers(prev => prev.map(u => u.id === userId ? { 
       ...u, 
       folders: (u.folders || []).map(f => {
          if (f.id === folderId) {
            return { ...f, files: [...f.files, newFile] };
          }
          return f;
       })
     } : u));
  };

  const deleteClientFile = (userId: string, folderId: string, fileId: string) => {
     if (currentUser && currentUser.id === userId) {
        const updatedFolders = (currentUser.folders || []).map(f => {
          if (f.id === folderId) {
            return { ...f, files: f.files.filter(file => file.id !== fileId) };
          }
          return f;
        });
        setCurrentUser({ ...currentUser, folders: updatedFolders });
     }

     setUsers(prev => prev.map(u => u.id === userId ? { 
       ...u, 
       folders: (u.folders || []).map(f => {
          if (f.id === folderId) {
            return { ...f, files: f.files.filter(file => file.id !== fileId) };
          }
          return f;
       })
     } : u));
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
    if (scheduleSettings.blockedDates.includes(dateStr)) return [];

    const dateObj = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = dateObj.getDay(); 
    if (!scheduleSettings.workDays.includes(dayOfWeek)) return [];

    const slots: string[] = [];
    let startH = parseInt(scheduleSettings.startHour.split(':')[0]);
    let endH = parseInt(scheduleSettings.endHour.split(':')[0]);

    for (let h = startH; h < endH; h++) {
      const timeSlot = `${h.toString().padStart(2, '0')}:00`;
      
      const isBlockedSlot = scheduleSettings.blockedSlots?.some(
          b => b.date === dateStr && b.time === timeSlot
      );
      if (isBlockedSlot) continue;

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
    setCurrentChatMessages([]);
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

  const updateMessageUI = (id: string, uiComponent: any) => {
    setCurrentChatMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, uiComponent } : msg
    ));
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
      const responseData = await chatWithConcierge(updatedMessages, { 
        user: currentUser,
        memories: currentUser?.memories || [],
        office: siteContent.office 
      }, settings.aiConfig);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseData.text,
        uiComponent: responseData.uiComponent,
        actions: responseData.actions
      };
      
      if (responseData.actions) {
         responseData.actions.forEach((action: any) => {
            if (action.type === 'learnMemory') {
               addClientMemory(action.payload);
            }
         });
      }

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
      culturalProjects, 
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
      addCulturalProject,
      updateCulturalProject,
      deleteCulturalProject,
      updateSiteContent,
      updateSettings,
      sendMessageToAI,
      addMessageToChat,
      updateMessageUI,
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
      appointments,
      scheduleSettings,
      updateScheduleSettings,
      addAppointment,
      updateAppointment,
      updateAppointmentStatus,
      deleteAppointmentPermanently,
      checkAvailability,
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