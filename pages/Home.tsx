
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

export const Home: React.FC = () => {
  const { projects } = useProjects();
  
  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/arch1/1920/1080" 
            alt="Hero Architecture" 
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Gradient Overlay for Text Pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-white mt-12">
          <span className="block mb-6 text-accent uppercase tracking-[0.3em] text-xs font-bold animate-slideUp drop-shadow-md">
            Arquitetura & Design
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light mb-8 md:mb-10 leading-[1.1] max-w-4xl animate-slideUp drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
            Projetando espaços <br/>
            para <i className="font-serif italic text-accent">viver melhor</i>.
          </h1>
          
          <Link 
            to="/portfolio" 
            className="inline-flex items-center space-x-3 text-base md:text-lg group animate-slideUp" 
            style={{ animationDelay: '0.2s' }}
          >
            <span className="border-b border-white pb-1 group-hover:border-accent group-hover:text-accent transition duration-300">Explorar Projetos</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition duration-300 group-hover:text-accent" />
          </Link>
        </div>
      </section>

      {/* Featured Scroll */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6 mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-2">Obras Selecionadas</h2>
            <p className="text-secondary text-base md:text-lg font-light">Projetos curados do nosso portfólio recente.</p>
          </div>
          <Link to="/portfolio" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-accent hover:border-accent transition">Ver Todos</Link>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto pb-12 space-x-6 md:space-x-8 px-6 md:px-16 lg:px-24 no-scrollbar snap-x snap-mandatory">
          {projects.slice(0, 5).map((project) => (
            <Link 
              to={`/project/${project.id}`} 
              key={project.id} 
              className="min-w-[280px] md:min-w-[450px] snap-start group"
            >
              <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-6 relative rounded-sm">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif group-hover:text-accent transition">{project.title}</h3>
              <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide">{project.location} — {project.year}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 md:py-32 bg-[#f9f9f9]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="w-full md:w-1/2 relative">
             <div className="absolute -top-6 -left-6 w-full h-full border-2 border-accent z-0 hidden md:block"></div>
             <img src="https://picsum.photos/seed/arch_about/800/1000" alt="About" className="w-full h-auto shadow-2xl relative z-10" />
          </div>
          <div className="w-full md:w-1/2">
             <span className="text-accent uppercase tracking-widest text-xs font-bold mb-4 block">Sobre o Escritório</span>
             <h2 className="text-3xl md:text-5xl font-serif mb-6 md:mb-8 leading-tight">Arquitetura Sensorial e Atemporal</h2>
             <p className="text-secondary leading-relaxed md:leading-loose mb-8 md:mb-10 text-base md:text-lg font-light">
               Acreditamos que a arquitetura não é apenas sobre edifícios, mas sobre como experimentamos o mundo. 
               Cada linha traçada é uma decisão sobre como a luz entrará em uma sala, como o som viajará e como uma pessoa se sentirá.
             </p>
             <Link to="/about" className="inline-block bg-primary text-white px-8 py-3 md:px-10 md:py-4 rounded-full hover:bg-accent hover:text-black transition duration-300 text-xs md:text-sm tracking-widest font-bold uppercase shadow-lg hover:shadow-xl">
               Nossa Filosofia
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
