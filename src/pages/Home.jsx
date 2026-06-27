import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { mockPrograms, mockTrainers, mockTransformations, mockTestimonials } from '../services/api';

// Premium Mouse-Track Parallax Spotlight Bento Card Component
function BentoCard({ className, bgImage, title, description }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
  };

  // Subtle opposite-direction parallax translation
  const translateX = isHovered ? (50 - coords.x) * 0.15 : 0;
  const translateY = isHovered ? (50 - coords.y) * 0.15 : 0;

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 50, y: 50 });
      }}
      className={`relative overflow-hidden rounded-sm border border-white/5 group cursor-pointer transition-all duration-300 ${className}`}
    >
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out" 
        style={{ 
          backgroundImage: `url('${bgImage}')`,
          transform: `scale(1.08) translate(${translateX}px, ${translateY}px)`
        }}
      ></div>
      
      {/* Gradient Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-10"></div>
      
      {/* Gold Radial Spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-15"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 220px at ${coords.x}% ${coords.y}%, rgba(212, 175, 55, 0.12) 0%, transparent 80%)`
        }}
      ></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 space-y-2 z-20 w-full">
        <h3 className="font-serif text-[20px] md:text-[24px] text-white font-semibold group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        {description && (
          <p className="font-sans text-white/70 text-sm md:text-body-md max-w-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [isSwapped, setIsSwapped] = useState(false);
  const [activeStat, setActiveStat] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroCtasRef = useRef(null);
  const heroImagesRef = useRef(null);
  const heroStatRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const testimonialTextRef = useRef(null);
  const testimonialAuthorRef = useRef(null);

  // Auto-swipe timer for testimonials (3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mockTestimonials.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // GSAP animation for slide changes
  useEffect(() => {
    if (testimonialTextRef.current && testimonialAuthorRef.current) {
      gsap.fromTo(testimonialTextRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo(testimonialAuthorRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out', delay: 0.08 }
      );
    }
  }, [currentSlide]);

  useEffect(() => {
    // GSAP animations for Hero Section
    const tl = gsap.timeline();
    
    tl.fromTo(heroSubtitleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
    
    tl.fromTo(heroTitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.4"
    );

    tl.fromTo(heroCtasRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      "-=0.4"
    );

    tl.fromTo(heroImagesRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
      "-=0.6"
    );

    tl.fromTo(heroStatRef.current,
      { opacity: 0, x: -30, rotation: -5 },
      { opacity: 1, x: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.75)' },
      "-=0.5"
    );

    // Staggered card entrance for "Why Choose" cards
    if (cardsContainerRef.current) {
      gsap.fromTo(cardsContainerRef.current.children,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, []);

  return (
    <div className="bg-background text-on-surface">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Luxury fitness studio" 
            className="w-full h-full object-cover brightness-[0.25]" 
            src="/images/img_f2aee0a6.png"
          />
        </div>
        <div className="absolute inset-0 gold-glow z-10"></div>
        
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center w-full relative z-20">
          <div className="lg:col-span-7 space-y-8 py-8">
            <div className="space-y-4">
              <span 
                ref={heroSubtitleRef}
                className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block"
              >
                The Pinnacle of Personal Training
              </span>
              <h1 
                ref={heroTitleRef}
                className="font-display-lg text-4xl md:text-5xl lg:text-[72px] leading-tight text-primary font-bold"
              >
                Elevate Your Body. <br />
                <span className="italic text-primary/70">Transform Your Life.</span>
              </h1>
              <p className="font-sans text-body-lg text-on-surface-variant max-w-xl">
                Experience a refined approach to wellness in our private members' collective. Bespoke programming, elite trainers, and a pursuit of longevity that transcends traditional fitness.
              </p>
            </div>
            
            <div ref={heroCtasRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/book" 
                className="px-8 py-4 bg-primary text-on-primary font-sans text-body-lg rounded-sm hover:bg-tertiary hover:text-on-tertiary transition-all duration-300 shadow-lg text-center font-medium"
              >
                Book Private Session
              </Link>
              <Link 
                to="/memberships" 
                className="px-8 py-4 border border-primary/30 text-primary font-sans text-body-lg rounded-sm hover:bg-primary/10 transition-all duration-300 text-center font-medium"
              >
                Explore Membership
              </Link>
            </div>
          </div>

          <div 
            ref={heroImagesRef} 
            onClick={() => setIsSwapped(!isSwapped)}
            className="lg:col-span-5 relative h-[500px] hidden lg:block cursor-pointer group select-none"
            title="Click to swap images"
          >
            {/* Elegant Swap Badge */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10 flex items-center gap-1.5 text-tertiary z-20 font-label-caps text-[10px] tracking-wider uppercase shadow-lg transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-xs">swap_horiz</span>
              Swap View
            </div>

            {/* Squat Athlete Card (Initially Front) */}
            <div className={`absolute inset-0 rounded-sm overflow-hidden transition-all duration-500 ease-out ${
              !isSwapped 
                ? 'border-2 border-primary/20 z-10 shadow-2xl transform group-hover:scale-[1.02] group-hover:-translate-x-6' 
                : 'glass-card p-2 z-0 opacity-70 transform rotate-3 translate-x-12 translate-y-8 group-hover:translate-x-20 group-hover:translate-y-12 group-hover:rotate-6'
            }`}>
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url('/images/img_99ed4012.png')` }}
              ></div>
            </div>

            {/* Luxury Gym Interior Card (Initially Back) */}
            <div className={`absolute inset-0 rounded-sm overflow-hidden transition-all duration-500 ease-out ${
              isSwapped 
                ? 'border-2 border-primary/20 z-10 shadow-2xl transform group-hover:scale-[1.02] group-hover:-translate-x-6' 
                : 'glass-card p-2 z-0 opacity-70 transform rotate-3 translate-x-12 translate-y-8 group-hover:translate-x-20 group-hover:translate-y-12 group-hover:rotate-6'
            }`}>
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url('/images/img_9f739797.png')` }}
              ></div>
            </div>
            
            {/* Floating Stat Card */}
            <div ref={heroStatRef} className="absolute -bottom-6 -left-6 glass-card p-6 rounded-xl z-20 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
                <div>
                  <div className="font-serif text-[24px] text-primary font-bold">54 <span className="text-body-md font-sans text-on-surface-variant italic font-normal">bpm</span></div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Resting Heart Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-stack-lg bg-surface-container-low border-y border-white/5">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-serif text-[32px] md:text-headline-md font-semibold text-primary">Why Choose Elevate Fitness</h2>
            <div className="h-1 w-20 bg-tertiary mx-auto"></div>
          </div>
          
          <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="glass-card p-8 rounded-sm hover:scale-105 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:border-tertiary/40 transition-all duration-500 ease-out">
              <span className="material-symbols-outlined text-4xl text-tertiary mb-6 block">workspace_premium</span>
              <h3 className="font-serif text-headline-sm font-bold mb-4">Certified Trainers</h3>
              <p className="font-sans text-on-surface-variant text-body-md leading-relaxed">Our elite staff holds advanced certifications in physiology, nutrition, and strength conditioning.</p>
            </div>
            <div className="glass-card p-8 rounded-sm hover:scale-105 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:border-tertiary/40 transition-all duration-500 ease-out">
              <span className="material-symbols-outlined text-4xl text-tertiary mb-6 block">tactic</span>
              <h3 className="font-serif text-headline-sm font-bold mb-4">Personalized Programs</h3>
              <p className="font-sans text-on-surface-variant text-body-md leading-relaxed">No templates. Every movement and meal plan is engineered specifically for your biological profile.</p>
            </div>
            <div className="glass-card p-8 rounded-sm hover:scale-105 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:border-tertiary/40 transition-all duration-500 ease-out">
              <span className="material-symbols-outlined text-4xl text-tertiary mb-6 block">event_repeat</span>
              <h3 className="font-serif text-headline-sm font-bold mb-4">Flexible Scheduling</h3>
              <p className="font-sans text-on-surface-variant text-body-md leading-relaxed">24/7 access and seamless mobile booking to fit the dynamic lifestyle of a modern professional.</p>
            </div>
            <div className="glass-card p-8 rounded-sm hover:scale-105 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:border-tertiary/40 transition-all duration-500 ease-out">
              <span className="material-symbols-outlined text-4xl text-tertiary mb-6 block">trending_up</span>
              <h3 className="font-serif text-headline-sm font-bold mb-4">Proven Results</h3>
              <p className="font-sans text-on-surface-variant text-body-md leading-relaxed">Data-driven tracking ensures every ounce of effort translates into measurable physical evolution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-stack-lg bg-surface relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter text-center">
            <div 
              onClick={() => setActiveStat(activeStat === 0 ? null : 0)}
              className={`glass-card px-6 py-8 border rounded-sm cursor-pointer select-none transition-all duration-300 ${
                activeStat === 0 
                  ? 'border-tertiary shadow-[0_0_20px_rgba(212,175,55,0.25)]' 
                  : 'border-white/5 hover:border-tertiary/60'
              }`}
            >
              <div className="font-serif text-[40px] md:text-display-lg text-primary font-bold">500+</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Active Members</div>
            </div>
            
            <div 
              onClick={() => setActiveStat(activeStat === 1 ? null : 1)}
              className={`glass-card px-6 py-8 border rounded-sm cursor-pointer select-none transition-all duration-300 ${
                activeStat === 1 
                  ? 'border-tertiary shadow-[0_0_20px_rgba(212,175,55,0.25)]' 
                  : 'border-white/5 hover:border-tertiary/60'
              }`}
            >
              <div className="font-serif text-[40px] md:text-display-lg text-primary font-bold">25+</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Expert Trainers</div>
            </div>
            
            <div 
              onClick={() => setActiveStat(activeStat === 2 ? null : 2)}
              className={`glass-card px-6 py-8 border rounded-sm cursor-pointer select-none transition-all duration-300 ${
                activeStat === 2 
                  ? 'border-tertiary shadow-[0_0_20px_rgba(212,175,55,0.25)]' 
                  : 'border-white/5 hover:border-tertiary/60'
              }`}
            >
              <div className="font-serif text-[40px] md:text-display-lg text-primary font-bold">10k+</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Sessions Yearly</div>
            </div>
            
            <div 
              onClick={() => setActiveStat(activeStat === 3 ? null : 3)}
              className={`glass-card px-6 py-8 border rounded-sm cursor-pointer select-none transition-all duration-300 ${
                activeStat === 3 
                  ? 'border-tertiary shadow-[0_0_20px_rgba(212,175,55,0.25)]' 
                  : 'border-white/5 hover:border-tertiary/60'
              }`}
            >
              <div className="font-serif text-[40px] md:text-display-lg text-primary font-bold">98%</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines Bento Grid */}
      <section className="py-stack-lg px-6 md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
          <div className="space-y-2">
            <span className="font-label-caps text-label-caps text-tertiary uppercase block">Curated Curriculums</span>
            <h2 className="font-serif text-[32px] md:text-headline-md font-semibold text-primary">Our Disciplines</h2>
          </div>
          <Link to="/programs" className="text-primary hover:text-tertiary flex items-center gap-2 group font-sans text-body-md">
            View All Programs 
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Strength (Large Card) */}
          <BentoCard 
            className="md:col-span-2"
            bgImage={mockPrograms[1].image}
            title="Strength &amp; Conditioning"
            description="Build absolute power and athletic resilience through scientific periodization."
          />
          
          {/* Yoga */}
          <BentoCard 
            bgImage={mockPrograms[6].image}
            title="Yoga &amp; Mobility"
            description="Restore alignment, expand joint range of motion, and optimize recovery flow."
          />
          
          {/* HIIT */}
          <BentoCard 
            bgImage={mockPrograms[3].image}
            title="HIIT Mastery"
            description="Accelerate metabolism and build anaerobic thresholds with elite interval sessions."
          />
          
          {/* Personal training (Wide Card) */}
          <BentoCard 
            className="md:col-span-2"
            bgImage={mockPrograms[0].image}
            title="Personal Elite Training"
            description="The ultimate 1-on-1 experience with our head performance directors."
          />
        </div>
      </section>

      {/* Expert Performance Coaches */}
      <section className="py-stack-lg bg-surface-container-low border-y border-white/5">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <span className="font-label-caps text-label-caps text-tertiary uppercase block">The Elite</span>
            <h2 className="font-serif text-[32px] md:text-headline-md font-semibold text-primary">Expert Performance Coaches</h2>
            <div className="h-1 w-20 bg-tertiary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {mockTrainers.slice(0, 3).map((trainer) => (
              <div key={trainer.id} className="glass-card overflow-hidden group border border-white/5">
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    alt={trainer.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={trainer.image}
                  />
                </div>
                <div className="p-8 space-y-2">
                  <h3 className="font-serif text-headline-sm text-primary font-semibold">{trainer.name}</h3>
                  <p className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">{trainer.title}</p>
                  <p className="text-on-surface-variant text-sm pt-2 line-clamp-2">{trainer.bio}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/trainers" 
              className="px-8 py-3 border border-primary/20 hover:border-primary text-primary font-medium tracking-widest text-[12px] uppercase rounded-sm inline-block hover:bg-white/5 transition-all duration-300"
            >
              Meet Our Complete Coaching Staff
            </Link>
          </div>
        </div>
      </section>

      {/* Transformations Section */}
      <section className="py-stack-lg bg-surface">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <span className="font-label-caps text-label-caps text-tertiary uppercase block">Evolutions</span>
            <h2 className="font-serif text-[32px] md:text-headline-md font-semibold text-primary">Real Transformations</h2>
            <p className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Witness the remarkable physical and mental journeys of our dedicated members. Blueprints of scientific discipline.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {mockTransformations.map((item, idx) => (
              <div 
                key={item.id} 
                className={`space-y-6 glass-card p-6 rounded-xl transition-all duration-500 hover:-translate-y-2 ${
                  idx === 1 ? 'md:translate-y-8' : ''
                }`}
              >
                <div className="aspect-[1.5/1] overflow-hidden rounded-sm border border-white/10 shadow-lg relative">
                  <img 
                    alt={`${item.name} transformation`} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    src={item.image}
                  />
                  {item.id !== "maria-t" && (
                    <>
                      <span className="absolute bottom-4 left-1/4 -translate-x-1/2 text-white font-sans font-bold text-lg md:text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 pointer-events-none">BEFORE</span>
                      <span className="absolute bottom-4 left-3/4 -translate-x-1/2 text-white font-sans font-bold text-lg md:text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 pointer-events-none">AFTER</span>
                    </>
                  )}
                </div>
                <div className="px-2">
                  <h4 className="font-bold text-lg mb-1 text-primary">{item.name}, <span className="text-sm font-normal text-on-surface-variant">{item.role}</span></h4>
                  <p className="text-on-surface-variant font-sans text-sm italic leading-relaxed">"{item.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Testimonials */}
      <section className="py-stack-lg bg-surface-container-lowest border-t border-white/5">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="text-center mb-12 space-y-4">
            <span className="font-label-caps text-label-caps text-tertiary uppercase block">Voices of the Collective</span>
            <h2 className="font-serif text-[32px] md:text-headline-md font-semibold text-primary">Member Testimonials</h2>
          </div>
          
          <div className="max-w-3xl mx-auto relative px-4">
            {/* Carousel Card */}
            <div className="glass-card p-10 md:p-14 rounded-sm border border-white/5 space-y-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
              {/* Luxury Quote Icon */}
              <span className="material-symbols-outlined text-[60px] text-tertiary/10 absolute top-4 left-4 select-none">
                format_quote
              </span>
              
              <div className="space-y-6 relative z-10">
                <div className="flex gap-1 text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <div ref={testimonialTextRef}>
                  <p className="font-sans text-xl md:text-2xl text-on-surface-variant italic leading-relaxed font-light">
                    "{mockTestimonials[currentSlide].content}"
                  </p>
                </div>
              </div>
              
              <div ref={testimonialAuthorRef} className="pt-6 border-t border-white/5 mt-6 flex justify-between items-end relative z-10">
                <div>
                  <p className="font-bold text-primary text-lg">{mockTestimonials[currentSlide].name}</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest">{mockTestimonials[currentSlide].role}</p>
                </div>
                <div className="text-tertiary font-label-caps text-xs tracking-widest font-semibold uppercase">
                  {currentSlide + 1} / {mockTestimonials.length}
                </div>
              </div>
            </div>
            
            {/* Indicator Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {mockTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'bg-tertiary w-6' : 'bg-outline-variant/40 hover:bg-outline-variant'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-stack-lg border-t border-white/5 bg-surface-container-low/30">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="font-serif text-[28px] md:text-headline-md italic text-primary">The Philosophy of Elevate</h2>
          <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed">
            We believe fitness is the foundation of a high-performance life. Elevate was founded not as a gym, but as a sanctuary for those who refuse to settle for mediocrity. Our mission is to provide the elite guidance, environment, and community necessary to unlock your physical potential and foster lifelong vitality.
          </p>
          <div className="flex justify-center pt-4">
            <img 
              alt="Elevate Logo" 
              className="h-16 w-auto object-contain opacity-80" 
              src="/images/logo_icon.svg"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-stack-lg relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 gold-glow opacity-30"></div>
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-center relative z-10">
          <div className="max-w-2xl mx-auto space-y-10">
            <h2 className="font-serif text-[32px] md:text-headline-md text-primary font-semibold">Your Transformation Awaits.</h2>
            <p className="font-sans text-body-lg text-on-surface-variant">
              Step into the collective. Experience personal training as it was meant to be—exclusive, intensive, and effective.
            </p>
            <Link 
              to="/book" 
              className="px-12 py-5 bg-primary text-on-primary font-bold text-lg rounded-sm hover:bg-tertiary hover:text-on-tertiary hover:scale-105 transition-all shadow-xl inline-block duration-300"
            >
              Start Your Journey Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
