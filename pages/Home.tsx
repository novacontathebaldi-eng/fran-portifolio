import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, ChevronDown } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { MagneticTitle } from '../components/MagneticTitle';

// Hook para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

export const Home: React.FC = () => {
  const { projects, culturalProjects, siteContent } = useProjects();
  const heroRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);
  const contentY = useTransform(scrollY, [0, 800], [0, 100]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 40, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.03,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Premium Parallax */}
      <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
        {/* Parallax Background Layer */}
        <motion.div
          className="absolute inset-0 z-0 scale-110"
          style={{ y: backgroundY }}
        >
          <motion.img
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png"
            alt="Hero Architecture"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 hero-gradient-animated z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-[1]" />

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-px h-32 bg-gradient-to-b from-accent/0 via-accent/50 to-accent/0 hidden lg:block"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-px h-32 bg-gradient-to-b from-accent/0 via-accent/50 to-accent/0 hidden lg:block"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />

        {/* Hero Content with Parallax */}
        <motion.div
          style={{ y: contentY, opacity }}
          className="container mx-auto px-6 relative z-10 text-white mt-12"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Elegant Tagline with Shimmer */}
            <motion.div
              variants={fadeInUp}
              className="mb-8 flex items-center gap-4"
            >
              <motion.div
                className="w-12 h-px bg-accent line-expand hidden md:block"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <span className="tagline-shimmer uppercase tracking-[0.4em] text-xs md:text-sm font-bold">
                Criando Espaços • Transformando Vidas
              </span>
            </motion.div>

            {/* Main Title with Magnetic Effect */}
            <motion.div variants={fadeInUp} className="mb-10 md:mb-12">
              {isMobile ? (
                <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light leading-[1.1] max-w-4xl drop-shadow-lg text-glow">
                  Projetando espaços <br />
                  para <i className="font-serif italic text-accent">viver melhor</i>.
                </h1>
              ) : (
                <MagneticTitle
                  className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light leading-[1.1] max-w-4xl drop-shadow-lg text-glow"
                  italicWord="viver"
                >
                  Projetando espaços para viver melhor.
                </MagneticTitle>
              )}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={fadeInUp}>
              <Link
                to="/portfolio"
                className="group inline-flex items-center space-x-4 text-base md:text-lg"
              >
                <span className="relative overflow-hidden">
                  <span className="inline-block border-b-2 border-white/50 pb-1 group-hover:border-accent transition-colors duration-500">
                    Explorar Projetos
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 group-hover:text-accent transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/70"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-light">Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
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
          ).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={`/project/${project.id}`}
                className="min-w-[280px] md:min-w-[450px] snap-start group block"
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-6 relative rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Location badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {project.location}
                    </span>
                    <span className="text-white/80 text-xs">{project.year}</span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-serif group-hover:text-accent transition-colors duration-300">{project.title}</h3>
                <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide group-hover:text-secondary transition-colors duration-300">{project.location} — {project.year}</p>
              </Link>
            </motion.div>
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
            ).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/cultural/${project.id}`}
                  className="min-w-[280px] md:min-w-[450px] snap-start group block"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-6 relative rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Category badge */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <span className="text-white text-xs font-bold uppercase tracking-wider bg-accent/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-white/80 text-xs">{project.year}</span>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif group-hover:text-accent transition-colors duration-300">{project.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide group-hover:text-secondary transition-colors duration-300">{project.category} — {project.year}</p>
                </Link>
              </motion.div>
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