import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, Variants } from 'framer-motion';

export const Home: React.FC = () => {
  const { projects, culturalProjects, siteContent } = useProjects();

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Get hero project
  const heroConfig = siteContent?.heroProject;
  let heroProject = null;
  let heroProjectType = 'project';

  if (heroConfig?.id) {
    if (heroConfig.type === 'cultural') {
      heroProject = culturalProjects.find(p => p.id === heroConfig.id);
      heroProjectType = 'cultural';
    } else {
      heroProject = projects.find(p => p.id === heroConfig.id);
    }
  }
  if (!heroProject) {
    heroProject = projects.find(p => p.featured) || culturalProjects.find(p => p.featured) || projects[0];
    heroProjectType = culturalProjects.find(p => p.id === heroProject?.id) ? 'cultural' : 'project';
  }
  const heroImage = heroProject?.image || 'https://qtlntypxagxhzlzpemvx.supabase.co/storage/v1/object/public/storage-Fran/1765189105042-0.24789718604799715.webp';

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">

        {/* Background Image */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroImage}
            alt={heroProject?.title || 'Arquitetura'}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 sm:px-8 md:px-16 pt-16 sm:pt-0">
          <div className="max-w-3xl">

            {/* Label - closer to header on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-4 sm:mb-8"
            >
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border border-[#d4bbb0]/40 text-[#d4bbb0] text-[9px] sm:text-[10px] md:text-xs tracking-[0.3em] sm:tracking-[0.5em] uppercase font-light backdrop-blur-sm bg-black/20 rounded-full">
                Fran Siller Arquitetura
              </span>
            </motion.div>

            {/* Typography */}
            <div className="overflow-hidden mb-2 sm:mb-4">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-[clamp(2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-white drop-shadow-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Transformamos
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-2 sm:mb-4">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-[clamp(2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-[#d4bbb0] drop-shadow-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                sonhos em
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6 sm:mb-10">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-[clamp(2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-white italic drop-shadow-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                espaços.
              </motion.h1>
            </div>

            {/* Description - hidden on smallest screens */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="hidden sm:block text-white/70 text-sm md:text-base font-light leading-relaxed max-w-lg mb-6 sm:mb-10 drop-shadow-md"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cada traço nasce da escuta. Cada espaço, de um sonho compartilhado.
              Arquitetura que abraça quem mora.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
            >
              <Link
                to="/portfolio"
                className="group relative overflow-hidden rounded-full"
              >
                <span className="relative z-10 flex items-center gap-2 sm:gap-3 text-white text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light py-2.5 px-5 sm:py-3 sm:px-6 md:py-4 md:px-8 border border-white/30 hover:border-[#d4bbb0] transition-all duration-500 backdrop-blur-sm bg-black/20 rounded-full">
                  Descobrir Projetos
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-[#d4bbb0] translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
                <span className="absolute inset-0 z-20 flex items-center justify-center gap-2 sm:gap-3 text-black text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 rounded-full">
                  Descobrir Projetos
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
              </Link>

              <Link
                to="/budget"
                className="group flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-[#d4bbb0] text-black text-[10px] sm:text-xs md:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase font-medium rounded-full hover:bg-white transition-colors duration-300"
              >
                Iniciar Projeto
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Info - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="hidden sm:flex absolute bottom-8 left-8 md:left-16 items-center gap-6 text-white/40 text-[10px] tracking-[0.3em] uppercase z-10"
        >
          <span>{siteContent?.office?.city || 'Brasil'}, {siteContent?.office?.state || 'BR'}</span>
          <span className="w-8 h-[1px] bg-white/30" />
          <span>Fran Siller Arquitetura</span>
        </motion.div>

        {/* Featured Project Info - Bottom Right (hidden on mobile) */}
        {heroProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="hidden sm:block absolute bottom-24 md:bottom-28 right-8 md:right-16 text-right z-20 backdrop-blur-md bg-black/40 p-4 rounded-lg"
          >
            <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-2 font-medium">Projeto em Destaque</p>
            <p className="text-white text-lg md:text-xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              {heroProject.title}
            </p>
            <Link
              to={heroProjectType === 'cultural' ? `/cultural/${heroProject.id}` : `/project/${heroProject.id}`}
              className="inline-flex items-center gap-2 text-[#d4bbb0] text-xs tracking-wider mt-2 hover:text-white transition-colors"
            >
              Ver Projeto <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}

      </section>

      {/* Featured Projects */}
      <section className="pt-20 pb-8 md:pt-32 md:pb-12 bg-white">
        <div className="container mx-auto px-6 mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-2">Projetos Selecionados</h2>
            <p className="text-secondary text-base md:text-lg font-light">Projetos curados do nosso portfólio recente.</p>
          </motion.div>
          <Link to="/portfolio" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-accent hover:border-accent transition">Ver Todos</Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex overflow-x-auto pb-6 space-x-6 md:space-x-8 px-6 md:px-20 lg:px-32 xl:px-40 obras-scroll snap-x snap-mandatory scroll-pl-6 md:scroll-pl-20"
        >
          {(projects.filter(p => p.featured).length > 0
            ? projects.filter(p => p.featured)
            : projects.slice(0, 5)
          ).map((project) => (
            <Link
              to={`/project/${project.id}`}
              key={project.id}
              className="min-w-[280px] md:min-w-[450px] flex-shrink-0 snap-start group"
            >
              <div className="w-[280px] h-[350px] md:w-[450px] md:h-[562px] overflow-hidden bg-gray-100 mb-6 relative rounded-sm">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif group-hover:text-accent transition">{project.title}</h3>
              <p className="text-secondary text-sm font-light">{project.location} · {project.year}</p>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Cultural Projects */}
      {culturalProjects.length > 0 && (culturalProjects.filter(p => p.featured).length > 0 || culturalProjects.length > 0) && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-6 mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-2">Projetos Culturais Selecionados</h2>
              <p className="text-secondary text-base md:text-lg font-light">Curadoria de projetos culturais e patrimoniais.</p>
            </motion.div>
            <Link to="/cultural" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-accent hover:border-accent transition">Ver Todos</Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex overflow-x-auto pb-6 space-x-6 md:space-x-8 px-6 md:px-20 lg:px-32 xl:px-40 obras-scroll snap-x snap-mandatory scroll-pl-6 md:scroll-pl-20"
          >
            {(culturalProjects.filter(p => p.featured).length > 0
              ? culturalProjects.filter(p => p.featured)
              : culturalProjects.slice(0, 5)
            ).map((project) => (
              <Link
                to={`/cultural/${project.id}`}
                key={project.id}
                className="min-w-[280px] md:min-w-[450px] flex-shrink-0 snap-start group"
              >
                <div className="w-[280px] h-[350px] md:w-[450px] md:h-[562px] overflow-hidden bg-gray-100 mb-6 relative rounded-sm">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif group-hover:text-accent transition">{project.title}</h3>
                <p className="text-secondary text-sm font-light">{project.location} · {project.year}</p>
              </Link>
            ))}
          </motion.div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 md:py-32 bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-6 block">Contato</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8 leading-tight">
                Vamos criar<br />
                <span className="text-accent italic">juntos?</span>
              </h2>
              <p className="text-gray-400 font-light text-lg max-w-md mb-10 leading-relaxed">
                Estamos prontos para dar vida ao seu projeto. Entre em contato e agende uma conversa.
              </p>
              <Link
                to="/budget"
                className="inline-flex items-center space-x-4 text-white group"
              >
                <span className="text-lg font-light border-b border-white pb-1 group-hover:border-accent group-hover:text-accent transition duration-300">Solicitar Orçamento</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition duration-300 group-hover:text-accent" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-10"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Endereço</span>
                </div>
                <p className="text-gray-400 font-light text-sm leading-relaxed">{siteContent?.office?.address}</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Horário</span>
                </div>
                <p className="text-gray-400 font-light text-sm leading-relaxed">{siteContent?.office?.hoursDescription}</p>
              </div>
              <div>
                <a
                  href={siteContent?.office?.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest hover:text-white transition"
                >
                  Ver no Google Maps
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section - Colorful */}
      <section className="h-[400px] md:h-[500px] relative">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(siteContent?.office?.mapQuery || siteContent?.office?.address || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização Fran Siller Arquitetura"
        />
      </section>

    </div>
  );
}
