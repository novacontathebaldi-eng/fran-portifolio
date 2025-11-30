import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Grid, List, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Portfolio: React.FC = () => {
  const { projects } = useProjects();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Mais recentes');

  // Simple sort logic for prototype
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortBy === 'Mais recentes') return b.year - a.year;
    return 0;
  });

  return (
    <div className="min-h-screen pt-44 pb-24">
      
      {/* 1. Page Header (Inside Container) */}
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10"
        >
           <div>
             <h1 className="text-4xl md:text-5xl font-serif mb-4">Portfólio</h1>
             <p className="text-secondary max-w-xl">
               Explore nossa coleção de projetos residenciais e comerciais, cada um projetado com uma narrativa única.
             </p>
           </div>
        </motion.div>
      </div>

      {/* 2. Full-Width Sticky Filter Bar (Outside Container) */}
      {/* Adjusted top values to eliminate gap: Mobile 56px, Desktop 60px (Slightly under-lapping header) */}
      <div className="sticky top-[56px] md:top-[60px] z-40 w-full bg-white/95 backdrop-blur-md border-y border-gray-100 transition-all duration-300 shadow-sm rounded-none">
        <div className="container mx-auto px-6 py-3 md:py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">
            
            {/* Filter & Sort Group */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-grow md:flex-grow-0">
              <button 
                onClick={() => setFilterOpen(!filterOpen)} 
                className={`flex items-center space-x-2 text-sm font-medium border px-3 py-2 md:px-4 rounded-full transition active:scale-95 bg-white shrink-0 ${filterOpen ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
              
              <div className="relative group z-30">
                <button className="flex items-center space-x-2 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded-lg transition">
                  <span className="text-gray-500 hidden sm:inline">Ordenar:</span>
                  <span className="font-bold text-black text-xs sm:text-sm">{sortBy}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {/* Dropdown Mock */}
                <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-lg py-2 hidden group-hover:block border border-gray-100 animate-fadeIn">
                  <button onClick={() => setSortBy('Mais recentes')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Mais recentes</button>
                  <button onClick={() => setSortBy('Relevância')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Relevância</button>
                </div>
              </div>
            </div>
            
            {/* View Toggle - Always Visible */}
            <div className="flex space-x-1 border border-gray-200 rounded-lg p-1 bg-white shrink-0 ml-auto md:ml-0">
               <button 
                 onClick={() => setView('grid')}
                 className={`p-2 rounded transition-colors ${view === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                 aria-label="Grid View"
               >
                 <Grid className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setView('list')}
                 className={`p-2 rounded transition-colors ${view === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                 aria-label="List View"
               >
                 <List className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content (Back Inside Container) */}
      <div className="container mx-auto px-6 mt-8">
        
        {/* Filter Drawer */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-bold text-sm mb-3">Categoria</h4>
                    <div className="space-y-2 text-sm text-secondary">
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="accent-black rounded" /> <span>Residencial</span></label>
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="accent-black rounded" /> <span>Comercial</span></label>
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="accent-black rounded" /> <span>Interiores</span></label>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-3">Ano</h4>
                    <div className="space-y-2 text-sm text-secondary">
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="accent-black rounded" /> <span>2024</span></label>
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="accent-black rounded" /> <span>2023</span></label>
                      <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="accent-black rounded" /> <span>Arquivo</span></label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid View */}
        {view === 'grid' ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            {sortedProjects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id} className="group block h-full flex flex-col">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200 rounded-sm mb-4 relative">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />
                </div>
                <div className="flex justify-between items-start mt-auto">
                  <div>
                    <h3 className="text-xl font-serif font-medium group-hover:text-accent transition">{project.title}</h3>
                    <p className="text-sm text-secondary mt-1">{project.category}</p>
                  </div>
                  <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded whitespace-nowrap">{project.year}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        ) : (
          /* List View */
          <div className="space-y-12">
             {sortedProjects.map((project) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={project.id}>
                <Link to={`/project/${project.id}`} className="group flex flex-col md:flex-row gap-8 items-center border-b border-gray-100 pb-12">
                  <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden bg-gray-200 rounded-sm">
                    <img src={project.image} className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105" />
                  </div>
                  <div className="w-full md:w-2/3">
                    <span className="text-xs text-accent uppercase tracking-wider">{project.category}</span>
                    <h3 className="text-2xl md:text-3xl font-serif mt-2 mb-4 group-hover:text-accent transition">{project.title}</h3>
                    <p className="text-secondary max-w-lg mb-6 text-sm md:text-base">{project.description}</p>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <span>{project.location}</span>
                      <span>{project.area} m²</span>
                      <span>{project.year}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};