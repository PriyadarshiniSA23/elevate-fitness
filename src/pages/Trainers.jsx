import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { useAppData } from '../hooks/useAppData';

export default function Trainers() {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { selectProgram, selectTrainer, setCurrentStep } = useBooking();
  const { trainers: mockTrainers, programs: mockPrograms } = useAppData();

  const handleBookWithCoach = (coach) => {
    // If no program is selected yet, find a matching program that the coach offers
    const matchingProgram = mockPrograms.find(p => coach.category.includes(p.category)) || mockPrograms[0];
    
    selectProgram(matchingProgram);
    selectTrainer(coach);
    setCurrentStep(3); // Jump straight to schedule step
    navigate('/book');
  };

  const filteredTrainers = filter === 'all' 
    ? mockTrainers 
    : mockTrainers.filter(t => t.category.includes(filter));

  const [activeId, setActiveId] = useState(null);

  const specializations = [
    {
      icon: 'fitness_center',
      title: 'Strength Training',
      desc: 'Master compound movements and build functional power with science-based protocols.'
    },
    {
      icon: 'monitor_weight',
      title: 'Weight Loss Coaching',
      desc: 'Sustainable fat loss through metabolic conditioning and behavioral change strategies.'
    },
    {
      icon: 'self_improvement',
      title: 'Yoga & Wellness',
      desc: 'Enhance mobility and mental clarity with expert-led flow and recovery sessions.'
    },
    {
      icon: 'timer',
      title: 'HIIT Training',
      desc: 'Maximize efficiency with high-intensity intervals designed for cardiovascular peak.'
    },
    {
      icon: 'sports_score',
      title: 'Sports Performance',
      desc: 'Elite-level drills focused on agility, speed, and explosive athletic output.'
    },
    {
      icon: 'nutrition',
      title: 'nutrition', // mapped to nutrition icon
      titleDisplay: 'Nutrition Coaching',
      desc: 'Precision fuel planning to support your training and optimize body composition.'
    }
  ];

  return (
    <div className="bg-background text-on-surface pb-stack-lg min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center pt-32 pb-20 overflow-hidden isolate mb-16">
        <div className="absolute inset-0 -z-20">
          <img 
            alt="Busy fitness studio hall" 
            className="w-full h-full object-cover brightness-[0.22]" 
            src="/images/trainers_hero_bg.png"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-background z-0"></div>
        <div className="absolute inset-0 gold-glow -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center px-6 z-10 space-y-6">
          <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block">The Collective Staff</span>
          <h1 className="font-serif text-4xl md:text-[54px] font-bold text-primary tracking-tight leading-tight">
            Meet The Experts Behind <br className="hidden md:inline" />
            Your Transformation
          </h1>
          <div className="h-1 w-24 bg-tertiary mx-auto mt-2"></div>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-sans text-body-lg pt-2 leading-relaxed">
            Our certified fitness professionals are dedicated to helping you achieve your goals through personalized coaching, proven methods, and continuous support.
          </p>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
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

        {/* Trainers Accordion Filmstrip (Option D) */}
        <section className="py-8 mb-20">
          <div className="flex flex-col md:flex-row min-h-[550px] w-full gap-3 overflow-hidden">
            {filteredTrainers.map((coach) => (
              <div 
                key={coach.id} 
                onMouseEnter={() => setActiveId(coach.id)}
                onMouseLeave={() => setActiveId(null)}
                className={`relative overflow-hidden group rounded-xl border border-white/5 cursor-pointer transition-all duration-700 ease-out h-[350px] md:h-[550px] ${
                  activeId === coach.id 
                    ? 'flex-[2.5] md:flex-[4] border-tertiary/20 shadow-2xl shadow-tertiary/5' 
                    : activeId !== null 
                      ? 'flex-[0.8] md:flex-[0.5] opacity-50' 
                      : 'flex-1 md:flex-1'
                }`}
              >
                {/* Portrait Background */}
                <img 
                  alt={coach.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  src={coach.image}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-10 pointer-events-none"></div>

                {/* On Leave Badge */}
                {coach.availability === 'On Leave' && (
                  <div className="absolute top-4 left-4 z-20 bg-error/80 text-white font-bold tracking-widest text-[10px] uppercase px-3 py-1 rounded backdrop-blur-md">
                    On Leave
                  </div>
                )}

                {/* Collapsed Name Label (Fades out when active) */}
                <div className={`absolute inset-0 flex items-end justify-center md:justify-start p-6 z-15 pointer-events-none transition-opacity duration-500 ${
                  activeId === coach.id ? 'opacity-0' : 'opacity-100'
                }`}>
                  <h3 className="font-serif text-lg font-bold text-white md:hidden text-center drop-shadow-md">
                    {coach.name}
                  </h3>
                  <h3 className="font-serif text-[22px] font-bold text-white hidden md:block origin-bottom-left -rotate-90 translate-x-4 translate-y-[-10px] whitespace-nowrap tracking-wider uppercase opacity-85">
                    {coach.name}
                  </h3>
                </div>

                {/* Expanded Details Panel */}
                <div className={`absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/100 via-black/75 to-black/10 transition-all duration-500 z-20 ${
                  activeId === coach.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                  <div className="space-y-4">
                    {/* Rating badge */}
                    <div className="flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-mono font-bold">{coach.rating ? Number(coach.rating).toFixed(1) : '5.0'}</span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white leading-none">{coach.name}</h3>
                      <p className="font-label-caps text-[10px] text-tertiary uppercase tracking-widest pt-1.5">{coach.title}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold">Specialization</span>
                      <p className="text-xs font-medium text-white">{coach.specialization}</p>
                    </div>

                    <p className="font-sans text-on-surface-variant text-xs leading-relaxed line-clamp-3">
                      {coach.bio}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[10px]">
                      <div>
                        <span className="block text-on-surface-variant uppercase text-[8px]">Experience</span>
                        <p className="font-semibold text-primary">{coach.experience}</p>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant uppercase text-[8px]">Location</span>
                        <p className="font-semibold text-primary">Prime South</p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookWithCoach(coach);
                      }}
                      className="w-full py-2.5 bg-tertiary text-background font-label-caps text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-background transition-all duration-300 rounded-sm"
                    >
                      Book Session
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* Success Stories (Real Proof) Section */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-16">
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block mb-2">The Proof</span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">Results That Speak For Themselves</h2>
            <div className="h-1 w-20 bg-tertiary mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Maria's Journey */}
            <div className="glass-card p-6 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-tertiary/10 transition-all duration-300">
              <div className="rounded-lg overflow-hidden mb-6 aspect-[1.5] bg-surface-container-high relative">
                <img 
                  alt="Maria's Journey" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="/images/trans1.png"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-xl font-bold text-white">Maria's Journey</h4>
                  <p className="text-sm text-on-surface-variant pt-0.5">Coached by Sienna</p>
                </div>
                <div className="text-right">
                  <span className="text-tertiary font-bold text-2xl block">-16kg</span>
                  <span className="text-on-surface-variant text-[10px] uppercase font-semibold tracking-wider">in 6 months</span>
                </div>
              </div>
            </div>

            {/* David's Evolution */}
            <div className="glass-card p-6 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-tertiary/10 transition-all duration-300">
              <div className="rounded-lg overflow-hidden mb-6 aspect-[1.5] bg-surface-container-high relative">
                <img 
                  alt="David's Evolution" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="/images/trans3.png"
                />
                <span className="absolute bottom-4 left-1/4 -translate-x-1/2 text-white font-sans font-bold text-lg md:text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 pointer-events-none">BEFORE</span>
                <span className="absolute bottom-4 left-3/4 -translate-x-1/2 text-white font-sans font-bold text-lg md:text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 pointer-events-none">AFTER</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-xl font-bold text-white">David's Evolution</h4>
                  <p className="text-sm text-on-surface-variant pt-0.5">Coached by Marcus</p>
                </div>
                <div className="text-right">
                  <span className="text-tertiary font-bold text-2xl block">+15% Strength</span>
                  <span className="text-on-surface-variant text-[10px] uppercase font-semibold tracking-wider">Lean Muscle Focus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trainer Specializations Bento */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-16">
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block mb-2">Excellence in every field</span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">Trainer Specializations</h2>
            <div className="h-1 w-20 bg-tertiary mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec, idx) => (
              <div 
                key={idx} 
                className="glass-card p-8 rounded-xl border border-white/5 flex flex-col items-center text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-300">
                  <span className="material-symbols-outlined text-white group-hover:text-background text-2xl transition-colors duration-300">
                    {spec.icon}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold mb-2 text-white">
                  {spec.titleDisplay || spec.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
