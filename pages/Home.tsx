import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, Variants } from 'framer-motion';

export const Home: React.FC = () => {
  const { projects, culturalProjects, siteContent } = useProjects();

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.5 } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5
      }
    }
  };

  const lineExpand: Variants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="bg-white text-[#1a1a1a] overflow-hidden">
      {/* ==================== HERO SECTION - SPLIT LAYOUT ==================== */}
      <section className="min-h-screen relative flex">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-32 relative z-10">
          {/* Decorative Corner */}
          <div className="absolute top-[120px] left-[40px] w-16 h-16 border-l border-t border-[#c9a962]/30 hidden lg:block" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
              <motion.div
                variants={lineExpand}
                className="h-px w-12 bg-[#c9a962] origin-left"
              />
              <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">
                Arquitetura & Design
              </span>
            </motion.div>

            {/* Main Title - Split Lines */}
            <motion.h1 variants={fadeInUp} className="mb-8">
              <span className="block text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.1] mb-2 text-[#1a1a1a]">
                Criando
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.1] text-[#c9a962]">
                Experiências
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.1] text-[#1a1a1a]">
                Atemporais
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-gray-500 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-md"
            >
              Onde a visão encontra a precisão. Projetamos espaços que transcendem o ordinário.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a1a] text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#c9a962] transition-all duration-500 group"
              >
                <span>Ver Projetos</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 border border-[#1a1a1a]/20 text-[#1a1a1a] text-xs font-bold tracking-[0.2em] uppercase hover:border-[#c9a962] hover:text-[#c9a962] transition-all duration-500"
              >
                <span>Agendar Consulta</span>
              </Link>
            </motion.div>

            {/* Bottom Stats */}
            <motion.div
              variants={fadeIn}
              className="mt-20 flex items-center gap-12"
            >
              <div>
                <p className="text-4xl font-serif text-[#c9a962]">150+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Projetos</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="text-4xl font-serif text-[#1a1a1a]">12</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Anos</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="text-4xl font-serif text-[#c9a962]">∞</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Possibilidades</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block w-1/2 relative"
        >
          <div className="absolute inset-0">
            <img
              src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png"
              alt="Architecture"
              className="w-full h-full object-cover"
            />
            {/* Soft overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-white" />
          </div>

          {/* Floating Card on Image */}
          <div className="absolute bottom-24 left-0 transform -translate-x-1/2">
            <div className="bg-white/90 backdrop-blur-xl p-8 w-80 shadow-2xl border border-[#c9a962]/20">
              <p className="text-xs text-[#c9a962] uppercase tracking-widest mb-3">Projeto em Destaque</p>
              <p className="text-xl font-serif text-[#1a1a1a] mb-2">Villa Serenidade</p>
              <p className="text-sm text-gray-400">São Paulo, 2024</p>
            </div>
          </div>

          {/* Geometric Decoration */}
          <div className="absolute top-[15%] right-[10%] w-48 h-48 border border-[#c9a962]/10 rotate-45 pointer-events-none" />
        </motion.div>

        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png"
            alt="Architecture"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/70" />
        </div>
      </section>

      {/* ==================== FEATURED PROJECTS ==================== */}
      <section className="py-24 md:py-40 bg-[#fafafa] relative">
        {/* Section Header */}
        <div className="container mx-auto px-8 md:px-16 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-4"
              >
                <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">01</span>
                <div className="h-px w-16 bg-[#c9a962]/30" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-serif font-light text-[#1a1a1a]"
              >
                Projetos <span className="text-[#c9a962]">Selecionados</span>
              </motion.h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 group text-gray-500 hover:text-[#c9a962] transition-colors text-sm uppercase tracking-wider"
            >
              <span>Ver Coleção Completa</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

        {/* Projects Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex overflow-x-auto gap-8 px-8 md:px-16 pb-8 obras-scroll snap-x snap-mandatory"
        >
          {(projects.filter(p => p.featured).length > 0
            ? projects.filter(p => p.featured)
            : projects.slice(0, 5)
          ).map((project, index) => (
            <Link
              to={`/project/${project.id}`}
              key={project.id}
              className="min-w-[320px] md:min-w-[500px] snap-start group"
            >
              <div className="relative overflow-hidden mb-6">
                {/* Image */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Index Number */}
                <div className="absolute top-6 left-6">
                  <span className="text-6xl font-serif text-black/5 group-hover:text-[#c9a962]/30 transition-colors duration-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* View Button */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="w-14 h-14 rounded-full border border-white flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif text-[#1a1a1a] group-hover:text-[#c9a962] transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 uppercase tracking-wider">
                    {project.location}
                  </p>
                </div>
                <span className="text-sm text-gray-300">{project.year}</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ==================== CULTURAL PROJECTS ==================== */}
      {culturalProjects.length > 0 && (
        <section className="py-24 md:py-40 bg-white relative">
          <div className="container mx-auto px-8 md:px-16 mb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-4"
                >
                  <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">02</span>
                  <div className="h-px w-16 bg-[#c9a962]/30" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-serif font-light text-[#1a1a1a]"
                >
                  Iniciativas <span className="text-[#c9a962]">Culturais</span>
                </motion.h2>
              </div>
              <Link
                to="/cultural"
                className="inline-flex items-center gap-2 group text-gray-500 hover:text-[#c9a962] transition-colors text-sm uppercase tracking-wider"
              >
                <span>Explorar Cultura</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex overflow-x-auto gap-8 px-8 md:px-16 pb-8 obras-scroll snap-x snap-mandatory"
          >
            {(culturalProjects.filter(p => p.featured).length > 0
              ? culturalProjects.filter(p => p.featured)
              : culturalProjects.slice(0, 5)
            ).map((project, index) => (
              <Link
                to={`/cultural/${project.id}`}
                key={project.id}
                className="min-w-[320px] md:min-w-[500px] snap-start group"
              >
                <div className="relative overflow-hidden mb-6">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-6 left-6">
                    <span className="text-6xl font-serif text-black/5 group-hover:text-[#c9a962]/30 transition-colors duration-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-14 h-14 rounded-full border border-white flex items-center justify-center bg-white/20 backdrop-blur-sm">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif text-[#1a1a1a] group-hover:text-[#c9a962] transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 uppercase tracking-wider">
                      {project.category}
                    </p>
                  </div>
                  <span className="text-sm text-gray-300">{project.year}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        </section>
      )}

      {/* ==================== ABOUT SECTION ==================== */}
      <section className="py-24 md:py-40 bg-[#fafafa] relative overflow-hidden">
        {/* Background Geometric */}
        <div className="absolute top-[10%] right-[-5%] w-40 h-40 border border-[#c9a962]/10 rounded-full pointer-events-none" />

        <div className="container mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/img-sobre-home.png"
                    alt="About"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating accent */}
                <div className="absolute -bottom-8 -right-8 w-2/3 h-2/3 border border-[#c9a962]/20 -z-10" />
              </div>
            </motion.div>

            {/* Content Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-7 lg:pl-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase">03</span>
                <div className="h-px w-16 bg-[#c9a962]/30" />
                <span className="text-gray-400 text-xs tracking-widest uppercase">Sobre Nós</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-8 leading-[1.1] text-[#1a1a1a]">
                Arquitetura é a arte de
                <span className="block text-[#c9a962]">organizar o espaço</span>
              </h2>

              <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-xl">
                Com mais de uma década de experiência, transformamos visões em realidade.
                Cada projeto é uma narrativa única, onde funcionalidade encontra beleza e
                tradição abraça inovação.
              </p>

              <div className="flex flex-wrap gap-6 mb-12">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a1a] text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#c9a962] transition-all duration-500 group"
                >
                  <span>Nossa História</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/office"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-[#1a1a1a]/20 text-[#1a1a1a] text-xs font-bold tracking-[0.2em] uppercase hover:border-[#c9a962] hover:text-[#c9a962] transition-all duration-500"
                >
                  <span>Visite o Ateliê</span>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-2xl font-serif text-[#c9a962] mb-2">Premium</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Materiais</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-[#1a1a1a] mb-2">Sob Medida</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Design</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-[#c9a962] mb-2">Atemporal</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Estilo</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT CTA ==================== */}
      <section className="py-24 md:py-40 bg-white relative">
        <div className="container mx-auto px-8 md:px-16">
          <div className="bg-[#1a1a1a] p-12 md:p-20 relative overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-[#c9a962]/30" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-[#c9a962]/30" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-[#c9a962]/30" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-[#c9a962]/30" />

            <div className="text-center max-w-3xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-[#c9a962] text-xs font-bold tracking-[0.3em] uppercase mb-6 block">
                  Vamos Criar Juntos
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-8 text-white">
                  Pronto para transformar seu espaço?
                </h2>
                <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto">
                  Entre em contato para uma consulta exclusiva e descubra como podemos
                  dar vida à sua visão.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#c9a962] text-[#1a1a1a] text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-all duration-500 group"
                  >
                    <span>Iniciar Projeto</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href={siteContent?.office?.mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-[#c9a962] hover:text-[#c9a962] transition-all duration-500"
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