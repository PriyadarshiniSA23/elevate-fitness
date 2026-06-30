import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/40">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 w-full max-w-container-max mx-auto h-20">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
            <img 
              alt="Elevate Fitness Logo" 
              className="h-6 w-auto md:h-8 object-contain" 
              src="/images/logo_icon.svg"
            />
          </div>
          <span className="font-display-lg text-[20px] md:text-[24px] text-primary tracking-tight font-semibold">Elevate Fitness</span>
        </Link>

        {/* Desktop Navigation Menu Links */}
        <div className="hidden lg:flex gap-8 items-center">
          <Link 
            className={`font-sans text-body-md tracking-[0.05em] hover:text-primary transition-colors ${isActive('/') ? 'active-dot text-primary' : 'text-on-surface-variant'}`} 
            to="/"
          >
            Home
          </Link>
          <Link 
            className={`font-sans text-body-md tracking-[0.05em] hover:text-primary transition-colors ${isActive('/programs') ? 'active-dot text-primary' : 'text-on-surface-variant'}`} 
            to="/programs"
          >
            Programs
          </Link>
          <Link 
            className={`font-sans text-body-md tracking-[0.05em] hover:text-primary transition-colors ${isActive('/trainers') ? 'active-dot text-primary' : 'text-on-surface-variant'}`} 
            to="/trainers"
          >
            Trainers
          </Link>
          <Link 
            className={`font-sans text-body-md tracking-[0.05em] hover:text-primary transition-colors ${isActive('/memberships') ? 'active-dot text-primary' : 'text-on-surface-variant'}`} 
            to="/memberships"
          >
            Memberships
          </Link>
          <Link 
            className={`font-sans text-body-md tracking-[0.05em] hover:text-primary transition-colors ${isActive('/about-contact') ? 'active-dot text-primary' : 'text-on-surface-variant'}`} 
            to="/about-contact"
          >
            About
          </Link>
        </div>

        {/* Action Controls - Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-tertiary/20 border-t-tertiary rounded-full animate-spin"></div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.membership && (
                  <div className="relative group flex items-center justify-center cursor-help">
                    <div className="w-8 h-8 rounded-full bg-surface-container border border-tertiary/30 flex items-center justify-center text-lg shadow-sm">
                      {user.membership.type.toLowerCase().includes('platinum') || user.membership.type.toLowerCase().includes('elite') ? '💎' :
                       user.membership.type.toLowerCase().includes('gold') ? '🥇' :
                       user.membership.type.toLowerCase().includes('silver') ? '🥈' : '🌟'}
                    </div>
                    <div className="absolute top-full mt-2 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="glass-card bg-surface/90 border border-tertiary/40 px-3 py-1.5 rounded-md shadow-lg shadow-black/50 whitespace-nowrap">
                        <span className="font-serif text-sm text-tertiary font-bold">{user.membership.type} Member</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleProfileClick}
                  className="text-on-surface hover:text-primary transition-colors flex items-center focus:outline-none"
                  title={`Dashboard: ${user?.full_name || 'Member'}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-tertiary/40 shrink-0 bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-lg font-mono">
                    {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </button>
              </div>
              
              <button 
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="text-on-surface-variant hover:text-error transition-colors flex items-center p-1"
                title="Logout"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleProfileClick} 
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 py-2 px-3 focus:outline-none text-sm font-sans font-medium"
              title="Login"
            >
              <span className="material-symbols-outlined text-xl">account_circle</span>
              <span>Login</span>
            </button>
          )}
          
          <Link 
            to="/book" 
            className="bg-primary text-on-primary font-sans text-body-md px-6 py-2 rounded-sm hover:bg-tertiary transition-all duration-300 transform active:scale-95 text-center font-medium"
          >
            Book Session
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <Link 
            to="/book" 
            className="bg-primary text-on-primary text-xs px-3 py-1.5 rounded-sm hover:bg-tertiary transition-all duration-300 font-medium"
          >
            Book
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-on-surface p-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full h-[calc(100vh-5rem)] bg-background border-t border-white/5 overflow-y-auto">
          <div className="flex flex-col px-6 py-8 space-y-6">
            <Link 
              className={`font-sans text-xl ${isActive('/') ? 'text-primary font-bold' : 'text-on-surface-variant'}`} 
              to="/"
            >
              Home
            </Link>
            <Link 
              className={`font-sans text-xl ${isActive('/programs') ? 'text-primary font-bold' : 'text-on-surface-variant'}`} 
              to="/programs"
            >
              Programs
            </Link>
            <Link 
              className={`font-sans text-xl ${isActive('/trainers') ? 'text-primary font-bold' : 'text-on-surface-variant'}`} 
              to="/trainers"
            >
              Trainers
            </Link>
            <Link 
              className={`font-sans text-xl ${isActive('/memberships') ? 'text-primary font-bold' : 'text-on-surface-variant'}`} 
              to="/memberships"
            >
              Memberships
            </Link>
            <Link 
              className={`font-sans text-xl ${isActive('/about-contact') ? 'text-primary font-bold' : 'text-on-surface-variant'}`} 
              to="/about-contact"
            >
              About
            </Link>

            <div className="h-px w-full bg-white/10 my-4"></div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-2 border-tertiary/20 border-t-tertiary rounded-full animate-spin"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-tertiary/20 flex items-center justify-center bg-surface-container cursor-pointer shrink-0"
                  title={`Dashboard: ${user.full_name}`}
                  onClick={handleProfileClick}
                >
                  <span className="font-mono text-lg font-bold text-tertiary">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="block font-bold">{user.full_name}</span>
                  <span className="block text-sm text-tertiary font-label-caps uppercase tracking-widest">{user.role === 'admin' ? 'Dashboard' : 'Profile'}</span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 text-error text-xl font-bold pt-4"
                >
                  <span className="material-symbols-outlined text-2xl">logout</span>
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={handleProfileClick}
                className="flex items-center gap-3 text-xl text-on-surface hover:text-primary transition-colors font-bold text-left"
              >
                <span className="material-symbols-outlined text-3xl">account_circle</span>
                Login to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
