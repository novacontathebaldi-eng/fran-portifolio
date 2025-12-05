import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, AdminNote, ClientMemory, ChatMessage, ClientFolder, ClientFile, AiFeedbackItem, Appointment, ScheduleSettings, Address, CulturalProject, ChatSession } from '../types';
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
  users: User[];
  siteContent: SiteContent;
  settings: GlobalSettings;
  adminNotes: AdminNote[];
  aiFeedbacks: AiFeedbackItem[];
  isLoadingAuth: boolean;
  isLoadingData: boolean;

  // Auth
  login: (email: string, password: string) => Promise<{ user: any | null; error: any }>;
  logout: () => Promise<void>;
  registerUser: (name: string, email: string, phone: string, password: string) => Promise<{ user: any | null; error: any }>;

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
  loadChatMessages: (messages: ChatMessage[]) => void;
  createNewChat: () => void;
  archiveCurrentChat: () => Promise<'success' | 'guest' | 'error'>;
  clearCurrentChat: () => void; // New simple clear
  restoreChatSession: (chatId: string) => void;
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

  updateUser: (user: User) => Promise<boolean>;

  addAdminNote: (note: Omit<AdminNote, 'id' | 'date' | 'status'>) => void;
  markNoteAsRead: (id: string) => void;
  deleteAdminNote: (id: string) => void;

  appointments: Appointment[];
  scheduleSettings: ScheduleSettings;
  updateScheduleSettings: (settings: ScheduleSettings) => void;
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateAppointment: (appt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  deleteAppointmentPermanently: (id: string) => void;
  checkAvailability: (date: string) => string[];

  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// UUID CONSTANT FOR SINGLETON SETTINGS ROW
const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';
const LS_CHAT_KEY = 'active_chat_session';

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

const DEFAULT_SITE_CONTENT: SiteContent = {
  about: {
    heroSubtitle: 'Ateliê de Arquitetura',
    heroTitle: 'Arquitetura que dialoga com o tempo, a memória e a paisagem',
    heroImage: 'https://qtlntypxagxhzlzpemvx.supabase.co/storage/v1/object/public/storage-Fran/fotoheroabout.png',
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
    address: 'Rua Vereador Sebastião José Siller, 330, Centro',
    street: 'Rua Vereador Sebastião José Siller',
    number: '330',
    district: 'Centro',
    city: 'Santa Leopoldina',
    state: 'ES',
    zipCode: '29640-000',
    mapsLink: 'https://maps.app.goo.gl/fxYnZFrFxKQshMfe9',
    mapQuery: '',
    hoursDescription: 'Segunda a Sexta, 09h às 17h',
    email: 'contato@fransiller.com.br',
    phone: '+55 (27) 99667-0426',
    blocks: []
  }
};

// Helper to map DB Snake Case to App Camel Case
const mapAppointment = (a: any): Appointment => ({
  id: a.id,
  clientId: a.client_id,
  clientName: a.client_name,
  type: a.type,
  date: a.date,
  time: a.time,
  location: a.location,
  meetingLink: a.meeting_link,
  status: a.status,
  createdAt: a.created_at,
  notes: a.notes
});

const translateAuthError = (message: string): string => {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos. Tente novamente.";
  if (message.includes("User already registered")) return "Este e-mail já está cadastrado. Tente fazer login.";
  if (message.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("Email not confirmed")) return "Verifique seu e-mail para confirmar a conta.";
  return "Ocorreu um erro na autenticação. Tente novamente.";
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Global Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [culturalProjects, setCulturalProjects] = useState<CulturalProject[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Chat State - Initialize from LocalStorage
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LS_CHAT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar chat do localStorage", e);
      return [];
    }
  });

  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [aiFeedbacks, setAiFeedbacks] = useState<AiFeedbackItem[]>([]);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });

  // Schedule State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(DEFAULT_SCHEDULE_SETTINGS);

  // Settings & Content
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  // --- PERSISTENCE EFFECT FOR CHAT ---
  useEffect(() => {
    if (currentChatMessages.length > 0) {
      localStorage.setItem(LS_CHAT_KEY, JSON.stringify(currentChatMessages));
    } else {
      // Clean up empty state
      localStorage.removeItem(LS_CHAT_KEY);
    }
  }, [currentChatMessages]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const fetchFullUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error || !profile) return null;

      const { data: memories } = await supabase.from('client_memories').select('*').eq('user_id', userId);
      const { data: folders } = await supabase.from('client_folders').select('*, files:client_files(*)').eq('user_id', userId);

      // Fetch appointments for this user specifically
      const { data: userAppts } = await supabase.from('appointments').select('*').eq('client_id', userId);
      const mappedAppts = userAppts ? userAppts.map(mapAppointment) : [];

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'admin' | 'client',
        phone: profile.phone,
        avatar: profile.avatar,
        bio: profile.bio,
        cpf: profile.cpf,
        birthDate: profile.birth_date,
        addresses: profile.addresses || [],

        memories: memories || [],
        folders: folders || [],
        appointments: mappedAppts,

        chats: profile.chats || [],
        projects: [],
        favorites: [],
      };
    } catch (e) {
      console.error("Error fetching full profile:", e);
      return null;
    }
  };

  // --- INITIAL DATA FETCHING ---
  const fetchGlobalData = async () => {
    // 1. Projects
    const { data: projectsData } = await supabase.from('projects').select('*').order('year', { ascending: false });
    if (projectsData) setProjects(projectsData);

    // 2. Cultural Projects
    const { data: cultData } = await supabase.from('cultural_projects').select('*').order('year', { ascending: false });
    if (cultData) setCulturalProjects(cultData);

    // 3. Settings & Content - USING UUID AND 3 COLUMNS
    const { data: settingsRow } = await supabase
      .from('site_settings')
      .select('about, office, settings')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (settingsRow) {
      // Update Site Content (About + Office)
      setSiteContent({
        about: { ...DEFAULT_SITE_CONTENT.about, ...(settingsRow.about || {}) },
        office: { ...DEFAULT_SITE_CONTENT.office, ...(settingsRow.office || {}) }
      });

      // Update Global Settings + Schedule (bundled in 'settings' column)
      const savedBundle = settingsRow.settings || {};

      if (savedBundle.global) {
        setSettings({ ...DEFAULT_SETTINGS, ...savedBundle.global });
      }
      if (savedBundle.schedule) {
        setScheduleSettings({ ...DEFAULT_SCHEDULE_SETTINGS, ...savedBundle.schedule });
      }
    }

    // 4. Appointments (Admin View - Fetch All)
    const { data: aptData } = await supabase.from('appointments').select('*');
    if (aptData) {
      // Map snake_case to camelCase
      const mapped = aptData.map(mapAppointment);
      setAppointments(mapped);
    }

    setIsLoadingData(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchGlobalData();

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = await fetchFullUserProfile(session.user.id);
        if (user) setCurrentUser(user);
      }
      setIsLoadingAuth(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Only fetch if we don't have the user or it's a different user
        if (!currentUser || currentUser.id !== session.user.id) {
          const user = await fetchFullUserProfile(session.user.id);
          if (user) setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        // Do NOT clear chat messages on logout to preserve context for the user
      }
      setIsLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- Admin: Fetch All Users ---
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchAllUsers = async () => {
        try {
          const { data: profiles, error } = await supabase.from('profiles').select('*');
          if (error || !profiles) return;

          const { data: allFolders } = await supabase.from('client_folders').select('*, files:client_files(*)');
          const { data: allMemories } = await supabase.from('client_memories').select('*');

          const mapped: User[] = profiles.map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            phone: p.phone,
            avatar: p.avatar,
            bio: p.bio,
            cpf: p.cpf,
            birthDate: p.birth_date,
            addresses: p.addresses || [],

            folders: allFolders?.filter((f: any) => f.user_id === p.id) || [],
            memories: allMemories?.filter((m: any) => m.user_id === p.id) || [],
            appointments: [],
            chats: p.chats || [],
            projects: [],
            favorites: [],
          }));

          setUsers(mapped);
        } catch (err) {
          console.error("Critical error in Admin User Fetch:", err);
        }
      };

      fetchAllUsers();
    }
  }, [currentUser?.role, currentUser?.folders, currentUser?.memories]);

  // --- AUTH ACTIONS ---

  const login = async (email: string, password: string) => {
    setIsLoadingAuth(true); // Force loading state so ProtectedRoutes wait
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoadingAuth(false);
      return { user: null, error: { message: translateAuthError(error.message) } };
    }

    // Force fetch profile immediately to update state BEFORE return
    if (data.user) {
      const user = await fetchFullUserProfile(data.user.id);
      setCurrentUser(user);
    }

    setIsLoadingAuth(false);
    return { user: data.user, error: null };
  };

  const registerUser = async (name: string, email: string, phone: string, password: string) => {
    setIsLoadingAuth(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (error) {
      setIsLoadingAuth(false);
      return { user: null, error: { message: translateAuthError(error.message) } };
    }

    if (data.user) {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: name, phone: phone })
        .eq('id', data.user.id);

      if (profileError) console.error("Error updating profile phone:", profileError);

      // Fetch full profile to ensure state is ready
      const user = await fetchFullUserProfile(data.user.id);
      setCurrentUser(user);
    }

    setIsLoadingAuth(false);
    return { user: data.user, error: null };
  };

  const logout = async () => {
    setCurrentUser(null); // Optimistic clear for immediate UI feedback
    await supabase.auth.signOut();
  };

  // --- SETTINGS PERSISTENCE (FIXED) ---
  const persistSettings = async (newContent?: SiteContent, newSettings?: GlobalSettings, newSchedule?: ScheduleSettings) => {
    // 1. Determine final state
    const finalContent = newContent || siteContent;
    const finalSettings = newSettings || settings;
    const finalSchedule = newSchedule || scheduleSettings;

    // 2. Update Local State IMMEDIATELY (Optimistic UI)
    if (newContent) setSiteContent(newContent);
    if (newSettings) setSettings(newSettings);
    if (newSchedule) setScheduleSettings(newSchedule);

    // 3. Prepare DB Payload - Mapping to the 3 distinct JSONB columns
    const payload = {
      id: SETTINGS_ID,
      about: finalContent.about,
      office: finalContent.office,
      settings: {
        global: finalSettings,
        schedule: finalSchedule
      }
    };

    // 4. Send to Supabase
    const { error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Error saving settings to DB:", error);
      showToast("Erro ao salvar alterações no banco de dados.", "error");
      // Optional: Revert local state if critical
    }
  };

  const addProject = async (project: Project) => {
    const { error } = await supabase.from('projects').insert(project);
    if (!error) {
      fetchGlobalData();
    } else {
      showToast('Erro ao salvar projeto.', 'error');
    }
  };

  const updateProject = async (project: Project) => {
    const { error } = await supabase.from('projects').update(project).eq('id', project.id);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    } else {
      showToast('Erro ao atualizar projeto.', 'error');
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addCulturalProject = async (project: CulturalProject) => {
    const { error } = await supabase.from('cultural_projects').insert(project);
    if (!error) fetchGlobalData();
  };

  const updateCulturalProject = async (project: CulturalProject) => {
    const { error } = await supabase.from('cultural_projects').update(project).eq('id', project.id);
    if (!error) setCulturalProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  const deleteCulturalProject = async (id: string) => {
    const { error } = await supabase.from('cultural_projects').delete().eq('id', id);
    if (!error) setCulturalProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateSiteContent = (content: SiteContent) => {
    persistSettings(content, undefined, undefined);
  };

  const updateSettings = (newSettings: GlobalSettings) => {
    persistSettings(undefined, newSettings, undefined);
  };

  const updateScheduleSettings = (newSettings: ScheduleSettings) => {
    persistSettings(undefined, undefined, newSettings);
  };

  // UPDATED: Now returns boolean status to caller
  const updateUser = async (updatedUser: User): Promise<boolean> => {
    const { error } = await supabase.from('profiles').update({
      name: updatedUser.name,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      cpf: updatedUser.cpf,
      birth_date: updatedUser.birthDate,
      chats: updatedUser.chats
    }).eq('id', updatedUser.id);

    if (!error) {
      if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      return true;
    } else {
      console.error("Error updating user:", error);
      showToast("Erro ao atualizar perfil.", "error");
      return false;
    }
  };

  const addClientMemory = async (memory: Omit<ClientMemory, 'id' | 'createdAt'>) => {
    if (!currentUser) return;

    const { data, error } = await supabase.from('client_memories').insert({
      user_id: currentUser.id,
      topic: memory.topic,
      content: memory.content,
      type: memory.type
    }).select().single();

    if (data && !error) {
      const newMem: ClientMemory = {
        id: data.id,
        topic: data.topic,
        content: data.content,
        type: data.type,
        createdAt: data.created_at
      };
      const updatedMemories = [...(currentUser.memories || []), newMem];
      setCurrentUser({ ...currentUser, memories: updatedMemories });
    }
  };

  const updateClientMemory = async (id: string, content: string) => {
  };

  const deleteClientMemory = async (id: string) => {
    const { error } = await supabase.from('client_memories').delete().eq('id', id);
    if (!error && currentUser) {
      const updated = (currentUser.memories || []).filter(m => m.id !== id);
      setCurrentUser({ ...currentUser, memories: updated });
    }
  };

  const createClientFolder = async (userId: string, folderName: string) => {
    const { data, error } = await supabase.from('client_folders').insert({
      user_id: userId,
      name: folderName
    }).select().single();

    if (data && !error) {
      const newFolder: ClientFolder = {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        files: []
      };

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, folders: [...(u.folders || []), newFolder] } : u));

      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? ({ ...prev, folders: [...(prev.folders || []), newFolder] }) : null);
      }
    } else {
      showToast("Erro ao criar pasta.", "error");
    }
  };

  const renameClientFolder = async (userId: string, folderId: string, newName: string) => {
    const { error } = await supabase.from('client_folders').update({ name: newName }).eq('id', folderId);
    if (!error) {
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        return {
          ...u,
          folders: u.folders?.map(f => f.id === folderId ? { ...f, name: newName } : f)
        };
      }));
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? ({
          ...prev,
          folders: prev.folders?.map(f => f.id === folderId ? { ...f, name: newName } : f)
        }) : null);
      }
    }
  };

  const deleteClientFolder = async (userId: string, folderId: string) => {
    const { error } = await supabase.from('client_folders').delete().eq('id', folderId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, folders: u.folders?.filter(f => f.id !== folderId) } : u));
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? ({ ...prev, folders: prev.folders?.filter(f => f.id !== folderId) }) : null);
      }
    }
  };

  const uploadFileToFolder = async (userId: string, folderId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `client_files/${userId}/${folderId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('storage-Fran').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('storage-Fran').getPublicUrl(filePath);

    const { data, error: dbError } = await supabase.from('client_files').insert({
      folder_id: folderId,
      name: file.name,
      url: publicUrlData.publicUrl,
      type: fileExt === 'pdf' ? 'pdf' : (file.type.startsWith('image/') ? 'image' : 'other'),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }).select().single();

    if (data && !dbError) {
      const newFile: ClientFile = {
        id: data.id,
        name: data.name,
        url: data.url,
        type: data.type,
        size: data.size,
        createdAt: data.created_at
      };

      const updateState = (prevUser: User) => {
        return {
          ...prevUser,
          folders: prevUser.folders?.map(f => f.id === folderId ? { ...f, files: [...f.files, newFile] } : f)
        };
      };

      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? updateState(prev) : null);
      }
      setUsers(prev => prev.map(u => u.id === userId ? updateState(u) : u));
    } else {
      throw new Error("Erro ao salvar referência do arquivo.");
    }
  };

  const deleteClientFile = async (userId: string, folderId: string, fileId: string) => {
    const { error } = await supabase.from('client_files').delete().eq('id', fileId);
    if (!error) {
      const updateState = (prevUser: User) => ({
        ...prevUser,
        folders: prevUser.folders?.map(f => f.id === folderId ? { ...f, files: f.files.filter(fi => fi.id !== fileId) } : f)
      });

      if (currentUser?.id === userId) setCurrentUser(prev => prev ? updateState(prev) : null);
      setUsers(prev => prev.map(u => u.id === userId ? updateState(u) : u));
    }
  };

  // --- APPOINTMENTS ---
  const addAppointment = async (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {

    const payload = {
      client_id: appt.clientId,
      client_name: appt.clientName,
      date: appt.date,
      time: appt.time,
      type: appt.type,
      location: appt.location,
      status: 'pending',
      meeting_link: appt.meetingLink || null,
      notes: appt.notes || null
    };

    const { data, error } = await supabase.from('appointments').insert(payload).select().single();

    if (data && !error) {
      // Refetch all to stay strictly synced
      const { data: aptData } = await supabase.from('appointments').select('*');
      if (aptData) {
        const mapped = aptData.map(mapAppointment);
        setAppointments(mapped);
      }

      // Update current user specific appointments
      if (currentUser && currentUser.id === appt.clientId) {
        const { data: userAppts } = await supabase.from('appointments').select('*').eq('client_id', currentUser.id);
        if (userAppts) {
          const mappedUserAppts = userAppts.map(mapAppointment);
          setCurrentUser(prev => prev ? ({ ...prev, appointments: mappedUserAppts }) : null);
        }
      }
    } else {
      console.error("Error adding appointment:", error);
      showToast("Erro ao agendar compromisso.", "error");
    }
  };

  const updateAppointment = async (appt: Appointment) => {
    const dbAppt = {
      status: appt.status,
      date: appt.date,
      time: appt.time,
      meeting_link: appt.meetingLink,
      notes: appt.notes
    };

    const { error } = await supabase.from('appointments').update(dbAppt).eq('id', appt.id);
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === appt.id ? appt : a));
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAppointmentPermanently = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const checkAvailability = (dateStr: string): string[] => {
    if (scheduleSettings.blockedDates.includes(dateStr)) return [];

    const dateObj = new Date(dateStr + 'T00:00:00');
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

  const createNewChat = () => {
    setCurrentChatMessages([]);
    localStorage.removeItem(LS_CHAT_KEY);
  };

  // REFACTORED ARCHIVE FUNCTION
  const archiveCurrentChat = async (): Promise<'success' | 'guest' | 'error'> => {
    // 1. If empty, just return success, no action needed
    if (currentChatMessages.length === 0) return 'success';

    // 2. Check if logged in
    if (!currentUser) {
      // Guest user: just clear the chat locally, no saving
      setCurrentChatMessages([]);
      localStorage.removeItem(LS_CHAT_KEY);
      return 'guest';
    }

    try {
      // 3. Prepare Chat Object
      // Sanitize messages: Remove circular refs or heavy UI components before saving
      const cleanMessages = currentChatMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        text: msg.text || '',
        uiComponent: msg.uiComponent ? { type: msg.uiComponent.type, data: msg.uiComponent.data } : undefined,
        actions: msg.actions
      }));

      const newChat: ChatSession = {
        id: Date.now().toString(),
        title: `Conversa de ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        messages: cleanMessages,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const updatedChats = [newChat, ...(currentUser.chats || [])];

      // 4. OPTIMISTIC UPDATE: Update Context/UI Immediately
      const optimisticUser = { ...currentUser, chats: updatedChats };
      setCurrentUser(optimisticUser);

      // 5. Clear Chat Area Immediately
      setCurrentChatMessages([]);
      localStorage.removeItem(LS_CHAT_KEY);

      // 6. Background DB Sync (Fire and Forget for UI responsiveness)
      // We use the existing updateUser which handles DB + Local State sync
      await updateUser(optimisticUser);

      return 'success';

    } catch (e) {
      console.error("Error archiving chat", e);
      return 'error';
    }
  };

  // Simple Clear for Guest or Reset
  const clearCurrentChat = () => {
    setCurrentChatMessages([]);
    localStorage.removeItem(LS_CHAT_KEY);
  }

  const restoreChatSession = (chatId: string) => {
    if (!currentUser) return;
    const session = currentUser.chats?.find(c => c.id === chatId);
    if (session) {
      setCurrentChatMessages(session.messages);
      showToast('Conversa restaurada.', 'info');
    }
  };

  const loadChatMessages = (messages: ChatMessage[]) => {
    setCurrentChatMessages(messages);
  };

  const logAiFeedback = (item: Omit<AiFeedbackItem, 'id' | 'createdAt'>) => {
    const newItem: AiFeedbackItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setAiFeedbacks(prev => [newItem, ...prev]);
  };

  const addMessageToChat = (message: ChatMessage) => setCurrentChatMessages(prev => [...prev, message]);

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
        office: siteContent.office,
        projects: projects,
        culturalProjects: culturalProjects
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

  const addAdminNote = (note: Omit<AdminNote, 'id' | 'date' | 'status'>) => {
    const newNote: AdminNote = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'new'
    };
    setAdminNotes(prev => [newNote, ...prev]);
  };
  const markNoteAsRead: (id: string) => void = (id) => setAdminNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
  const deleteAdminNote = (id: string) => setAdminNotes(prev => prev.filter(n => n.id !== id));

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
      isLoadingAuth,
      isLoadingData,
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
      loadChatMessages,
      createNewChat,
      archiveCurrentChat,
      clearCurrentChat,
      restoreChatSession,
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