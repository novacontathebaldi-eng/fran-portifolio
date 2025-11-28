
export interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  area: number; // in sqm
  location: string;
  image: string;
  description: string;
  images: string[];
  price?: string; // Mock for "service cost"
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
  projects?: Project[]; // For clients, their assigned projects
  favorites?: string[];
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
