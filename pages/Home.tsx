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

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Editorial Split-Screen */}
      <section className="relative h-screen flex overflow-hidden bg-[#0a0a0a]">

        {/* Left Side - Typography & Content */}
        <div className="relative z-20 w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20">

          {/* Floating Label */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-2 border border-[#d4bbb0]/30 text-[#d4bbb0] text-[10px] md:text-xs tracking-[0.5em] uppercase font-light">
              Fran Siller Arquitetura
            </span>
          </motion.div>

          {/* Giant Typography - Character by character animation */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              className="text-[clamp(2.5rem,8vw,6rem)] font-light leading-[0.95] tracking-[-0.03em] text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {"Criamos".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-4">
            <motion.h1
              className="text-[clamp(2.5rem,8vw,6rem)] font-light leading-[0.95] tracking-[-0.03em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {"poesia em".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.04, ease: [0.33, 1, 0.68, 1] }}
                  className={`inline-block ${char === " " ? "w-[0.3em]" : ""}`}
                  style={{ color: char === " " ? "transparent" : "#d4bbb0" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-10">
            <motion.h1
              className="text-[clamp(2.5rem,8vw,6rem)] font-light leading-[0.95] tracking-[-0.03em] text-white italic"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {"concreto.".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 + i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          {/* Elegant Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="text-white/50 text-sm md:text-base font-light leading-relaxed max-w-md mb-10"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Cada traço nasce da escuta. Cada espaço, de um sonho compartilhado.
            Arquitetura que abraça quem mora.
          </motion.p>

          {/* Elegant CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link
              to="/portfolio"
              className="group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3 text-white text-sm tracking-[0.2em] uppercase font-light py-4 px-8 border border-white/20 hover:border-[#d4bbb0] transition-all duration-500">
                Descobrir Projetos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
              </span>
              <div className="absolute inset-0 bg-[#d4bbb0] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="absolute inset-0 z-20 flex items-center justify-center gap-3 text-black text-sm tracking-[0.2em] uppercase font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                Descobrir Projetos
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              to="/budget"
              className="group flex items-center gap-3 text-[#d4bbb0] text-sm tracking-[0.15em] uppercase font-light hover:text-white transition-colors duration-300"
            >
              <span className="w-8 h-[1px] bg-current group-hover:w-12 transition-all duration-300" />
              Iniciar Projeto
            </Link>
          </motion.div>

          {/* Bottom Info Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="absolute bottom-8 left-8 md:left-16 lg:left-20 flex items-center gap-8 text-white/30 text-[10px] tracking-[0.3em] uppercase"
          >
            <span>São Paulo, BR</span>
            <span className="w-12 h-[1px] bg-white/20" />
            <span>Est. 2010</span>
          </motion.div>
        </div>

        {/* Right Side - Image with Overlay */}
        <div className="hidden lg:block absolute top-0 right-0 w-[50%] h-full">
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
            className="relative w-full h-full"
          >
            <img
              src="https://qtlntypxagxhzlzpemvx.supabase.co/storage/v1/object/public/storage-Fran/1765189105042-0.24789718604799715.webp"
              alt="Arquitetura"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/20" />

            {/* Floating Project Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.2 }}
              className="absolute bottom-12 right-12 text-right"
            >
              <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">Projeto em Destaque</p>
              <p className="text-white text-lg font-light" style={{ fontFamily: "'Playfair Display', serif" }}>Casa Jardim Paulista</p>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 text-[#d4bbb0] text-xs tracking-wider mt-3 hover:text-white transition-colors"
              >
                Ver Projeto <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Vertical Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="absolute top-1/2 -translate-y-1/2 -left-6 rotate-[-90deg] origin-center"
          >
            <span className="text-white/20 text-[10px] tracking-[0.5em] uppercase whitespace-nowrap">
              Scroll para explorar
            </span>
          </motion.div>
        </div>

        {/* Mobile Background Image */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src="https://qtlntypxagxhzlzpemvx.supabase.co/storage/v1/object/public/storage-Fran/1765189105042-0.24789718604799715.webp"
            alt="Arquitetura"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/70" />
        </div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 1.8, ease: [0.33, 1, 0.68, 1] }}
          className="hidden lg:block absolute top-0 left-[55%] w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent origin-top"
        />

        {/* Corner Accents */}
        <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-white/10 hidden lg:block" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-[#d4bbb0]/30 hidden lg:block" />

      </section>


      {/* Featured Scroll */}
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

        {/* Horizontal Scroll Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex overflow-x-auto pb-6 space-x-6 md:space-x-8 px-6 md:px-20 lg:px-32 xl:px-40 obras-scroll snap-x snap-mandatory scroll-pl-6 md:scroll-pl-20"
        >
          {/* Mostrar featured primeiro, fallback para os 5 primeiros */}
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
              <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide">{project.location} — {project.year}</p>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Featured Cultural Projects Scroll */}
      {(culturalProjects.filter(p => p.featured).length > 0 || culturalProjects.length > 0) && (
        <section className="pt-8 pb-20 md:pt-12 md:pb-32 bg-white">
          <div className="container mx-auto px-6 mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-2">Projetos Culturais Selecionados</h2>
              <p className="text-secondary text-base md:text-lg font-light">Iniciativas culturais e projetos especiais.</p>
            </motion.div>
            <Link to="/cultural" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-accent hover:border-accent transition">Ver Todos</Link>
          </div>

          {/* Horizontal Scroll Container */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex overflow-x-auto pb-6 space-x-6 md:space-x-8 px-6 md:px-20 lg:px-32 xl:px-40 obras-scroll snap-x snap-mandatory scroll-pl-6 md:scroll-pl-20"
          >
            {/* Mostrar featured primeiro, fallback para os 5 primeiros */}
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
                <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide">{project.category} — {project.year}</p>
              </Link>
            ))}
          </motion.div>
        </section>
      )}


      {/* About Teaser */}
      <section className="py-20 md:py-32 bg-[#f9f9f9]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 relative group"
          >
            <div className="absolute -top-6 -left-6 w-full h-full border-2 border-accent z-0 hidden md:block"></div>
            <div className="relative z-10 overflow-hidden shadow-2xl">
              <img
                src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/img-sobre-home.png"
                alt="About"
                className="w-full h-auto transition-transform duration-1000 ease-in-out hover:scale-105"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <span className="text-accent uppercase tracking-widest text-xs font-bold mb-4 block">Sobre o Escritório</span>
            <h2 className="text-3xl md:text-5xl font-serif mb-6 md:mb-8 leading-tight">Arquitetura Sensorial e Atemporal</h2>
            <p className="text-secondary leading-relaxed md:leading-loose mb-8 md:mb-10 text-base md:text-lg font-light">
              Acreditamos que a arquitetura não é apenas sobre edifícios, mas sobre como experimentamos o mundo.
              Cada linha traçada é uma decisão sobre como a luz entrará em uma sala, como o som viajará e como uma pessoa se sentirá.
            </p>
            <Link to="/about" className="inline-block bg-primary text-white px-8 py-3 md:px-10 md:py-4 rounded-full hover:bg-accent hover:text-black transition duration-300 text-xs md:text-sm tracking-widest font-bold uppercase shadow-lg hover:shadow-xl active:scale-95">
              Nossa Filosofia
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Visit Us Section - FIXED LINK */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-0 shadow-2xl rounded-2xl overflow-hidden">

            {/* Info Column */}
            <div className="w-full lg:w-1/3 bg-[#111] text-white p-12 flex flex-col justify-center">
              <span className="text-accent uppercase tracking-widest text-xs font-bold mb-6 block">Visite-nos</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-tight">Nosso Ateliê <br /> Criativo</h2>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-lg mb-1">Endereço</p>
                    <p className="text-gray-400 font-light text-sm leading-relaxed">{siteContent?.office?.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-lg mb-1">Horário</p>
                    <p className="text-gray-400 font-light text-sm leading-relaxed">{siteContent?.office?.hoursDescription}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href={siteContent?.office?.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-white text-black text-center py-4 rounded-full font-bold uppercase text-xs tracking-wider hover:bg-accent transition"
                >
                  Traçar Rota
                </a>
                {/* CHANGED FROM MODAL BUTTON TO DIRECT LINK */}
                <Link
                  to="/office"
                  className="block w-full border border-gray-700 text-white text-center py-4 rounded-full font-bold uppercase text-xs tracking-wider hover:border-white transition"
                >
                  Conheça o Escritório
                </Link>
              </div>
            </div>

            {/* Map Column */}
            <div className="w-full lg:w-2/3 h-[400px] lg:h-auto relative bg-gray-200">
              {/* Google Maps Embed using Address Query */}
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(siteContent?.office?.mapQuery || siteContent?.office?.address || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="transition duration-700"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};