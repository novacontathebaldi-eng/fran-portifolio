import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, Variants } from 'framer-motion';

export const Home: React.FC = () => {
  const { projects, siteContent } = useProjects();

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
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-home.png"
            alt="Hero Architecture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-6 relative z-10 text-white mt-12"
        >
          <motion.span variants={fadeInUp} className="block mb-6 text-accent uppercase tracking-[0.3em] text-xs font-bold drop-shadow-md">
            Arquitetura & Design
          </motion.span>

          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light mb-8 md:mb-10 leading-[1.1] max-w-4xl drop-shadow-lg">
            Projetando espaços <br />
            para <i className="font-serif italic text-accent">viver melhor</i>.
          </motion.h1>

          <motion.div variants={fadeInUp}>
            <Link
              to="/portfolio"
              className="inline-flex items-center space-x-3 text-base md:text-lg group"
            >
              <span className="border-b border-white pb-1 group-hover:border-accent group-hover:text-accent transition duration-300">Explorar Projetos</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition duration-300 group-hover:text-accent" />
            </Link>
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
            <h2 className="text-3xl md:text-4xl font-serif mb-2">Obras Selecionadas</h2>
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