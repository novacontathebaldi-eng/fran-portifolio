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
  
  // Auth
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
  archiveCurrentChat: () => Promise<void>;
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
    blocks: []
  }
};

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
  
  // Chat State
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>([]);
  
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [aiFeedbacks, setAiFeedbacks] = useState<AiFeedbackItem[]>([]);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });
  
  // Schedule State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(DEFAULT_SCHEDULE_SETTINGS);

  // Settings & Content
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // --- HELPER: Fetch Full User Profile (with memories/folders) ---
  const fetchFullUserProfile = async (userId: string): Promise<User | null> => {
    try {
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error || !profile) return null;

        // Fetch Memories
        const { data: memories } = await supabase.from('client_memories').select('*').eq('user_id', userId);
        
        // Fetch Folders with Files
        const { data: folders } = await supabase.from('client_folders').select('*, files:client_files(*)').eq('user_id', userId);

        // Fetch Appointments for this user
        const { data: userAppts } = await supabase.from('appointments').select('*').eq('client_id', userId);

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'client',
          phone: profile.phone,
          avatar: profile.avatar,
          bio: profile.bio,
          cpf: profile.cpf,
          birthDate: profile.birth_date, // Map from snake_case
          addresses: profile.addresses || [],
          
          memories: memories || [],
          folders: folders || [],
          appointments: userAppts || [],
          
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

      // 3. Settings
      const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
      if (settingsData) {
        if (settingsData.content) setSiteContent({ ...DEFAULT_SITE_CONTENT, ...settingsData.content });
        if (settingsData.settings) setSettings({ ...DEFAULT_SETTINGS, ...settingsData.settings });
        if (settingsData.schedule_settings) setScheduleSettings({ ...DEFAULT_SCHEDULE_SETTINGS, ...settingsData.schedule_settings });
      }

      // 4. Appointments
      const { data: aptData } = await supabase.from('appointments').select('*');
      if (aptData) setAppointments(aptData);
  };

  useEffect(() => {
    fetchGlobalData();

    // Session Management
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const user = await fetchFullUserProfile(session.user.id);
        if (user) setCurrentUser(user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
          if (!currentUser || currentUser.id !== session.user.id) {
             const user = await fetchFullUserProfile(session.user.id);
             if (user) setCurrentUser(user);
          }
      } else {
        setCurrentUser(null);
        setCurrentChatMessages([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []); 

  // --- Admin: Fetch All Users (Deep fetch) ---
  useEffect(() => {
    // FIX: Robust check for admin role to fetch all users
    if (currentUser?.role === 'admin') {
      const fetchAllUsers = async () => {
        try {
          const { data: profiles, error } = await supabase.from('profiles').select('*');
          
          if (error) {
              console.error("Error fetching profiles for admin:", error);
              return;
          }

          if (!profiles) return;

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
  }, [currentUser?.role]);

  // --- AUTH ACTIONS ---
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return { user: null, error: { message: translateAuthError(error.message) } };
    }
    return { user: null, error: null };
  };

  const registerUser = async (name: string, email: string, phone: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (error) {
        return { user: null, error: { message: translateAuthError(error.message) } };
    }

    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ name: name, phone: phone })
            .eq('id', data.user.id);
            
        if (profileError) console.error("Error updating profile phone:", profileError);
    }

    return { user: null, error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const persistSettings = async (newContent?: SiteContent, newSettings?: GlobalSettings, newSchedule?: ScheduleSettings) => {
    const updates: any = {};
    if (newContent) updates.content = newContent;
    if (newSettings) updates.settings = newSettings;
    if (newSchedule) updates.schedule_settings = newSchedule;

    const { error } = await supabase.from('site_settings').upsert({ id: 'main', ...updates });
    if (error) console.error("Error saving settings:", error);
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
    setSiteContent(content);
    persistSettings(content, undefined, undefined);
  };

  const updateSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    persistSettings(undefined, newSettings, undefined);
  };

  const updateScheduleSettings = (newSettings: ScheduleSettings) => {
    setScheduleSettings(newSettings);
    persistSettings(undefined, undefined, newSettings);
  };

  const updateUser = async (updatedUser: User) => {
    const { error } = await supabase.from('profiles').update({
      name: updatedUser.name,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      cpf: updatedUser.cpf,
      birth_date: updatedUser.birthDate,
      chats: updatedUser.chats // Sync chats if updated
    }).eq('id', updatedUser.id);

    if (!error) {
      if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } else {
        showToast("Erro ao atualizar perfil.", "error");
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
        setCurrentUser({...currentUser, memories: updated});
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
        const { data: aptData } = await supabase.from('appointments').select('*');
        if (aptData) setAppointments(aptData);
        if (currentUser && currentUser.id === appt.clientId) {
            const { data: userAppts } = await supabase.from('appointments').select('*').eq('client_id', currentUser.id);
            if (userAppts) setCurrentUser(prev => prev ? ({ ...prev, appointments: userAppts }) : null);
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

  // --- AI Chat Logic ---
  const createNewChat = () => setCurrentChatMessages([]);

  const archiveCurrentChat = async () => {
    if (currentChatMessages.length === 0) return;
    
    if (currentUser) {
       // Save to profile if logged in
       const newChat: ChatSession = {
           id: Date.now().toString(),
           title: `Conversa de ${new Date().toLocaleDateString('pt-BR')}`,
           messages: currentChatMessages,
           createdAt: new Date().toISOString(),
           lastUpdated: new Date().toISOString()
       };
       
       const updatedChats = [newChat, ...(currentUser.chats || [])];
       await updateUser({ ...currentUser, chats: updatedChats });
    }
    
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
      archiveCurrentChat,
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