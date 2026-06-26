import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '25+', label: 'Certified Trainers' },
  { value: '10k+', label: 'Sessions Held' },
  { value: '98%', label: 'Satisfaction' },
  { value: '5+', label: 'Years Excellence' }
];

const estateImages = [
  {
    title: 'Strength Training Zone',
    desc: 'Artisan equipment for elite performance.',
    url: '/images/img_f2aee0a6.png'
  },
  {
    title: 'Yoga Studio',
    desc: 'Find your center in absolute silence.',
    url: '/images/img_4d0edddc.png'
  },
  {
    title: 'Premium Locker Rooms',
    desc: 'The luxury of privacy and comfort.',
    url: '/images/img_f2b99ed7.png'
  },
  {
    title: 'Recovery Lounge',
    desc: 'Post-workout regeneration at its finest.',
    url: '/images/img_528e7d48.png'
  }
];

export default function AboutContact() {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Membership Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: 'Membership Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="bg-background text-on-surface pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Header */}
        <header className="text-center mb-20 space-y-4">
          <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block">Our Concept &amp; Locations</span>
          <h1 className="font-serif text-4xl md:text-[54px] font-bold text-primary tracking-tight">About &amp; Contact</h1>
          <div className="h-1 w-24 bg-tertiary mx-auto mt-2"></div>
        </header>

        {/* ─── 1. OUR JOURNEY ────────────────────────────────────────── */}
        <section className="py-12 bg-background relative overflow-hidden mb-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary leading-tight">Our Journey</h2>
              <div className="w-20 h-1 bg-tertiary"></div>
              <p className="font-sans text-on-surface-variant text-body-lg leading-relaxed">
                Founded in 2018, Elevate Fitness emerged from a simple realization: fitness is not a seasonal chore, but a lifelong pursuit of excellence. We moved away from the aggressive grit of traditional gyms to create a space that feels like a private sanctuary.
              </p>
              <p className="font-sans text-on-surface-variant/80 text-sm leading-relaxed">
                Our vision was to create a refined ecosystem where members feel confident, inspired, and supported. We focus on well-being that transcends the physical, fostering lasting transformations in both body and mind.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 rounded-xl border border-white/5 space-y-4 hover:border-tertiary/10 transition-colors">
                <span className="material-symbols-outlined text-tertiary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                <h3 className="font-serif text-xl font-bold text-white">Our Mission</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  To empower our members with curated fitness experiences that prioritize long-term health and personal growth through elite coaching.
                </p>
              </div>
              <div className="glass-card p-8 rounded-xl border border-white/5 space-y-4 hover:border-tertiary/10 transition-colors md:mt-8">
                <span className="material-symbols-outlined text-tertiary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                <h3 className="font-serif text-xl font-bold text-white">Our Vision</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  To be the global benchmark for luxury wellness, where every interaction is an investment in a higher version of oneself.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. THE SIGNATURE DIFFERENCE ──────────────────────────── */}
        <section className="py-16 bg-surface-container-low rounded-2xl p-8 md:p-12 mb-20 border border-white/5">
          <div className="text-center mb-16 space-y-3">
            <span className="font-label-caps text-xs text-tertiary tracking-[0.2em] block uppercase">Why Elevate?</span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">The Signature Difference</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group p-8 bg-background border border-white/5 hover:border-tertiary/30 transition-all duration-500 rounded-xl">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-tertiary transition-colors duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background transition-colors">school</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">Certified Trainers</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">Our specialists hold advanced degrees and world-class certifications in sports science.</p>
            </div>
            {/* Card 2 */}
            <div className="group p-8 bg-background border border-white/5 hover:border-tertiary/30 transition-all duration-500 rounded-xl">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-tertiary transition-colors duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background transition-colors">analytics</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">Personalized Programs</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">DNA-based fitness plans tailored to your unique physiology and lifestyle goals.</p>
            </div>
            {/* Card 3 */}
            <div className="group p-8 bg-background border border-white/5 hover:border-tertiary/30 transition-all duration-500 rounded-xl">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-tertiary transition-colors duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background transition-colors">fitness_center</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">Modern Facilities</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">Equipped with the latest Technogym Bio-Circuit and premium recovery pods.</p>
            </div>
            {/* Card 4 */}
            <div className="group p-8 bg-background border border-white/5 hover:border-tertiary/30 transition-all duration-500 rounded-xl">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-tertiary transition-colors duration-300">
                <span className="material-symbols-outlined text-white group-hover:text-background transition-colors">trending_up</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">Results-Driven</h4>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">A commitment to measurable progress and long-term metabolic health.</p>
            </div>
          </div>
        </section>

        {/* ─── 3. ESTATE SWAP VIEW ──────────────────────────────────── */}
        <section className="py-12 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Title & Description */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="font-label-caps text-xs text-tertiary tracking-[0.2em] block uppercase">The Estate</span>
                <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary leading-tight">Experience Premium Training Spaces</h2>
              </div>
              <div className="w-20 h-1 bg-tertiary"></div>
              <p className="font-sans text-on-surface-variant text-body-lg leading-relaxed">
                Our private members club features multiple custom training zones designed for peak performance, longevity biometrics, and active recovery.
              </p>
              <p className="font-sans text-on-surface-variant/80 text-sm leading-relaxed">
                Click the interactive image stack to cycle through our 4 key zones: the Strength Zone, Yoga Studio, Locker Suite, and Recovery Lounge.
              </p>
            </div>

            {/* Right Column: Swap View Component */}
            <div 
              onClick={() => setActiveImageIndex((prev) => (prev + 1) % estateImages.length)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="lg:col-span-6 relative h-[450px] cursor-pointer select-none"
              title="Click to cycle images"
            >
              {/* Elegant Cycle Badge */}
              <div 
                style={{ zIndex: 50 }}
                className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10 flex items-center gap-1.5 text-tertiary font-label-caps text-[10px] tracking-wider uppercase shadow-lg hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-xs">swap_horiz</span>
                Cycle Spaces ({activeImageIndex + 1} / {estateImages.length})
              </div>

              {estateImages.map((img, idx) => {
                // Calculate cyclic position relative to active index
                const position = (idx - activeImageIndex + estateImages.length) % estateImages.length;
                
                // Determine styling based on position in stack
                const zIndex = 30 - position * 10;
                const opacity = position === 0 ? 1 : 0.8 - position * 0.15;
                
                // Spread offsets on hover
                const translateMultiplier = isHovered ? 1.5 : 1.0;
                const translateX = position * 18 * translateMultiplier;
                const translateY = position * 14 * translateMultiplier;
                const rotate = position * 2.5;

                return (
                  <div
                    key={idx}
                    className="absolute inset-0 rounded-xl overflow-hidden transition-all duration-500 ease-out border border-white/5 shadow-2xl"
                    style={{
                      zIndex,
                      opacity,
                      transform: `translate(${translateX}px, ${translateY}px) scale(${1 - position * 0.04}) rotate(${rotate}deg)`,
                      pointerEvents: position === 0 ? 'auto' : 'none'
                    }}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center relative" 
                      style={{ backgroundImage: `url('${img.url}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 p-8 w-full z-20">
                        <h5 className="font-serif text-xl font-bold text-white leading-none">{img.title}</h5>
                        <p className="text-on-surface-variant text-xs mt-2 leading-relaxed">{img.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 4. ACHIEVEMENTS BAR ───────────────────────────────────── */}
        <section className="py-16 bg-surface-container-lowest border-y border-white/5 mb-20 -mx-6 md:-mx-margin-desktop px-6 md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center max-w-container-max mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className={i === 4 ? "col-span-2 md:col-span-1" : ""}>
                <div className="font-mono text-3xl md:text-[38px] font-bold text-tertiary mb-1">{stat.value}</div>
                <div className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 6. CONTACT & LOCATION ─────────────────────────────────── */}
        <section className="py-16 bg-surface-container-low rounded-2xl p-8 md:p-12 mb-20 border border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left: Contact Info & Map */}
            <div className="space-y-10">
              <div className="space-y-3">
                <span className="font-label-caps text-xs text-tertiary tracking-[0.2em] block uppercase">Get In Touch</span>
                <h2 className="font-serif text-3xl font-bold text-primary leading-tight">We’re Here To Support Your Evolution</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Address</p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    123 Fitness Avenue, Manhattan<br />New York, NY 10001
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Phone</p>
                  <p className="text-sm font-medium text-white">+1 (212) 555-0198</p>
                </div>
                <div className="space-y-1">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Email</p>
                  <p className="text-sm font-medium text-white">concierge@elevatefitness.com</p>
                </div>
                <div className="space-y-1">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Hours</p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    Mon–Fri: 05:00 - 22:00<br />Sat–Sun: 07:00 - 18:00
                  </p>
                </div>
              </div>

              {/* Custom Animated Map Component */}
              <div className="relative w-full h-[320px] bg-surface-container overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                <div className="w-full h-full relative bg-surface-container-lowest flex items-center justify-center overflow-hidden">
                  
                  {/* Street SVG Pattern Background */}
                  <div className="absolute inset-0 opacity-25 grayscale pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                      <pattern id="street-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                        <rect width="200" height="200" fill="#0e0e0e"></rect>
                        <path d="M0 100 h200 M100 0 v200" stroke="#353535" strokeWidth="12"></path>
                        <path d="M40 0 v200 M160 0 v200 M0 40 h200 M0 160 h200" stroke="#1f2020" strokeWidth="4"></path>
                        <text x="110" y="90" fill="#444748" fontFamily="Inter" fontSize="8" fontWeight="600" transform="rotate(-90 110 90)">5TH AVENUE</text>
                        <text x="10" y="115" fill="#444748" fontFamily="Inter" fontSize="8" fontWeight="600">W 23RD ST</text>
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#street-pattern)"></rect>
                    </svg>
                  </div>

                  {/* Marker Pin & Label */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                      <span className="material-symbols-outlined text-tertiary text-5xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/60 rounded-full blur-sm"></div>
                    </div>
                    <div className="mt-4 bg-surface-container-highest/95 backdrop-blur-xl border border-tertiary/20 p-4 rounded-lg shadow-2xl text-center">
                      <p className="font-label-caps text-tertiary text-[10px] tracking-[0.2em] mb-1 font-bold">ELEVATE FITNESS</p>
                      <p className="text-white text-[12px] font-medium">123 Fitness Avenue, Manhattan</p>
                      <p className="text-on-surface-variant text-[9px] mt-1 font-semibold tracking-wider">PREMIUM MEMBERS CLUB</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
                    <button className="w-9 h-9 bg-surface-container-highest/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-tertiary hover:text-background transition-all rounded-lg">
                      <span className="material-symbols-outlined text-base">add</span>
                    </button>
                    <button className="w-9 h-9 bg-surface-container-highest/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-tertiary hover:text-background transition-all rounded-lg">
                      <span className="material-symbols-outlined text-base">remove</span>
                    </button>
                  </div>

                  <div className="absolute top-4 left-4">
                    <div className="bg-surface-container-highest/90 backdrop-blur-md px-4 py-1.5 border border-tertiary/20 rounded-full flex items-center gap-2 shadow-lg">
                      <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-label-caps text-white tracking-widest font-bold">LIVE SATELLITE</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right: Bespoke Inquiry Form */}
            <div className="glass-card p-8 md:p-10 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-center">
              <div className="gold-glow absolute inset-0 opacity-40"></div>
              
              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-primary">Bespoke Inquiry</h2>
                  <p className="text-on-surface-variant text-sm mt-1">Submit your details and our concierge will contact you within 12 hours.</p>
                </div>

                {submitted ? (
                  <div className="p-8 bg-tertiary/10 border border-tertiary/20 rounded-lg text-center space-y-3">
                    <span className="material-symbols-outlined text-tertiary text-4xl">verified</span>
                    <h3 className="font-serif text-xl text-primary font-bold">Message Dispatched</h3>
                    <p className="text-sm text-on-surface-variant">We look forward to welcoming you to the collective.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-semibold">Full Name</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 placeholder:text-outline-variant/30 text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-semibold">Email Address</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 placeholder:text-outline-variant/30 text-sm"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-semibold">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 placeholder:text-outline-variant/30 text-sm"
                          placeholder="+1 (212) 000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-semibold">Subject</label>
                        <div className="relative">
                          <select 
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 text-sm appearance-none cursor-pointer"
                          >
                            <option className="bg-surface-container">Membership Inquiry</option>
                            <option className="bg-surface-container">Personal Training</option>
                            <option className="bg-surface-container">Corporate Partnership</option>
                            <option className="bg-surface-container">Other</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-semibold">Your Message</label>
                      <textarea 
                        required
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 placeholder:text-outline-variant/30 text-sm resize-none"
                        placeholder="Tell us about your fitness journey..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-4 bg-tertiary text-background font-label-caps text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 font-bold rounded-sm shadow-xl active:scale-[0.98]"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ─── 7. READY TO START BANNER ──────────────────────────────── */}
        <section className="relative py-28 overflow-hidden bg-background border border-white/5 rounded-2xl">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tertiary/10 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-white leading-tight">Ready To Start Your Fitness Journey?</h2>
            <p className="font-sans text-on-surface-variant text-sm max-w-xl mx-auto leading-relaxed">
              Take the first step towards a more refined, powerful version of yourself with our elite coaching and world-class facilities.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => navigate('/book')}
                className="bg-white text-black px-12 py-4.5 rounded-sm font-label-caps text-sm tracking-widest hover:bg-tertiary transition-all duration-300 shadow-2xl font-bold uppercase active:scale-95"
              >
                Book A Session Today
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
