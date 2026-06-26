import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-6 md:px-margin-desktop py-stack-lg w-full max-w-container-max mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-full">
              <img 
                alt="Elevate Fitness Logo" 
                className="h-6 w-auto object-contain" 
                src="/images/logo_icon.svg"
              />
            </div>
            <span className="font-display-lg text-[22px] text-primary tracking-tight font-semibold">Elevate Fitness</span>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant max-w-xs leading-relaxed">
            Elite wellness for the modern achiever. Private training, refined environment, and lasting results for longevity.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary">The Club</h4>
          <nav className="flex flex-col gap-2">
            <Link className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/programs">Programs</Link>
            <Link className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/trainers">Trainers</Link>
            <Link className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/memberships">Memberships</Link>
            <Link className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/about-contact">About &amp; Contact</Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary">Support</h4>
          <nav className="flex flex-col gap-2">
            <Link className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/about-contact">Contact Us</Link>
            <a className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" href="#privacy">Privacy Policy</a>
            <a className="font-sans text-body-md text-on-surface-variant hover:text-tertiary transition-colors" href="#terms">Terms of Service</a>
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary">Newsletter</h4>
          {subscribed ? (
            <p className="text-sm text-tertiary font-medium">Thanks for subscribing!</p>
          ) : (
            <>
              <p className="text-sm text-on-surface-variant mb-4">Join the collective for exclusive training insights.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address" 
                  className="bg-transparent border-b border-outline-variant py-2 text-on-surface placeholder:text-outline-variant/50 focus:border-tertiary focus:ring-0 text-sm flex-grow"
                />
                <button 
                  onClick={handleSubscribe}
                  className="text-tertiary font-bold tracking-widest text-[12px] uppercase border border-tertiary/20 hover:border-tertiary px-4 py-2 hover:bg-tertiary/10 transition-all"
                >
                  Join
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-sans text-on-surface-variant/60 text-sm">© 2024 Elevate Fitness. All rights reserved.</p>
        <p className="font-sans text-on-surface-variant/60 text-sm italic">Designed for Peak Vitality &amp; Longevity.</p>
      </div>
    </footer>
  );
}
