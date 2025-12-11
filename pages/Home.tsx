import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, Variants } from 'framer-motion';

export const Home: React.FC = () => {
  const { projects, culturalProjects, siteContent } = useProjects();

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2 } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3
      }
    }
  };

  const lineExpand: Variants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="bg-white text-[#1a1a1a] overflow-hidden">
      {/* ==================== HERO SECTION - FUNDO ESCURO ==================== */}
      <section className="h-screen max-h-[900px] relative flex bg-[#0a0a0a]">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-20 relative z-10">
          {/* Decorative Corner */}
          <div className="absolute top-24 left-8 w-12 h-12 border-l border-t border-[#c9a962]/30 hidden lg:block" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-lg"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <motion.div
                variants={lineExpand}
                className="h-px w-10 bg-[#c9a962] origin-left"
              />
              <span className="text-[#c9a962] text-[10px] font-bold tracking-[0.25em] uppercase">
                Arquitetura & Design
              </span>
            </motion.div>

            {/* Main Title - Menor */}
            <motion.h1 variants={fadeInUp} className="mb-6">
              <span className="block text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-[1.1] mb-1 text-white">
                Criando
              </span>
              <span className="block text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-[1.1] text-[#c9a962]">
                Experiências
              </span>
              <span className="block text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-[1.1] text-white">
                Atemporais
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-8 max-w-sm"
            >
              Onde a visão encontra a precisão. Projetamos espaços que transcendem o ordinário.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a962] text-[#0a0a0a] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all duration-500 group"
              >
                <span>Ver Projetos</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:border-[#c9a962] hover:text-[#c9a962] transition-all duration-500"
              >
                <span>Agendar Consulta</span>
              </Link>
            </motion.div>

            {/* Bottom Stats - Compacto */}
            <motion.div
              variants={fadeIn}
              className="mt-12 flex items-center gap-8"
            >
              <div>
                <p className="text-3xl font-serif text-[#c9a962]">150+</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Projetos</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl font-serif text-white">12</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Anos</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl font-serif text-[#c9a962]">∞</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Possibilidades</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block w-1/2 relative"
        >
          <div className="absolute inset-0">
            <img
              src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png"
              alt="Architecture"
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0a0a0a]/30 to-[#0a0a0a]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>

          {/* Floating Card on Image */}
          <div className="absolute bottom-16 left-0 transform -translate-x-1/3">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl p-6 w-64 border border-[#c9a962]/20">
              <p className="text-[10px] text-[#c9a962] uppercase tracking-widest mb-2">Projeto em Destaque</p>
              <p className="text-lg font-serif text-white mb-1">Villa Serenidade</p>
              <p className="text-xs text-white/40">São Paulo, 2024</p>
            </div>
          </div>

          {/* Geometric Decoration */}
          <div className="absolute top-[15%] right-[10%] w-32 h-32 border border-[#c9a962]/10 rotate-45 pointer-events-none" />
        </motion.div>

        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png"
            alt="Architecture"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/60" />
        </div>
      </section>

      {/* ==================== FEATURED PROJECTS - TEMA CLARO ==================== */}
      <section className="py-20 md:py-32 bg-[#fafafa] relative">
        {/* Section Header */}
        <div className="container mx-auto px-6 md:px-12 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-3"
              >
                <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">01</span>
                <div className="h-px w-12 bg-[#c9a962]/30" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-serif font-light text-[#1a1a1a]"
              >
                Projetos <span className="text-[#c9a962]">Selecionados</span>
              </motion.h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 group text-gray-500 hover:text-[#c9a962] transition-colors text-xs uppercase tracking-wider"
            >
              <span>Ver Coleção</span>
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

        {/* Projects Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-6 obras-scroll snap-x snap-mandatory"
        >
          {(projects.filter(p => p.featured).length > 0
            ? projects.filter(p => p.featured)
            : projects.slice(0, 5)
          ).map((project, index) => (
            <Link
              to={`/project/${project.id}`}
              key={project.id}
              className="min-w-[280px] md:min-w-[400px] snap-start group"
            >
              <div className="relative overflow-hidden mb-4">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute top-4 left-4">
                  <span className="text-5xl font-serif text-black/5 group-hover:text-[#c9a962]/30 transition-colors duration-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-serif text-[#1a1a1a] group-hover:text-[#c9a962] transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                    {project.location}
                  </p>
                </div>
                <span className="text-xs text-gray-300">{project.year}</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ==================== CULTURAL PROJECTS ==================== */}
      {culturalProjects.length > 0 && (
        <section className="py-20 md:py-32 bg-white relative">
          <div className="container mx-auto px-6 md:px-12 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">02</span>
                  <div className="h-px w-12 bg-[#c9a962]/30" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-serif font-light text-[#1a1a1a]"
                >
                  Iniciativas <span className="text-[#c9a962]">Culturais</span>
                </motion.h2>
              </div>
              <Link
                to="/cultural"
                className="inline-flex items-center gap-2 group text-gray-500 hover:text-[#c9a962] transition-colors text-xs uppercase tracking-wider"
              >
                <span>Explorar</span>
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-6 obras-scroll snap-x snap-mandatory"
          >
            {(culturalProjects.filter(p => p.featured).length > 0
              ? culturalProjects.filter(p => p.featured)
              : culturalProjects.slice(0, 5)
            ).map((project, index) => (
              <Link
                to={`/cultural/${project.id}`}
                key={project.id}
                className="min-w-[280px] md:min-w-[400px] snap-start group"
              >
                <div className="relative overflow-hidden mb-4">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="text-5xl font-serif text-black/5 group-hover:text-[#c9a962]/30 transition-colors duration-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-white/20 backdrop-blur-sm">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg md:text-xl font-serif text-[#1a1a1a] group-hover:text-[#c9a962] transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                      {project.category}
                    </p>
                  </div>
                  <span className="text-xs text-gray-300">{project.year}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        </section>
      )}

      {/* ==================== ABOUT SECTION ==================== */}
      <section className="py-20 md:py-32 bg-[#fafafa] relative overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-32 h-32 border border-[#c9a962]/10 rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/img-sobre-home.png"
                    alt="About"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 border border-[#c9a962]/20 -z-10" />
              </div>
            </motion.div>

            {/* Content Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-7 lg:pl-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">03</span>
                <div className="h-px w-12 bg-[#c9a962]/30" />
                <span className="text-gray-400 text-xs tracking-widest uppercase">Sobre Nós</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-6 leading-[1.1] text-[#1a1a1a]">
                Arquitetura é a arte de
                <span className="block text-[#c9a962]">organizar o espaço</span>
              </h2>

              <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-lg">
                Com mais de uma década de experiência, transformamos visões em realidade.
                Cada projeto é uma narrativa única, onde funcionalidade encontra beleza.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#c9a962] transition-all duration-500 group"
                >
                  <span>Nossa História</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/office"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a1a]/20 text-[#1a1a1a] text-[10px] font-bold tracking-[0.2em] uppercase hover:border-[#c9a962] hover:text-[#c9a962] transition-all duration-500"
                >
                  <span>Visite o Ateliê</span>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-xl font-serif text-[#c9a962] mb-1">Premium</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Materiais</p>
                </div>
                <div>
                  <p className="text-xl font-serif text-[#1a1a1a] mb-1">Sob Medida</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Design</p>
                </div>
                <div>
                  <p className="text-xl font-serif text-[#c9a962] mb-1">Atemporal</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Estilo</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT CTA ==================== */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="bg-[#1a1a1a] p-10 md:p-16 relative overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l border-t border-[#c9a962]/30" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-[#c9a962]/30" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-[#c9a962]/30" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r border-b border-[#c9a962]/30" />

            <div className="text-center max-w-2xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-[#c9a962] text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
                  Vamos Criar Juntos
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-6 text-white">
                  Pronto para transformar seu espaço?
                </h2>
                <p className="text-white/50 text-base mb-10 max-w-lg mx-auto">
                  Entre em contato para uma consulta exclusiva.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a962] text-[#1a1a1a] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all duration-500 group"
                  >
                    <span>Iniciar Projeto</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href={siteContent?.office?.mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:border-[#c9a962] hover:text-[#c9a962] transition-all duration-500"
                  >
                    <span>Visitar Escritório</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};