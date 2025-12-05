import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Grid, List, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Cultural: React.FC = () => {
  const { culturalProjects } = useProjects();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  // Sorting State
  const [sortBy, setSortBy] = useState('Mais recentes');

  // Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // 1. Extract Unique Categories & Years dynamically
  const uniqueCategories = Array.from(new Set(culturalProjects.map(p => p.category).filter((c): c is string => !!c))).sort();
  const uniqueYears = Array.from(new Set(culturalProjects.map(p => p.year).filter((y): y is number => !!y))).sort((a: number, b: number) => b - a);

  // 2. Filter Logic
  const filteredProjects = culturalProjects.filter(p => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchYear = selectedYears.length === 0 || selectedYears.includes(p.year);
    return matchCategory && matchYear;
  });

  // 3. Sort Logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const getTime = (p: typeof culturalProjects[0]) => {
      if (p.created_at) return new Date(p.created_at).getTime();
      return new Date(p.year, 0, 1).getTime();
    };

    if (sortBy === 'Mais recentes') {
      const diff = getTime(b) - getTime(a);
      if (diff !== 0) return diff;
      return b.title.localeCompare(a.title); // Tie-breaker
    }
    if (sortBy === 'Mais antigos') {
      const diff = getTime(a) - getTime(b);
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title); // Tie-breaker
    }
    if (sortBy === 'Por Categoria') {
      return a.category.localeCompare(b.category);
    }
    if (sortBy === 'Relevância') {
      return 0;
    }
    return 0;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedYears([]);
  };

  const activeFiltersCount = selectedCategories.length + selectedYears.length;

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
            <h1 className="text-4xl md:text-5xl font-serif mb-4">Cultura & Patrimônio</h1>
            <p className="text-secondary max-w-xl">
              Projetos dedicados à preservação histórica, exposições e intervenções em patrimônios culturais.
            </p>
          </div>
        </motion.div>
      </div>

      {/* 2. Full-Width Sticky Filter Bar (Outside Container) */}
      <div className="sticky top-20 md:top-16 z-40 w-full bg-white/95 backdrop-blur-md border-y border-gray-100 transition-all duration-300 shadow-sm rounded-none">
        <div className="container mx-auto px-6 py-3 md:py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">

            {/* Filter & Sort Group */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-grow md:flex-grow-0">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center space-x-2 text-sm font-medium border px-3 py-2 md:px-4 rounded-full transition active:scale-95 bg-white shrink-0 ${filterOpen || activeFiltersCount > 0 ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="relative group z-30">
                <button className="flex items-center space-x-2 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded-lg transition">
                  <span className="text-gray-500 hidden sm:inline">Ordenar:</span>
                  <span className="font-bold text-black text-xs sm:text-sm">{sortBy}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-lg py-2 hidden group-hover:block border border-gray-100 animate-fadeIn">
                  <button onClick={() => setSortBy('Mais recentes')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'Mais recentes' ? 'font-bold' : ''}`}>Mais recentes</button>
                  <button onClick={() => setSortBy('Mais antigos')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'Mais antigos' ? 'font-bold' : ''}`}>Mais antigos</button>
                  <button onClick={() => setSortBy('Por Categoria')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'Por Categoria' ? 'font-bold' : ''}`}>Por Categoria</button>
                </div>
              </div>

              {/* Quick Category Chips (Desktop) */}
              <div className="hidden lg:flex items-center space-x-2 ml-4 overflow-x-auto no-scrollbar">
                <button
                  onClick={clearFilters}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition whitespace-nowrap ${selectedCategories.length === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Todos
                </button>
                {uniqueCategories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition whitespace-nowrap ${selectedCategories.includes(cat) ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
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
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 relative">
                <button onClick={() => setFilterOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                  <span className="sr-only">Fechar</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h4 className="font-bold text-sm mb-3">Categoria</h4>
                    <div className="space-y-2 text-sm text-secondary max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {uniqueCategories.map((cat: string) => (
                        <label key={cat} className="flex items-center space-x-2 cursor-pointer hover:text-black transition">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="accent-black rounded w-4 h-4"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-3">Ano</h4>
                    <div className="space-y-2 text-sm text-secondary max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {uniqueYears.map((year: number) => (
                        <label key={year} className="flex items-center space-x-2 cursor-pointer hover:text-black transition">
                          <input
                            type="checkbox"
                            checked={selectedYears.includes(year)}
                            onChange={() => toggleYear(year)}
                            className="accent-black rounded w-4 h-4"
                          />
                          <span>{year}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-end justify-end">
                    <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-500">
          Mostrando {sortedProjects.length} projetos
        </div>

        {sortedProjects.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-xl font-serif">Nenhum projeto cultural encontrado com os filtros selecionados.</p>
            <button onClick={clearFilters} className="mt-4 text-black underline hover:text-accent">Limpar filtros</button>
          </div>
        ) : view === 'grid' ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            <AnimatePresence>
              {sortedProjects.map((project) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={project.id}
                >
                  <Link to={`/cultural/${project.id}`} className="group block h-full flex flex-col">
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* List View */
          <div className="space-y-12">
            <AnimatePresence>
              {sortedProjects.map((project) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={project.id}
                >
                  <Link to={`/cultural/${project.id}`} className="group flex flex-col md:flex-row gap-8 items-center border-b border-gray-100 pb-12">
                    <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden bg-gray-200 rounded-sm">
                      <img src={project.image} className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105" />
                    </div>
                    <div className="w-full md:w-2/3">
                      <span className="text-xs text-accent uppercase tracking-wider">{project.category}</span>
                      <h3 className="text-2xl md:text-3xl font-serif mt-2 mb-4 group-hover:text-accent transition">{project.title}</h3>
                      <p className="text-secondary max-w-lg mb-6 text-sm md:text-base">{project.description}</p>
                      <div className="flex gap-6 text-sm text-gray-400">
                        <span>{project.location}</span>
                        <span>{project.year}</span>
                        {project.partners && <span className="font-bold text-gray-500">{project.partners}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};