import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockTrainers } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/Footer';
import gsap from 'gsap';

export default function UserDashboard() {
  const { user, logout, cancelBooking, rescheduleBooking, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState([]);
  
  const [bookingFilter, setBookingFilter] = useState('All');
  const bookingsListRef = useRef(null);

  // Modals state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    primaryGoal: '',
    homeClub: '',
    allergies: ''
  });

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  useEffect(() => {
    if (user?.bookings) {
      setActiveBookings(user.bookings);
    }
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        primaryGoal: user.primaryGoal || 'Sustainable Hypertrophy & Metabolic Efficiency',
        homeClub: user.homeClub || 'Elevate Prime, Mumbai South',
        allergies: user.allergies || 'None reported.'
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleCancelBookingClick = (id) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      cancelBooking(id);
    }
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (rescheduleBookingId && rescheduleDate && rescheduleTime) {
      rescheduleBooking(rescheduleBookingId, rescheduleDate, rescheduleTime);
      setShowReschedule(false);
      setRescheduleDate('');
      setRescheduleTime('');
    }
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setShowEditProfile(false);
  };

  // Animation state
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);
  const toastRef = useRef(null);
  const prevUnlockedRef = useRef([]);

  // Filter Bookings logic
  const now = new Date();
  const upcomingBookingsList = activeBookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    try {
      return new Date(`${b.date} ${b.time}`) > now;
    } catch { return true; }
  });
  const completedBookingsList = activeBookings.filter(b => b.status === "Completed");
  const cancelledBookingsList = activeBookings.filter(b => b.status === "Cancelled");

  let displayedBookings = activeBookings;
  if (bookingFilter === 'Upcoming') displayedBookings = upcomingBookingsList;
  if (bookingFilter === 'Completed') displayedBookings = completedBookingsList;
  if (bookingFilter === 'Cancelled') displayedBookings = cancelledBookingsList;

  useEffect(() => {
    if (bookingsListRef.current) {
      gsap.fromTo(bookingsListRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [bookingFilter, activeBookings]);

  // Derived calculations
  const confirmedBookings = upcomingBookingsList;
  const completedBookings = completedBookingsList;
  
  const nearestSession = confirmedBookings.length > 0 ? confirmedBookings[0] : null;

  const assignedCoach = nearestSession 
    ? mockTrainers.find(t => t.name === nearestSession.coach) || mockTrainers[0]
    : null;

  // Monthly goal logic (Only completed sessions in current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthSessions = completedBookings.filter(b => {
    if (!b.date) return false;
    const d = new Date(b.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  const targetSessions = 8;
  const goalProgress = Math.min(Math.round((currentMonthSessions / targetSessions) * 100), 100);

  // --- Achievement Calculation Logic ---
  const firstBookingUnlocked = completedBookings.length > 0;
  
  const discoverySessions = completedBookings.filter(b => b.type && b.type.includes('Discovery')).length;
  const discoveryExplorerUnlocked = discoverySessions >= 2;
  
  const uniquePrograms = new Set(completedBookings.map(b => b.program)).size;
  const programExplorerUnlocked = uniquePrograms >= 5;
  
  const strengthSessions = completedBookings.filter(b => b.program && b.program.includes("Strength & Conditioning")).length;
  const strengthSpecialistUnlocked = strengthSessions >= 10;
  
  const goalCrusherUnlocked = currentMonthSessions >= 8;
  
  const membershipTier = user?.membership?.status === 'Active' ? user.membership.type : 'Guest';
  
  // Animation hook
  useEffect(() => {
    const currentUnlocked = [];
    if (firstBookingUnlocked) currentUnlocked.push('first_booking');
    if (discoveryExplorerUnlocked) currentUnlocked.push('discovery');
    if (programExplorerUnlocked) currentUnlocked.push('program');
    if (strengthSpecialistUnlocked) currentUnlocked.push('strength');
    if (goalCrusherUnlocked) currentUnlocked.push('goal');
    currentUnlocked.push(membershipTier);

    if (prevUnlockedRef.current.length > 0) {
      const newlyUnlockedKeys = currentUnlocked.filter(key => !prevUnlockedRef.current.includes(key));
      if (newlyUnlockedKeys.length > 0) {
        let toastData = null;
        if (newlyUnlockedKeys.includes('first_booking')) toastData = { title: "First Booking", desc: "Completed your first successful booking." };
        else if (newlyUnlockedKeys.includes('discovery')) toastData = { title: "Discovery Explorer", desc: "Completed both complimentary Discovery Sessions." };
        else if (newlyUnlockedKeys.includes('program')) toastData = { title: "Program Explorer", desc: "Completed bookings from five different programs." };
        else if (newlyUnlockedKeys.includes('strength')) toastData = { title: "Strength Specialist", desc: "Built consistency through strength training." };
        else if (newlyUnlockedKeys.includes('goal')) toastData = { title: "Goal Crusher", desc: "Reached your monthly fitness goal." };
        else if (newlyUnlockedKeys.some(k => k.includes('Silver') || k.includes('Gold') || k.includes('Platinum'))) {
          toastData = { title: "Membership Elite", desc: "Upgraded to a premium membership tier." };
        }

        if (toastData) {
          setNewlyUnlocked(toastData);
        }
      }
    }
    prevUnlockedRef.current = currentUnlocked;
  }, [firstBookingUnlocked, discoveryExplorerUnlocked, programExplorerUnlocked, strengthSpecialistUnlocked, goalCrusherUnlocked, membershipTier]);

  useEffect(() => {
    if (newlyUnlocked && toastRef.current) {
      gsap.fromTo(toastRef.current, 
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
      
      const timer = setTimeout(() => {
        gsap.to(toastRef.current, { y: -20, opacity: 0, duration: 0.4, onComplete: () => setNewlyUnlocked(null) });
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  const totalAchievements = 6;
  const unlockedCount = [firstBookingUnlocked, discoveryExplorerUnlocked, programExplorerUnlocked, strengthSpecialistUnlocked, goalCrusherUnlocked, true].filter(Boolean).length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  const payments = user?.payments || [];

  // Calculate days remaining
  let daysRemaining = null;
  if (user?.membership?.expiryDate) {
    const expiry = new Date(user.membership.expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  let membershipBadge = { title: 'Guest Member', style: 'text-on-surface-variant bg-white/10 border-white/10' };
  if (membershipTier.includes('Silver')) membershipBadge = { title: 'Silver Elite', style: 'text-gray-300 bg-gray-500/20 border-gray-400/30 shadow-[0_0_15px_rgba(209,213,219,0.2)]' };
  if (membershipTier.includes('Gold')) membershipBadge = { title: 'Gold Collective', style: 'text-tertiary bg-tertiary/10 border-tertiary/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]' };
  if (membershipTier.includes('Platinum')) membershipBadge = { title: 'Platinum Elite', style: 'text-white bg-gradient-to-br from-tertiary to-primary border-tertiary shadow-[0_0_20px_rgba(212,175,55,0.4)]' };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col justify-between relative">
      
      {/* Dashboard Top Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-margin-desktop py-4 max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-2 font-sans text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <span className="font-serif text-2xl font-bold text-on-surface tracking-tighter">Elevate Fitness</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="font-label-caps text-[11px] text-on-surface font-semibold tracking-widest">
                {user?.full_name?.toUpperCase() || "MEMBER"}
              </span>
              <span className="text-[10px] text-tertiary uppercase tracking-tighter font-mono">
                {user?.membership?.status === "Active" ? user.membership.type : "Guest Account"}
              </span>
            </div>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border border-tertiary/30 bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-lg font-mono">
              {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            
            <button 
              onClick={handleLogout} 
              className="text-error/70 hover:text-error transition-colors p-2"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main dashboard content container */}
      <main className="pt-28 pb-16 max-w-container-max mx-auto px-6 md:px-margin-desktop space-y-stack-lg w-full flex-grow z-10">
        
        {/* Welcome Banner Section */}
        <section className="w-full">
          <div className="relative w-full h-[280px] rounded-xl overflow-hidden glass-card gold-glow flex flex-col justify-center px-8 md:px-12 border border-white/5">
            <div className="absolute inset-0 z-0 opacity-20">
              <img 
                className="w-full h-full object-cover" 
                alt="Gym Interior view"
                src="/images/img_67e2d12f.png" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10"></div>
            
            <div className="relative z-20 max-w-2xl">
              <span className="font-label-caps text-xs text-tertiary mb-2 block font-bold tracking-widest">MEMBER DASHBOARD</span>
              <h1 className="font-serif text-3xl md:text-display-lg-mobile lg:text-display-lg mb-4 text-primary font-bold">
                Welcome Back, {user?.full_name?.split(' ')[0] || 'Member'}
              </h1>
              <p className="font-sans text-sm md:text-body-lg text-on-surface-variant italic border-l-2 border-tertiary pl-6 py-1">
                "The difference between the difficult and the impossible is that the impossible takes a little longer."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-tertiary/10 border border-tertiary/30 text-tertiary rounded-full text-[10px] font-bold tracking-wider uppercase">
                  {user?.membership?.status === "Active" ? user.membership.type : 'Non-Member'}
                </span>
                <span className="text-on-surface-variant text-[11px]">
                  {user?.membership?.status === "Active" ? `Member since ${user.membership.activationDate.split(',')[1] || '2026'}` : 'Guest Account'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter">
          <div className="glass-card p-6 rounded-xl flex flex-col gap-2 border border-white/5 hover:border-tertiary/30 transition-all">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">ACTIVE MEMBERSHIP</span>
            <span className="font-serif text-xl md:text-[22px] text-primary font-semibold">
              {user?.membership?.status === "Active" ? user.membership.type : "None"}
            </span>
            <span className={`${user?.membership?.status === "Active" ? "text-tertiary" : "text-error"} text-xs flex items-center gap-1 mt-1 font-bold`}>
              <span className="material-symbols-outlined text-[15px]">
                {user?.membership?.status === "Active" ? "verified" : "cancel"}
              </span> 
              {user?.membership?.status === "Active" ? "Fully Active" : "No Active Membership"}
            </span>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col gap-2 border border-white/5 hover:border-tertiary/30 transition-all">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">UPCOMING SESSION</span>
            <span className="font-serif text-xl md:text-[22px] text-primary font-semibold">
              {nearestSession ? nearestSession.date : "No sessions"}
            </span>
            <span className="text-on-surface-variant text-xs mt-1">
              {nearestSession ? nearestSession.program : "Book a session to get started"}
            </span>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col gap-2 border border-white/5 hover:border-tertiary/30 transition-all">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">ASSIGNED COACH</span>
            <span className="font-serif text-xl md:text-[22px] text-primary font-semibold">
              {assignedCoach ? assignedCoach.name : "None"}
            </span>
            <span className="text-on-surface-variant text-xs mt-1">
              {assignedCoach ? assignedCoach.specialization : "No trainer assigned yet"}
            </span>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col gap-2 border border-white/5 hover:border-tertiary/30 transition-all">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">MONTHLY GOAL</span>
            <span className="font-serif text-xl md:text-[22px] text-primary font-semibold">{goalProgress}% Complete</span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden flex items-center justify-between">
              <div 
                className="bg-tertiary h-full rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1">{currentMonthSessions} / {targetSessions} Sessions</span>
          </div>
          <div className="glass-card p-6 rounded-xl flex flex-col gap-2 border border-white/5 hover:border-tertiary/30 transition-all">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">TOTAL SAVINGS</span>
            <span className="font-serif text-xl md:text-[22px] text-tertiary font-bold">
              ₹{user?.totalSavings?.toLocaleString('en-IN') || 0}
            </span>
            <span className="text-on-surface-variant text-xs mt-1">
              From Membership Discounts
            </span>
          </div>
        </section>

        {/* Two Column Layout Block */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Left Column: Bookings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="font-serif text-2xl font-bold text-primary">My Bookings</h2>
              <Link to="/book" className="text-tertiary font-label-caps text-[10px] border-b border-tertiary/30 hover:border-tertiary pb-1 transition-all uppercase tracking-widest font-bold">
                Book Session
              </Link>
            </div>
            
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
              {['All', 'Upcoming', 'Completed', 'Cancelled'].map(filter => {
                const count = filter === 'All' ? activeBookings.length : 
                              filter === 'Upcoming' ? upcomingBookingsList.length : 
                              filter === 'Completed' ? completedBookingsList.length : 
                              cancelledBookingsList.length;
                return (
                  <button 
                    key={filter}
                    onClick={() => setBookingFilter(filter)}
                    className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full transition-all border whitespace-nowrap ${
                      bookingFilter === filter 
                        ? 'bg-tertiary/10 text-tertiary border-tertiary' 
                        : 'bg-transparent text-on-surface-variant border-tertiary/30 hover:border-tertiary/60'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                )
              })}
            </div>

            <div className="space-y-4" ref={bookingsListRef}>
              {displayedBookings.length === 0 ? (
                <div className="glass-card p-8 rounded-xl text-center border border-white/5">
                  <p className="text-on-surface-variant text-sm">No {bookingFilter.toLowerCase()} bookings found.</p>
                </div>
              ) : (
                displayedBookings.map((b) => (
                  <div key={b.id} className="glass-card p-6 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-6 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center bg-white/5 w-16 h-16 rounded-lg border border-white/5 shrink-0">
                        <span className="text-tertiary font-bold text-xl font-mono">{b.date.includes(' ') ? b.date.split(' ')[1].replace(',', '') : b.date.substring(8, 10)}</span>
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold">{b.date.includes(' ') ? b.date.split(' ')[0] : 'DAY'}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-sans font-bold text-primary">{b.program}</h4>
                          {b.type && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              b.type.includes('Discovery') 
                                ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' 
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {b.type}
                            </span>
                          )}
                        </div>
                        <p className="text-on-surface-variant text-sm pt-1">{b.time} with {b.coach} • 60 Min</p>
                        <p className="text-[10px] font-mono text-outline-variant mt-1">ID: {b.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 text-[9px] font-label-caps tracking-widest uppercase font-bold rounded border ${
                        b.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        b.status === 'Cancelled' ? 'bg-error/10 text-error border-error/20' : 
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {b.status}
                      </span>
                      
                      <div className="flex gap-3">
                        {b.status === "Confirmed" && (
                          <>
                            <button 
                              onClick={() => handleCancelBookingClick(b.id)}
                              className="px-4 py-2 text-[10px] font-bold text-on-surface-variant border border-white/10 rounded-sm hover:bg-white/5 transition-colors uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => {
                                setRescheduleBookingId(b.id);
                                setShowReschedule(true);
                              }}
                              className="px-4 py-2 text-[10px] font-bold text-on-primary bg-primary rounded-sm hover:bg-tertiary hover:text-on-tertiary transition-all uppercase tracking-wider"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                        {b.status === "Completed" && (
                          <>
                            <button 
                              onClick={() => alert(`Details for booking ${b.id}\nProgram: ${b.program}\nCoach: ${b.coach}\nTime: ${b.date} ${b.time}`)}
                              className="px-4 py-2 text-[10px] font-bold text-on-surface-variant border border-white/10 rounded-sm hover:bg-white/5 transition-colors uppercase tracking-wider"
                            >
                              View Details
                            </button>
                            <Link 
                              to="/book"
                              className="px-4 py-2 text-[10px] font-bold text-tertiary border border-tertiary/30 bg-tertiary/10 rounded-sm hover:bg-tertiary hover:text-on-tertiary transition-all uppercase tracking-wider text-center flex items-center justify-center"
                            >
                              Book Again
                            </Link>
                          </>
                        )}
                        {b.status === "Cancelled" && (
                          <Link 
                            to="/book"
                            className="px-4 py-2 text-[10px] font-bold text-tertiary border border-tertiary/30 bg-tertiary/10 rounded-sm hover:bg-tertiary hover:text-on-tertiary transition-all uppercase tracking-wider text-center flex items-center justify-center"
                          >
                            Book Again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Coach Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="glass-card rounded-xl overflow-hidden border border-white/5">
              {assignedCoach ? (
                <>
                  <div className="relative h-60 bg-surface-container">
                    <img 
                      className="w-full h-full object-cover object-top" 
                      alt={`${assignedCoach.name} headshot`}
                      src={assignedCoach.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                      <h3 className="font-serif text-2xl text-primary font-bold">{assignedCoach.name}</h3>
                      <p className="text-tertiary font-label-caps text-[9px] tracking-widest font-bold uppercase">{assignedCoach.title}</p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] text-on-surface-variant uppercase font-semibold">Specialization</span>
                          <p className="text-xs text-primary">{assignedCoach.specialization}</p>
                        </div>
                        <div>
                          <span className="block text-[9px] text-on-surface-variant uppercase font-semibold">Experience</span>
                          <p className="text-xs text-primary">{assignedCoach.experience} Elite Coaching</p>
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed italic">
                        "{assignedCoach.bio || 'Focusing on biomechanical efficiency and sustainable muscle growth. My philosophy revolves around longevity and functional peak performance.'}"
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-6">
                      <div>
                        <span className="block text-[9px] text-on-surface-variant uppercase">NEXT WORKOUT</span>
                        <span className="text-xs font-semibold text-primary">{nearestSession?.date || 'N/A'}</span>
                      </div>
                      <button 
                        onClick={() => alert(`Opening mock chat concierge with Coach ${assignedCoach.name}...`)}
                        className="px-6 py-2 bg-primary text-on-primary font-label-caps text-[10px] tracking-wider rounded-sm hover:bg-tertiary hover:text-on-tertiary transition-all font-bold uppercase"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  <span className="material-symbols-outlined text-4xl text-white/10 mb-4">person_off</span>
                  <p className="text-on-surface-variant text-sm">No trainer assigned yet.<br/>Book a session to get matched with an elite coach.</p>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* Milestones & Achievements (Replaces Weekly Performance Graph) */}
        <section className="glass-card rounded-xl p-8 space-y-8 border border-white/5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary">Milestones &amp; Achievements</h2>
              <p className="text-on-surface-variant text-xs mt-1">Your recent accomplishments and unlocked performance badges.</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-tertiary font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                Achievements Unlocked: {unlockedCount} / {totalAchievements}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                Completion: {completionPercentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            
            {/* 1. First Booking */}
            <div className={`group flex flex-col p-6 bg-white/5 rounded-xl border border-white/5 gap-4 relative overflow-hidden transition-all duration-300 ${firstBookingUnlocked ? 'border-tertiary/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]' : 'opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${firstBookingUnlocked ? 'bg-tertiary/10 border border-tertiary/30 text-tertiary shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/10 border border-white/10 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{firstBookingUnlocked ? 'check_circle' : 'lock'}</span>
                </div>
                {firstBookingUnlocked && <span className="text-[9px] font-label-caps uppercase text-tertiary bg-tertiary/10 px-2 py-1 rounded">Unlocked</span>}
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm mb-1">First Booking</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Complete your first successful booking.</p>
                {!firstBookingUnlocked && (
                  <p className="text-[10px] text-on-surface-variant font-mono mt-3">No completed bookings yet.</p>
                )}
              </div>
            </div>

            {/* 2. Discovery Explorer */}
            <div className={`group flex flex-col p-6 bg-white/5 rounded-xl border border-white/5 gap-4 relative overflow-hidden transition-all duration-300 ${discoveryExplorerUnlocked ? 'border-tertiary/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]' : 'opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${discoveryExplorerUnlocked ? 'bg-tertiary/10 border border-tertiary/30 text-tertiary shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/10 border border-white/10 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{discoveryExplorerUnlocked ? 'explore' : 'lock'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">{discoverySessions} / 2</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm mb-1">Discovery Explorer</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">Complete both complimentary Discovery Sessions.</p>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden flex items-center">
                  <div className={`h-full rounded-full ${discoveryExplorerUnlocked ? 'bg-tertiary' : 'bg-white/40'}`} style={{ width: `${Math.min((discoverySessions/2)*100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* 3. Program Explorer */}
            <div className={`group flex flex-col p-6 bg-white/5 rounded-xl border border-white/5 gap-4 relative overflow-hidden transition-all duration-300 ${programExplorerUnlocked ? 'border-tertiary/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]' : 'opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${programExplorerUnlocked ? 'bg-tertiary/10 border border-tertiary/30 text-tertiary shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/10 border border-white/10 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{programExplorerUnlocked ? 'category' : 'lock'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">{uniquePrograms} / 5</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm mb-1">Program Explorer</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">Experience different training programs.</p>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden flex items-center">
                  <div className={`h-full rounded-full ${programExplorerUnlocked ? 'bg-tertiary' : 'bg-white/40'}`} style={{ width: `${Math.min((uniquePrograms/5)*100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* 4. Strength Specialist */}
            <div className={`group flex flex-col p-6 bg-white/5 rounded-xl border border-white/5 gap-4 relative overflow-hidden transition-all duration-300 ${strengthSpecialistUnlocked ? 'border-tertiary/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]' : 'opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${strengthSpecialistUnlocked ? 'bg-tertiary/10 border border-tertiary/30 text-tertiary shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/10 border border-white/10 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{strengthSpecialistUnlocked ? 'fitness_center' : 'lock'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">{strengthSessions} / 10</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm mb-1">Strength Specialist</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">Build consistency through strength training.</p>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden flex items-center">
                  <div className={`h-full rounded-full ${strengthSpecialistUnlocked ? 'bg-tertiary' : 'bg-white/40'}`} style={{ width: `${Math.min((strengthSessions/10)*100, 100)}%` }}></div>
                </div>
                {!strengthSpecialistUnlocked && (
                  <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 flex items-center justify-center p-4 transition-opacity text-center backdrop-blur-sm">
                    <p className="text-[11px] text-white font-semibold tracking-wide">Complete 10 Strength &amp; Conditioning sessions to unlock this achievement.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Goal Crusher */}
            <div className={`group flex flex-col p-6 bg-white/5 rounded-xl border border-white/5 gap-4 relative overflow-hidden transition-all duration-300 ${goalCrusherUnlocked ? 'border-tertiary/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]' : 'opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${goalCrusherUnlocked ? 'bg-tertiary/10 border border-tertiary/30 text-tertiary shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/10 border border-white/10 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{goalCrusherUnlocked ? 'track_changes' : 'lock'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">{currentMonthSessions} / 8</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm mb-1">Goal Crusher</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">Reach your monthly fitness goal.</p>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden flex items-center">
                  <div className={`h-full rounded-full ${goalCrusherUnlocked ? 'bg-tertiary' : 'bg-white/40'}`} style={{ width: `${Math.min((currentMonthSessions/8)*100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* 6. Membership Elite */}
            <div className="group flex flex-col p-6 bg-white/5 rounded-xl border border-tertiary/20 gap-4 relative overflow-hidden shadow-[0_4px_20px_rgba(212,175,55,0.05)] transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <span className="material-symbols-outlined">diamond</span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${membershipBadge.style}`}>
                    {membershipBadge.title}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm mb-1">Membership Elite</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">This achievement represents your highest membership.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Membership Details & Recent Invoices */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          
          {/* Membership Info */}
          <div className="glass-card p-8 rounded-xl flex flex-col justify-between border border-white/5">
            {user?.membership && user.membership.status === 'Active' ? (
              <div>
                <span className="font-label-caps text-[10px] text-on-surface-variant mb-4 block font-bold tracking-widest">MEMBERSHIP ACTIVE</span>
                <h3 className="font-serif text-[32px] text-primary font-bold mb-2">{user.membership.type} Plan</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  {user.membership.type.includes("Platinum") ? (
                    "Unlimited access to all collective clubs, private lounges, recovery suites, and 4 specialized coach reviews monthly."
                  ) : user.membership.type.includes("Gold") ? (
                    "Premium access to collective clubs, group fitness classes, and 2 private training sessions monthly."
                  ) : (
                    "Access to premium cardio and strength areas, baseline biometrics, steam room, and lockers."
                  )}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-white/5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Activation Date</span>
                    <span className="font-semibold text-primary">{user.membership.activationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Expiry Date</span>
                    <span className="font-semibold text-primary">{user.membership.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Days Remaining</span>
                    <span className={`font-bold ${daysRemaining <= 7 ? 'text-error' : 'text-primary'}`}>
                      {daysRemaining !== null ? `${daysRemaining} Days` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Membership Status</span>
                    <span className="text-tertiary font-bold uppercase text-xs tracking-wider">
                      {user.membership.status}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => alert('Renewal workflow triggered.')}
                  disabled={daysRemaining > 7}
                  className="mt-8 w-full py-4 bg-tertiary text-on-tertiary font-label-caps text-xs tracking-widest uppercase font-bold rounded hover:brightness-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:brightness-100"
                >
                  {daysRemaining > 7 ? 'Auto-Renewal Active' : 'Renew Membership'}
                </button>
              </div>
            ) : (
              <div>
                <span className="font-label-caps text-[10px] text-on-surface-variant mb-4 block font-bold tracking-widest">DISCOVERY SESSIONS</span>
                <h3 className="font-serif text-[32px] text-primary font-bold mb-2">
                  Remaining: {user?.remainingTrials ?? 2} / 2
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  {user?.remainingTrials === 2 ? (
                    "You have 2 complimentary trial sessions available. Experience our premium facilities and dedicated coaches."
                  ) : user?.remainingTrials === 1 ? (
                    "You have 1 complimentary trial session left. Use it to book a longevity scan or a private coaching session."
                  ) : (
                    "You have used both of your complimentary trial sessions. Purchase a subscription to unlock full member access."
                  )}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-white/5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Status</span>
                    <span className={`font-bold uppercase text-xs tracking-wider ${
                      user?.remainingTrials === 2 
                        ? 'text-tertiary' 
                        : user?.remainingTrials === 1 
                          ? 'text-primary' 
                          : 'text-error'
                    }`}>
                      {user?.remainingTrials > 0 ? "Available" : "Completed"}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/memberships')}
                  className="mt-8 w-full py-4 bg-primary text-on-primary hover:bg-tertiary hover:text-on-tertiary font-label-caps text-xs tracking-widest uppercase font-bold rounded transition-all duration-200"
                >
                  Become a Member
                </button>
              </div>
            )}
          </div>

          {/* Billing Ledger */}
          <div className="glass-card p-8 rounded-xl border border-white/5">
            <span className="font-label-caps text-[10px] text-on-surface-variant mb-6 block font-bold tracking-widest">RECENT BILLING HISTORY</span>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No payment history available.</p>
              ) : (
                payments.map((invoice, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/5 last:border-b-0 gap-4 sm:gap-0">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">{invoice.type || 'Payment'}</span>
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-primary border border-white/10 px-2 py-0.5 rounded">{invoice.status || 'Paid'}</span>
                      </div>
                      <span className="font-semibold text-sm text-primary">{invoice.description || 'Elevate Fitness Service'}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">{invoice.date} • {invoice.method || 'Card'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <span className="font-bold font-mono text-sm text-primary">₹{invoice.amount?.toLocaleString('en-IN') || '0'}</span>
                      <button className="text-tertiary hover:text-primary transition-colors flex p-1 border border-white/10 rounded hover:border-tertiary">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {payments.length > 0 && (
              <button className="mt-6 text-[10px] font-label-caps font-bold text-on-surface-variant hover:text-tertiary transition-colors uppercase tracking-widest">
                View Full Billing Ledger
              </button>
            )}
          </div>

        </section>

        {/* Member Profile info */}
        <section className="glass-card rounded-xl p-8 border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-tertiary/30 bg-tertiary/10 text-tertiary flex items-center justify-center text-2xl font-mono">
                <span className="font-mono text-2xl font-bold text-tertiary">{user?.full_name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-primary font-bold">{user?.full_name || "Member Name"}</h2>
                <p className="text-on-surface-variant text-xs md:text-sm">{user?.email || "email@example.com"} • {user?.phone_number || 'No phone added'}</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={() => setShowEditProfile(true)} className="flex-grow sm:flex-none px-6 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/5 transition-all">Edit Profile</button>
              <button className="flex-grow sm:flex-none px-6 py-3 bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/10 transition-all">Settings</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pt-8 border-t border-white/5 text-sm">
            <div className="space-y-1">
              <span className="block text-[9px] text-tertiary uppercase tracking-widest font-bold">PRIMARY VITALITY GOAL</span>
              <p className="text-primary font-medium">{user?.primaryGoal || 'General Fitness'}</p>
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] text-tertiary uppercase tracking-widest font-bold">HOME COLLECTIVE CLUB</span>
              <p className="text-primary font-medium">{user?.homeClub || 'Chennai'}</p>
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] text-tertiary uppercase tracking-widest font-bold">ALLERGIES / LIMITATIONS</span>
              <p className="text-primary font-medium">{user?.allergies || 'None reported'}</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* --- MODALS --- */}

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="font-serif text-xl text-primary font-bold mb-4">Reschedule Session</h3>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">New Date</label>
                <input 
                  type="date" 
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">New Time</label>
                <input 
                  type="time" 
                  required
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowReschedule(false)} className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded hover:text-primary transition-all text-xs font-bold uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-tertiary text-on-tertiary rounded hover:brightness-110 transition-all text-xs font-bold uppercase tracking-widest">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] glass-card p-8 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl text-primary font-bold mb-6">Edit Profile</h3>
            <form onSubmit={handleEditProfileSubmit} className="space-y-5">
              
              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">Email Address</label>
                <input 
                  type="email" 
                  readOnly
                  value={user?.email || ''}
                  className="w-full bg-black/10 border border-white/5 rounded px-3 py-2 text-on-surface-variant text-sm cursor-not-allowed"
                />
                <span className="text-[9px] text-on-surface-variant italic mt-1 block">Email address cannot be changed.</span>
              </div>

              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">Primary Fitness Goal</label>
                <select 
                  value={editForm.primaryGoal}
                  onChange={(e) => setEditForm({...editForm, primaryGoal: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Endurance">Endurance</option>
                  <option value="General Fitness">General Fitness</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">Home Club</label>
                <select 
                  value={editForm.homeClub}
                  onChange={(e) => setEditForm({...editForm, homeClub: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm"
                >
                  <option value="Chennai">Chennai</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Trichy">Trichy</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block mb-1">Allergies or Limitations (Optional)</label>
                <input 
                  type="text" 
                  value={editForm.allergies}
                  onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-primary focus:border-tertiary focus:ring-0 text-sm"
                  placeholder="e.g. Asthma, Knee Injury, None"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded hover:text-primary transition-all text-xs font-bold uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-on-primary rounded hover:bg-tertiary transition-all text-xs font-bold uppercase tracking-widest">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GSAP Animated Achievement Toast */}
      {newlyUnlocked && (
        <div 
          ref={toastRef} 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card bg-surface/90 border border-tertiary/40 p-4 pr-10 rounded-xl shadow-[0_10px_40px_rgba(212,175,55,0.2)] flex items-center gap-4 min-w-[300px]"
        >
          <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          </div>
          <div>
            <span className="text-[10px] font-label-caps text-tertiary uppercase tracking-widest font-bold">Achievement Unlocked</span>
            <h4 className="font-serif text-lg font-bold text-primary">{newlyUnlocked.title}</h4>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">{newlyUnlocked.desc}</p>
          </div>
          <button 
            onClick={() => setNewlyUnlocked(null)}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

    </div>
  );
}
