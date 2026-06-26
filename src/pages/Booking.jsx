import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import Footer from '../components/Footer';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, startOfDay, addDays, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

const TIER_LEVELS = {
  'Guest': 0,
  'Silver Suite': 1,
  'Gold Collective': 2,
  'Platinum Elite': 3
};

const ITEM_TIER_LEVELS = {
  'Standard': 0,
  'Silver': 1,
  'Gold': 2,
  'Platinum': 3
};

const DISCOUNTS = {
  'Guest': 0,
  'Silver Suite': 0.05,
  'Gold Collective': 0.10,
  'Platinum Elite': 0.15
};

export default function Booking() {
  const {
    booking,
    currentStep,
    setCurrentStep,
    selectProgram,
    selectTrainer,
    selectSchedule,
    setDetails,
    resetBooking
  } = useBooking();

  const { programs: rawPrograms, trainers: rawTrainers } = useAppData();
  const mockPrograms = rawPrograms.filter(p => p.availability !== 'Unavailable');
  const mockTrainers = rawTrainers.filter(t => t.availability !== 'On Leave');
  const { user, isAuthenticated, addBooking } = useAuth();
  const navigate = useNavigate();
  const stepContainerRef = useRef(null);
  
  // Modals
  const [showTrialBlock, setShowTrialBlock] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState({ text: '', tier: '' });

  // Payment State
  const [paymentName, setPaymentName] = useState('');
  const [paymentCard, setPaymentCard] = useState('');
  const [paymentExpiry, setPaymentExpiry] = useState('');
  const [paymentCvc, setPaymentCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Auto-fill member details strictly from current user
  useEffect(() => {
    if (user) {
      setDetails({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    } else {
      setDetails({ name: '', email: '', phone: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/book' } });
    }
  }, [isAuthenticated, navigate]);

  const hasActiveMembership = user?.membership && user.membership.status === 'Active';
  const hasTrialsLeft = user?.remainingTrials > 0;
  const userTier = hasActiveMembership ? user.membership.type : 'Guest';
  const userTierLevel = TIER_LEVELS[userTier];
  const discountRate = DISCOUNTS[userTier];

  // Pricing structure
  const subtotal = booking.program ? booking.program.price : 0;
  const serviceFee = booking.program ? 20 : 0; // Flat luxury service fee
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal - discountAmount + serviceFee;

  if (user && user.status === 'Suspended') {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/75 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center z-0 scale-105"
            style={{
              backgroundImage: `url('/images/img_a7ab72ca.png')`
            }}
          ></div>
        </div>

        <div className="relative z-30 w-full max-w-[500px] glass-card p-8 md:p-10 rounded-2xl border border-error/20 text-center space-y-6">
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto">
            <span className="material-symbols-outlined text-3xl font-bold">block</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl text-error font-bold">Account Suspended</h2>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Your account has been temporarily suspended. You cannot make new bookings at this time. Please contact the administrator.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-surface-container text-on-surface font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-white/10 font-bold duration-200 border border-white/10"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Membership & Trial Block check
  if (isAuthenticated && !hasActiveMembership && !hasTrialsLeft && showTrialBlock && currentStep !== 7) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/75 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center z-0 scale-105"
            style={{
              backgroundImage: `url('/images/img_a7ab72ca.png')`
            }}
          ></div>
        </div>

        <div className="relative z-30 w-full max-w-[500px] glass-card p-8 md:p-10 rounded-2xl border border-white/10 text-center space-y-6">
          <div className="w-16 h-16 bg-tertiary/10 border border-tertiary/30 rounded-full flex items-center justify-center text-tertiary mx-auto">
            <span className="material-symbols-outlined text-3xl font-bold">hourglass_empty</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl text-primary font-bold">Your Complimentary Discovery Sessions Have Been Used</h2>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Become a member today to continue booking sessions and unlock exclusive benefits.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => navigate('/memberships')}
              className="w-full bg-primary text-on-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-tertiary hover:text-on-tertiary font-bold duration-200"
            >
              Become a Member
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTrialBlock(false);
                navigate('/');
              }}
              className="w-full border border-outline-variant text-on-surface-variant hover:text-primary font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-white/5 duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableTrainers = booking.program
    ? mockTrainers.filter(trainer => trainer.category.includes(booking.program.category))
    : mockTrainers;

  useEffect(() => {
    if (stepContainerRef.current) {
      gsap.fromTo(stepContainerRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentStep]);

  const handleItemClick = (item, type) => {
    const itemLevel = ITEM_TIER_LEVELS[item.tier];
    if (userTierLevel < itemLevel) {
      setUpgradeMessage({
        text: `This ${type} is available exclusively for ${item.tier} Members.`,
        tier: item.tier
      });
      setShowUpgradeModal(true);
      return;
    }
    
    if (type === 'program') selectProgram(item);
    if (type === 'trainer') selectTrainer(item);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !booking.program) return;
    if (currentStep === 2 && !booking.trainer) return;
    if (currentStep === 3 && (!booking.date || !booking.time)) return;
    if (currentStep === 4 && (!booking.name || !booking.email)) return;

    if (currentStep === 6) {
      if (!paymentName.trim() || !paymentCard.trim() || !paymentExpiry.trim() || !paymentCvc.trim()) {
        setPaymentError("Please fill in all required payment details.");
        return;
      }
      setPaymentError('');

      addBooking({
        date: booking.date,
        time: booking.time,
        program: booking.program?.title,
        coach: booking.trainer?.name,
        transaction: {
          amount: total,
          savings: discountAmount
        }
      });
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col justify-between">
      {/* Booking Header Bar */}
      <nav className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="flex justify-between items-center h-20 px-6 md:px-margin-desktop max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-4">
            <span className="font-serif text-2xl font-bold text-primary tracking-tighter">Elevate Fitness</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">
              Exit Wizard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main wizard framework */}
      <main className="pt-28 pb-16 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full flex-grow z-10">

        {/* Booking Hero (Hidden on confirmed screen) */}
        {currentStep < 7 && (
          <header className="mb-8 text-center">
            <h1 className="font-serif text-3xl md:text-[48px] font-bold text-primary mb-2">Book Your <span className="text-tertiary italic">Wellness Session</span></h1>
            
            {/* Membership Benefits Banner */}
            {hasActiveMembership && (
              <div className="mt-4 inline-flex flex-wrap justify-center items-center gap-3 md:gap-6 py-2 px-6 bg-tertiary/10 border border-tertiary/20 rounded-full">
                <span className="text-tertiary font-serif font-bold">{userTier}</span>
                <span className="text-white/20">|</span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-tertiary">check</span> 
                  {discountRate * 100}% Discount Applied
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-tertiary">check</span> 
                  {userTier.split(' ')[0]} Programs Unlocked
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-tertiary">check</span> 
                  {userTierLevel >= 2 ? 'Priority' : 'Standard'} Slots Enabled
                </span>
              </div>
            )}
          </header>
        )}

        {/* Step Progress Tracker (1-7) (Hidden on confirmed screen) */}
        {currentStep < 7 && (
          <section className="mb-12 relative overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex justify-between items-center min-w-[750px] px-2">
              {[
                { step: 1, label: 'Program' },
                { step: 2, label: 'Trainer' },
                { step: 3, label: 'Schedule' },
                { step: 4, label: 'Details' },
                { step: 5, label: 'Review' },
                { step: 6, label: 'Payment' },
                { step: 7, label: 'Confirmed' }
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <div
                    onClick={() => {
                      if (item.step < currentStep) setCurrentStep(item.step);
                    }}
                    className={`flex flex-col items-center gap-2 shrink-0 ${item.step < currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-mono text-sm font-bold ${currentStep === item.step
                      ? 'border-tertiary text-tertiary'
                      : currentStep > item.step
                        ? 'border-tertiary bg-tertiary text-on-tertiary'
                        : 'border-outline-variant text-on-surface-variant'
                      }`}>
                      {currentStep > item.step ? (
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      ) : item.step}
                    </div>
                    <span className={`font-sans text-[10px] uppercase tracking-wider ${currentStep === item.step ? 'text-tertiary font-bold' : 'text-on-surface-variant'}`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < 6 && (
                    <div className={`flex-grow h-[1px] mx-2 ${currentStep > item.step ? 'bg-tertiary' : 'bg-outline-variant/30'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {/* Steps Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

          {/* Left Column: Form Steps */}
          <div className={`${currentStep < 7 ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8`} ref={stepContainerRef}>

            {/* Step 1: Program Portfolio */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl md:text-headline-sm text-primary font-semibold">Choose Your Discipline</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockPrograms.map((prog) => {
                    const isLocked = userTierLevel < ITEM_TIER_LEVELS[prog.tier];
                    return (
                      <div
                        key={prog.id}
                        onClick={() => handleItemClick(prog, 'program')}
                        className={`relative glass-card p-3 rounded-xl border transition-all cursor-pointer group flex items-center gap-4 overflow-hidden ${
                          booking.program?.id === prog.id ? 'border-tertiary bg-tertiary/5' : 'border-white/5 hover:border-primary/20'
                        }`}
                      >
                        <div className={`w-20 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0 ${isLocked ? 'blur-[2px]' : ''}`}>
                          <img alt={prog.title} className="w-full h-full object-cover" src={prog.image} />
                        </div>
                        <div className={`flex-grow min-w-0 ${isLocked ? 'opacity-60 blur-[1px]' : ''}`}>
                          <h3 className="font-serif text-sm font-semibold truncate text-primary group-hover:text-tertiary transition-colors">{prog.title}</h3>
                          <div className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase tracking-wider pt-1">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {prog.duration}</span>
                            <span className="text-tertiary font-bold">₹{prog.price}</span>
                          </div>
                        </div>
                        
                        {isLocked ? (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-surface border border-tertiary/30 p-2 rounded-full shadow-lg">
                              <span className="material-symbols-outlined text-tertiary text-lg">lock</span>
                            </div>
                          </div>
                        ) : (
                          <div className="shrink-0 pr-2">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${booking.program?.id === prog.id ? 'border-tertiary' : 'border-outline'}`}>
                              {booking.program?.id === prog.id && <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Trainer Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl md:text-headline-sm text-primary font-semibold">Select Your Dedicated Coach</h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Showing coaches specializing in <span className="text-tertiary font-bold uppercase">{booking.program?.category}</span>.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTrainers.map((coach) => {
                    const isLocked = userTierLevel < ITEM_TIER_LEVELS[coach.tier];
                    return (
                      <div
                        key={coach.id}
                        onClick={() => handleItemClick(coach, 'trainer')}
                        className={`relative glass-card p-4 rounded-xl border transition-all cursor-pointer group flex gap-4 overflow-hidden ${
                          booking.trainer?.id === coach.id ? 'border-tertiary bg-tertiary/5' : 'border-white/5 hover:border-primary/20'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden bg-surface-container shrink-0 border border-white/5 ${isLocked ? 'blur-[2px]' : ''}`}>
                          <img alt={coach.name} className="w-full h-full object-cover" src={coach.image} />
                        </div>
                        <div className={`flex-grow min-w-0 flex flex-col justify-between ${isLocked ? 'opacity-60 blur-[1px]' : ''}`}>
                          <div>
                            <h3 className="font-serif text-sm font-semibold truncate text-primary group-hover:text-tertiary transition-colors">{coach.name}</h3>
                            <p className="text-[10px] text-tertiary uppercase tracking-wider font-semibold">{coach.title}</p>
                            <p className="text-on-surface-variant text-[11px] mt-1 line-clamp-1">{coach.specialization}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-on-surface-variant">Rating: {(coach.rating || 5.0).toFixed(1)} ⭐</span>
                            {!isLocked && <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">Select</span>}
                          </div>
                        </div>

                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-surface border border-tertiary/30 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                              <span className="material-symbols-outlined text-tertiary text-sm">lock</span>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-tertiary">{coach.tier} Exclusive</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Time Scheduling */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl md:text-headline-sm text-primary font-semibold">Select Preferred Date &amp; Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Interactive Professional Calendar */}
                  <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4 flex justify-center">
                    <style>{`
                      .rdp {
                        --rdp-cell-size: 40px;
                        --rdp-accent-color: #D4AF37;
                        --rdp-background-color: rgba(212, 175, 55, 0.1);
                        --rdp-accent-color-dark: #B8860B;
                        --rdp-background-color-dark: rgba(212, 175, 55, 0.2);
                        --rdp-outline: 2px solid var(--rdp-accent-color);
                        --rdp-outline-selected: 2px solid var(--rdp-accent-color);
                        margin: 0;
                        font-family: inherit;
                      }
                      .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                        background-color: var(--rdp-accent-color);
                        color: #121212;
                        font-weight: bold;
                      }
                      .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                        background-color: var(--rdp-background-color);
                      }
                      .rdp-day_today {
                        font-weight: bold;
                        border: 1px solid var(--rdp-accent-color);
                      }
                      .rdp-head_cell {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        color: rgba(255,255,255,0.6);
                      }
                      .rdp-nav_button {
                        color: #D4AF37;
                      }
                    `}</style>
                    <DayPicker
                      mode="single"
                      selected={booking.date ? new Date(booking.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setDetails({ date: format(date, 'MMM d, yyyy'), time: '' });
                        }
                      }}
                      fromDate={startOfDay(new Date())}
                      toDate={addDays(startOfDay(new Date()), 90)}
                      disabled={[
                        { before: startOfDay(new Date()) },
                        { dayOfWeek: [0] } // Disable Sundays
                      ]}
                      defaultMonth={startOfDay(new Date())}
                      fromMonth={startOfDay(new Date())}
                      className="text-on-surface"
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-4">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-bold">Available Slots</span>
                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        const selectedDate = booking.date ? new Date(booking.date) : null;
                        if (!selectedDate) {
                          return <div className="col-span-2 py-8 text-center text-on-surface-variant text-sm font-sans border border-white/5 rounded-lg glass-card">Select a date to view available slots.</div>;
                        }

                        const isToday = isSameDay(selectedDate, startOfDay(new Date()));
                        const currentHour = new Date().getHours();
                        const currentMinute = new Date().getMinutes();

                        // Slots mapping logic based on user tier
                        const standardSlots = ['08:00 AM', '10:30 AM', '01:00 PM', '04:30 PM'];
                        const prioritySlots = ['07:00 AM', '06:00 PM'];
                        const vipSlots = ['05:30 AM', '08:00 PM'];

                        let availableSlots = [...standardSlots];
                        if (userTierLevel >= 2) availableSlots = [...availableSlots, ...prioritySlots];
                        if (userTierLevel >= 3) availableSlots = [...availableSlots, ...vipSlots];

                        // Sort by time
                        availableSlots.sort((a, b) => {
                          const timeA = new Date('1970/01/01 ' + a);
                          const timeB = new Date('1970/01/01 ' + b);
                          return timeA - timeB;
                        });

                        const finalSlots = availableSlots.filter(slot => {
                          if (!isToday) return true;
                          const isPM = slot.includes('PM');
                          let [hourStr, minStr] = slot.split(' ')[0].split(':');
                          let hour = parseInt(hourStr);
                          if (isPM && hour !== 12) hour += 12;
                          if (!isPM && hour === 12) hour = 0;
                          const min = parseInt(minStr);

                          if (hour > currentHour) return true;
                          if (hour === currentHour && min > currentMinute) return true;
                          return false;
                        });

                        if (finalSlots.length === 0) {
                          return <div className="col-span-2 py-8 text-center text-on-surface-variant text-sm font-sans border border-white/5 rounded-lg glass-card">No slots available for this date.</div>;
                        }

                        return finalSlots.map((t) => {
                          const isVip = vipSlots.includes(t);
                          const isPriority = prioritySlots.includes(t);
                          const isPremiumSlot = isVip || isPriority;

                          return (
                            <button
                              key={t}
                              onClick={() => selectSchedule(booking.date, t)}
                              className={`py-3 px-2 rounded-lg font-medium text-xs border transition-all text-center flex flex-col items-center justify-center gap-1 ${booking.time === t
                                ? 'border-tertiary bg-tertiary/10 text-tertiary'
                                : 'border-white/5 glass-card hover:border-primary/20 text-on-surface-variant'
                                }`}
                            >
                              {t}
                              {isPremiumSlot && (
                                <span className={`text-[8px] uppercase tracking-widest font-bold ${booking.time === t ? 'text-tertiary' : 'text-tertiary/70'}`}>
                                  {isVip ? 'VIP Slot' : 'Priority Slot'}
                                </span>
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 4: Member details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl md:text-headline-sm text-primary font-semibold">Member Information</h2>
                <div className="glass-card p-6 md:p-8 rounded-xl border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block">Full Name</label>
                      <input
                        required
                        type="text"
                        value={booking.name || ''}
                        onChange={(e) => setDetails({ name: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block">Email Address</label>
                      <input
                        required
                        type="email"
                        value={booking.email || ''}
                        onChange={(e) => setDetails({ email: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                        placeholder="john@elevate.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block">Phone Number</label>
                      <input
                        required
                        type="tel"
                        value={booking.phone || ''}
                        onChange={(e) => setDetails({ phone: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block">Member ID</label>
                      <input
                        disabled
                        type="text"
                        value={user?.memberId || 'Guest'}
                        className="w-full bg-transparent border-0 border-b border-white/5 text-on-surface-variant pb-2 text-sm cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block">Special Requirements</label>
                    <textarea
                      value={booking.notes || ''}
                      onChange={(e) => setDetails({ notes: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm resize-none"
                      rows="2"
                      placeholder="Muscular tightness, lower back sensitivity, goals, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl md:text-headline-sm text-primary font-semibold">Review Your Booking</h2>
                <div className="glass-card p-6 md:p-8 rounded-xl border border-white/5 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block">Selected Program</span>
                      <p className="font-semibold text-primary">{booking.program?.title}</p>
                    </div>
                    <button className="text-tertiary text-xs hover:underline font-bold" onClick={() => setCurrentStep(1)}>Edit</button>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block">Performance Coach</span>
                      <p className="font-semibold text-primary">{booking.trainer?.name} — {booking.trainer?.title}</p>
                    </div>
                    <button className="text-tertiary text-xs hover:underline font-bold" onClick={() => setCurrentStep(2)}>Edit</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block">Schedule Slot</span>
                      <p className="font-semibold text-primary">{booking.date} at {booking.time}</p>
                    </div>
                    <button className="text-tertiary text-xs hover:underline font-bold" onClick={() => setCurrentStep(3)}>Edit</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Checkout payment */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl md:text-headline-sm text-primary font-semibold">Secure Checkout</h2>
                <div className="glass-card p-6 md:p-8 rounded-xl border border-white/5 space-y-6">
                  <div className="flex items-center justify-between p-4 border border-tertiary bg-tertiary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary">credit_card</span>
                      <span className="font-medium text-primary text-sm">Credit / Debit Card</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-tertiary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-tertiary rounded-full"></div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded text-center font-bold">
                      {paymentError}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Card Holder Name</label>
                      <input
                        required
                        type="text"
                        value={paymentName}
                        onChange={(e) => setPaymentName(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Card Number</label>
                      <input
                        required
                        type="text"
                        value={paymentCard}
                        onChange={(e) => setPaymentCard(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm font-mono"
                        placeholder="4000 1234 5678 9010"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Expiry (MM/YY)</label>
                        <input
                          required
                          type="text"
                          value={paymentExpiry}
                          onChange={(e) => setPaymentExpiry(e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm font-mono"
                          placeholder="12/28"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">CVC</label>
                        <input
                          required
                          type="password"
                          value={paymentCvc}
                          onChange={(e) => setPaymentCvc(e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm font-mono"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Booking Confirmed */}
            {currentStep === 7 && (
              <div className="text-center py-8 space-y-8 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-tertiary rounded-full flex items-center justify-center text-background mx-auto shadow-lg shadow-tertiary/10 animate-bounce">
                  <span className="material-symbols-outlined text-4xl font-bold">check</span>
                </div>
                <div>
                  <h2 className="font-serif text-3xl md:text-[44px] font-bold text-primary mb-4">Booking Confirmed</h2>
                  <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed">
                    Your elite session has been secured. A confirmation guide and calendar invitation have been sent to <span className="text-primary font-semibold">{booking.email}</span>.
                  </p>
                </div>

                {discountAmount > 0 && (
                  <div className="bg-tertiary/10 border border-tertiary/30 text-tertiary font-bold text-sm py-3 px-6 rounded-lg inline-block mx-auto mb-4">
                    You saved ₹{discountAmount} on this booking!
                  </div>
                )}

                {/* Receipt Card */}
                <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 text-left space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <span className="material-symbols-outlined text-9xl">verified</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">Booking ID</span>
                      <p className="font-mono text-lg md:text-xl text-tertiary font-bold">#{user?.bookings?.[0]?.id || 'EF-2024-8842'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">Status</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-tertiary/20 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-tertiary/20">Confirmed</span>
                        {user?.bookings?.[0]?.type && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {user.bookings[0].type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Program</span>
                      <p className="font-semibold text-primary text-sm md:text-md">{booking.program?.title}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Dedicated Coach</span>
                      <p className="font-semibold text-primary text-sm md:text-md">{booking.trainer?.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Date</span>
                      <p className="font-semibold text-primary text-sm md:text-md">{booking.date}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Time</span>
                      <p className="font-semibold text-primary text-sm md:text-md">{booking.time}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Total Paid</span>
                    <span className="text-xl font-bold font-mono text-tertiary">₹{total}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    onClick={() => alert('Receipt PDF download triggered.')}
                    className="bg-primary text-on-primary px-8 py-3 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all duration-300 font-bold flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span> Download Receipt
                  </button>
                  <button
                    onClick={() => {
                      resetBooking();
                      navigate('/dashboard');
                    }}
                    className="border border-outline-variant text-on-surface px-8 py-3 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-white/5 transition-all duration-300 font-bold"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {currentStep < 7 && (
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <button
                  onClick={handlePrevStep}
                  className={`flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-caps text-xs uppercase tracking-widest ${currentStep === 1 ? 'invisible' : 'visible'}`}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Previous
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={
                    (!hasActiveMembership && !hasTrialsLeft) ||
                    (currentStep === 1 && !booking.program) ||
                    (currentStep === 2 && !booking.trainer) ||
                    (currentStep === 3 && (!booking.date || !booking.time)) ||
                    (currentStep === 4 && (!booking.name || !booking.email))
                  }
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all flex items-center gap-3 group font-bold disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-on-primary"
                >
                  <span>
                    {currentStep === 6 ? 'Book & Pay' : `Continue to ${
                      currentStep === 1 ? 'Trainer' :
                      currentStep === 2 ? 'Schedule' :
                      currentStep === 3 ? 'Details' :
                      currentStep === 4 ? 'Review' : 'Payment'
                    }`}
                  </span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Summary Column */}
          {currentStep < 7 && (
            <div className="lg:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
              <div className="glass-card rounded-xl overflow-hidden border border-white/5">
                <div className="h-28 relative overflow-hidden flex items-end p-6">
                  <img
                    alt="Header Background"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.4] z-0"
                    src="/images/img_f2aee0a6.png"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-surface-container-highest/20 to-transparent z-10"></div>
                  <h3 className="font-serif text-lg text-primary drop-shadow-md z-20 relative font-bold">Booking Summary</h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {/* Program item */}
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-tertiary text-lg shrink-0 mt-0.5">fitness_center</span>
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block font-bold">Selected Program</span>
                        <p className="font-semibold text-primary text-sm">{booking.program ? booking.program.title : 'Not selected'}</p>
                        <p className="text-[10px] text-on-surface-variant">{booking.program ? booking.program.duration : '—'}</p>
                      </div>
                    </div>
                    {/* Trainer item */}
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-tertiary text-lg shrink-0 mt-0.5">person</span>
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block font-bold">Performance Coach</span>
                        <p className="font-semibold text-primary text-sm">{booking.trainer ? booking.trainer.name : 'Any available'}</p>
                      </div>
                    </div>
                    {/* Schedule item */}
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-tertiary text-lg shrink-0 mt-0.5">calendar_today</span>
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block font-bold">Schedule Slot</span>
                        <p className="font-semibold text-primary text-sm">{booking.date ? `${booking.date}` : 'Not set'}</p>
                        <p className="text-[10px] text-on-surface-variant">{booking.time ? booking.time : '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial calculation */}
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex justify-between items-end text-xs text-on-surface-variant">
                      <span>Program Price</span>
                      <span className="font-mono text-primary">₹{subtotal}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-end text-xs text-tertiary font-bold">
                        <span>Membership Discount ({discountRate * 100}%)</span>
                        <span className="font-mono">-₹{discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-end text-xs text-on-surface-variant">
                      <span>Service Fee (Luxury)</span>
                      <span className="font-mono text-primary">₹{serviceFee}</span>
                    </div>

                    <div className="h-[1px] bg-white/10 w-full pt-1"></div>
                    <div className="flex justify-between items-end">
                      <span className="font-serif text-sm font-semibold text-primary">Final Total</span>
                      <span className="text-xl font-bold font-mono text-tertiary">₹{total}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="text-center pt-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-tertiary bg-tertiary/10 px-3 py-1 rounded border border-tertiary/20">
                          Money Saved: ₹{discountAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] glass-card p-8 rounded-2xl border border-tertiary/30 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-9xl">lock</span>
            </div>
            
            <div className="w-16 h-16 bg-tertiary/10 border border-tertiary/30 rounded-full flex items-center justify-center text-tertiary mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl font-bold">lock</span>
            </div>
            
            <h3 className="font-serif text-2xl text-primary font-bold mb-3">Premium Access Required</h3>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              {upgradeMessage.text} Upgrade your membership to unlock this elite feature.
            </p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/memberships');
                }}
                className="w-full py-4 bg-tertiary text-background font-label-caps text-xs tracking-widest uppercase font-bold rounded-sm hover:brightness-110 transition-all shadow-lg shadow-tertiary/20"
              >
                Upgrade Membership
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-4 border border-outline-variant text-on-surface-variant font-label-caps text-xs tracking-widest uppercase font-bold rounded-sm hover:text-primary hover:border-white/20 transition-all"
              >
                Choose Another
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
