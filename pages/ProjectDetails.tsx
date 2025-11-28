
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Heart, Share2, ArrowLeft } from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const { projects } = useProjects();
  
  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Projeto não encontrado.</div>;
  }

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="h-[60vh] md:h-[75vh] w-full overflow-hidden relative">
        <img src={project.image} className="w-full h-full object-cover" />
        {/* Stronger Gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12 md:pb-20 px-6 md:px-12">
          <div className="container mx-auto relative z-10">
            <Link to="/portfolio" className="text-white/60 hover:text-white mb-6 flex items-center space-x-2 text-xs md:text-sm uppercase tracking-widest transition">
               <ArrowLeft className="w-4 h-4" /> <span>Voltar para Portfólio</span>
            </Link>
            <span className="inline-block px-3 py-1 border border-white/30 text-white/90 text-[10px] md:text-xs uppercase tracking-widest rounded-full mb-4 backdrop-blur-md bg-white/10">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-white mb-2 drop-shadow-lg leading-tight break-words">{project.title}</h1>
            <p className="text-white/80 text-sm md:text-lg font-light flex items-center space-x-2">
               <span>{project.location}</span>
               <span className="w-1 h-1 bg-accent rounded-full"></span>
               <span>{project.year}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Details Sidebar */}
          <div className="lg:w-1/4">
             <div className="lg:sticky lg:top-32 space-y-8 md:space-y-10 border-t border-black pt-8">
               <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                 <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Localização</h3>
                   <p className="text-lg md:text-xl font-serif">{project.location}</p>
                 </div>
                 <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Área Construída</h3>
                   <p className="text-lg md:text-xl font-serif">{project.area} m²</p>
                 </div>
                 <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ano</h3>
                   <p className="text-lg md:text-xl font-serif">{project.year}</p>
                 </div>
               </div>
               
               <div className="pt-4 lg:pt-8 flex gap-4">
                 <button className="flex-grow flex items-center justify-center space-x-2 bg-black text-white px-6 py-4 rounded-full hover:bg-accent hover:text-black transition shadow-lg">
                    <span className="text-sm font-bold uppercase tracking-wider">Solicitar Projeto</span>
                 </button>
                 <button className="p-4 border border-gray-200 rounded-full hover:bg-gray-50 hover:scale-105 transition text-gray-500 hover:text-red-500">
                   <Heart className="w-5 h-5" />
                 </button>
               </div>
             </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif leading-relaxed mb-8 md:mb-10 text-gray-900">
               {project.description}
             </h2>
             <div className="prose prose-lg text-secondary mb-12 md:mb-16 max-w-none">
               <p>
                 Este projeto exemplifica nossa dedicação em criar espaços que dialogam com seu entorno e melhoram a qualidade de vida de seus usuários. 
                 Cada detalhe foi pensado para maximizar o conforto, a funcionalidade e a estética atemporal. A luz natural desempenha um papel fundamental, 
                 esculpindo os volumes internos ao longo do dia.
               </p>
               <p>
                 A escolha de materiais reflete uma busca pela autenticidade e durabilidade, priorizando texturas naturais que envelhecem com dignidade.
               </p>
             </div>

             {/* Gallery */}
             <div className="space-y-8 md:space-y-12">
                {project.images.map((img, idx) => (
                  <div key={idx} className="relative group overflow-hidden rounded-sm shadow-sm">
                    <img src={img} className="w-full h-auto object-cover transition duration-1000 group-hover:scale-105" loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500">
                       <span className="text-white text-xs uppercase tracking-widest">Detalhe {idx + 1}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Similar Projects */}
      <section className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
         <div className="container mx-auto px-6">
           <div className="flex justify-between items-end mb-8 md:mb-12">
             <h3 className="text-2xl md:text-3xl font-serif">Você também pode gostar</h3>
             <Link to="/portfolio" className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1">Ver Portfólio</Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {projects.filter(p => p.id !== project.id).slice(0, 3).map(p => (
                <Link to={`/project/${p.id}`} key={p.id} className="group block">
                   <div className="aspect-[4/3] overflow-hidden bg-gray-200 mb-6 rounded-sm relative">
                     <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300"></div>
                   </div>
                   <h4 className="font-serif text-xl md:text-2xl group-hover:text-accent transition mb-2">{p.title}</h4>
                   <span className="text-xs text-gray-400 uppercase tracking-widest">{p.category}</span>
                </Link>
              ))}
           </div>
         </div>
      </section>
    </div>
  );
};
