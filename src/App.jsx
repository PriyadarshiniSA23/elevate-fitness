import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { BookingProvider } from './hooks/useBooking';
import { AppDataProvider } from './hooks/useAppData';
import AppRoutes from './routes/AppRoutes';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('elevate_splash_shown');
    if (hasShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('elevate_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <BrowserRouter>
      <AppDataProvider>
        <AuthProvider>
          <BookingProvider>
            {showSplash ? (
              <SplashScreen onComplete={handleSplashComplete} />
            ) : (
              <AppRoutes />
            )}
          </BookingProvider>
        </AuthProvider>
      </AppDataProvider>
    </BrowserRouter>
  );
}
