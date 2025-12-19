

export type BlockType = 'text' | 'heading' | 'image-full' | 'image-grid' | 'quote' | 'map' | 'details';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Text content or Image URL
  items?: string[]; // For grids
  caption?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  area: number; // in sqm
  location: string;
  image: string;
  description: string; // Legacy fallback
  blocks?: ContentBlock[]; // New CMS structure
  images: string[];
  price?: string;
  created_at?: string; // For "Newest" sorting
  featured?: boolean; // Exibir na página inicial
}

export interface CulturalProject {
  id: string;
  title: string;
  category: string; // 'Patrimônio', 'Exposição', 'Restauro', 'Pesquisa', 'Publicação'
  year: number;
  location: string;
  image: string;
  partners?: string; // New field for institutional partners
  description: string;
  blocks?: ContentBlock[];
  images: string[]; // Legacy support fallback
  created_at?: string;
  featured?: boolean; // Exibir na página inicial
}

// ==================== SHOP / E-COMMERCE TYPES ====================

export type ShopProductStatus = 'draft' | 'active';
export type ShopOrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface ShopProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[]; // Array of image URLs stored as JSONB
  stock: number;
  category: string;
  status: ShopProductStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ShopOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: ShopProduct; // Joined data for display
}

export interface ShopOrder {
  id: string;
  userId: string;
  status: ShopOrderStatus;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  notes?: string;
  items?: ShopOrderItem[];
  created_at?: string;
  updated_at?: string;
}

// Cart Item (client-side only, not persisted to DB)
export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

// ==================== END SHOP TYPES ====================

export type UserRole = 'admin' | 'client';

export interface ClientMemory {
  id: string;
  topic: string; // e.g., "Style Preference", "Family", "Budget"
  content: string; // e.g., "Likes minimalist, hates red colors"
  type: 'user_defined' | 'system_detected'; // User added vs AI deduced
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string; // Auto-generated or "New Chat"
  messages: ChatMessage[];
  createdAt: string;
  lastUpdated: string;
}

export interface ClientFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'video' | 'cad' | 'other';
  size: string;
  createdAt: string;
}

export interface ClientFolder {
  id: string;
  name: string;
  createdAt: string;
  files: ClientFile[];
}

export interface Appointment {
  id: string;
  clientId: string; // 'guest' or user ID
  clientName: string;
  type: 'meeting' | 'visit';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string; // Address or 'Escritório Fran Siller / Online'
  meetingLink?: string; // New: For Google Meet/Zoom links
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduling';
  createdAt: string;
  notes?: string;
}

export interface ScheduleSettings {
  enabled: boolean;
  workDays: number[]; // 0 = Sunday, 1 = Monday...
  startHour: string; // "09:00"
  endHour: string; // "18:00"
  blockedDates: string[]; // ISO dates YYYY-MM-DD (Full Day Block)
  blockedSlots: { date: string; time: string }[]; // New: Specific Time Block
}

export interface Address {
  id: string;
  label: string; // e.g., "Casa", "Trabalho", "Terreno Obra"
  street: string;
  number: string;
  complement?: string;
  district: string; // Bairro
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // WhatsApp (Mandatory for registration)
  role: UserRole;
  avatar?: string;
  bio?: string;

  // Personal Data (Optional - Profile)
  cpf?: string; // Or CNPJ
  birthDate?: string; // ISO Date YYYY-MM-DD
  addresses?: Address[];

  projects?: Project[];
  favorites?: string[];
  folders?: ClientFolder[];
  memories?: ClientMemory[];
  chats?: ChatSession[];
  appointments?: Appointment[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
}

// Budget System Types
export interface Service {
  id: string;
  category: string;
  name: string;
  description?: string;
  orderIndex: number;
  active: boolean;
  createdAt: string;
}

export interface BudgetRequest {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocationFull: string;
  projectCity: string;
  projectState: string;
  observations?: string;
  services: Service[];
  status: 'pending' | 'analyzing' | 'quoted' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface BudgetRequestItem {
  id: string;
  budgetRequestId: string;
  serviceId: string;
  createdAt: string;
}

// Updated Interfaces for Dynamic Content
export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface PillarItem {
  id: string;
  title: string;
  description: string;
  icon?: string; // Optional icon identifier
}

// FAQ Item for Contact Page
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}



// Dynamic Social Link - Stored in database
export interface SocialLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok' | 'pinterest' | 'whatsapp' | 'telegram' | 'other';
  url: string;
  label?: string; // Optional custom label for 'other' type
}

export interface OfficeDetails {
  // Toggle for office visibility on site
  isActive?: boolean; // true = show office info, false = hide all office references

  // Address Info
  address: string; // Full string for display
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  mapsLink: string; // Google Maps URL
  mapQuery?: string; // Exact query for the embedded map iframe

  // Hours
  hoursDescription: string; // e.g., "Segunda a Sexta, 09h às 18h"

  // Contact Info (New Global Settings)
  email: string;
  phone: string;

  // Social Media Links - Dynamic array stored in database
  socialLinks?: SocialLink[];

  // Legacy fields (deprecated - use socialLinks instead)
  instagram?: string;
  whatsapp?: string;
  linkedin?: string;

  // FAQ Section (Editable from Admin)
  faqItems?: FaqItem[];

  // Contact Form Subjects (Editable from Admin)
  contactSubjects?: string[];

  // New Block System for Office Page
  blocks: ContentBlock[];

  // Deprecated but kept for type safety during migration if needed
  facadeImage?: string;
  interiorImages?: string[];
  aboutText?: string;
}

export interface SiteContent {
  about: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string; // New
    profileImage: string; // New\r\n    backgroundImage?: string; // Background image for About page
    bio: string;
    stats: StatItem[]; // New
    pillars: PillarItem[]; // New
    recognition: string[]; // New
    parallaxProjects?: Array<{ id: string; type: 'project' | 'cultural' }>; // Projects for About page parallax
    homeAboutImage?: string; // Foto da arquiteta exclusiva para a seção "Sobre" da home page
  };
  office: OfficeDetails; // Centralized Office Data (Source of Truth)
  // Hero Section Settings
  heroProject?: { id: string; type: 'project' | 'cultural' } | null; // Project to feature on homepage Hero
}

// Quick Action Button for Chatbot (configurable via Admin Panel)
export interface ChatQuickAction {
  id: string;
  label: string;        // Texto exibido no botão
  message: string;      // Mensagem enviada ao clicar
  icon?: string;        // Ícone opcional (nome do lucide-react)
  order: number;        // Ordem de exibição
  active: boolean;      // Ativo/Inativo
}

// Chatbot Configuration (managed via Admin Panel)
export interface ChatbotConfig {
  quickActions: ChatQuickAction[];
  welcomeMessage: string;
  transferToHumanEnabled: boolean;
  fallbackMessage: string;
  showQuickActionsOnOpen: boolean;
}

// Dashboard Widget for Customizable Admin Overview
export type DashboardTabId = 'dashboard' | 'agenda' | 'projects' | 'cultural' | 'clients' | 'ai-config' | 'budgets' | 'messages' | 'contact-messages' | 'office' | 'content' | 'settings' | 'shop' | 'invites';

export interface DashboardWidget {
  id: string;
  tabId: DashboardTabId;
  label: string;
  icon: string;     // lucide-react icon name
  bgColor: string;  // Tailwind color class (e.g., 'bg-black', 'bg-red-600')
  order: number;
  showCount?: boolean;
  countKey?: 'projects' | 'culturalProjects' | 'appointments' | 'messages' | 'contactMessages' | 'budgets';
}

export interface GlobalSettings {
  enableShop: boolean;
  aiConfig: AIConfig;
  chatbotConfig?: ChatbotConfig;
  dashboardWidgets?: DashboardWidget[];
}

// ==================== AI PROVIDER TYPES ====================

export type AIProvider = 'gemini' | 'groq';

export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-3-pro-preview' | 'gemini-2.5-pro' | 'gemini-2.0-flash' | 'gemini-2.0-flash-lite';

export type GroqModel = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' | 'qwen/qwen3-32b';

export interface GeminiConfig {
  model: GeminiModel;
}

export interface GroqConfig {
  model: GroqModel;
}

export interface AIConfig {
  provider: AIProvider;
  useCustomSystemInstruction: boolean;
  systemInstruction: string;
  defaultGreeting: string;
  temperature: number;
  contextLimit: number; // Número máximo de mensagens a enviar como contexto (default: 10)
  // Provider-specific configs
  gemini: GeminiConfig;
  groq: GroqConfig;
  // Legacy fallback
  model?: string;
}


export interface Message {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  source: 'chatbot' | 'contact_form';
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface AiFeedbackItem {
  id: string;
  userMessage: string;
  aiResponse: string;
  type: 'like' | 'dislike';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  uiComponent?: {
    type: 'ProjectCarousel' | 'ContactCard' | 'LeadForm' | 'SocialLinks' | 'CalendarWidget' | 'BookingSuccess' | 'ServiceRedirect' | 'CulturalCarousel' | 'ProductCarousel' | 'OfficeMap';
    data: any;
  };
  actions?: {
    type: 'navigate' | 'saveNote' | 'scheduleMeeting' | 'learnMemory' | 'requestHuman';
    payload: any;
  }[];
  feedback?: 'like' | 'dislike'; // UI State
}