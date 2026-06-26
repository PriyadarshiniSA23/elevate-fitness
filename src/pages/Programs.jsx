import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { useAppData } from '../hooks/useAppData';

export default function Programs() {
  const [filter, setFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const { selectProgram, setCurrentStep } = useBooking();
  const { programs: mockPrograms } = useAppData();

  const handleBookNow = (program) => {
    selectProgram(program);
    setCurrentStep(2); // Jump straight to Trainer selection step
    navigate('/book');
  };

  const filteredPrograms = filter === 'all' 
    ? mockPrograms 
    : mockPrograms.filter(p => p.category.includes(filter));

  return (
    <div className="bg-background text-on-surface pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block">Our Disciplines</span>
          <h1 className="font-serif text-4xl md:text-[54px] font-bold text-primary tracking-tight">Curated Training Programs</h1>
          <div className="h-1 w-24 bg-tertiary mx-auto mt-2"></div>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-sans text-body-lg pt-2">
            Explore our elite training portfolios designed for body transformation, absolute strength, and biological longevity.
          </p>
        </header>

        {/* Program Categories */}
        <section className="py-8 mb-16 border-b border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-8 rounded-sm flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background text-2xl transition-colors duration-300">model_training</span>
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 text-white">Body Transformation</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">Aesthetic evolution through science-backed protocols.</p>
            </div>
            <div className="glass-card p-8 rounded-sm flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background text-2xl transition-colors duration-300">fitness_center</span>
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 text-white">Strength &amp; Performance</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">Unlocking elite power and athletic potential.</p>
            </div>
            <div className="glass-card p-8 rounded-sm flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background text-2xl transition-colors duration-300">spa</span>
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 text-white">Wellness &amp; Recovery</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">Longevity-focused practices for peak vitality.</p>
            </div>
            <div className="glass-card p-8 rounded-sm flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background text-2xl transition-colors duration-300">groups</span>
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 text-white">Group Training</h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">High-energy sessions within a premium community.</p>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {['all', 'strength', 'weight-loss', 'wellness'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-sm font-label-caps text-xs tracking-widest uppercase border transition-all duration-300 ${
                filter === cat
                  ? 'bg-tertiary border-tertiary text-on-tertiary font-bold shadow-lg shadow-tertiary/10'
                  : 'border-white/10 text-on-surface-variant hover:border-primary hover:text-primary bg-white/5'
              }`}
            >
              {cat === 'weight-loss' ? 'Weight Loss' : cat}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {filteredPrograms.map((program) => (
            <div 
              key={program.id} 
              className="relative overflow-hidden group rounded-xl border border-white/5 h-[400px] cursor-pointer"
            >
              {/* Background Image */}
              <img 
                alt={program.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                src={program.image}
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent group-hover:via-black/55 transition-all duration-300 z-0"></div>

              {/* Unavailable Badge */}
              {program.availability === 'Unavailable' && (
                <div className="absolute top-4 left-4 z-20 bg-error/80 text-white font-bold tracking-widest text-[10px] uppercase px-3 py-1 rounded backdrop-blur-md">
                  Unavailable
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-sm border border-white/10">
                <span className="font-label-caps text-[10px] text-tertiary font-bold tracking-widest uppercase">
                  {program.category === 'weight-loss' ? 'Weight Loss' : program.category}
                </span>
              </div>

              {/* Slide-up Drawer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-lg border-t border-white/10 transform translate-y-[calc(100%-76px)] group-hover:translate-y-0 transition-transform duration-500 ease-out z-10 flex flex-col justify-between h-[280px]">
                {/* Title (Always visible) */}
                <div className="h-[52px] flex items-start justify-between">
                  <h3 className="font-serif text-[22px] text-white font-bold leading-tight group-hover:text-tertiary transition-colors duration-300">
                    {program.title}
                  </h3>
                </div>

                {/* Expanded Details */}
                <div className="flex-grow flex flex-col justify-between mt-2 space-y-4">
                  <p className="font-sans text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                    {program.description}
                  </p>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-on-surface-variant uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
                        {program.duration}
                      </span>
                    </div>
                    <span className="text-tertiary font-bold text-xl font-mono">
                      ₹{program.price}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant/60 italic">Private custom session</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookNow(program);
                      }}
                      className="px-5 py-2 bg-tertiary text-background font-label-caps text-[11px] font-bold tracking-widest uppercase hover:bg-white hover:text-background transition-all duration-300 rounded-sm"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Your Path To Excellence (Timeline) */}
        <section className="py-20 mt-20 border-t border-white/5">
          <div className="text-center mb-16">
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block mb-2">The Blueprint</span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">Your Path To Excellence</h2>
            <div className="h-1 w-20 bg-tertiary mx-auto mt-3"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4">
            {/* Timeline connector line on desktop */}
            <div className="absolute top-6 left-0 w-full h-[1px] bg-white/10 hidden md:block z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex-1 flex flex-col md:block items-center text-center md:text-left group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="text-white group-hover:text-background font-bold font-mono transition-colors duration-300">01</span>
              </div>
              <h4 className="font-label-caps text-primary mb-3 uppercase tracking-wider text-sm font-semibold">Choose</h4>
              <p className="text-sm text-on-surface-variant max-w-[220px]">Select the program tier that aligns with your ultimate vision.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10 flex-1 flex flex-col md:block items-center text-center md:text-left group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="text-white group-hover:text-background font-bold font-mono transition-colors duration-300">02</span>
              </div>
              <h4 className="font-label-caps text-primary mb-3 uppercase tracking-wider text-sm font-semibold">Meet</h4>
              <p className="text-sm text-on-surface-variant max-w-[220px]">Comprehensive consultation &amp; biometric assessment with our masters.</p>
            </div>
            
            {/* Step 3 */}
            <div className="relative z-10 flex-1 flex flex-col md:block items-center text-center md:text-left group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="text-white group-hover:text-background font-bold font-mono transition-colors duration-300">03</span>
              </div>
              <h4 className="font-label-caps text-primary mb-3 uppercase tracking-wider text-sm font-semibold">Plan</h4>
              <p className="text-sm text-on-surface-variant max-w-[220px]">Receive your bespoke training and physiological roadmap.</p>
            </div>
            
            {/* Step 4 */}
            <div className="relative z-10 flex-1 flex flex-col md:block items-center text-center md:text-left group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="text-white group-hover:text-background font-bold font-mono transition-colors duration-300">04</span>
              </div>
              <h4 className="font-label-caps text-primary mb-3 uppercase tracking-wider text-sm font-semibold">Track</h4>
              <p className="text-sm text-on-surface-variant max-w-[220px]">Real-time performance tracking and monthly reviews.</p>
            </div>
            
            {/* Step 5 */}
            <div className="relative z-10 flex-1 flex flex-col md:block items-center text-center md:text-left group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                <span className="text-white group-hover:text-background font-bold font-mono transition-colors duration-300">05</span>
              </div>
              <h4 className="font-label-caps text-primary mb-3 uppercase tracking-wider text-sm font-semibold">Achieve</h4>
              <p className="text-sm text-on-surface-variant max-w-[220px]">Surpass your limits and manifest your peak physical form.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 mt-10 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-center mb-16 text-primary">Frequently Asked Questions</h2>
            <div className="space-y-4">
              
              {/* FAQ 1 */}
              <div className="glass-card border border-white/5 rounded-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                  className="flex items-center justify-between w-full p-6 text-left cursor-pointer hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span className="font-label-caps uppercase tracking-wider text-xs md:text-sm text-primary">How are programs customized?</span>
                  <span className={`material-symbols-outlined text-tertiary transition-transform duration-300 ${openFaq === 0 ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === 0 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-on-surface-variant text-sm font-sans leading-relaxed">
                    We begin with a comprehensive 360-degree assessment including blood work, gait analysis, and VO2 max testing to build your foundation.
                  </div>
                </div>
              </div>
              
              {/* FAQ 2 */}
              <div className="glass-card border border-white/5 rounded-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  className="flex items-center justify-between w-full p-6 text-left cursor-pointer hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span className="font-label-caps uppercase tracking-wider text-xs md:text-sm text-primary">Can I switch programs mid-way?</span>
                  <span className={`material-symbols-outlined text-tertiary transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === 1 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-on-surface-variant text-sm font-sans leading-relaxed">
                    Yes, your journey is dynamic. Based on monthly reviews, our coaches can pivot your strategy to match your changing goals.
                  </div>
                </div>
              </div>
              
              {/* FAQ 3 */}
              <div className="glass-card border border-white/5 rounded-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  className="flex items-center justify-between w-full p-6 text-left cursor-pointer hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span className="font-label-caps uppercase tracking-wider text-xs md:text-sm text-primary">Do you offer nutrition-only plans?</span>
                  <span className={`material-symbols-outlined text-tertiary transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === 2 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-on-surface-variant text-sm font-sans leading-relaxed">
                    Nutrition is integrated into all our premium programs, but bespoke standalone dietary consulting is available via our Platinum tier.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
