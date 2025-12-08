import React, { useRef, useState, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { Users, Clock, Leaf, ArrowDown } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';

// Height for the parallax hero section
const SECTION_HEIGHT = 1500;
const MOBILE_SECTION_HEIGHT = 900;

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

  // Get parallax projects from settings OR use first 4 projects
  const parallaxProjectsConfig = (about as any).parallaxProjects || [];

  const parallaxImages = React.useMemo(() => {
    if (parallaxProjectsConfig.length > 0) {
      return parallaxProjectsConfig
        .slice(0, 4)
        .map((config: { id: string; type: 'project' | 'cultural' }) => {
          const source = config.type === 'cultural' ? culturalProjects : projects;
          const project = source.find(p => p.id === config.id);
          if (!project) return null;
          return { src: project.image, alt: project.title, id: project.id, type: config.type };
        })
        .filter(Boolean);
    }
    return projects.slice(0, 4).map(p => ({ src: p.image, alt: p.title, id: p.id, type: 'project' as const }));
  }, [parallaxProjectsConfig, projects, culturalProjects]);

  if (isLoadingData) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-center animate-pulse">
          <span className="text-accent uppercase tracking-[0.3em] text-sm">Carregando</span>
        </div>
      </div>
    );
  }

  // Desktop: Use Lenis for smooth scroll
  // Mobile: Use native scroll (Lenis has issues on touch devices)
  const PageContent = (
    <div className="bg-zinc-950">
      <Hero
        heroImage={about.heroImage}
        heroTitle={about.heroTitle}
        heroSubtitle={about.heroSubtitle}
        parallaxImages={parallaxImages}
        isMobile={isMobile}
      />

      {/* Bio Section */}
      <section className="py-16 md:py-24 bg-white relative z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute top-4 -left-4 w-full h-full border-2 border-gray-200 z-0 hidden md:block" />
                <img
                  src={about.profileImage}
                  alt="Profile"
                  className="w-full h-auto relative z-10 shadow-lg object-cover max-h-[400px] md:max-h-[600px] rounded-lg md:rounded-none"
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
              <h2 className="text-2xl md:text-4xl font-serif mb-4 md:mb-6">Fran Siller</h2>
              <p className="text-gray-500 uppercase tracking-widest text-[10px] md:text-xs font-bold mb-6 md:mb-8">Arquiteta Principal & Fundadora</p>

              <div className="prose text-secondary mb-6 md:mb-8">
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{about.bio}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 md:gap-8 border-t border-gray-100 pt-6 md:pt-8">
                {about.stats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <span className="block text-xl md:text-4xl font-serif text-accent mb-1">{stat.value}</span>
                    <span className="text-[8px] md:text-xs uppercase text-gray-400 font-bold leading-tight">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy / Values */}
      <section className="py-16 md:py-24 bg-[#1a1a1a] text-white relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-10 md:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-serif mb-3 md:mb-4">Nossos Pilares</h2>
            <p className="text-gray-400 text-sm md:text-base">A base fundamental sobre a qual construímos cada projeto.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12">
            {about.pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.id}
                className="bg-white/5 backdrop-blur-sm p-6 md:p-10 rounded-lg border border-white/10"
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ ease: "easeInOut", duration: 0.75, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    {idx % 3 === 0 ? <Leaf className="w-5 h-5 md:w-6 md:h-6 text-accent" /> :
                      idx % 3 === 1 ? <Clock className="w-5 h-5 md:w-6 md:h-6 text-accent" /> :
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
                  </div>
                  <h3 className="text-base md:text-xl font-serif text-white">{pillar.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-12 md:py-20 bg-white border-t border-gray-100 relative z-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h3
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 md:mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Reconhecimento & Mídia
          </motion.h3>
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-12 opacity-50 grayscale"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {about.recognition.map((rec, idx) => (
              <span key={idx} className="text-base md:text-2xl font-serif font-bold">{rec}</span>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );

  // Desktop: wrap with Lenis, Mobile: use native scroll
  if (isMobile) {
    return PageContent;
  }

  return (
    <ReactLenis root options={{ lerp: 0.05 }}>
      {PageContent}
    </ReactLenis>
  );
};

// ========== HERO COMPONENT ==========
interface HeroProps {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  parallaxImages: Array<{ src: string; alt: string; id: string; type: 'project' | 'cultural' }>;
  isMobile: boolean;
}

const Hero: React.FC<HeroProps> = ({ heroImage, heroTitle, heroSubtitle, parallaxImages, isMobile }) => {
  const sectionHeight = isMobile ? MOBILE_SECTION_HEIGHT : SECTION_HEIGHT;

  return (
    <div
      style={{ height: `calc(${sectionHeight}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage heroImage={heroImage} heroTitle={heroTitle} heroSubtitle={heroSubtitle} isMobile={isMobile} />
      <ParallaxImages images={parallaxImages} isMobile={isMobile} />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </div>
  );
};

// ========== CENTER IMAGE ==========
interface CenterImageProps {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  isMobile: boolean;
}

const CenterImage: React.FC<CenterImageProps> = ({ heroImage, heroTitle, heroSubtitle, isMobile }) => {
  const { scrollY } = useScroll();
  const sectionHeight = isMobile ? MOBILE_SECTION_HEIGHT : SECTION_HEIGHT;

  // Mobile: Start with more vertical rectangle (35-65) to fit text
  // Desktop: Original (25-75)
  const clip1 = useTransform(scrollY, [0, sectionHeight], isMobile ? [35, 0] : [25, 0]);
  const clip2 = useTransform(scrollY, [0, sectionHeight], isMobile ? [65, 100] : [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, sectionHeight + 500],
    [isMobile ? "250%" : "170%", "100%"]
  );

  const opacity = useTransform(
    scrollY,
    [sectionHeight, sectionHeight + 500],
    [1, 0]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage: `url(${heroImage})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Text - Smaller on mobile to fit inside clip-path */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-8">
        <motion.span
          className="text-accent uppercase tracking-[0.1em] md:tracking-[0.25em] text-[9px] md:text-xs font-bold mb-2 md:mb-4 block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {heroSubtitle}
        </motion.span>
        <motion.h1
          className="text-[15px] leading-tight md:text-4xl lg:text-6xl font-serif md:leading-snug max-w-[200px] md:max-w-2xl drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {heroTitle}
        </motion.h1>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-white/80"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-1 md:gap-2">
          <span className="text-[8px] md:text-xs uppercase tracking-widest">Role para descobrir</span>
          <ArrowDown className="w-3 h-3 md:w-5 md:h-5" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========== PARALLAX IMAGES ==========
interface ParallaxImagesProps {
  images: Array<{ src: string; alt: string; id: string; type: 'project' | 'cultural' }>;
  isMobile: boolean;
}

const ParallaxImages: React.FC<ParallaxImagesProps> = ({ images, isMobile }) => {
  // Desktop: Original positions with full movement
  const desktopPositions = [
    { start: -200, end: 200, className: 'w-1/3' },
    { start: 200, end: -250, className: 'mx-auto w-2/3' },
    { start: -200, end: 200, className: 'ml-auto w-1/3' },
    { start: 0, end: -500, className: 'ml-24 w-5/12' },
  ];

  // Mobile: Much smaller movement, centered images
  const mobilePositions = [
    { start: -15, end: 15, className: 'w-3/4 mx-auto' },
    { start: 10, end: -10, className: 'w-4/5 mx-auto' },
    { start: -10, end: 10, className: 'w-3/4 mx-auto' },
    { start: 8, end: -15, className: 'w-4/5 mx-auto' },
  ];

  const positions = isMobile ? mobilePositions : desktopPositions;

  return (
    <div className={`mx-auto px-4 pt-[200px] ${isMobile ? 'max-w-xs' : 'max-w-5xl'}`}>
      {images.slice(0, 4).map((img, index) => {
        const pos = positions[index];
        if (!pos) return null;
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

// ========== SINGLE PARALLAX IMAGE ==========
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

  // Desktop: Full effect with opacity and scale
  // Mobile: Only gentle translateY, no opacity/scale
  const opacity = useTransform(scrollYProgress, [0.75, 1], isMobile ? [1, 1] : [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], isMobile ? [1, 1] : [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  const linkPath = projectType === 'cultural' ? `/cultural/${projectId}` : `/project/${projectId}`;

  return (
    <Link to={linkPath} ref={ref} className="block mb-4 md:mb-0">
      <motion.img
        src={src}
        alt={alt}
        className={`${className} rounded-lg shadow-xl md:shadow-2xl`}
        style={{ transform, opacity }}
        loading="lazy"
        decoding="async"
      />
    </Link>
  );
};

export default About;
