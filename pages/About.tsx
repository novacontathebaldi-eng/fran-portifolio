import React, { useRef, useState, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { Users, Clock, Leaf, ArrowDown } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';

// Height for the parallax hero section
const SECTION_HEIGHT = 1500;

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const About: React.FC = () => {
  const { siteContent, projects, culturalProjects, isLoadingData } = useProjects();
  const { about } = siteContent;
  const isMobile = useIsMobile();

  // Get parallax projects from settings OR use featured as fallback
  // about.parallaxProjects is array of {id, type: 'project' | 'cultural'}
  const parallaxProjectsConfig = (about as any).parallaxProjects || [];

  const parallaxImages = React.useMemo(() => {
    if (parallaxProjectsConfig.length > 0) {
      // Use configured projects
      return parallaxProjectsConfig
        .map((config: { id: string; type: 'project' | 'cultural' }) => {
          const source = config.type === 'cultural' ? culturalProjects : projects;
          const project = source.find(p => p.id === config.id);
          if (!project) return null;
          return { src: project.image, alt: project.title, id: project.id, type: config.type };
        })
        .filter(Boolean);
    }

    // Fallback: use featured projects or first 4
    const featured = projects.filter((p: any) => p.featured).slice(0, 4);
    const fallback = featured.length >= 4 ? featured : projects.slice(0, 4);
    return fallback.map(p => ({ src: p.image, alt: p.title, id: p.id, type: 'project' as const }));
  }, [parallaxProjectsConfig, projects, culturalProjects]);

  // Don't render until data is loaded to avoid flash of default content
  if (isLoadingData) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-center animate-pulse">
          <span className="text-accent uppercase tracking-[0.3em] text-sm">Carregando</span>
        </div>
      </div>
    );
  }

  // Content wrapper - disable Lenis on mobile for performance
  const ContentWrapper = isMobile
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : ({ children }: { children: React.ReactNode }) => (
      <ReactLenis root options={{ lerp: 0.05 }}>{children}</ReactLenis>
    );

  return (
    <ContentWrapper>
      <div className="bg-white">
        {/* Smooth Scroll Hero with Parallax */}
        <SmoothHero
          heroImage={about.heroImage}
          heroTitle={about.heroTitle}
          heroSubtitle={about.heroSubtitle}
          parallaxImages={parallaxImages}
          isMobile={isMobile}
        />

        {/* Bio Section */}
        <section className="py-24 bg-white relative z-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="absolute top-4 -left-4 w-full h-full border-2 border-gray-200 z-0" />
                  <img
                    src={about.profileImage}
                    alt="Profile"
                    className="w-full h-auto relative z-10 shadow-lg object-cover max-h-[600px]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </motion.div>
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-serif mb-6">Fran Siller</h2>
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-8">Arquiteta Principal & Fundadora</p>

                <div className="prose prose-lg text-secondary mb-8">
                  <p className="whitespace-pre-wrap leading-relaxed">{about.bio}</p>
                </div>

                {/* Dynamic Stats */}
                <div className="grid grid-cols-3 gap-8 border-t border-gray-100 pt-8">
                  {about.stats.map((stat, index) => (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="block text-4xl font-serif text-accent mb-1">{stat.value}</span>
                      <span className="text-xs uppercase text-gray-400 font-bold">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Philosophy / Values - Dark Section for contrast */}
        <section className="py-24 bg-[#1a1a1a] text-white">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif mb-4">Nossos Pilares</h2>
              <p className="text-gray-400">A base fundamental sobre a qual construímos cada projeto, do esboço inicial à entrega das chaves.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {about.pillars.map((pillar, idx) => (
                <motion.div
                  key={pillar.id}
                  className="bg-white/5 backdrop-blur-sm p-10 rounded-lg border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-500 h-full group"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent/40 transition-colors">
                    {idx % 3 === 0 ? <Leaf className="w-6 h-6 text-accent" /> :
                      idx % 3 === 1 ? <Clock className="w-6 h-6 text-accent" /> :
                        <Users className="w-6 h-6 text-accent" />}
                  </div>
                  <h3 className="text-xl font-serif mb-4 text-white">{pillar.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recognition */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6 text-center">
            <motion.h3
              className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Reconhecimento & Mídia
            </motion.h3>
            <motion.div
              className="flex flex-wrap justify-center gap-12 opacity-50 grayscale"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {about.recognition.map((rec, idx) => (
                <span key={idx} className="text-2xl font-serif font-bold">{rec}</span>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </ContentWrapper>
  );
};

// ========== SMOOTH SCROLL HERO COMPONENTS ==========

interface SmoothHeroProps {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  parallaxImages: Array<{ src: string; alt: string; id: string; type: 'project' | 'cultural' }>;
  isMobile: boolean;
}

const SmoothHero: React.FC<SmoothHeroProps> = ({ heroImage, heroTitle, heroSubtitle, parallaxImages, isMobile }) => {
  // Shorter section on mobile for better performance
  const sectionHeight = isMobile ? 600 : SECTION_HEIGHT;

  return (
    <div
      style={{ height: `calc(${sectionHeight}px + 100vh)` }}
      className="relative w-full z-0"
    >
      <CenterImage heroImage={heroImage} heroTitle={heroTitle} heroSubtitle={heroSubtitle} isMobile={isMobile} />

      {/* Scroll indicator - OUTSIDE of CenterImage for proper z-index */}
      <ScrollIndicator />

      {/* Parallax images - with lower z-index */}
      <ParallaxImages images={parallaxImages} isMobile={isMobile} />

      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent to-white pointer-events-none z-[5]" />
    </div>
  );
};

interface CenterImageProps {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  isMobile: boolean;
}

const CenterImage: React.FC<CenterImageProps> = ({ heroImage, heroTitle, heroSubtitle, isMobile }) => {
  const { scrollY } = useScroll();

  // Simplified transformations for mobile
  const scrollRange = isMobile ? 600 : 1500;

  const clip1 = useTransform(scrollY, [0, scrollRange], [25, 0]);
  const clip2 = useTransform(scrollY, [0, scrollRange], [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, scrollRange + 500],
    [isMobile ? "130%" : "170%", "100%"]
  );
  const opacity = useTransform(
    scrollY,
    [scrollRange, scrollRange + 500],
    [1, 0]
  );

  const textOpacity = useTransform(scrollY, [0, isMobile ? 150 : 400], [1, 0]);
  const textY = useTransform(scrollY, [0, isMobile ? 150 : 400], [0, -30]);

  return (
    <motion.div
      className="sticky top-0 h-screen w-full overflow-hidden z-[1]"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage: `url(${heroImage})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Hero Text - Very small on mobile to fit inside the clip-path */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-2 sm:px-6"
        style={{ opacity: textOpacity, y: textY }}
      >
        <motion.span
          className="text-accent uppercase tracking-[0.1em] sm:tracking-[0.25em] text-[8px] sm:text-xs md:text-sm font-bold mb-1 sm:mb-4 block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {heroSubtitle}
        </motion.span>
        <motion.h1
          className="text-sm sm:text-lg md:text-2xl lg:text-4xl font-serif leading-snug max-w-[50vw] sm:max-w-xl md:max-w-2xl drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {heroTitle}
        </motion.h1>
      </motion.div>
    </motion.div>
  );
};

// Scroll Indicator - Separate component with fixed position
const ScrollIndicator: React.FC = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ opacity }}
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2 text-white/80"
      >
        <span className="text-xs uppercase tracking-widest bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">Role para descobrir</span>
        <ArrowDown className="w-5 h-5" />
      </motion.div>
    </motion.div>
  );
};

interface ParallaxImagesProps {
  images: Array<{ src: string; alt: string; id: string; type: 'project' | 'cultural' }>;
  isMobile: boolean;
}

const ParallaxImages: React.FC<ParallaxImagesProps> = ({ images, isMobile }) => {
  if (images.length === 0) return null;

  // Reduced parallax movement on mobile for performance
  const mobilePositions = [
    { start: -50, end: 50, className: 'w-1/2 mx-auto' },
    { start: 30, end: -40, className: 'w-2/3 mx-auto' },
    { start: -30, end: 30, className: 'w-1/2 mx-auto' },
    { start: 0, end: -60, className: 'w-2/3 mx-auto' },
  ];

  // Dynamic positioning based on number of images
  const desktopPositions = [
    { start: -200, end: 200, className: 'w-1/3' },
    { start: 200, end: -250, className: 'mx-auto w-2/3' },
    { start: -200, end: 200, className: 'ml-auto w-1/3' },
    { start: 0, end: -500, className: 'ml-24 w-5/12' },
    { start: -150, end: 150, className: 'w-2/5' },
    { start: 100, end: -200, className: 'ml-auto w-1/3' },
    { start: -100, end: 300, className: 'mx-auto w-1/2' },
    { start: 50, end: -150, className: 'ml-16 w-2/5' },
  ];

  const positions = isMobile ? mobilePositions : desktopPositions;
  // Limit to 2 images on mobile for performance
  const displayImages = isMobile ? images.slice(0, 2) : images;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-[200px] relative z-[2]">
      {displayImages.map((img, index) => {
        const pos = positions[index % positions.length];
        return (
          <ParallaxImg
            key={img.id}
            src={img.src}
            alt={img.alt}
            projectId={img.id}
            projectType={img.type}
            start={pos.start}
            end={pos.end}
            className={pos.className}
            isMobile={isMobile}
          />
        );
      })}
    </div>
  );
};

interface ParallaxImgProps {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
  projectId: string;
  projectType: 'project' | 'cultural';
  isMobile: boolean;
}

const ParallaxImg: React.FC<ParallaxImgProps> = ({ className, alt, src, start, end, projectId, projectType, isMobile }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  const linkPath = projectType === 'cultural' ? `/cultural/${projectId}` : `/project/${projectId}`;

  return (
    <Link to={linkPath} ref={ref} className="block relative z-[2]">
      <motion.img
        src={src}
        alt={alt}
        className={`${className} rounded-lg shadow-2xl cursor-pointer hover:ring-4 hover:ring-accent/50 transition-all duration-300`}
        style={{ transform, opacity }}
        loading="lazy"
        decoding="async"
      />
    </Link>
  );
};

export default About;
