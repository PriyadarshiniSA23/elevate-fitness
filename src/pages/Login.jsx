import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';

export default function Login() {
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD', 'RESET_PASSWORD'
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '', extra: '', button: '' });
  const [errorModal, setErrorModal] = useState(null); // 'EXISTS', 'NOT_FOUND', 'INVALID_PASSWORD', 'INVALID_PASSWORD_ADMIN'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Forgot/Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetVerificationSimulated, setResetVerificationSimulated] = useState(false);
  
  const [focus, setFocus] = useState(false);
  
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const formContainerRef = useRef(null);
  const successRef = useRef(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    
    if (result.error === 'NOT_FOUND') {
      setErrorModal('NOT_FOUND');
    } else if (result.error === 'SUSPENDED') {
      setErrorModal('SUSPENDED');
    } else if (result.error === 'INVALID_PASSWORD') {
      if (email.toLowerCase() === 'elevateadmin@gmail.com') {
        setErrorModal('INVALID_PASSWORD_ADMIN');
      } else {
        setErrorModal('INVALID_PASSWORD');
      }
    } else if (result && !result.error) {
      if (from) {
        navigate(from);
      } else if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    const result = register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });

    if (result.error === 'EXISTS') {
      setErrorModal('EXISTS');
    } else if (result && !result.error) {
      setSuccessMessage({
        title: "Welcome to Elevate Fitness!",
        message: "Your account has been created successfully.",
        extra: "🎉 As a welcome gift, 2 Complimentary Discovery Sessions have been added to your account.",
        button: "Continue"
      });
      setIsSuccess(true);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    
    // Check if email exists by attempting a mock login with empty pass just to get NOT_FOUND
    const result = login(resetEmail, '');
    if (result.error === 'NOT_FOUND') {
      setErrorModal('NOT_FOUND');
    } else {
      // Simulate email verification success
      setResetVerificationSimulated(true);
      setTimeout(() => {
        setResetVerificationSimulated(false);
        changeMode('RESET_PASSWORD');
      }, 2500);
    }
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setResetError('');
    
    if (!newPassword) {
      setResetError("Password cannot be empty.");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    const success = resetPassword(resetEmail, newPassword);
    if (success) {
      setSuccessMessage({
        title: "Password Updated",
        message: "Your password has been updated successfully.",
        extra: "",
        button: "Return to Login"
      });
      setIsSuccess(true);
    } else {
      setResetError("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (isSuccess && successRef.current) {
      gsap.fromTo(successRef.current, 
        { opacity: 0, scale: 0.9 }, 
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [isSuccess]);

  const changeMode = (newMode) => {
    const container = formContainerRef.current;
    if (!container) {
      setAuthMode(newMode);
      return;
    }
    gsap.to(container, {
      opacity: 0,
      x: authMode === 'LOGIN' ? -20 : 20,
      duration: 0.3,
      onComplete: () => {
        setAuthMode(newMode);
        setRegError('');
        setResetError('');
        gsap.fromTo(container, 
          { opacity: 0, x: authMode === 'LOGIN' ? 20 : -20 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });
  };

  const handleSuccessAction = () => {
    if (authMode === 'RESET_PASSWORD') {
      setIsSuccess(false);
      setPassword('');
      changeMode('LOGIN');
    } else {
      if (from) {
        navigate(from);
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Render Premium Dialogs
  const renderErrorModal = () => {
    if (!errorModal) return null;

    let content = null;

    if (errorModal === 'EXISTS') {
      content = (
        <>
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl font-bold">warning</span>
          </div>
          <h2 className="font-serif text-2xl text-primary font-bold mb-2">Account Already Exists</h2>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
            An account has already been registered with this email address.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setErrorModal(null); changeMode('LOGIN'); }} className="w-full bg-primary text-on-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-tertiary font-bold">Login Instead</button>
            <button onClick={() => setErrorModal(null)} className="w-full border border-outline-variant text-on-surface-variant hover:text-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all">Cancel</button>
          </div>
        </>
      );
    } else if (errorModal === 'NOT_FOUND') {
      content = (
        <>
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl font-bold">person_off</span>
          </div>
          <h2 className="font-serif text-2xl text-primary font-bold mb-2">Account Not Found</h2>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
            No account was found with this email address.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setErrorModal(null); changeMode('REGISTER'); }} className="w-full bg-primary text-on-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-tertiary font-bold">Create Account</button>
            <button onClick={() => setErrorModal(null)} className="w-full border border-outline-variant text-on-surface-variant hover:text-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all">Try Again</button>
          </div>
        </>
      );
    } else if (errorModal === 'SUSPENDED') {
      content = (
        <>
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl font-bold">block</span>
          </div>
          <h2 className="font-serif text-2xl text-primary font-bold mb-2">Account Suspended</h2>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
            Your account has been temporarily suspended. Please contact the fitness studio administrator.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setErrorModal(null)} className="w-full border border-outline-variant text-on-surface-variant hover:text-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all">Close</button>
          </div>
        </>
      );
    } else if (errorModal === 'INVALID_PASSWORD') {
      content = (
        <>
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl font-bold">lock_open</span>
          </div>
          <h2 className="font-serif text-2xl text-primary font-bold mb-2">Incorrect Password</h2>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
            The password you entered is incorrect.<br/>Please try again or reset your password.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setErrorModal(null); changeMode('FORGOT_PASSWORD'); setResetEmail(email); }} className="w-full bg-primary text-on-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-tertiary font-bold">Forgot Password</button>
            <button onClick={() => setErrorModal(null)} className="w-full border border-outline-variant text-on-surface-variant hover:text-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all">Try Again</button>
          </div>
        </>
      );
    } else if (errorModal === 'INVALID_PASSWORD_ADMIN') {
      content = (
        <>
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl font-bold">gpp_maybe</span>
          </div>
          <h2 className="font-serif text-2xl text-primary font-bold mb-2">Incorrect Password</h2>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
            The administrator password is incorrect.<br/>Please try again.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setErrorModal(null); changeMode('FORGOT_PASSWORD'); setResetEmail(email); }} className="w-full bg-primary text-on-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-tertiary font-bold">Forgot Password</button>
            <button onClick={() => setErrorModal(null)} className="w-full border border-outline-variant text-on-surface-variant hover:text-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all">Try Again</button>
          </div>
        </>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <div className="relative w-full max-w-[400px] glass-card p-8 md:p-10 rounded-2xl border border-white/10 text-center">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-on-surface p-margin-mobile md:p-0 relative overflow-hidden bg-background">
      
      {/* Back Button */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-50">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center justify-center w-12 h-12 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-tertiary/50 hover:bg-tertiary/10 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-white/80 group-hover:text-tertiary transition-colors duration-300 transform group-hover:-translate-x-1">
            arrow_back
          </span>
        </button>
      </div>

      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-500" 
          style={{ 
            backgroundImage: `url('/images/img_a7ab72ca.png')` 
          }}
        ></div>
        {/* Ambient Gold Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gold-glow opacity-30 z-20 pointer-events-none"></div>
      </div>

      {renderErrorModal()}

      {/* Auth Card Container */}
      <main className="relative z-30 w-full max-w-[480px]">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-[38px] md:text-display-lg text-primary tracking-tighter mb-2 font-bold">
            Elevate Fitness
          </h1>
          <div className="h-[1px] w-12 bg-tertiary mx-auto opacity-60"></div>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass-card p-8 md:p-12 rounded-xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10 group-hover:bg-white/20 transition-all duration-500"></div>
          
          {isSuccess ? (
            <div ref={successRef} className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-tertiary/10 border border-tertiary/30 rounded-full flex items-center justify-center text-tertiary mx-auto animate-bounce">
                <span className="material-symbols-outlined text-3xl font-bold">check</span>
              </div>
              <h2 className="font-serif text-3xl text-primary font-bold">{successMessage.title}</h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                {successMessage.message}
              </p>
              {successMessage.extra && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-primary text-sm font-semibold">
                  {successMessage.extra}
                </div>
              )}
              <button 
                onClick={handleSuccessAction}
                className="w-full bg-primary text-on-primary font-sans text-body-md py-4 rounded-sm transition-all hover:bg-tertiary hover:text-on-tertiary hover:scale-[1.01] active:scale-95 duration-200 font-bold"
              >
                {successMessage.button}
              </button>
            </div>
          ) : resetVerificationSimulated ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-tertiary/10 border border-tertiary/30 rounded-full flex items-center justify-center text-tertiary mx-auto animate-pulse">
                <span className="material-symbols-outlined text-3xl font-bold">mark_email_read</span>
              </div>
              <h2 className="font-serif text-2xl text-primary font-bold">Verified</h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                A password reset request has been verified.
              </p>
            </div>
          ) : (
            <div ref={formContainerRef}>
              <div className="mb-8 text-center">
                <h2 className="font-serif text-headline-sm text-on-surface mb-2 font-semibold">
                  {authMode === 'LOGIN' && "Welcome Back"}
                  {authMode === 'REGISTER' && "Create Your Account"}
                  {authMode === 'FORGOT_PASSWORD' && "Account Recovery"}
                  {authMode === 'RESET_PASSWORD' && "Create New Password"}
                </h2>
                <p className="font-sans text-body-md text-on-surface-variant">
                  {authMode === 'LOGIN' && "Sign in to continue your fitness journey."}
                  {authMode === 'REGISTER' && "Join Elevate Fitness and begin your transformation."}
                  {authMode === 'FORGOT_PASSWORD' && "Enter your email to receive a secure reset link."}
                  {authMode === 'RESET_PASSWORD' && "Secure your account with a new password."}
                </p>
              </div>

              {regError && authMode === 'REGISTER' && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error text-xs rounded text-center font-bold">
                  {regError}
                </div>
              )}
              {resetError && authMode === 'RESET_PASSWORD' && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error text-xs rounded text-center font-bold">
                  {resetError}
                </div>
              )}

              {authMode === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Email Address</label>
                    <div className="relative">
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 text-sm placeholder:text-outline-variant/30 font-mono"
                        placeholder="name@elevate.com"
                      />
                      <span className={`material-symbols-outlined absolute right-0 top-3 text-sm transition-colors duration-300 ${focus ? 'text-tertiary' : 'text-outline-variant'}`}>mail</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Password</label>
                    <div className="relative">
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 text-sm placeholder:text-outline-variant/30"
                        placeholder="••••••••"
                      />
                      <span className="material-symbols-outlined absolute right-0 top-3 text-outline-variant text-sm">lock</span>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <button 
                      type="submit" 
                      className="w-full bg-primary text-on-primary font-sans text-body-md py-4 rounded-sm transition-all hover:bg-tertiary hover:text-on-tertiary hover:scale-[1.01] active:scale-95 duration-200 font-bold"
                    >
                      Login
                    </button>
                    
                    <div className="flex flex-col items-center gap-2 mt-4">
                      <button 
                        type="button" 
                        onClick={() => changeMode('FORGOT_PASSWORD')}
                        className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        Forgot Password?
                      </button>
                      <div className="text-sm text-on-surface-variant mt-2">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => changeMode('REGISTER')} className="text-tertiary hover:text-primary font-bold">
                          Create Account
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {authMode === 'REGISTER' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-on-surface focus:border-tertiary focus:ring-0 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-on-surface focus:border-tertiary focus:ring-0 text-sm font-mono"
                      placeholder="john@elevate.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-on-surface focus:border-tertiary focus:ring-0 text-sm font-mono"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Password</label>
                    <input 
                      required
                      type="password" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-on-surface focus:border-tertiary focus:ring-0 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Confirm Password</label>
                    <input 
                      required
                      type="password" 
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 text-on-surface focus:border-tertiary focus:ring-0 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-4 space-y-4">
                    <button 
                      type="submit" 
                      className="w-full bg-tertiary text-on-tertiary font-sans text-body-md py-4 rounded-sm transition-all hover:brightness-110 hover:scale-[1.01] active:scale-95 duration-200 font-bold uppercase tracking-widest text-xs"
                    >
                      Create Account
                    </button>
                    <div className="text-center text-sm text-on-surface-variant mt-4">
                      Already have an account?{' '}
                      <button type="button" onClick={() => changeMode('LOGIN')} className="text-tertiary hover:text-primary font-bold">
                        Login
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {authMode === 'FORGOT_PASSWORD' && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Registered Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 text-sm font-mono"
                      placeholder="name@elevate.com"
                    />
                  </div>
                  <div className="pt-6 space-y-4">
                    <button 
                      type="submit" 
                      className="w-full bg-primary text-on-primary font-sans text-body-md py-4 rounded-sm transition-all hover:bg-tertiary hover:text-on-tertiary hover:scale-[1.01] active:scale-95 duration-200 font-bold"
                    >
                      Continue
                    </button>
                    <div className="text-center text-sm text-on-surface-variant mt-4">
                      <button type="button" onClick={() => changeMode('LOGIN')} className="text-tertiary hover:text-primary font-bold">
                        Back to Login
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {authMode === 'RESET_PASSWORD' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">New Password</label>
                    <input 
                      required
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">Confirm Password</label>
                    <input 
                      required
                      type="password" 
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-3 text-on-surface focus:border-tertiary focus:ring-0 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-6">
                    <button 
                      type="submit" 
                      className="w-full bg-tertiary text-on-tertiary font-sans text-body-md py-4 rounded-sm transition-all hover:brightness-110 hover:scale-[1.01] active:scale-95 duration-200 font-bold uppercase tracking-widest text-xs"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Access Disclaimer */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
            <p className="font-sans text-[12px] text-on-surface-variant/60 leading-relaxed italic">
              Universal Portal: Members, Personal Trainers, and Administrative Staff access their respective dashboards through this secure gateway.
            </p>
          </div>

        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center opacity-60">
          <p className="font-label-caps text-[10px] tracking-widest text-on-surface-variant">
            Premium Wellness Ecosystem
          </p>
        </div>

      </main>
    </div>
  );
}
