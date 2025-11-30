

import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone } from 'lucide-react';

export const Office: React.FC = () => {
  const { siteContent } = useProjects();
  
  // Safe access to office content
  const officeData = siteContent?.office || {};
  const { blocks, address, hoursDescription, mapsLink, mapQuery, phone, email } = officeData;

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (!blocks || blocks.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl font-serif mb-4">Conteúdo em Construção</h2>
        <p className="text-gray-500">O administrador ainda não definiu o conteúdo desta página.</p>
      </div>
    );
  }

  // Determine if the first block is a Hero Image to adjust padding
  const hasHero = blocks[0].type === 'image-full';

  return (
    <div className={`bg-white min-h-screen ${hasHero ? '' : 'pt-24'}`}>
      {/* Dynamic Block Renderer */}
      {blocks.map((block, index) => {
        
        // 1. HERO IMAGE (Image Full) - Sem margem superior se for o primeiro
        if (block.type === 'image-full') {
          return (
            <motion.div 
              key={block.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className={`w-full relative ${index === 0 ? 'h-[70vh] md:h-[85vh]' : 'h-[50vh] md:h-[70vh] mt-12 md:mt-24'}`}
            >
              <img src={block.content} alt="Office" className="w-full h-full object-cover" />
              {block.caption && (
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-8 md:p-12">
                   <p className="text-white text-sm md:text-base font-medium tracking-widest uppercase">{block.caption}</p>
                </div>
              )}
            </motion.div>
          );
        }

        // 2. HEADING
        if (block.type === 'heading') {
          return (
            <div key={block.id} className="container mx-auto px-6 pt-12 pb-6 md:pt-20 md:pb-10">
              <motion.h2 
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] text-primary"
              >
                {block.content}
              </motion.h2>
            </div>
          );
        }

        // 3. TEXT
        if (block.type === 'text') {
          return (
            <div key={block.id} className="container mx-auto px-6 pb-12 md:pb-20">
              <motion.div 
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="prose prose-lg md:prose-xl text-secondary max-w-3xl leading-relaxed font-light"
              >
                <p className="whitespace-pre-line">{block.content}</p>
              </motion.div>
            </div>
          );
        }

        // 4. IMAGE GRID
        if (block.type === 'image-grid') {
          return (
            <div key={block.id} className="container mx-auto px-6 py-12 md:py-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {block.items?.map((img, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                    className="aspect-[4/3] bg-gray-100 overflow-hidden relative group"
                  >
                    <img 
                      src={img} 
                      alt={`Gallery ${idx}`} 
                      className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110" 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        }

        // 5. QUOTE
        if (block.type === 'quote') {
          return (
            <div key={block.id} className="bg-[#f9f9f9] py-24 md:py-32 my-12 md:my-24">
              <div className="container mx-auto px-6 text-center max-w-4xl">
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                >
                  <span className="block text-6xl text-accent font-serif mb-4">“</span>
                  <h3 className="text-3xl md:text-5xl font-serif italic text-primary leading-tight mb-8">
                    {block.content}
                  </h3>
                  <div className="h-1 w-20 bg-accent mx-auto"></div>
                </motion.div>
              </div>
            </div>
          );
        }

        // 6. DETAILS (Contact Info styled card)
        if (block.type === 'details') {
          return (
            <div key={block.id} className="container mx-auto px-6 py-12 md:py-24">
               <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="bg-[#1a1a1a] text-white rounded-sm p-8 md:p-16 shadow-2xl"
               >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                          <MapPin className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="text-xl font-serif">Localização</h4>
                        <p className="text-gray-400 font-light leading-relaxed">{address}</p>
                        {mapsLink && (
                          <a href={mapsLink} target="_blank" rel="noreferrer" className="inline-block text-xs font-bold uppercase tracking-widest border-b border-accent pb-1 hover:text-accent transition mt-2">Ver no Mapa</a>
                        )}
                     </div>
                     
                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="text-xl font-serif">Horário</h4>
                        <p className="text-gray-400 font-light leading-relaxed">{hoursDescription}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                          <Phone className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="text-xl font-serif">Contato</h4>
                        <div className="space-y-1">
                          <p className="text-gray-400 font-light">{phone}</p>
                          <p className="text-gray-400 font-light">{email}</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
          );
        }

        // 7. MAP (Full width responsive map)
        if (block.type === 'map') {
          return (
            <div key={block.id} className="w-full h-[400px] md:h-[600px] bg-gray-200 mt-12 grayscale hover:grayscale-0 transition duration-1000">
               <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  allowFullScreen 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || address || 'São Paulo')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
               ></iframe>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};