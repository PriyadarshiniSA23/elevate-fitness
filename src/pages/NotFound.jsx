import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="bg-background text-on-surface pt-32 pb-stack-lg min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center space-y-8 relative overflow-hidden py-16 rounded-xl glass-card border border-white/5">
        <div className="absolute inset-0 gold-glow opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6">
          <span className="font-label-caps text-xs text-tertiary tracking-widest uppercase block font-bold">ERROR Code 404</span>
          
          <h1 className="font-serif text-[44px] leading-tight font-bold text-primary">
            Path <br />
            <span className="italic text-primary/70">Not Discovered</span>
          </h1>
          
          <div className="h-[1px] w-12 bg-tertiary mx-auto opacity-60"></div>
          
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
            The exclusive sanctuary path you are seeking does not exist or has been relocated to another wing.
          </p>

          <Link 
            to="/" 
            className="px-10 py-4 bg-primary text-on-primary font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all duration-300 font-bold inline-block"
          >
            Return to Collective Home
          </Link>
        </div>
      </div>
    </div>
  );
}
