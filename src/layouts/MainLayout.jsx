import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Smooth page entry animation using GSAP
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main ref={containerRef} className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
