
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Grid, List, ChevronDown, Filter } from 'lucide-react';

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
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12">
           <div>
             <h1 className="text-4xl md:text-5xl font-serif mb-4">Portfólio</h1>
             <p className="text-secondary max-w-xl">
               Explore nossa coleção de projetos residenciais e comerciais, cada um projetado com uma narrativa única.
             </p>
           </div>
        </div>

        {/* Controls */}
        <div className="sticky top-20 bg-white z-20 py-4 border-b border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              className="flex items-center space-x-2 text-sm font-medium border border-gray-200 px-4 py-2 rounded-full hover:border-black transition w-full sm:w-auto justify-center sm:justify-start"
            >
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </button>
            <div className="relative group z-30 w-full sm:w-auto">
              <button className="flex items-center justify-between sm:justify-start space-x-2 text-sm font-medium px-2 w-full sm:w-auto">
                <span>Ordenar: {sortBy}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {/* Dropdown Mock */}
              <div className="absolute top-full left-0 w-full sm:w-40 bg-white shadow-xl rounded-lg py-2 hidden group-hover:block border border-gray-100">
                <button onClick={() => setSortBy('Mais recentes')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Mais recentes</button>
                <button onClick={() => setSortBy('Relevância')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Relevância</button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 border border-gray-200 rounded-lg p-1 self-end md:self-auto hidden md:flex">
             <button 
               onClick={() => setView('grid')}
               className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}
             >
               <Grid className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setView('list')}
               className={`p-2 rounded ${view === 'list' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}
             >
               <List className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Filter Drawer (Visual Only) */}
        {filterOpen && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-bold text-sm mb-3">Categoria</h4>
                <div className="space-y-2 text-sm text-secondary">
                  <label className="flex items-center space-x-2"><input type="checkbox" /> <span>Residencial</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" /> <span>Comercial</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" /> <span>Interiores</span></label>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3">Ano</h4>
                <div className="space-y-2 text-sm text-secondary">
                  <label className="flex items-center space-x-2"><input type="checkbox" /> <span>2024</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" /> <span>2023</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" /> <span>Arquivo</span></label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {sortedProjects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id} className="group block">
                <div className="aspect-[4/3] overflow-hidden bg-gray-200 rounded-sm mb-4 relative">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif font-medium group-hover:text-accent transition">{project.title}</h3>
                    <p className="text-sm text-secondary mt-1">{project.category}</p>
                  </div>
                  <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded">{project.year}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-12">
             {sortedProjects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id} className="group flex flex-col md:flex-row gap-8 items-center border-b border-gray-100 pb-12">
                <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden bg-gray-200">
                   <img src={project.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
