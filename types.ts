

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
}

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

// Contact Message from Form Submissions
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface OfficeDetails {
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

  // Social Media Links
  instagram?: string;        // Instagram profile URL
  whatsapp?: string;         // WhatsApp number (international format, e.g., 5527996670426)
  linkedin?: string;         // LinkedIn profile URL

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
    profileImage: string; // New
    bio: string;
    stats: StatItem[]; // New
    pillars: PillarItem[]; // New
    recognition: string[]; // New
  };
  office: OfficeDetails; // Centralized Office Data (Source of Truth)
}

export interface GlobalSettings {
  enableShop: boolean;
  aiConfig: {
    model: string;
    useCustomSystemInstruction: boolean; // New Toggle
    systemInstruction: string;
    defaultGreeting: string; // New: Editable Welcome Message
    temperature: number;
  };
}

export interface AdminNote {
  id: string;
  userName: string;
  userContact: string; // Email or Phone
  message: string;
  date: string;
  status: 'new' | 'read';
  source: 'chatbot' | 'contact_form';
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
    type: 'ProjectCarousel' | 'ContactCard' | 'LeadForm' | 'SocialLinks' | 'CalendarWidget';
    data: any;
  };
  actions?: {
    type: 'navigate' | 'saveNote' | 'scheduleMeeting';
    payload: any;
  }[];
  feedback?: 'like' | 'dislike'; // UI State
}