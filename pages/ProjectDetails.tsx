
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Heart, ArrowLeft, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const { projects, isLoadingData } = useProjects();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const project = projects.find(p => p.id === id);

  // LOGIC FIX:
  // We strictly separate sources. If the project uses CMS Blocks, we ONLY use images from those blocks.
  // If the project uses the legacy array, we ONLY use that.
  // This prevents duplicates (showing the same image twice) and "ghost" images (images in the DB but not rendered on screen).
  const allImages = useMemo(() => {
    if (!project) return [];

    const hasBlocks = project.blocks && project.blocks.length > 0;

    if (hasBlocks) {
      // 1. Extract only images that are actually rendered in the blocks
      const blockImages: string[] = [];
      project.blocks?.forEach(block => {
        if (block.type === 'image-full' && block.content) {
          blockImages.push(block.content);
        }
        if (block.type === 'image-grid' && block.items) {
          block.items.forEach(item => {
            if (item) blockImages.push(item);
          });
        }
      });
      // 2. Remove duplicates using Set, but preserve order of appearance
      return Array.from(new Set(blockImages));
    } else {
      // Legacy Mode: Use the main images array
      return project.images || [];
    }
  }, [project]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % allImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length);
    }
  };

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This is a React rule - hooks must be called in the same order every render

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev! + 1) % allImages.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev! - 1 + allImages.length) % allImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allImages.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

  // Screen size detection for sticky title (only on large screens)
  useEffect(() => {
    const checkScreenSize = () => {
      // lg breakpoint in Tailwind is 1024px
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Scroll detection for sticky title
  useEffect(() => {
    const handleScroll = () => {
      // Hero section is approximately 60-75vh, trigger sticky after scrolling past it
      const heroHeight = window.innerHeight * 0.65;
      setIsScrolled(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // CONDITIONAL RETURNS - AFTER all hooks have been called
  // Show loading while data is being fetched
  if (isLoadingData || (projects.length === 0 && id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Only show not found AFTER data has loaded AND projects array is populated
  if (!project) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Projeto não encontrado.</div>;
  }

  return (
    <div className="bg-white">
      {/* Lightbox Modal - Using Portal to render at document.body level ensures it floats above EVERYTHING */}
      {createPortal(
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              // FIXED: w-screen h-screen fixed inset-0 ensures it covers the entire viewport on PC and Mobile
              className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center w-screen h-screen"
              onClick={closeLightbox}
            >
              <button className="absolute top-6 right-6 text-white/70 hover:text-white transition z-20 p-2">
                <X className="w-8 h-8" />
              </button>

              <button onClick={prevImage} className="absolute left-4 md:left-8 text-white/50 hover:text-white transition p-4 z-20 hover:bg-white/10 rounded-full">
                <ChevronLeft className="w-10 h-10" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={allImages[lightboxIndex]}
                  className="max-h-full max-w-full object-contain rounded-sm shadow-2xl select-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <button onClick={nextImage} className="absolute right-4 md:right-8 text-white/50 hover:text-white transition p-4 z-20 hover:bg-white/10 rounded-full">
                <ChevronRight className="w-10 h-10" />
              </button>

              <div className="absolute bottom-6 left-0 right-0 text-center text-white/60 text-sm tracking-widest font-medium">
                {lightboxIndex + 1} / {allImages.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="h-[60vh] md:h-[75vh] w-full overflow-hidden relative"
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={project.image}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12 md:pb-20 px-6 md:px-12">
          <div className="container mx-auto relative z-10">
            <Link to="/portfolio" className="text-white hover:text-white mb-6 flex items-center space-x-2 text-xs md:text-sm uppercase tracking-widest transition" style={{ textShadow: '0 0 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> <span>Voltar para Portfólio</span>
            </Link>
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-3 py-1 border border-white/30 text-white/90 text-[10px] md:text-xs uppercase tracking-widest rounded-full mb-4 backdrop-blur-md bg-white/10"
            >
              {project.category}
            </motion.span>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-white mb-2 drop-shadow-lg leading-tight break-words"
            >
              {project.title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-sm md:text-lg font-light flex items-center space-x-2"
            >
              <span>{project.location}</span>
              <span className="w-1 h-1 bg-accent rounded-full"></span>
              <span>{project.year}</span>
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Details Sidebar */}
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-32 space-y-8 md:space-y-10 border-t border-black pt-8">
              {/* Sticky Title - appears on scroll (only on large screens) */}
              <AnimatePresence>
                {isScrolled && isLargeScreen && (
                  <motion.div
                    initial={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.1, 0.25, 1],
                      opacity: { duration: 0.6 },
                      filter: { duration: 0.5 }
                    }}
                    className="pb-6 mb-6 border-b border-gray-200"
                  >
                    <h2 className="text-2xl md:text-3xl font-serif text-black leading-tight">
                      {project.title}
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 lg:grid-cols-1 gap-6"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Localização</h3>
                  <p className="text-lg md:text-xl font-serif">{project.location}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Área Construída</h3>
                  <p className="text-lg md:text-xl font-serif">{project.area} m²</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ano</h3>
                  <p className="text-lg md:text-xl font-serif">{project.year}</p>
                </div>
              </motion.div>

              <div className="pt-4 lg:pt-8 flex gap-4">
                <Link to="/services" className="flex-grow flex items-center justify-center space-x-2 bg-black text-white px-6 py-4 rounded-full hover:bg-accent hover:text-black transition shadow-lg active:scale-95 duration-200">
                  <span className="text-sm font-bold uppercase tracking-wider">Solicitar Projeto</span>
                </Link>
                <button className="p-4 border border-gray-200 rounded-full hover:bg-gray-50 hover:scale-105 active:scale-95 transition text-gray-500 hover:text-red-500">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content & Blocks */}
          <div className="lg:w-3/4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              {/* Legacy Description Fallback */}
              {(!project.blocks || project.blocks.length === 0) && (
                <div className="prose prose-lg text-secondary max-w-none">
                  <p className="text-2xl font-serif text-black leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Dynamic Blocks */}
              {project.blocks?.map((block) => (
                <div key={block.id}>
                  {block.type === 'heading' && (
                    <h2 className="text-3xl font-serif font-bold mt-12 mb-6 text-black border-l-4 border-black pl-4">
                      {block.content}
                    </h2>
                  )}

                  {block.type === 'text' && (
                    <div className="prose prose-lg text-secondary max-w-none">
                      <p className="leading-loose">{block.content}</p>
                    </div>
                  )}

                  {block.type === 'quote' && (
                    <div className="border-l-4 border-accent pl-8 py-4 my-8">
                      <p className="text-3xl font-serif italic text-gray-900 leading-tight">"{block.content}"</p>
                    </div>
                  )}

                  {block.type === 'image-full' && (
                    <div className="w-full">
                      <div
                        className="overflow-hidden rounded-sm shadow-sm cursor-zoom-in"
                        onClick={() => {
                          const foundIdx = allImages.indexOf(block.content);
                          if (foundIdx >= 0) openLightbox(foundIdx);
                        }}
                      >
                        <img
                          src={block.content}
                          className="w-full h-auto transition-transform duration-1000 ease-in-out hover:scale-105"
                          alt="Project detail"
                        />
                      </div>
                      {block.caption && <p className="text-xs text-gray-400 mt-2 text-center">{block.caption}</p>}
                    </div>
                  )}

                  {block.type === 'image-grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {block.items?.map((url, i) => (
                        <div
                          key={i}
                          className="overflow-hidden rounded-sm shadow-sm cursor-zoom-in"
                          onClick={() => {
                            const foundIdx = allImages.indexOf(url);
                            if (foundIdx >= 0) openLightbox(foundIdx);
                          }}
                        >
                          <img
                            src={url}
                            className="w-full h-64 md:h-96 object-cover transition-transform duration-1000 ease-in-out hover:scale-110"
                            alt="Grid detail"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Gallery (Legacy Support) */}
            {(!project.blocks || project.blocks.length === 0) && (
              <div className="mt-20 space-y-8 md:space-y-12">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Galeria Completa</h3>
                {project.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="relative group overflow-hidden rounded-sm shadow-sm cursor-zoom-in"
                    onClick={() => {
                      const foundIdx = allImages.indexOf(img);
                      if (foundIdx >= 0) openLightbox(foundIdx);
                    }}
                  >
                    <img
                      src={img}
                      className="w-full h-auto object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
