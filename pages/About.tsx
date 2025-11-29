
import React from 'react';
import { Award, Users, Clock, Leaf } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

export const About: React.FC = () => {
  const { siteContent } = useProjects();
  const { about } = siteContent;

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src={about.heroImage} 
          alt="About Hero" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" 
        />
        <div className="absolute inset-0 bg-black/60" /> {/* Darker overlay for better text contrast */}
        <div className="relative z-10 text-center text-white max-w-4xl px-6">
          <span className="text-accent uppercase tracking-[0.2em] text-sm font-bold mb-4 block animate-slideUp">{about.heroSubtitle}</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 animate-slideUp leading-tight drop-shadow-2xl" style={{ animationDelay: '0.1s' }}>
             {about.heroTitle}
          </h1>
        </div>
      </div>

      {/* Bio Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <div className="relative">
                 <div className="absolute top-4 -left-4 w-full h-full border-2 border-gray-200 z-0"></div>
                 <img src={about.profileImage} alt="Profile" className="w-full h-auto relative z-10 shadow-lg object-cover max-h-[600px]" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl font-serif mb-6">Fran Siller</h2>
              <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-8">Arquiteta Principal & Fundadora</p>
              
              <div className="prose prose-lg text-secondary mb-8">
                <p className="whitespace-pre-wrap leading-relaxed">{about.bio}</p>
              </div>

              {/* Dynamic Stats */}
              <div className="grid grid-cols-3 gap-8 border-t border-gray-100 pt-8">
                {about.stats.map((stat) => (
                  <div key={stat.id}>
                    <span className="block text-4xl font-serif text-accent mb-1">{stat.value}</span>
                    <span className="text-xs uppercase text-gray-400 font-bold">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy / Values */}
      <section className="py-24 bg-[#f9f9f9]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-serif mb-4">Nossos Pilares</h2>
            <p className="text-secondary">A base fundamental sobre a qual construímos cada projeto, do esboço inicial à entrega das chaves.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {about.pillars.map((pillar, idx) => (
              <div key={pillar.id} className="bg-white p-10 rounded-sm shadow-sm hover:-translate-y-2 transition duration-300 h-full">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  {/* Icon logic placeholder - cycling icons for variety if not specified */}
                  {idx % 3 === 0 ? <Leaf className="w-6 h-6 text-black" /> : 
                   idx % 3 === 1 ? <Clock className="w-6 h-6 text-black" /> : 
                   <Users className="w-6 h-6 text-black" />}
                </div>
                <h3 className="text-xl font-serif mb-4">{pillar.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Mock */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
           <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-10">Reconhecimento & Mídia</h3>
           <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
              {about.recognition.map((rec, idx) => (
                <span key={idx} className="text-2xl font-serif font-bold">{rec}</span>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};
