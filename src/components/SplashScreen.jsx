import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SplashScreen({ onComplete }) {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const borderRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Exit animation before calling onComplete
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              opacity: 0,
              scale: 1.05,
              duration: 0.8,
              ease: 'power3.inOut',
              onComplete: onComplete
            });
          } else {
            onComplete();
          }
        }
      });

      // Entrance Animation
      tl.fromTo(containerRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
      .fromTo(logoRef.current, 
        { opacity: 0, scale: 0.8, y: 30 }, 
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(borderRef.current,
        { width: 0, opacity: 0 },
        { width: '48px', opacity: 0.6, duration: 0.8, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo(textRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      )
      // Hold for a moment
      .to({}, { duration: 1.0 }); // Wait 1s
    });

    return () => ctx.revert(); // clean up GSAP animations
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[#131313] z-[9999] flex flex-col items-center justify-center text-on-surface overflow-hidden"
    >
      {/* Ambient Gold Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full gold-glow opacity-30 pointer-events-none blur-3xl"></div>

      <div className="text-center space-y-6 z-10">
        {/* Logo Monogram */}
        <div ref={logoRef} className="w-24 h-24 mb-6 relative z-10 mx-auto">
          <img 
            alt="Elevate Fitness Logo" 
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-[pulse_3s_ease-in-out_infinite]" 
            src="/images/logo_icon.svg"
          />
        </div>

        {/* Separator */}
        <div ref={borderRef} className="h-[1px] bg-tertiary mx-auto"></div>

        {/* Brand Text */}
        <div ref={textRef} className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl text-primary tracking-tight font-bold">
            ELEVATE FITNESS
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-tertiary font-semibold">
            Redefining Luxury Wellness
          </p>
        </div>
      </div>
    </div>
  );
}
