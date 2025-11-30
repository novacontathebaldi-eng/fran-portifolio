import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, X, Phone, Mail } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, Variants, AnimatePresence } from 'framer-motion';

export const Home: React.FC = () => {
  const { projects, siteContent } = useProjects();
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  
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

  // Lock body scroll when Full Screen Modal is open
  useEffect(() => {
    if (showOfficeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showOfficeModal]);
  
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        {/* Background Image Parallax Effect could go here, staying simple for now */}
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
            Projetando espaços <br/>
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
      <section className="py-20 md:py-32 bg-white">
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
          className="flex overflow-x-auto pb-12 space-x-6 md:space-x-8 px-6 md:px-20 lg:px-32 xl:px-40 no-scrollbar snap-x snap-mandatory scroll-pl-6 md:scroll-pl-20"
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

      {/* Visit Us Section - NEW */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
           <div className="flex flex-col lg:flex-row gap-0 shadow-2xl rounded-2xl overflow-hidden">
              
              {/* Info Column */}
              <div className="w-full lg:w-1/3 bg-[#111] text-white p-12 flex flex-col justify-center">
                 <span className="text-accent uppercase tracking-widest text-xs font-bold mb-6 block">Visite-nos</span>
                 <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-tight">Nosso Ateliê <br/> Criativo</h2>
                 
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
                    <button 
                      onClick={() => setShowOfficeModal(true)}
                      className="block w-full border border-gray-700 text-white text-center py-4 rounded-full font-bold uppercase text-xs tracking-wider hover:border-white transition"
                    >
                      Conheça o Escritório
                    </button>
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
                   src={`https://maps.google.com/maps?q=${encodeURIComponent(siteContent?.office?.address || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                   className="filter grayscale hover:grayscale-0 transition duration-700"
                 ></iframe>
              </div>
           </div>
        </div>
      </section>

      {/* FULL SCREEN OFFICE MODAL - DYNAMIC CMS */}
      <AnimatePresence>
        {showOfficeModal && (
           <motion.div 
             initial={{ opacity: 0, y: '100%' }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: '100%' }}
             transition={{ duration: 0.5, ease: "easeInOut" }}
             className="fixed inset-0 z-[100] bg-white overflow-y-auto"
           >
              {/* Close Button - Sticky */}
              <div className="fixed top-6 right-6 z-[110]">
                <button 
                  onClick={() => setShowOfficeModal(false)} 
                  className="bg-black text-white p-3 rounded-full hover:bg-accent hover:text-black transition shadow-lg group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Dynamic Content Rendering */}
              <div className="min-h-screen pb-20">
                 
                 {(!siteContent?.office?.blocks || siteContent.office.blocks.length === 0) ? (
                    <div className="h-screen flex items-center justify-center">
                       <p className="text-gray-400">Conteúdo do escritório em construção.</p>
                    </div>
                 ) : (
                    siteContent.office.blocks.map((block) => {
                       
                       // 1. HERO IMAGE (Image Full)
                       if (block.type === 'image-full') {
                          return (
                             <div key={block.id} className="w-full h-[60vh] md:h-[80vh] relative">
                                <img src={block.content} className="w-full h-full object-cover" />
                                {block.caption && (
                                   <div className="absolute bottom-0 left-0 bg-white/90 px-6 py-3 text-sm font-bold tracking-wider uppercase">
                                      {block.caption}
                                   </div>
                                )}
                             </div>
                          );
                       }

                       // 2. HEADING
                       if (block.type === 'heading') {
                          return (
                             <div key={block.id} className="container mx-auto px-6 py-12 md:py-20">
                                <motion.h2 
                                  initial={{ opacity: 0, y: 30 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  className="text-4xl md:text-6xl font-serif leading-tight max-w-4xl"
                                >
                                   {block.content}
                                </motion.h2>
                             </div>
                          );
                       }

                       // 3. TEXT
                       if (block.type === 'text') {
                          return (
                             <div key={block.id} className="container mx-auto px-6 pb-12">
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  viewport={{ once: true }}
                                  className="prose prose-lg md:prose-xl text-gray-600 leading-relaxed max-w-3xl"
                                >
                                   <p>{block.content}</p>
                                </motion.div>
                             </div>
                          );
                       }

                       // 4. IMAGE GRID
                       if (block.type === 'image-grid') {
                          return (
                             <div key={block.id} className="container mx-auto px-6 py-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                   {block.items?.map((img, idx) => (
                                      <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="h-[400px] bg-gray-100 overflow-hidden"
                                      >
                                         <img src={img} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                                      </motion.div>
                                   ))}
                                </div>
                             </div>
                          );
                       }

                       // 5. QUOTE
                       if (block.type === 'quote') {
                          return (
                             <div key={block.id} className="bg-gray-50 py-20 my-12">
                                <div className="container mx-auto px-6 text-center">
                                   <h3 className="text-3xl md:text-5xl font-serif italic text-gray-800">"{block.content}"</h3>
                                </div>
                             </div>
                          );
                       }

                       // 6. DETAILS (Contact Info)
                       if (block.type === 'details') {
                          return (
                             <div key={block.id} className="container mx-auto px-6 py-12 bg-black text-white rounded-xl my-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-12">
                                   <div>
                                      <MapPin className="w-8 h-8 text-accent mb-4" />
                                      <h4 className="text-xl font-bold mb-2">Endereço</h4>
                                      <p className="text-gray-400">{siteContent?.office?.address}</p>
                                   </div>
                                   <div>
                                      <Clock className="w-8 h-8 text-accent mb-4" />
                                      <h4 className="text-xl font-bold mb-2">Horário</h4>
                                      <p className="text-gray-400">{siteContent?.office?.hoursDescription}</p>
                                   </div>
                                   <div>
                                      <Phone className="w-8 h-8 text-accent mb-4" />
                                      <h4 className="text-xl font-bold mb-2">Contato</h4>
                                      <p className="text-gray-400 text-sm mb-1">(27) 99667-0426</p>
                                      <p className="text-gray-400 text-sm">contato@fransiller.com.br</p>
                                   </div>
                                </div>
                             </div>
                          );
                       }

                       // 7. MAP
                       if (block.type === 'map') {
                          return (
                             <div key={block.id} className="w-full h-[500px] bg-gray-200">
                                <iframe 
                                   width="100%" 
                                   height="100%" 
                                   style={{ border: 0 }} 
                                   loading="lazy" 
                                   allowFullScreen 
                                   referrerPolicy="no-referrer-when-downgrade"
                                   src={`https://maps.google.com/maps?q=${encodeURIComponent(siteContent?.office?.address || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                   className="filter grayscale hover:grayscale-0 transition duration-700"
                                ></iframe>
                             </div>
                          );
                       }

                       return null;
                    })
                 )}

                 {/* Sticky Footer in Modal for CTA */}
                 <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 md:p-6 z-50 flex justify-between items-center">
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Gostou do que viu?</p>
                       <p className="font-serif text-lg">Vamos conversar sobre seu projeto.</p>
                    </div>
                    <Link to="/contact" onClick={() => setShowOfficeModal(false)} className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-accent hover:text-black transition">
                       Agendar Visita
                    </Link>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};