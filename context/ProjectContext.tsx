import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, SiteContent, GlobalSettings, Message, ClientMemory, ChatMessage, ClientFolder, ClientFile, AiFeedbackItem, Appointment, ScheduleSettings, Address, CulturalProject, ChatSession, ShopProduct, ShopOrder, ShopOrderItem } from '../types';
import { chatWithConcierge } from '../api/chat';
import { supabase } from '../supabaseClient';
import { notifyNewAppointment } from '../utils/emailService';

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
  messages: Message[];
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
  persistAllSettings: (content: SiteContent, settings: GlobalSettings, schedule: ScheduleSettings) => Promise<boolean>;

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

  // Address Management
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address | null>;
  updateAddress: (address: Address) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;

  addMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateMessageStatus: (id: string, status: Message['status']) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

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

  // Shop / E-Commerce
  shopProducts: ShopProduct[];
  shopOrders: ShopOrder[];
  fetchShopProducts: () => Promise<void>;
  addShopProduct: (product: Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>) => Promise<ShopProduct | null>;
  updateShopProduct: (product: ShopProduct) => Promise<boolean>;
  deleteShopProduct: (id: string) => Promise<boolean>;
  fetchShopOrders: () => Promise<void>;
  updateShopOrderStatus: (orderId: string, status: ShopOrder['status']) => Promise<boolean>;
  createShopOrder: (order: Omit<ShopOrder, 'id' | 'created_at' | 'updated_at'>, items: { productId: string; quantity: number; unitPrice: number }[]) => Promise<ShopOrder | null>;
  subscribeToShopProducts: () => (() => void) | undefined;
  subscribeToProjects: () => (() => void) | undefined;
  subscribeToCulturalProjects: () => (() => void) | undefined;
  subscribeToMessages: () => (() => void) | undefined;
  subscribeToSiteSettings: () => (() => void) | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// UUID CONSTANT FOR SINGLETON SETTINGS ROW
const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';
const LS_CHAT_KEY = 'active_chat_session';

const DEFAULT_SETTINGS: GlobalSettings = {
  enableShop: true,
  aiConfig: {
    provider: 'gemini',
    useCustomSystemInstruction: false,
    systemInstruction: `VOCÊ É O "CONCIERGE DIGITAL" DA FRAN SILLER ARQUITETURA...`,
    defaultGreeting: "Olá {name}. Sou o Concierge Digital Fran Siller. Como posso tornar seu dia melhor?",
    temperature: 0.7,
    gemini: {
      model: 'gemini-2.5-flash'
    },
    groq: {
      model: 'llama-3.3-70b-versatile'
    }
  },
  chatbotConfig: {
    quickActions: [
      { id: '1', label: 'Agendar Reunião', message: 'Olá! Gostaria de agendar uma reunião para conhecer melhor o escritório.', icon: 'Calendar', order: 1, active: true },
      { id: '2', label: 'Solicitar Orçamento', message: 'Olá! Preciso de um orçamento para um projeto de arquitetura.', icon: 'Receipt', order: 2, active: true },
      { id: '3', label: 'Ver Portfólio', message: 'Gostaria de ver alguns projetos do portfólio.', icon: 'Folder', order: 3, active: true },
      { id: '4', label: 'Falar com Atendente', message: 'Gostaria de falar com um atendente humano, por favor.', icon: 'User', order: 4, active: true }
    ],
    welcomeMessage: 'Olá! Como posso ajudar você hoje?',
    transferToHumanEnabled: false,
    fallbackMessage: 'Desculpe, não consegui entender. Posso te ajudar de outra forma?',
    showQuickActionsOnOpen: true
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
    blocks: [],
    // Dynamic social links array - stored in database
    socialLinks: [],
    // Contact page config
    faqItems: [],
    contactSubjects: ['Orçamento de Projeto', 'Dúvidas Gerais', 'Imprensa / Mídia', 'Parcerias']
  },
  heroProject: null
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [aiFeedbacks, setAiFeedbacks] = useState<AiFeedbackItem[]>([]);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', isVisible: false });

  // Schedule State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(DEFAULT_SCHEDULE_SETTINGS);

  // Settings & Content
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  // Shop / E-commerce State
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([]);

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

      // Fetch addresses from the addresses table (not JSONB)
      const { data: addressesData } = await supabase.from('addresses').select('*').eq('user_id', userId);
      const mappedAddresses: Address[] = addressesData ? addressesData.map((a: any) => ({
        id: a.id,
        label: a.label || '',
        street: a.street || '',
        number: a.number || '',
        complement: a.complement || '',
        district: a.district || '',
        city: a.city || '',
        state: a.state || '',
        zipCode: a.zip_code || ''
      })) : [];

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'admin' | 'client',
        phone: profile.phone,
        avatar: profile.avatar_url, // Use correct column name
        bio: profile.bio,
        cpf: profile.cpf,
        birthDate: profile.birth_date,
        addresses: mappedAddresses,

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
    if ((import.meta as any).env?.DEV) console.log('📊 DB: Query executed', { operation: 'fetchGlobalData', timestamp: new Date().toISOString() });

    // 1. Projects
    const { data: projectsData, error: projectsError } = await supabase.from('projects').select('*').order('year', { ascending: false });
    if ((import.meta as any).env?.DEV) console.log('📊 DB: Query result', { table: 'projects', count: projectsData?.length || 0, error: projectsError?.message, timestamp: new Date().toISOString() });
    if (projectsData) setProjects(projectsData);

    // 2. Cultural Projects
    const { data: cultData, error: cultError } = await supabase.from('cultural_projects').select('*').order('year', { ascending: false });
    if ((import.meta as any).env?.DEV) console.log('📊 DB: Query result', { table: 'cultural_projects', count: cultData?.length || 0, error: cultError?.message, timestamp: new Date().toISOString() });
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
        office: { ...DEFAULT_SITE_CONTENT.office, ...(settingsRow.office || {}) },
        heroProject: settingsRow.settings?.heroProject || null
      });

      // Update Global Settings + Schedule (bundled in 'settings' column)
      const savedBundle = settingsRow.settings || {};

      if (savedBundle.global) {
        // Deep merge to preserve nested properties like chatbotConfig and aiConfig
        const savedAiConfig = savedBundle.global.aiConfig || {};
        setSettings({
          ...DEFAULT_SETTINGS,
          ...savedBundle.global,
          aiConfig: {
            ...DEFAULT_SETTINGS.aiConfig,
            ...savedAiConfig,
            // Ensure provider defaults to 'gemini' if not set (retrocompatibility)
            provider: savedAiConfig.provider || 'gemini',
            // Deep merge gemini config
            gemini: {
              ...DEFAULT_SETTINGS.aiConfig.gemini,
              ...(savedAiConfig.gemini || {}),
              // Legacy fallback: if old 'model' field exists and starts with 'gemini', use it
              model: savedAiConfig.gemini?.model ||
                (savedAiConfig.model?.startsWith('gemini') ? savedAiConfig.model : DEFAULT_SETTINGS.aiConfig.gemini.model)
            },
            // Deep merge groq config
            groq: {
              ...DEFAULT_SETTINGS.aiConfig.groq,
              ...(savedAiConfig.groq || {})
            }
          },
          chatbotConfig: savedBundle.global.chatbotConfig || DEFAULT_SETTINGS.chatbotConfig
        });
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

    // 5. Messages (Unified)
    try {
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (msgError) {
        if ((import.meta as any).env?.DEV) console.error('[Data] Messages fetch error:', msgError);
      } else if (msgData) {
        const mapped: Message[] = msgData.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          source: m.source,
          status: m.status,
          createdAt: m.created_at
        }));
        setMessages(mapped);
      }
    } catch (err) {
      if ((import.meta as any).env?.DEV) console.error('[Data] Messages fetch unexpected error:', err);
    }

    if ((import.meta as any).env?.DEV) console.log('[Data] fetchGlobalData complete!');
    setIsLoadingData(false);
  };

  // Guard and tracking refs for multi-tab race condition prevention
  const isProcessingAuthRef = React.useRef(false);
  const lastProcessedUserIdRef = React.useRef<string | null>(null);
  const authDebounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guard against double initialization (React StrictMode, HMR, etc.)
  const hasInitializedRef = React.useRef(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (hasInitializedRef.current) {
      if ((import.meta as any).env?.DEV) console.log('[Init] Skipping duplicate initialization');
      return;
    }
    hasInitializedRef.current = true;

    const init = async () => {
      await fetchGlobalData();

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        lastProcessedUserIdRef.current = session.user.id;
        const user = await fetchFullUserProfile(session.user.id);
        if (user) setCurrentUser(user);
      }
      setIsLoadingAuth(false);
    };

    init();

    // MULTI-TAB FIX: Handle auth state changes with debounce to prevent rapid duplicate events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((import.meta as any).env?.DEV) console.log('[Auth] Event:', event, 'Session:', session?.user?.id);

      // Clear any pending debounce timer
      if (authDebounceTimerRef.current) {
        clearTimeout(authDebounceTimerRef.current);
      }

      // Handle SIGNED_OUT immediately - no debounce needed
      if (event === 'SIGNED_OUT') {
        lastProcessedUserIdRef.current = null;
        setCurrentUser(null);
        setIsLoadingAuth(false);
        return;
      }

      // TOKEN_REFRESHED doesn't need user refetch
      if (event === 'TOKEN_REFRESHED') {
        if ((import.meta as any).env?.DEV) console.log('[Auth] Token refreshed - no action needed');
        setIsLoadingAuth(false);
        return;
      }

      // Skip if same user already processed (prevents duplicate SIGNED_IN events across tabs)
      const userId = session?.user?.id;
      if (userId && userId === lastProcessedUserIdRef.current && !isProcessingAuthRef.current) {
        if ((import.meta as any).env?.DEV) console.log('[Auth] Same user already processed, skipping');
        setIsLoadingAuth(false);
        return;
      }

      // Skip if currently processing
      if (isProcessingAuthRef.current) {
        if ((import.meta as any).env?.DEV) console.log('[Auth] Skipping - already processing');
        return;
      }

      // Debounce: wait 100ms before processing to batch rapid events
      authDebounceTimerRef.current = setTimeout(async () => {
        if (isProcessingAuthRef.current) {
          if ((import.meta as any).env?.DEV) console.log('[Auth] Debounced but already processing');
          return;
        }

        if (session?.user?.id && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          isProcessingAuthRef.current = true;
          try {
            if ((import.meta as any).env?.DEV) console.log('[Auth] Processing user:', session.user.id);
            const user = await fetchFullUserProfile(session.user.id);
            if (user) {
              setCurrentUser(user);
              lastProcessedUserIdRef.current = session.user.id;
            }
          } catch (error) {
            console.error('[Auth] Error fetching user profile:', error);
          } finally {
            isProcessingAuthRef.current = false;
          }
        } else if (!session) {
          setCurrentUser(null);
          lastProcessedUserIdRef.current = null;
        }

        setIsLoadingAuth(false);
      }, 100);
    });

    // Note: Global subscriptions (Settings, Messages) are now handled in a separate useEffect
    // below to ensure subscribeToSiteSettings and subscribeToMessages are properly defined

    return () => {
      if (authDebounceTimerRef.current) {
        clearTimeout(authDebounceTimerRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);


  // --- Admin: Fetch All Users ---
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchAllUsers = async () => {
        try {
          // 1. Fetch Users & Profiles
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

          // 2. Re-fetch Admin Data (Messages & Appointments) ensures validity after Auth
          // This fixes the "empty on first load" issue caused by RLS blocking the initial public fetch
          const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
          if (msgData) {
            const mappedMsgs: Message[] = msgData.map((m: any) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              phone: m.phone,
              subject: m.subject,
              message: m.message,
              source: m.source,
              status: m.status,
              createdAt: m.created_at
            }));
            setMessages(mappedMsgs);
          }

          const { data: aptData } = await supabase.from('appointments').select('*');
          if (aptData) {
            setAppointments(aptData.map(mapAppointment));
          }

          // 3. Fetch Shop Orders (Admin View)
          fetchShopOrders();

        } catch (err) {
          console.error("Critical error in Admin Data Fetch:", err);
        }
      };

      fetchAllUsers();
    }
  }, [currentUser?.role, currentUser?.folders, currentUser?.memories]);

  // --- AUTH ACTIONS ---

  const login = async (email: string, password: string) => {
    if ((import.meta as any).env?.DEV) console.log('🔐 AUTH: Login attempt', { email, timestamp: new Date().toISOString() });
    setIsLoadingAuth(true); // Force loading state so ProtectedRoutes wait
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if ((import.meta as any).env?.DEV) console.log('❌ AUTH ERROR:', { error: error.message, timestamp: new Date().toISOString() });
      setIsLoadingAuth(false);
      return { user: null, error: { message: translateAuthError(error.message) } };
    }

    // Force fetch profile immediately to update state BEFORE return
    if (data.user) {
      if ((import.meta as any).env?.DEV) console.log('🔐 AUTH: Session created', { userId: data.user.id, timestamp: new Date().toISOString() });
      const user = await fetchFullUserProfile(data.user.id);
      setCurrentUser(user);
    }

    setIsLoadingAuth(false);
    return { user: data.user, error: null };
  };

  const registerUser = async (name: string, email: string, phone: string, password: string) => {
    if ((import.meta as any).env?.DEV) console.log('🔐 AUTH: Registration attempt', { email, timestamp: new Date().toISOString() });
    setIsLoadingAuth(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (error) {
      if ((import.meta as any).env?.DEV) console.log('❌ AUTH ERROR:', { error: error.message, timestamp: new Date().toISOString() });
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
    if ((import.meta as any).env?.DEV) console.log('🔐 AUTH: Logout initiated', { userId: currentUser?.id, timestamp: new Date().toISOString() });
    setCurrentUser(null); // Optimistic clear for immediate UI feedback
    await supabase.auth.signOut();
    if ((import.meta as any).env?.DEV) console.log('🔐 AUTH: Session cleared', { timestamp: new Date().toISOString() });
  };

  // --- SETTINGS PERSISTENCE (FIXED) ---
  const persistSettings = async (newContent?: SiteContent, newSettings?: GlobalSettings, newSchedule?: ScheduleSettings): Promise<boolean> => {
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
        schedule: finalSchedule,
        heroProject: finalContent.heroProject || null
      }
    };

    // 4. Send to Supabase
    const { error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Error saving settings to DB:", error);
      return false;
    }
    return true;
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

  const updateSiteContent = async (content: SiteContent): Promise<boolean> => {
    return await persistSettings(content, undefined, undefined);
  };

  const updateSettings = async (newSettings: GlobalSettings): Promise<boolean> => {
    return await persistSettings(undefined, newSettings, undefined);
  };

  const updateScheduleSettings = async (newSettings: ScheduleSettings): Promise<boolean> => {
    return await persistSettings(undefined, undefined, newSettings);
  };

  // New unified persist function that takes ALL values explicitly to avoid race conditions
  const persistAllSettings = async (
    content: SiteContent,
    globalSettings: GlobalSettings,
    schedule: ScheduleSettings
  ): Promise<boolean> => {
    // Update local state immediately (optimistic UI)
    setSiteContent(content);
    setSettings(globalSettings);
    setScheduleSettings(schedule);

    // Prepare DB Payload
    const payload = {
      id: SETTINGS_ID,
      about: content.about,
      office: content.office,
      settings: {
        global: globalSettings,
        schedule: schedule,
        heroProject: content.heroProject || null
      }
    };

    // Send to Supabase
    const { error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Error saving all settings to DB:", error);
      return false;
    }
    return true;
  };

  // UPDATED: Now returns boolean status to caller
  const updateUser = async (updatedUser: User): Promise<boolean> => {
    const { error } = await supabase.from('profiles').update({
      name: updatedUser.name,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      avatar_url: updatedUser.avatar, // DB column is avatar_url, not avatar
      cpf: updatedUser.cpf,
      birth_date: updatedUser.birthDate
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

  // --- ADDRESS MANAGEMENT ---
  const addAddress = async (address: Omit<Address, 'id'>): Promise<Address | null> => {
    if (!currentUser) return null;

    const { data, error } = await supabase.from('addresses').insert({
      user_id: currentUser.id,
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement || null,
      district: address.district,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode
    }).select().single();

    if (error) {
      console.error('Error adding address:', error);
      showToast('Erro ao salvar endereço.', 'error');
      return null;
    }

    const newAddress: Address = {
      id: data.id,
      label: data.label,
      street: data.street,
      number: data.number,
      complement: data.complement,
      district: data.district,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code
    };

    // Update local state
    const updatedAddresses = [...(currentUser.addresses || []), newAddress];
    setCurrentUser({ ...currentUser, addresses: updatedAddresses });

    return newAddress;
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const { error } = await supabase.from('addresses').delete().eq('id', addressId);

    if (error) {
      console.error('Error deleting address:', error);
      showToast('Erro ao excluir endereço.', 'error');
      return false;
    }

    // Update local state
    const updatedAddresses = (currentUser.addresses || []).filter(a => a.id !== addressId);
    setCurrentUser({ ...currentUser, addresses: updatedAddresses });

    return true;
  };

  const updateAddress = async (address: Address): Promise<boolean> => {
    if (!currentUser) return false;

    const { error } = await supabase.from('addresses').update({
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement || null,
      district: address.district,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode
    }).eq('id', address.id);

    if (error) {
      console.error('Error updating address:', error);
      showToast('Erro ao atualizar endereço.', 'error');
      return false;
    }

    // Update local state
    const updatedAddresses = (currentUser.addresses || []).map(a =>
      a.id === address.id ? address : a
    );
    setCurrentUser({ ...currentUser, addresses: updatedAddresses });

    return true;
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

      // Enviar e-mail de notificação (Brevo)
      notifyNewAppointment({
        clientName: appt.clientName,
        date: appt.date,
        time: appt.time,
        type: appt.type
      }).catch(err => console.error('[Brevo] Erro ao enviar email de agendamento:', err));

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

  // ==================== SHOP / E-COMMERCE FUNCTIONS ====================

  const fetchShopProducts = async () => {
    if ((import.meta as any).env?.DEV) console.log('[Shop] Starting fetchShopProducts...');
    try {
      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if ((import.meta as any).env?.DEV) console.log('[Shop] Products fetched:', data?.length || 0);

      // Map DB format to app format
      const products: ShopProduct[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        price: parseFloat(p.price) || 0,
        images: p.images || [],
        stock: p.stock || 0,
        category: p.category || '',
        status: p.status || 'draft',
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      setShopProducts(products);
      if ((import.meta as any).env?.DEV) console.log('[Shop] fetchShopProducts complete!');
    } catch (error) {
      console.error('[Shop] Error fetching shop products:', error);
    }
  };

  // Subscribe to realtime changes on shop_products table
  const subscribeToShopProducts = useCallback(() => {
    const channel = supabase
      .channel('shop_products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shop_products'
        },
        (payload) => {
          console.log('[Realtime] Shop products change:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newProduct: ShopProduct = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description || '',
              price: parseFloat(payload.new.price) || 0,
              images: payload.new.images || [],
              stock: payload.new.stock || 0,
              category: payload.new.category || '',
              status: payload.new.status || 'draft',
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at
            };
            setShopProducts(prev => [newProduct, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setShopProducts(prev => prev.map(p => {
              if (p.id === payload.new.id) {
                return {
                  id: payload.new.id,
                  title: payload.new.title,
                  description: payload.new.description || '',
                  price: parseFloat(payload.new.price) || 0,
                  images: payload.new.images || [],
                  stock: payload.new.stock || 0,
                  category: payload.new.category || '',
                  status: payload.new.status || 'draft',
                  created_at: payload.new.created_at,
                  updated_at: payload.new.updated_at
                };
              }
              return p;
            }));
          } else if (payload.eventType === 'DELETE') {
            setShopProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to realtime changes on projects table (Portfolio)
  const subscribeToProjects = useCallback(() => {
    const channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          if ((import.meta as any).env?.DEV) {
            console.log('[Realtime] Projects change:', payload.eventType);
          }

          if (payload.eventType === 'INSERT') {
            setProjects(prev => [payload.new as Project, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => prev.map(p =>
              p.id === payload.new.id ? payload.new as Project : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to realtime changes on cultural_projects table
  const subscribeToCulturalProjects = useCallback(() => {
    const channel = supabase
      .channel('cultural_projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cultural_projects'
        },
        (payload) => {
          if ((import.meta as any).env?.DEV) {
            console.log('[Realtime] Cultural Projects change:', payload.eventType);
          }

          if (payload.eventType === 'INSERT') {
            setCulturalProjects(prev => [payload.new as CulturalProject, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCulturalProjects(prev => prev.map(p =>
              p.id === payload.new.id ? payload.new as CulturalProject : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setCulturalProjects(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to realtime changes on messages table
  const subscribeToMessages = useCallback(() => {
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if ((import.meta as any).env?.DEV) console.log('[Realtime] Messages change:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newMsg: Message = {
              id: payload.new.id,
              name: payload.new.name,
              email: payload.new.email,
              phone: payload.new.phone,
              subject: payload.new.subject,
              message: payload.new.message,
              source: payload.new.source,
              status: payload.new.status,
              createdAt: payload.new.created_at
            };
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [newMsg, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m =>
              m.id === payload.new.id ? {
                ...m,
                status: payload.new.status, // Usually only status updates interactively
                // Update other fields if needed
                name: payload.new.name,
                email: payload.new.email,
                phone: payload.new.phone,
                subject: payload.new.subject,
                message: payload.new.message
              } : m
            ));
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to realtime changes on site_settings table (Phase 4)
  const subscribeToSiteSettings = useCallback(() => {
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: `id=eq.${SETTINGS_ID}`
        },
        (payload) => {
          if ((import.meta as any).env?.DEV) {
            console.log('[Realtime] Site Settings change detected');
          }

          const row = payload.new as any;

          // Update Site Content (About + Office)
          if (row.about || row.office) {
            setSiteContent({
              about: { ...DEFAULT_SITE_CONTENT.about, ...(row.about || {}) },
              office: { ...DEFAULT_SITE_CONTENT.office, ...(row.office || {}) }
            });
          }

          // Update Global Settings + Schedule
          if (row.settings) {
            const savedBundle = row.settings;
            if (savedBundle.global) {
              setSettings({
                ...DEFAULT_SETTINGS,
                ...savedBundle.global,
                aiConfig: {
                  ...DEFAULT_SETTINGS.aiConfig,
                  ...(savedBundle.global.aiConfig || {})
                },
                chatbotConfig: savedBundle.global.chatbotConfig || DEFAULT_SETTINGS.chatbotConfig
              });
            }
            if (savedBundle.schedule) {
              setScheduleSettings({ ...DEFAULT_SCHEDULE_SETTINGS, ...savedBundle.schedule });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- GLOBAL REALTIME SUBSCRIPTIONS ACTIVATION ---
  // Activate subscriptions after functions are defined
  useEffect(() => {
    const unsubscribeSettings = subscribeToSiteSettings();
    const unsubscribeMessages = subscribeToMessages();

    if ((import.meta as any).env?.DEV) {
      console.log('[Realtime] Global subscriptions activated (site_settings, messages)');
    }

    return () => {
      unsubscribeSettings?.();
      unsubscribeMessages?.();
    };
  }, [subscribeToSiteSettings, subscribeToMessages]);

  const addShopProduct = async (product: Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ShopProduct | null> => {
    try {
      const { data, error } = await supabase
        .from('shop_products')
        .insert({
          title: product.title,
          description: product.description,
          price: product.price,
          images: product.images,
          stock: product.stock,
          category: product.category,
          status: product.status
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: ShopProduct = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        images: data.images || [],
        stock: data.stock || 0,
        category: data.category || '',
        status: data.status || 'draft',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setShopProducts(prev => [newProduct, ...prev]);
      showToast('Produto criado com sucesso!', 'success');
      return newProduct;
    } catch (error) {
      console.error('Error adding shop product:', error);
      showToast('Erro ao criar produto.', 'error');
      return null;
    }
  };

  const updateShopProduct = async (product: ShopProduct): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shop_products')
        .update({
          title: product.title,
          description: product.description,
          price: product.price,
          images: product.images,
          stock: product.stock,
          category: product.category,
          status: product.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      setShopProducts(prev => prev.map(p => p.id === product.id ? product : p));
      showToast('Produto atualizado!', 'success');
      return true;
    } catch (error) {
      console.error('Error updating shop product:', error);
      showToast('Erro ao atualizar produto.', 'error');
      return false;
    }
  };

  const deleteShopProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShopProducts(prev => prev.filter(p => p.id !== id));
      showToast('Produto excluído.', 'info');
      return true;
    } catch (error) {
      console.error('Error deleting shop product:', error);
      showToast('Erro ao excluir produto.', 'error');
      return false;
    }
  };

  const fetchShopOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_orders')
        .select(`
          *,
          items:shop_order_items(
            *,
            product:shop_products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orders: ShopOrder[] = (data || []).map((o: any) => ({
        id: o.id,
        userId: o.user_id,
        status: o.status,
        total: parseFloat(o.total) || 0,
        shippingAddress: o.shipping_address || {},
        paymentMethod: o.payment_method || '',
        notes: o.notes,
        items: (o.items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price) || 0,
          product: item.product ? {
            id: item.product.id,
            title: item.product.title,
            description: item.product.description || '',
            price: parseFloat(item.product.price) || 0,
            images: item.product.images || [],
            stock: item.product.stock || 0,
            category: item.product.category || '',
            status: item.product.status || 'draft'
          } : undefined
        })),
        created_at: o.created_at,
        updated_at: o.updated_at
      }));

      setShopOrders(orders);
    } catch (error) {
      console.error('Error fetching shop orders:', error);
    }
  };

  const updateShopOrderStatus = async (orderId: string, status: ShopOrder['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shop_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setShopOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showToast('Status do pedido atualizado!', 'success');
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Erro ao atualizar status do pedido.', 'error');
      return false;
    }
  };

  const createShopOrder = async (
    order: Omit<ShopOrder, 'id' | 'created_at' | 'updated_at'>,
    items: { productId: string; quantity: number; unitPrice: number }[]
  ): Promise<ShopOrder | null> => {
    try {
      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('shop_orders')
        .insert({
          user_id: order.userId,
          status: order.status || 'pending',
          total: order.total,
          shipping_address: order.shippingAddress,
          payment_method: order.paymentMethod,
          notes: order.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }));

      const { error: itemsError } = await supabase
        .from('shop_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Decrement stock for each product
      for (const item of items) {
        const product = shopProducts.find(p => p.id === item.productId);
        if (product) {
          await supabase
            .from('shop_products')
            .update({ stock: Math.max(0, product.stock - item.quantity) })
            .eq('id', item.productId);
        }
      }

      // 4. Refresh products to get updated stock
      await fetchShopProducts();

      const newOrder: ShopOrder = {
        id: orderData.id,
        userId: orderData.user_id,
        status: orderData.status,
        total: parseFloat(orderData.total) || 0,
        shippingAddress: orderData.shipping_address || {},
        paymentMethod: orderData.payment_method || '',
        notes: orderData.notes,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at
      };

      setShopOrders(prev => [newOrder, ...prev]);
      showToast('Pedido criado com sucesso!', 'success');
      return newOrder;
    } catch (error) {
      console.error('Error creating shop order:', error);
      showToast('Erro ao criar pedido.', 'error');
      return null;
    }
  };

  // ==================== END SHOP FUNCTIONS ====================

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
      }, {
        ...settings.aiConfig,
        chatbotConfig: settings.chatbotConfig
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseData.text,
        uiComponent: responseData.uiComponent as ChatMessage['uiComponent'],
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

  // Unified Message Actions
  const addMessage = async (msg: Omit<Message, 'id' | 'createdAt' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          name: msg.name,
          email: msg.email || null,
          phone: msg.phone || null,
          subject: msg.subject || null,
          message: msg.message,
          source: msg.source,
          status: 'new'
        })
        .select()
        .single();

      if (error) {
        console.error('[Messages] Error saving:', error);
        // Fallback local
        const localMsg: Message = {
          ...msg,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          status: 'new'
        };
        setMessages(prev => [localMsg, ...prev]);
        return;
      }
      // Realtime will handle the update, but optimistic update is fine too if we wanted
    } catch (err) {
      console.error('[Messages] Unexpected error:', err);
    }
  };

  const updateMessageStatus = async (id: string, status: Message['status']) => {
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      culturalProjects,
      currentUser,
      users,
      siteContent,
      settings,
      messages,
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
      persistAllSettings,
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
      addAddress,
      updateAddress,
      deleteAddress,
      addMessage,
      updateMessageStatus,
      deleteMessage,
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
      hideToast,

      // Shop / E-commerce
      shopProducts,
      shopOrders,
      fetchShopProducts,
      addShopProduct,
      updateShopProduct,
      deleteShopProduct,
      fetchShopOrders,
      updateShopOrderStatus,
      createShopOrder,
      subscribeToShopProducts,
      subscribeToProjects,
      subscribeToCulturalProjects,
      subscribeToMessages,
      subscribeToSiteSettings
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