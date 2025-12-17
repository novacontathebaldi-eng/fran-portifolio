import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, ChevronDown } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { projects, culturalProjects, siteContent } = useProjects();
  const isOfficeActive = siteContent?.office?.isActive !== false;

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

      {/* ===== HERO SECTION - COMPLETELY NEW DESIGN ===== */}
      <section className="relative min-h-screen flex flex-col">

        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
            src={heroImage}
            alt={heroProject?.title || 'Arquitetura'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Main Content - Centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">

            {/* Elegant Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[#d4bbb0] text-sm md:text-base tracking-[0.4em] uppercase mb-6 font-light"
            >
              Arquitetura & Design
            </motion.p>

            {/* Main Title - Clean & Bold */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light leading-[1.1] mb-8"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              Projetamos espaços<br />
              <span className="italic text-[#d4bbb0]">que contam histórias</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-white/70 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
            >
              Cada projeto é uma jornada única. Unimos estética, funcionalidade
              e a essência de quem vai habitar o espaço.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/portfolio"
                className="px-8 py-4 bg-white text-black text-sm tracking-widest uppercase font-medium hover:bg-[#d4bbb0] transition-colors duration-300 rounded-none"
              >
                Ver Portfólio
              </Link>
              <Link
                to="/budget"
                className="px-8 py-4 bg-[#d4bbb0] text-black text-sm tracking-widest uppercase font-medium hover:bg-white transition-colors duration-300 rounded-none"
              >
                Solicitar Orçamento
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Featured Project Badge - Bottom Right */}
        {heroProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="hidden md:block absolute bottom-12 right-12 text-right"
          >
            <Link
              to={heroProjectType === 'cultural' ? `/cultural/${heroProject.id}` : `/project/${heroProject.id}`}
              className="group"
            >
              <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-1">Em Destaque</p>
              <p className="text-white text-lg font-light group-hover:text-[#d4bbb0] transition-colors">
                {heroProject.title}
              </p>
            </Link>
          </motion.div>
        )}

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </motion.div>

      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <p className="text-[#d4bbb0] text-sm tracking-[0.3em] uppercase mb-3">Portfólio</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Projetos Selecionados
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="group flex items-center gap-2 text-sm tracking-widest uppercase hover:text-[#d4bbb0] transition-colors"
            >
              Ver Todos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(projects.filter(p => p.featured).length > 0
              ? projects.filter(p => p.featured).slice(0, 6)
              : projects.slice(0, 6)
            ).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={`/project/${project.id}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-light group-hover:text-[#d4bbb0] transition-colors" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{project.location}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CULTURAL PROJECTS ===== */}
      {culturalProjects.length > 0 && (
        <section className="py-20 md:py-32 bg-[#f8f6f4]">
          <div className="container mx-auto px-6">

            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <p className="text-[#d4bbb0] text-sm tracking-[0.3em] uppercase mb-3">Cultura & Patrimônio</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Projetos Culturais
                </h2>
              </div>
              <Link
                to="/cultural"
                className="group flex items-center gap-2 text-sm tracking-widest uppercase hover:text-[#d4bbb0] transition-colors"
              >
                Ver Todos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(culturalProjects.filter(p => p.featured).length > 0
                ? culturalProjects.filter(p => p.featured).slice(0, 6)
                : culturalProjects.slice(0, 6)
              ).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link to={`/cultural/${project.id}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h3 className="text-xl font-light group-hover:text-[#d4bbb0] transition-colors" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{project.location}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CONTACT SECTION - NEW DESIGN ===== */}
      <section className="py-20 md:py-32 bg-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[#d4bbb0] text-sm tracking-[0.3em] uppercase mb-6">Próximo Passo</p>
              <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Vamos conversar sobre<br />
                <span className="italic text-[#d4bbb0]">seu projeto?</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 font-light">
                Estamos prontos para transformar suas ideias em realidade.
                Entre em contato e agende uma conversa sem compromisso.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link
                to="/budget"
                className="px-10 py-4 bg-[#d4bbb0] text-black text-sm tracking-widest uppercase font-medium hover:bg-white transition-colors duration-300"
              >
                Solicitar Orçamento
              </Link>
              <Link
                to="/schedule"
                className="px-10 py-4 border border-white/30 text-white text-sm tracking-widest uppercase font-light hover:border-[#d4bbb0] hover:text-[#d4bbb0] transition-all duration-300"
              >
                Agendar Reunião
              </Link>
            </motion.div>

            {/* Contact Info - only show location when office is active */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`grid grid-cols-1 ${isOfficeActive ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-8 pt-12 border-t border-white/10`}
            >
              {isOfficeActive && (
                <>
                  <div className="text-center">
                    <MapPin className="w-5 h-5 text-[#d4bbb0] mx-auto mb-3" />
                    <p className="text-white/60 text-sm">{siteContent?.office?.address}</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-[#d4bbb0] mx-auto mb-3" />
                    <p className="text-white/60 text-sm">{siteContent?.office?.hoursDescription}</p>
                  </div>
                  <div className="text-center">
                    <a
                      href={siteContent?.office?.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#d4bbb0] text-sm hover:text-white transition-colors"
                    >
                      Ver no Mapa
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </>
              )}
              {!isOfficeActive && (
                <div className="text-center">
                  <Clock className="w-5 h-5 text-[#d4bbb0] mx-auto mb-3" />
                  <p className="text-white/60 text-sm">{siteContent?.office?.hoursDescription}</p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ===== MAP - only show when office is active ===== */}
      {isOfficeActive && (
        <section className="h-[300px] md:h-[400px] relative">
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
      )}

    </div>
  );
}
