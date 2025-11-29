
export type BlockType = 'text' | 'image-full' | 'image-grid' | 'quote';

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
  documents?: { name: string; date: string; url: string; type: 'pdf' | 'dwg' }[]; // New for Client Area
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
}

export interface SiteContent {
  about: {
    heroTitle: string;
    heroSubtitle: string;
    bio: string;
  }
}

export interface GlobalSettings {
  enableShop: boolean;
  aiConfig: {
    model: string;
    systemInstruction: string;
    temperature: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  uiComponent?: {
    type: 'ProjectCarousel' | 'ContactCard' | 'LeadForm';
    data: any;
  };
}
