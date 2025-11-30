
export type BlockType = 'text' | 'heading' | 'image-full' | 'image-grid' | 'quote';

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduling';
  createdAt: string;
  notes?: string;
}

export interface ScheduleSettings {
  enabled: boolean;
  workDays: number[]; // 0 = Sunday, 1 = Monday...
  startHour: string; // "09:00"
  endHour: string; // "18:00"
  blockedDates: string[]; // ISO dates YYYY-MM-DD
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  bio?: string;
  projects?: Project[];
  favorites?: string[];
  folders?: ClientFolder[]; // New Folder Structure
  memories?: ClientMemory[]; // New: Long-term memory
  chats?: ChatSession[]; // New: Chat history
  appointments?: Appointment[]; // New: Scheduling
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
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
  }
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