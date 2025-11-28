
import { Project, ServicePackage, User } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Villa Serenity',
    category: 'Residencial',
    year: 2023,
    area: 450,
    location: 'São Paulo, SP',
    image: 'https://picsum.photos/id/10/800/600',
    description: 'Uma abordagem minimalista e moderna para viver em encostas, com foco na luz natural e materiais brutos.',
    images: ['https://picsum.photos/id/11/800/600', 'https://picsum.photos/id/12/800/600'],
  },
  {
    id: '2',
    title: 'Loft Urbano',
    category: 'Interiores',
    year: 2024,
    area: 120,
    location: 'Curitiba, PR',
    image: 'https://picsum.photos/id/14/800/600',
    description: 'Conversão de um antigo armazém industrial em um espaço de convivência familiar acolhedor.',
    images: ['https://picsum.photos/id/15/800/600', 'https://picsum.photos/id/16/800/600'],
  },
  {
    id: '3',
    title: 'Complexo Azure',
    category: 'Comercial',
    year: 2022,
    area: 2500,
    location: 'Rio de Janeiro, RJ',
    image: 'https://picsum.photos/id/20/800/600',
    description: 'Espaços de escritório sustentáveis projetados para o futuro do trabalho híbrido.',
    images: ['https://picsum.photos/id/24/800/600', 'https://picsum.photos/id/26/800/600'],
  },
  {
    id: '4',
    title: 'Casa da Montanha',
    category: 'Residencial',
    year: 2023,
    area: 300,
    location: 'Campos do Jordão, SP',
    image: 'https://picsum.photos/id/28/800/600',
    description: 'A integração com a natureza foi o principal impulsionador para este refúgio isolado na montanha.',
    images: ['https://picsum.photos/id/29/800/600', 'https://picsum.photos/id/30/800/600'],
  },
  {
    id: '5',
    title: 'Estúdio Minimalista',
    category: 'Interiores',
    year: 2024,
    area: 45,
    location: 'Belo Horizonte, MG',
    image: 'https://picsum.photos/id/42/800/600',
    description: 'Maximizando o espaço em um micro-apartamento através de soluções inteligentes de marcenaria.',
    images: ['https://picsum.photos/id/43/800/600', 'https://picsum.photos/id/44/800/600'],
  }
];

export const MOCK_SERVICES: ServicePackage[] = [
  {
    id: 'study',
    name: 'Estudo Preliminar',
    description: 'Concepção de design, moodboards e volumetria 3D inicial.',
    basePrice: 2500,
    features: ['Análise do Local', 'Esboços Conceituais', 'Moodboard', '1 Revisão']
  },
  {
    id: 'exec',
    name: 'Projeto Executivo',
    description: 'Desenhos técnicos completos prontos para construção.',
    basePrice: 8000,
    features: ['Plantas Técnicas', 'Elétrica/Hidráulica', 'Lista de Materiais', 'Renders 3D']
  },
  {
    id: 'turnkey',
    name: 'Obra Completa (Turnkey)',
    description: 'Do design à instalação final do mobiliário.',
    basePrice: 20000,
    features: ['Projeto Completo', 'Gestão de Obra', 'Decoração', 'Pronto para Morar']
  }
];

export const MOCK_USER_CLIENT: User = {
  id: 'u1',
  name: 'Cliente Exemplo',
  email: 'cliente@exemplo.com.br',
  role: 'client',
  bio: 'Amante de arte e empreendedora.',
  projects: [MOCK_PROJECTS[0]],
  favorites: ['2', '5']
};

export const MOCK_USER_ADMIN: User = {
  id: 'admin1',
  name: 'Fran Siller',
  email: 'admin@fran.com',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Fran+Siller&background=000&color=fff',
  bio: 'Arquiteta Principal'
};
