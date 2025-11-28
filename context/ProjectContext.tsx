
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Project, User, SiteContent } from '../types';
import { MOCK_PROJECTS, MOCK_USER_CLIENT, MOCK_USER_ADMIN } from '../data';

interface ProjectContextType {
  projects: Project[];
  currentUser: User | null;
  siteContent: SiteContent;
  login: (email: string) => User | null;
  logout: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateSiteContent: (content: SiteContent) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Default content
  const [siteContent, setSiteContent] = useState<SiteContent>({
    about: {
      heroSubtitle: 'Quem Somos',
      heroTitle: 'Arquitetura com alma e propósito.',
      bio: 'Com mais de 15 anos de experiência no mercado de arquitetura de alto padrão, Fran Siller fundou seu escritório com uma premissa clara: criar espaços que não sejam apenas visualmente impactantes, mas que melhorem a qualidade de vida de quem os habita.'
    }
  });

  const login = (email: string) => {
    // Simple mock login logic
    if (email.includes('admin')) {
      setCurrentUser(MOCK_USER_ADMIN);
      return MOCK_USER_ADMIN;
    } else {
      setCurrentUser(MOCK_USER_CLIENT);
      return MOCK_USER_CLIENT;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateSiteContent = (content: SiteContent) => {
    setSiteContent(content);
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      currentUser, 
      siteContent, 
      login, 
      logout, 
      addProject, 
      updateProject, 
      deleteProject,
      updateSiteContent 
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
