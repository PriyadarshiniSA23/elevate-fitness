import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import gsap from 'gsap';

const ANNUAL_DISCOUNT = 0.20;

const comparisonFeatures = [
  { label: 'Booking Discount', silver: '5%', gold: '10%', platinum: '15%' },
  { label: 'Trainer Access', silver: 'Silver Trainers', gold: 'Gold Trainers', platinum: 'All Trainers' },
  { label: 'Program Access', silver: 'Silver Programs', gold: 'Gold Programs', platinum: 'All Programs' },
  { label: 'Booking Slots', silver: 'Standard', gold: 'Priority', platinum: 'VIP & Priority' },
  { label: 'Trainer Consultations', silver: '1 / Month', gold: '2 / Month', platinum: 'Unlimited' }
];

const membershipTestimonials = [
  {
    name: "Elena R.",
    role: "Gold Collective Member",
    content: "The Gold Collective plan is perfect. The inclusion of group classes and 2 private sessions monthly gives me exactly the elite guidance and structure I need."
  },
  {
    name: "James W.",
    role: "Platinum Elite Member",
    content: "Upgrading to Platinum Elite was the best decision. The 24/7 keycard access, private lounge, and recovery suite feel like an exclusive sanctuary."
  },
  {
    name: "Sophia M.",
    role: "Silver Suite Member",
    content: "Even at the Silver level, the access to premium areas and the baseline longevity biometric scan provided massive value. Highly recommend Elevate!"
  }
];

const faqs = [
  {
    q: 'Can I upgrade or downgrade my membership tier?',
    a: 'Absolutely. You can upgrade your membership at any time and the price difference will be prorated for the current billing cycle. Downgrades take effect at the start of the next billing period.'
  },
  {
    q: 'Is there a joining fee or contract lock-in?',
    a: 'There is a one-time joining fee of ₹2,000 waived for annual subscribers. All memberships are month-to-month with no lock-in contract. Annual plans offer the best value at a 20% discount.'
  },
  {
    q: 'How do private training sessions work for Gold members?',
    a: 'Gold Collective members receive 2 private training sessions per month with a certified coach of their choice. Sessions are 60 minutes and bookable through the member app up to 2 weeks in advance.'
  },
  {
    q: 'What is included in the Biometric Longevity Scan?',
    a: 'Our complimentary baseline scan measures key health markers including body composition, VO2 max estimate, resting metabolic rate, grip strength, and cardiovascular health. Results are reviewed with a performance coach.'
  },
  {
    q: 'Can I bring guests to the facility?',
    a: 'Yes — all tiers include guest passes. Silver gets 1 per month, Gold gets 2 per month, and Platinum Elite members enjoy unlimited guest invitations. Guests must be registered at the front desk.'
  },
  {
    q: 'What is the cancellation policy?',
    a: 'You may cancel anytime with 30 days written notice. For annual plans, a prorated refund is issued for any remaining full months after the cancellation date. No cancellation fees apply.'
  }
];

const tierIcons = {
  'Silver Suite': 'workspace_premium',
  'Gold Collective': 'star',
  'Platinum Elite': 'diamond',
};

function CellValue({ value, isPopular }) {
  if (value === true) {
    return (
      <span className={`material-symbols-outlined text-lg ${isPopular ? 'text-tertiary' : 'text-primary'}`}>
        check
      </span>
    );
  }
  if (value === false || !value) {
    return <span className="text-white/20">—</span>;
  }
  return <span className={`text-xs font-semibold font-mono ${isPopular ? 'text-tertiary' : 'text-primary'}`}>{value}</span>;
}

export default function Memberships() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateMembership } = useAuth();
  const { memberships: mockMemberships } = useAppData();

  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Membership Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(mockMemberships[1] || null); // default Gold
  const [memberInfo, setMemberInfo] = useState({ fullName: '', email: '', phone: '' });
  const [paymentDetails, setPaymentDetails] = useState({ cardholderName: '', cardNumber: '', cardExpiry: '', cardCvv: '' });
  const [membershipReceipt, setMembershipReceipt] = useState(null);
  const wizardRef = useRef(null);

  // Sync user details strictly if logged in
  useEffect(() => {
    if (user) {
      setMemberInfo(prev => ({
        ...prev,
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone_number || ''
      }));
    } else {
      setMemberInfo({ fullName: '', email: '', phone: '' });
    }
  }, [user]);

  // Read saved wizard state if returning from login redirection
  useEffect(() => {
    const savedPlanId = sessionStorage.getItem('elevate_selected_plan_id');
    const savedStep = sessionStorage.getItem('elevate_wizard_step');
    if (savedPlanId) {
      const plan = mockMemberships.find(p => p.id === savedPlanId);
      if (plan) setSelectedPlan(plan);
    }
    if (savedStep && isAuthenticated) {
      setWizardStep(parseInt(savedStep, 10));
      sessionStorage.removeItem('elevate_wizard_step');
      sessionStorage.removeItem('elevate_selected_plan_id');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % membershipTestimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Animate wizard step transitions
  useEffect(() => {
    if (wizardRef.current) {
      gsap.fromTo(wizardRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [wizardStep]);

  const getDiscountedMonthlyRate = (monthlyPrice) => {
    return Math.floor(monthlyPrice * 0.8);
  };

  const getPrice = (monthlyPrice) => {
    if (annual) return getDiscountedMonthlyRate(monthlyPrice);
    return monthlyPrice;
  };

  const getAnnualTotal = (monthlyPrice) => {
    return getDiscountedMonthlyRate(monthlyPrice) * 12;
  };

  const getSaving = (monthlyPrice) => {
    const monthlyTotal = monthlyPrice * 12;
    const annualTotal = getDiscountedMonthlyRate(monthlyPrice) * 12;
    return monthlyTotal - annualTotal;
  };

  // Continue to details step (requires auth check)
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (!isAuthenticated) {
      sessionStorage.setItem('elevate_selected_plan_id', plan.id);
      sessionStorage.setItem('elevate_wizard_step', '2');
      navigate('/login', { state: { from: '/memberships' } });
    } else {
      setWizardStep(2);
    }
  };

  // Step 5 payment click
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentDetails.cardholderName || !paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv) {
      alert("Please fill in all payment details.");
      return;
    }

    const membershipId = `EF-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date();
    const expiry = new Date();
    if (annual) {
      expiry.setFullYear(today.getFullYear() + 1);
    } else {
      expiry.setMonth(today.getMonth() + 1);
    }

    const formatDate = (date) => {
      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const newMembership = {
      type: selectedPlan.title,
      status: "Active",
      activationDate: formatDate(today),
      expiryDate: formatDate(expiry),
      amount: annual ? getAnnualTotal(selectedPlan.price) : getPrice(selectedPlan.price),
      cycle: annual ? "Annual" : "Monthly"
    };

    // Update user context & localStorage
    updateMembership(newMembership);

    setMembershipReceipt({
      id: membershipId,
      type: selectedPlan.title,
      name: memberInfo.fullName || user?.full_name || "Guest User",
      activationDate: formatDate(today),
      expiryDate: formatDate(expiry)
    });

    setWizardStep(6);
  };

  if (user && user.status === 'Suspended') {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="relative z-30 w-full max-w-[500px] glass-card p-8 md:p-10 rounded-2xl border border-error/20 text-center space-y-6">
          <div className="w-16 h-16 bg-error/10 border border-error/30 rounded-full flex items-center justify-center text-error mx-auto">
            <span className="material-symbols-outlined text-3xl font-bold">block</span>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl text-error font-bold">Account Suspended</h2>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              Your account has been temporarily suspended. You cannot purchase or renew memberships at this time. Please contact the administrator.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-surface-container text-on-surface font-sans text-xs uppercase tracking-widest py-4 rounded-sm transition-all hover:bg-white/10 font-bold duration-200 border border-white/10">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">

      {/* ─── 1. HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[52vh] flex items-center justify-center pt-36 pb-24 overflow-hidden isolate">
        {/* Ambient gradient */}
        <div className="absolute inset-0 -z-20 bg-background" />
        <div
          className="absolute -z-10 pointer-events-none"
          style={{
            inset: 0,
            background: 'radial-gradient(ellipse 70% 55% at 50% 60%, hsl(45 85% 52% / 0.10) 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(hsl(45 85% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(45 85% 60%) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="text-center px-6 space-y-6 max-w-4xl mx-auto z-10">
          <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block">
            Exclusive Subscriptions
          </span>
          <h1 className="font-serif text-4xl md:text-[54px] font-bold text-primary tracking-tight leading-tight">
            Choose Your Path to<br className="hidden md:inline" /> Peak Performance
          </h1>
          <div className="h-1 w-24 bg-tertiary mx-auto" />
          <p className="text-on-surface-variant max-w-2xl mx-auto font-sans text-body-lg pt-2 leading-relaxed">
            Select your access level to private facilities, bespoke coaching programs, and longevity biometrics. Every tier is built for those who demand excellence.
          </p>
        </div>
      </section>

      {/* ─── 2. BILLING TOGGLE (Only render if wizard is on step 1) ────────────────────────────────────── */}
      {wizardStep === 1 && (
        <div className="flex justify-center items-center gap-4 pb-14">
          <button
            onClick={() => setAnnual(false)}
            className={`text-sm font-semibold transition-colors duration-300 focus:outline-none hover:text-primary ${!annual ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${annual ? 'bg-tertiary' : 'bg-white/10'}`}
            aria-label="Toggle annual billing"
            id="billing-toggle"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${annual ? 'translate-x-7' : 'translate-x-0'}`}
            />
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`text-sm font-semibold transition-colors duration-300 focus:outline-none hover:text-primary flex items-center gap-2 ${annual ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            Annual
            <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary text-[10px] font-bold uppercase tracking-wider">
              Save 20%
            </span>
          </button>
        </div>
      )}

      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">

        {/* ─── 3. MEMBERSHIP WIZARD ─────────────────────────────────── */}
        {wizardStep === 1 ? (
          <div ref={wizardRef}>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-28">
              {mockMemberships.map((plan) => {
                const price = getPrice(plan.price);
                const saving = getSaving(plan.price);
                const icon = tierIcons[plan.title] || 'star';
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-500 cursor-pointer ${
                      plan.isPopular
                        ? 'border-tertiary shadow-2xl shadow-tertiary/10 scale-[1.03] bg-gradient-to-b from-surface-container to-background'
                        : 'border-white/5 hover:border-white/15 bg-white/2.5 hover:shadow-xl hover:shadow-white/5'
                    } ${isSelected ? 'ring-2 ring-tertiary' : ''}`}
                    style={plan.isPopular ? { background: 'linear-gradient(160deg, hsl(45 85% 52% / 0.05) 0%, hsl(0 0% 8%) 60%)' } : {}}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-tertiary text-background px-5 py-1.5 rounded-full text-[10px] font-label-caps tracking-widest uppercase font-bold shadow-lg shadow-tertiary/20">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-8 flex flex-col flex-1">
                      {/* Tier Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${plan.isPopular ? 'bg-tertiary/15 border border-tertiary/30' : 'bg-white/5 border border-white/10'}`}>
                        <span
                          className={`material-symbols-outlined text-xl ${plan.isPopular ? 'text-tertiary' : 'text-on-surface-variant'}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {icon}
                        </span>
                      </div>

                      {/* Plan Name */}
                      <span className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest block mb-1">
                        {plan.title === 'Platinum Elite' ? 'Full Access Suite' : plan.title === 'Gold Collective' ? 'Most Inclusive' : 'Club Access'}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-primary mb-5">{plan.title}</h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-mono font-bold text-tertiary leading-none">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-on-surface-variant uppercase tracking-wider">/ month</span>
                      </div>
                      {annual && (
                        <div className="space-y-1 mb-4 h-10">
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            Annual Total: ₹{getAnnualTotal(plan.price).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-tertiary font-semibold">
                            You Save ₹{saving.toLocaleString('en-IN')} per year
                          </p>
                        </div>
                      )}
                      {!annual && <div className="mb-4 h-10" />}

                      <div className="h-px bg-white/8 mb-7" />

                      {/* Features */}
                      <ul className="space-y-3.5 flex-1 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span
                              className={`material-symbols-outlined text-sm shrink-0 mt-0.5 ${plan.isPopular ? 'text-tertiary' : 'text-white/40'}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              verified
                            </span>
                            <span className="font-sans text-on-surface-variant text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan);
                        }}
                        id={`select-plan-${plan.id}`}
                        className={`w-full py-4 font-label-caps text-xs tracking-widest uppercase font-bold rounded-sm transition-all duration-300 ${
                          isSelected
                            ? 'bg-tertiary text-background hover:brightness-110 shadow-lg shadow-tertiary/15'
                            : 'border border-white/15 text-on-surface-variant hover:border-tertiary hover:text-tertiary hover:bg-tertiary/5'
                        }`}
                      >
                        {isSelected ? 'Get Started' : 'Choose Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        ) : (
          <div ref={wizardRef} className="max-w-3xl mx-auto mb-28">
            {/* Progress Tracker */}
            <div className="flex justify-between items-center mb-12 overflow-x-auto pb-4 custom-scrollbar">
              {[
                { step: 1, label: 'Plan' },
                { step: 2, label: 'Details' },
                { step: 3, label: 'Info' },
                { step: 4, label: 'Review' },
                { step: 5, label: 'Payment' },
                { step: 6, label: 'Activated' }
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <div 
                    onClick={() => {
                      if (item.step < wizardStep && wizardStep < 6) {
                        setWizardStep(item.step);
                      }
                    }}
                    className={`flex flex-col items-center gap-2 shrink-0 ${item.step < wizardStep && wizardStep < 6 ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-mono text-xs font-bold ${
                      wizardStep === item.step 
                        ? 'border-tertiary text-tertiary' 
                        : wizardStep > item.step 
                          ? 'border-tertiary bg-tertiary text-on-tertiary' 
                          : 'border-outline-variant text-on-surface-variant'
                    }`}>
                      {wizardStep > item.step ? (
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      ) : item.step}
                    </div>
                    <span className={`font-sans text-[9px] uppercase tracking-wider ${
                      wizardStep === item.step ? 'text-tertiary font-bold' : 'text-on-surface-variant'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < 5 && (
                    <div className={`flex-grow h-[1px] mx-2 ${
                      wizardStep > item.step ? 'bg-tertiary' : 'bg-outline-variant/30'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Form Step Contents */}
            <div className="glass-card p-8 md:p-10 rounded-2xl border border-white/5">
              {/* Step 2: Details */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="font-serif text-2xl text-primary font-bold">{selectedPlan.title} Membership</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Verify details of your selected subscription level.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Price Plan</span>
                        <p className="text-xl font-bold font-mono text-tertiary">
                          ₹{getPrice(selectedPlan.price).toLocaleString('en-IN')} <span className="text-xs text-on-surface-variant font-normal">/ month</span>
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Billed {annual ? 'annually' : 'monthly'}
                        </p>
                      </div>
                      {annual && (
                        <div className="p-3 border border-tertiary/20 bg-tertiary/5 rounded space-y-1">
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            Annual Total: ₹{getAnnualTotal(selectedPlan.price).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-tertiary font-semibold">
                            You Save ₹{getSaving(selectedPlan.price).toLocaleString('en-IN')} per year
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">Selected Tier Features</span>
                      <ul className="space-y-2">
                        {selectedPlan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                            <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">verified</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <button 
                      onClick={() => setWizardStep(1)}
                      className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-caps text-xs uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button 
                      onClick={() => setWizardStep(3)}
                      className="bg-primary text-on-primary px-8 py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all duration-200 font-bold"
                    >
                      Continue to Info
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Member Information */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="font-serif text-2xl text-primary font-bold">Member Information</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Input details for the primary membership holder.</p>
                  </div>
                  <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-bold">Full Name *</label>
                        <input 
                          required
                          type="text" 
                          value={memberInfo.fullName}
                          onChange={(e) => setMemberInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-bold">Email Address *</label>
                        <input 
                          required
                          type="email" 
                          value={memberInfo.email}
                          onChange={(e) => setMemberInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest block font-bold">Phone Number *</label>
                      <input 
                        required
                        type="tel" 
                        value={memberInfo.phone}
                        onChange={(e) => setMemberInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <button 
                      onClick={() => setWizardStep(2)}
                      className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-caps text-xs uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!memberInfo.fullName || !memberInfo.email || !memberInfo.phone) {
                          alert("Please fill in all required fields.");
                          return;
                        }
                        setWizardStep(4);
                      }}
                      className="bg-primary text-on-primary px-8 py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all duration-200 font-bold"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review Membership */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="font-serif text-2xl text-primary font-bold">Review Membership</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Review your summary invoice before proceeding to payment.</p>
                  </div>
                  <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Chosen Plan</span>
                          <p className="font-bold text-primary">{selectedPlan.title} ({annual ? 'Annual' : 'Monthly'})</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Member Details</span>
                          <p className="font-medium text-primary">{memberInfo.fullName}</p>
                          <p className="text-xs text-on-surface-variant">{memberInfo.email}</p>
                          <p className="text-xs text-on-surface-variant">{memberInfo.phone}</p>
                        </div>
                      </div>

                      <div className="bg-white/3 p-6 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs text-on-surface-variant">
                          <span>Membership</span>
                          <span className="font-mono text-primary">{annual ? 'Annual Plan' : 'Monthly Plan'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-on-surface-variant">
                          <span>Monthly Rate</span>
                          <span className="font-mono text-primary">₹{getPrice(selectedPlan.price).toLocaleString('en-IN')}</span>
                        </div>
                        {annual && (
                          <>
                            <div className="flex justify-between items-center text-xs text-on-surface-variant">
                              <span>Annual Total</span>
                              <span className="font-mono text-primary">₹{getAnnualTotal(selectedPlan.price).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-tertiary font-medium">
                              <span>Yearly Savings</span>
                              <span className="font-mono">₹{getSaving(selectedPlan.price).toLocaleString('en-IN')}</span>
                            </div>
                          </>
                        )}
                        <div className="h-[1px] bg-white/10 w-full pt-1"></div>
                        <div className="flex justify-between items-end">
                          <span className="font-serif font-bold text-primary">Total Payable</span>
                          <span className="text-lg font-bold font-mono text-tertiary">
                            ₹{annual ? getAnnualTotal(selectedPlan.price).toLocaleString('en-IN') : getPrice(selectedPlan.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <button 
                      onClick={() => setWizardStep(3)}
                      className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-caps text-xs uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button 
                      onClick={() => setWizardStep(5)}
                      className="bg-primary text-on-primary px-8 py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all duration-200 font-bold"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Secure Payment */}
              {wizardStep === 5 && (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="font-serif text-2xl text-primary font-bold">Secure Payment</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Payments are encrypted and secured.</p>
                  </div>
                  
                  <div className="space-y-5 pt-2">
                    <div className="flex items-center justify-between p-4 border border-tertiary bg-tertiary/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-tertiary">credit_card</span>
                        <span className="font-medium text-primary text-sm">Credit / Debit Card</span>
                      </div>
                      <span className="material-symbols-outlined text-tertiary text-lg">verified_user</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block font-bold">Cardholder Name *</label>
                        <input 
                          required
                          type="text" 
                          value={paymentDetails.cardholderName}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                          className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block font-bold">Card Number *</label>
                        <input 
                          required
                          type="text" 
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm font-mono"
                          placeholder="4000 1234 5678 9010"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block font-bold">Expiry (MM/YY) *</label>
                          <input 
                            required
                            type="text" 
                            value={paymentDetails.cardExpiry}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardExpiry: e.target.value }))}
                            className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm font-mono"
                            placeholder="12/28"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-label-caps text-on-surface-variant uppercase block font-bold">CVV *</label>
                          <input 
                            required
                            type="password" 
                            value={paymentDetails.cardCvv}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardCvv: e.target.value }))}
                            className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-primary pb-2 text-sm font-mono"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-[11px] text-on-surface-variant/70 italic">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span>Fully Encrypted 256-bit SSL Payment Gateway.</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-caps text-xs uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button 
                      type="submit"
                      className="bg-tertiary text-background px-10 py-4 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:brightness-110 transition-all duration-200 font-bold shadow-lg shadow-tertiary/15"
                    >
                      Pay &amp; Activate
                    </button>
                  </div>
                </form>
              )}

              {/* Step 6: Membership Activated */}
              {wizardStep === 6 && membershipReceipt && (
                <div className="text-center py-6 space-y-8 max-w-xl mx-auto">
                  <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center text-background mx-auto shadow-lg shadow-tertiary/20 animate-bounce">
                    <span className="material-symbols-outlined text-3xl font-bold">check</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl text-primary font-bold mb-2">Membership Activated</h3>
                    <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                      You are now an Elevate Fitness Member.
                    </p>
                  </div>

                  {/* Membership Card Details */}
                  <div className="glass-card p-6 rounded-2xl border border-white/8 text-left space-y-5 relative overflow-hidden bg-gradient-to-br from-white/2.5 to-transparent">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                      <span className="material-symbols-outlined text-9xl">verified</span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Membership ID</span>
                        <p className="font-mono text-base text-tertiary font-bold">{membershipReceipt.id}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Status</span>
                        <span className="bg-tertiary/20 text-tertiary px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-tertiary/20">Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Member Name</span>
                        <p className="font-semibold text-primary">{membershipReceipt.name}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Membership Type</span>
                        <p className="font-semibold text-primary">{membershipReceipt.type}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Activation Date</span>
                        <p className="font-semibold text-primary">{membershipReceipt.activationDate}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-widest block mb-0.5">Expiry Date</span>
                        <p className="font-semibold text-primary">{membershipReceipt.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits checklist */}
                  <div className="text-left space-y-4 pt-4 border-t border-white/5">
                    <span className="text-[10px] text-tertiary uppercase tracking-widest block font-bold">Your Premium Member Benefits:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                      {[
                        "Book Fitness Sessions",
                        "Access Member Dashboard",
                        "Manage Bookings",
                        "Workout Progress Tracking",
                        "Membership Renewal",
                        "Download Receipts",
                        "Exclusive Member Offers",
                        ...(selectedPlan.title.includes('Gold') || selectedPlan.title.includes('Platinum') ? [
                          "Priority Booking (Gold & Platinum)",
                          "Nutrition Consultation (Gold & Platinum)"
                        ] : []),
                        ...(selectedPlan.title.includes('Platinum') ? [
                          "Personal Trainer Access (Platinum)"
                        ] : []),
                        "Exclusive Fitness Events"
                      ].map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-sm">verified</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-grow bg-primary text-on-primary py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-on-tertiary transition-all duration-200 font-bold"
                    >
                      Go to Dashboard
                    </button>
                    <button 
                      onClick={() => navigate('/book')}
                      className="flex-grow bg-white/5 border border-white/10 text-primary py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-white/10 transition-all duration-200 font-bold"
                    >
                      Book Your First Session
                    </button>
                    <button 
                      onClick={() => alert('Downloading your digital Elevate Membership Card PDF...')}
                      className="flex-grow border border-tertiary/30 text-tertiary py-3.5 rounded-sm font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary/5 transition-all duration-200 font-bold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* ─── 4. COMPARISON TABLE ──────────────────────────────────── */}
        <section className="mb-28">
          <div className="text-center mb-14">
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block mb-2">
              Full Breakdown
            </span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">
              Compare Every Feature
            </h2>
            <div className="h-1 w-20 bg-tertiary mx-auto mt-3" />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/5">
                  <th className="text-left py-5 px-6 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest w-1/2">
                    Feature
                  </th>
                  {mockMemberships.map((plan) => (
                    <th key={plan.id} className="py-5 px-4 text-center">
                      <span className={`font-serif text-sm font-bold ${plan.isPopular ? 'text-tertiary' : 'text-primary'}`}>
                        {plan.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors duration-200"
                  >
                    <td className="py-6 px-6 text-on-surface-variant font-medium text-sm">{row.label}</td>
                    <td className="py-6 px-4 text-center">
                      <CellValue value={row.silver} isPopular={false} />
                    </td>
                    <td className="py-6 px-4 text-center bg-white/3">
                      <CellValue value={row.gold} isPopular={true} />
                    </td>
                    <td className="py-6 px-4 text-center">
                      <CellValue value={row.platinum} isPopular={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── 5. TESTIMONIALS ──────────────────────────────────────── */}
        <section className="mb-28 border-t border-white/5 pt-20">
          <div className="text-center mb-14">
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block mb-2">
              Member Voices
            </span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">
              What Our Members Say
            </h2>
            <div className="h-1 w-20 bg-tertiary mx-auto mt-3" />
          </div>

          <div className="max-w-3xl mx-auto relative px-4">
            {/* Carousel Card */}
            <div className="glass-card p-10 md:p-14 rounded-xl border border-white/5 space-y-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
              {/* Luxury Quote Icon */}
              <span className="material-symbols-outlined text-[60px] text-tertiary/10 absolute top-4 left-4 select-none">
                format_quote
              </span>
              
              <div className="space-y-6 relative z-10">
                <div className="flex gap-1 text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <div>
                  <p className="font-sans text-lg md:text-xl text-on-surface-variant italic leading-relaxed font-light transition-all duration-300">
                    "{membershipTestimonials[currentTestimonial].content}"
                  </p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-end relative z-10">
                <div>
                  <p className="font-bold text-primary text-base">{membershipTestimonials[currentTestimonial].name}</p>
                  <p className="text-[10px] font-label-caps uppercase tracking-widest text-tertiary">{membershipTestimonials[currentTestimonial].role}</p>
                </div>
                <div className="text-tertiary font-label-caps text-xs tracking-widest font-semibold uppercase">
                  {currentTestimonial + 1} / {membershipTestimonials.length}
                </div>
              </div>
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {membershipTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentTestimonial === idx ? 'bg-tertiary w-6' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. FAQ ACCORDION ─────────────────────────────────────── */}
        <section className="mb-28 border-t border-white/5 pt-20 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase block mb-2">
              Have Questions?
            </span>
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-primary">
              Frequently Asked Questions
            </h2>
            <div className="h-1 w-20 bg-tertiary mx-auto mt-3" />
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  openFaq === idx ? 'border-tertiary/20 bg-white/3' : 'border-white/5 bg-white/2 hover:border-white/10'
                }`}
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span className={`font-sans text-sm font-semibold leading-snug transition-colors duration-300 ${openFaq === idx ? 'text-tertiary' : 'text-primary'}`}>
                    {faq.q}
                  </span>
                  <span
                    className={`material-symbols-outlined text-on-surface-variant text-xl shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-tertiary' : ''}`}
                  >
                    expand_more
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-500 ease-out"
                  style={{ maxHeight: openFaq === idx ? '240px' : '0px' }}
                >
                  <p className="px-6 pb-6 font-sans text-sm text-on-surface-variant leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 7. "NOT SURE?" CTA BANNER ────────────────────────────── */}
        <section className="mb-24">
          <div
            className="rounded-2xl border border-white/8 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(45 85% 52% / 0.07) 0%, hsl(0 0% 7%) 60%)',
            }}
          >
            {/* Decorative glow */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right center, hsl(45 85% 52% / 0.08) 0%, transparent 70%)' }}
            />

            <div className="space-y-3 text-center md:text-left z-10">
              <span className="font-label-caps text-[10px] text-tertiary uppercase tracking-widest block">
                Complimentary Consultation
              </span>
              <h3 className="font-serif text-2xl md:text-3xl text-primary font-bold">
                Not sure which plan fits you?
              </h3>
              <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed">
                Book a complimentary private assessment with our lead performance coach. We will analyze your body biometrics and design a custom plan around your lifestyle and goals.
              </p>
            </div>

            <button
              onClick={() => navigate('/book')}
              id="cta-book-assessment"
              className="px-10 py-4 border border-tertiary/30 text-tertiary font-label-caps text-xs tracking-widest uppercase hover:bg-tertiary hover:text-background transition-all duration-300 shrink-0 font-bold rounded-sm z-10"
            >
              Book Free Assessment
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
