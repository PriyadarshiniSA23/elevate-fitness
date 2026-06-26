import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/40">
      <div className="flex justify-between items-center px-6 md:px-margin-desktop py-4 w-full max-w-container-max mx-auto h-20">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center">
            <img 
              alt="Elevate Fitness Logo" 
              className="h-8 w-auto object-contain" 
              src="/images/logo_icon.svg"
            />
          </div>
          <span className="font-display-lg text-[24px] text-primary tracking-tight font-semibold">Elevate Fitness</span>
        </Link>

        {/* Navigation Menu Links */}
        <div className="hidden md:flex gap-8 items-center">
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

        {/* Action Controls */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Membership Holder Badge */}
                {user.membership && (
                  <div className="relative group flex items-center justify-center cursor-help">
                    <div className="w-8 h-8 rounded-full bg-surface-container border border-tertiary/30 flex items-center justify-center text-lg shadow-sm">
                      {user.membership.type.toLowerCase().includes('platinum') || user.membership.type.toLowerCase().includes('elite') ? '💎' :
                       user.membership.type.toLowerCase().includes('gold') ? '🥇' :
                       user.membership.type.toLowerCase().includes('silver') ? '🥈' : '🌟'}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="glass-card bg-surface/90 border border-tertiary/40 px-3 py-1.5 rounded-md shadow-lg shadow-black/50 whitespace-nowrap">
                        <span className="font-serif text-sm text-tertiary font-bold">{user.membership.type} Member</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Profile Avatar */}
                <button 
                  onClick={handleProfileClick}
                  className="text-on-surface hover:text-primary transition-colors flex items-center focus:outline-none"
                  title={`Dashboard: ${user.name}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-tertiary/40 shrink-0 bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-lg font-mono">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={() => {
                  logout();
                  navigate('/');
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
      </div>
    </nav>
  );
}
