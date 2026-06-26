import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import AddTrainerModal from '../components/admin/AddTrainerModal';
import AddProgramModal from '../components/admin/AddProgramModal';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <p className="text-sm text-tertiary font-mono mt-2">
      {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {time.toLocaleTimeString('en-US')}
    </p>
  );
};

export default function AdminDashboard() {
  const { logout, registeredUsers, adminUpdateUserStatus, adminDeleteUser, adminUpdateBooking, getAllBookings } = useAuth();
  const { 
    trainers, updateTrainer, addTrainer, deleteTrainer,
    programs, updateProgram, addProgram, deleteProgram,
    memberships, updateMembershipPricing,
    notifications, activityLog, logActivity, addNotification
  } = useAppData();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);

  const [adminBookingFilter, setAdminBookingFilter] = useState('All');
  const adminBookingsListRef = useRef(null);

  // Force re-render every minute to keep relative timestamps ("Just now", "1 min ago") live
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (tab, filter = '') => {
    gsap.to('.animate-fadeIn', { opacity: 0, y: -10, duration: 0.2, onComplete: () => {
      setActiveTab(tab);
      if (filter) setSearchQuery(filter);
      else setSearchQuery('');
      setTimeout(() => gsap.to('.animate-fadeIn', { opacity: 1, y: 0, duration: 0.4 }), 50);
    }});
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    return 'Yesterday';
  };

  const allBookings = [...getAllBookings()].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // Admin Bookings Filter Logic
  const now = new Date();
  const upcomingAdminBookingsList = allBookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    try {
      return new Date(b.sessionDateTime || `${b.date} ${b.time}`) > now;
    } catch { return true; }
  });
  const completedAdminBookingsList = allBookings.filter(b => b.status === 'Completed');
  const cancelledAdminBookingsList = allBookings.filter(b => b.status === 'Cancelled');

  let displayedAdminBookings = allBookings;
  if (adminBookingFilter === 'Upcoming') displayedAdminBookings = upcomingAdminBookingsList;
  if (adminBookingFilter === 'Completed') displayedAdminBookings = completedAdminBookingsList;
  if (adminBookingFilter === 'Cancelled') displayedAdminBookings = cancelledAdminBookingsList;

  useEffect(() => {
    if (adminBookingsListRef.current) {
      gsap.fromTo(adminBookingsListRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [adminBookingFilter, allBookings.length]);

  // Basic Stats
  const totalMembers = registeredUsers.length;
  const activeMemberships = registeredUsers.filter(u => u.membership && u.membership.status === 'Active').length;
  const discoveryUsers = registeredUsers.filter(u => !u.membership || u.membership.status !== 'Active').length;
  
  const completedSessions = allBookings.filter(b => b.status === 'Completed').length;
  const cancelledSessions = allBookings.filter(b => b.status === 'Cancelled').length;

  // Payments & Revenue
  const allPayments = [];
  registeredUsers.forEach(u => {
    if (u.payments) u.payments.forEach(p => allPayments.push({...p, userEmail: u.email, userName: u.name}));
  });

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const getPaymentDate = (dateStr) => {
    return new Date(dateStr);
  };

  const isToday = (dateStr) => {
    const d = getPaymentDate(dateStr);
    return d >= startOfToday;
  };

  const isThisWeek = (dateStr) => {
    const d = getPaymentDate(dateStr);
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    return (now - d) <= msInWeek;
  };

  const isThisMonth = (dateStr) => {
    const d = getPaymentDate(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  let totalRevenue = 0;
  let monthlyRevenue = 0;
  let todayRevenue = 0;
  let weeklyRevenue = 0;
  let discoveryRevenue = 0;
  let membershipRevenue = 0;
  let bookingRevenue = 0;

  allPayments.filter(p => p.status === 'Paid').forEach(p => {
    const amt = p.amount || 0;
    totalRevenue += amt;
    
    if (isToday(p.date)) todayRevenue += amt;
    if (isThisWeek(p.date)) weeklyRevenue += amt;
    if (isThisMonth(p.date)) monthlyRevenue += amt;

    if (p.type === 'Membership') membershipRevenue += amt;
    else if (p.type === 'Booking') {
      if (p.description && p.description.includes('Discovery')) {
        discoveryRevenue += amt;
      } else {
        bookingRevenue += amt;
      }
    }
  });

  // Time Validation for 'Mark Completed'
  const canMarkCompleted = (b) => {
    try {
      const sessionDate = new Date(b.sessionDateTime || `${b.date} ${b.time}`);
      return new Date() >= sessionDate;
    } catch {
      return true; // Fallback
    }
  };

  // Today's Overview Logic
  const todaysBookingsCount = allBookings.filter(b => isToday(b.date)).length;
  const pendingConfirmations = allBookings.filter(b => b.status === 'Confirmed').length;
  const sessionsAwaitingCompletion = allBookings.filter(b => b.status === 'Confirmed' && canMarkCompleted(b)).length;

  const handleMarkCompleted = (b) => {
    if (!canMarkCompleted(b)) {
      alert("This session cannot be marked as completed before its scheduled time.");
      return;
    }
    if (confirm(`Mark booking ${b.id} as Completed?`)) {
      adminUpdateBooking(b.userEmail, b.id, 'Completed');
      logActivity(`Booking ${b.id} marked as completed.`, 'text-green-400', 'bg-green-400');
    }
  };

  const handleCancelBooking = (b) => {
    if (confirm(`Cancel booking ${b.id}?`)) {
      adminUpdateBooking(b.userEmail, b.id, 'Cancelled');
      logActivity(`Booking ${b.id} cancelled by admin.`, 'text-error', 'bg-error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      
      {/* Sidebar Navigation Panel */}
      <aside className="h-screen w-64 bg-surface-container-low/80 backdrop-blur-2xl border-r border-outline-variant/10 shadow-2xl flex flex-col justify-between shrink-0 z-50">
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-tertiary/20 text-tertiary">
              <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-primary tracking-tighter">Elevate</h1>
              <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest opacity-60">Admin Premium</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'members', label: 'Members', icon: 'groups' },
              { id: 'bookings', label: 'Bookings', icon: 'event_available' },
              { id: 'trainers', label: 'Trainers', icon: 'exercise' },
              { id: 'programs', label: 'Programs', icon: 'grid_view' },
              { id: 'memberships', label: 'Memberships', icon: 'card_membership' },
              { id: 'payments', label: 'Billing & Revenue', icon: 'account_balance_wallet' },
              { id: 'analytics', label: 'Analytics', icon: 'analytics' },
              { id: 'notifications', label: 'Notifications', icon: 'notifications' },
              { id: 'activity', label: 'Activity Log', icon: 'history' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded transition-all duration-300 font-label-caps text-xs tracking-wider uppercase ${
                  activeTab === tab.id
                    ? 'text-tertiary bg-tertiary/10 border-r-2 border-tertiary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-md">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-outline-variant/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-error/70 hover:text-error px-4 py-3 hover:bg-error/5 transition-all duration-300 font-label-caps text-xs tracking-wider uppercase font-bold"
          >
            <span className="material-symbols-outlined text-md">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Pane */}
      <main className="flex-1 overflow-y-auto relative h-full flex flex-col justify-between">
        
        {/* Top Header Controls */}
        <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 px-8 h-20 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-xl font-semibold text-primary capitalize">Elevate Fitness Control Center</h2>
            {activeTab === 'dashboard' && (
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                Monitor members, bookings, trainers, revenue, memberships, and business performance in real time.
              </p>
            )}
            {activeTab !== 'dashboard' && (
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                {activeTab.replace('-', ' ')} Hub
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/10">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs text-on-surface ml-2 w-48 placeholder:text-on-surface-variant/40"
                placeholder="Search index..."
              />
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/10">
              <div className="text-right">
                <p className="font-label-caps text-[10px] text-on-surface font-bold tracking-widest">MASTER ADMIN</p>
                <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-tighter opacity-60">System Control</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className="p-8 space-y-8 flex-grow">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* 3. WELCOME PANEL */}
              <div className="glass-card p-8 rounded-xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="gold-glow absolute -inset-10 opacity-30 pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="font-serif text-3xl font-bold text-primary">Welcome, Master Admin</h3>
                  <Clock />
                </div>
                <div className="flex gap-8 relative z-10">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary font-mono">{todaysBookingsCount}</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Today's Bookings</p>
                  </div>

                  <div className="text-center border-l border-white/10 pl-8">
                    <p className="text-3xl font-bold text-green-400 font-mono">₹{(todayRevenue).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Today's Revenue</p>
                  </div>
                </div>
              </div>

              {/* 4. QUICK ACTIONS */}
              <div>
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-4">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => handleNavClick('trainers')} className="glass-card p-4 rounded border border-white/5 hover:border-tertiary/50 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-primary group">
                    <span className="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform">add_circle</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Add Trainer</span>
                  </button>
                  <button onClick={() => handleNavClick('programs')} className="glass-card p-4 rounded border border-white/5 hover:border-tertiary/50 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-primary group">
                    <span className="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform">add_circle</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Add Program</span>
                  </button>
                  <button onClick={() => handleNavClick('bookings')} className="glass-card p-4 rounded border border-white/5 hover:border-tertiary/50 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-primary group">
                    <span className="material-symbols-outlined text-blue-400 group-hover:scale-110 transition-transform">calendar_today</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Today's Bookings</span>
                  </button>
                  <button onClick={() => handleNavClick('memberships')} className="glass-card p-4 rounded border border-white/5 hover:border-tertiary/50 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-primary group">
                    <span className="material-symbols-outlined text-green-400 group-hover:scale-110 transition-transform">diamond</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Manage Plans</span>
                  </button>
                </div>
              </div>

              {/* 1. & 2. OVERVIEW CARDS (CLICKABLE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                <button onClick={() => handleNavClick('members')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-tertiary/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-tertiary/0 group-hover:bg-tertiary/5 transition-colors"></div>
                  <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">groups</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Total Members</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{totalMembers}</h3>
                </button>
                
                <button onClick={() => handleNavClick('memberships')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-green-400/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-green-400/0 group-hover:bg-green-400/5 transition-colors"></div>
                  <span className="material-symbols-outlined text-green-400 bg-green-400/10 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">verified_user</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Active Memberships</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{activeMemberships}</h3>
                </button>

                <button onClick={() => handleNavClick('members', 'Discovery')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-blue-400/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/5 transition-colors"></div>
                  <span className="material-symbols-outlined text-blue-400 bg-blue-400/10 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">explore</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Discovery Users</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{discoveryUsers}</h3>
                </button>

                <button onClick={() => handleNavClick('bookings')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-purple-400/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-purple-400/0 group-hover:bg-purple-400/5 transition-colors"></div>
                  <span className="material-symbols-outlined text-purple-400 bg-purple-400/10 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">event_note</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Total Bookings</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{allBookings.length}</h3>
                </button>
                
                <button onClick={() => handleNavClick('trainers')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-white/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant bg-white/5 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">exercise</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Total Trainers</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{trainers.length}</h3>
                </button>

                <button onClick={() => handleNavClick('programs')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-white/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant bg-white/5 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">grid_view</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Total Programs</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{programs.length}</h3>
                </button>

                <button onClick={() => handleNavClick('bookings', 'Completed')} className="text-left glass-card p-6 rounded-xl border border-white/5 hover:border-green-400/30 hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-green-400/0 group-hover:bg-green-400/5 transition-colors"></div>
                  <span className="material-symbols-outlined text-green-400 bg-green-400/10 p-3 rounded-lg mb-4 inline-block group-hover:scale-110 transition-transform">task_alt</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Completed Sessions</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1">{completedSessions}</h3>
                </button>

                <button onClick={() => handleNavClick('payments')} className="text-left glass-card p-6 rounded-xl border border-tertiary/20 hover:border-tertiary hover:bg-white/5 hover:scale-[1.02] transition-all group relative overflow-hidden cursor-pointer">
                  <div className="gold-glow absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-3 rounded-lg mb-4 inline-block relative z-10 group-hover:scale-110 transition-transform">payments</span>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold relative z-10">Monthly Revenue</p>
                  <h3 className="font-serif text-[28px] text-primary font-bold mt-1 relative z-10">₹{monthlyRevenue.toLocaleString('en-IN')}</h3>
                </button>
              </div>

              {/* NEW REORGANIZED LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* REVENUE SUMMARY (Expanded) */}
                <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col p-6 space-y-6">
                  <h4 className="font-serif text-md font-semibold text-primary">Revenue Summary</h4>
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Today's Revenue</span>
                      <span className="font-mono text-primary font-bold">₹{todayRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Weekly Revenue</span>
                      <span className="font-mono text-primary font-bold">₹{weeklyRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Monthly Revenue</span>
                      <span className="font-mono text-tertiary font-bold text-lg">₹{monthlyRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Discovery Sales</span>
                      <span className="font-mono text-blue-400 font-bold">₹{discoveryRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Membership Sales</span>
                      <span className="font-mono text-green-400 font-bold">₹{membershipRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Booking Sales</span>
                      <span className="font-mono text-purple-400 font-bold">₹{bookingRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Total Revenue</span>
                      <span className="font-mono text-tertiary font-bold">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* RECENT BOOKINGS */}
                <div className="lg:col-span-2 glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <h4 className="font-serif text-md font-semibold text-primary">Recent Bookings</h4>
                    <button onClick={() => handleNavClick('bookings')} className="text-[10px] font-bold uppercase tracking-widest text-tertiary hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto p-4 flex-grow">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                        <tr>
                          <th className="pb-3 px-2">Member</th>
                          <th className="pb-3 px-2">Program & Trainer</th>
                          <th className="pb-3 px-2">Time</th>
                          <th className="pb-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[...allBookings].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0,5).map(b => (
                          <tr key={b.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-2 font-semibold text-xs text-primary">{b.userName}</td>
                            <td className="py-3 px-2 text-xs"><span className="text-primary">{b.program}</span><br/><span className="text-[10px] text-on-surface-variant">{b.coach}</span></td>
                            <td className="py-3 px-2 text-xs text-on-surface-variant">{b.date} {b.time}</td>
                            <td className="py-3 px-2">
                               <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${b.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : b.status === 'Cancelled' ? 'bg-error/10 text-error border-error/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TODAY'S ACTIVITY */}
                <div className="lg:col-span-2 glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-white/5">
                    <h4 className="font-serif text-md font-semibold text-primary">Today's Activity Feed</h4>
                  </div>
                  <div className="p-5 space-y-4 max-h-[300px] overflow-y-auto">
                    {activityLog.length === 0 ? (
                      <p className="text-sm text-on-surface-variant text-center py-4">No recent activity.</p>
                    ) : activityLog.slice(0, 10).map((act, i) => (
                      <div key={act.id || i} className="flex gap-4 items-start">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.bg || 'bg-tertiary'}`}></div>
                        <div>
                          <p className={`text-sm font-semibold ${act.color || 'text-primary'}`}>{act.action}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">{getTimeAgo(act.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NOTIFICATIONS & LOG PREVIEW */}
                <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col">
                   <div className="p-5 border-b border-white/5">
                    <h4 className="font-serif text-md font-semibold text-primary">Notifications & Logs</h4>
                  </div>
                  <div className="p-5 space-y-6 flex-grow">
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Latest Alerts</h5>
                      <div className="space-y-3">
                        {notifications.slice(0,2).map(n => (
                          <div key={n.id} className="text-xs text-primary border-l-2 border-tertiary pl-3">{n.message}</div>
                        ))}
                      </div>
                      <button onClick={() => handleNavClick('notifications')} className="text-[9px] font-bold uppercase text-tertiary mt-3 hover:underline">View All Notifications</button>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">System Logs</h5>
                      <div className="space-y-3">
                        {activityLog.slice(0,2).map(l => (
                          <div key={l.id} className="text-xs text-primary font-mono opacity-80 border-l-2 border-white/20 pl-3">{l.action}</div>
                        ))}
                      </div>
                      <button onClick={() => handleNavClick('activity')} className="text-[9px] font-bold uppercase text-tertiary mt-3 hover:underline">View Full Log</button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && (
            <div className="glass-card rounded-xl overflow-hidden border border-white/5 animate-fadeIn">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-serif text-lg font-semibold text-primary">Registered Members</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container/50 border-b border-white/5 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                    <tr>
                      <th className="p-4">Member</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Membership</th>
                      <th className="p-4">Reg Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registeredUsers.filter(u => 
                      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (searchQuery === 'Discovery' && (!u.membership || u.membership.status !== 'Active'))
                    ).map((u) => (
                      <tr key={u.email} className="hover:bg-white/5 transition-colors text-primary">
                        <td className="p-4 font-semibold">{u.name}</td>
                        <td className="p-4 text-xs text-on-surface-variant">{u.email}<br/>{u.phone}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${u.membership?.status === 'Active' ? 'bg-tertiary/10 text-tertiary' : 'bg-white/10 text-on-surface-variant'}`}>
                            {u.membership ? u.membership.type : `Discovery (${u.remainingTrials} left)`}
                          </span>
                        </td>
                        <td className="p-4 text-xs">{u.registrationDate}</td>
                        <td className="p-4">
                           <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${u.status === 'Suspended' ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-400'}`}>
                             {u.status || 'Active'}
                           </span>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button onClick={() => adminUpdateUserStatus(u.email, u.status === 'Suspended' ? 'Active' : 'Suspended')} className="text-[10px] font-bold uppercase text-tertiary border border-tertiary/20 px-2 py-1 rounded hover:bg-tertiary/10 transition">Toggle Status</button>
                          <button onClick={() => { if(confirm(`Delete ${u.name}?`)) adminDeleteUser(u.email); }} className="text-[10px] font-bold uppercase text-error border border-error/20 px-2 py-1 rounded hover:bg-error/10 transition">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {registeredUsers.length === 0 && (
                      <tr><td colSpan="6" className="p-6 text-center text-on-surface-variant">No members found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="glass-card rounded-xl overflow-hidden border border-white/5 animate-fadeIn flex flex-col">
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h4 className="font-serif text-lg font-semibold text-primary">All Bookings</h4>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {['All', 'Upcoming', 'Completed', 'Cancelled'].map(filter => {
                    const count = filter === 'All' ? allBookings.length : 
                                  filter === 'Upcoming' ? upcomingAdminBookingsList.length : 
                                  filter === 'Completed' ? completedAdminBookingsList.length : 
                                  cancelledAdminBookingsList.length;
                    return (
                      <button 
                        key={filter}
                        onClick={() => setAdminBookingFilter(filter)}
                        className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full transition-all border whitespace-nowrap ${
                          adminBookingFilter === filter 
                            ? 'bg-tertiary/10 text-tertiary border-tertiary' 
                            : 'bg-transparent text-on-surface-variant border-tertiary/30 hover:border-tertiary/60'
                        }`}
                      >
                        {filter} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" ref={adminBookingsListRef}>
                  <thead className="bg-surface-container/50 border-b border-white/5 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Member</th>
                      <th className="p-4">Program & Coach</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayedAdminBookings.filter(b => 
                      b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (searchQuery === 'Completed' && b.status === 'Completed')
                    ).map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors text-primary">
                        <td className="p-4 font-mono text-[10px]">{b.id}</td>
                        <td className="p-4 font-semibold">{b.userName}<br/><span className="text-[10px] text-tertiary">{b.userMembership}</span></td>
                        <td className="p-4">{b.program}<br/><span className="text-[10px] text-on-surface-variant">{b.coach}</span></td>
                        <td className="p-4">{b.date} {b.time}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${b.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' : b.status === 'Cancelled' ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-400'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 flex flex-row justify-end gap-1 items-center">
                          {b.status === 'Confirmed' && (
                            <>
                              <button onClick={() => handleMarkCompleted(b)} className="text-[9px] px-2 py-1.5 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded font-bold uppercase hover:bg-tertiary hover:text-on-tertiary transition">Mark Completed</button>
                              <button onClick={() => handleCancelBooking(b)} className="text-[9px] px-2 py-1.5 bg-error/10 text-error border border-error/20 rounded font-bold uppercase hover:bg-error hover:text-white transition">Cancel</button>
                            </>
                          )}
                          {/* Removed View Details for Completed/Cancelled bookings as per request */}
                          {b.status === 'Pending' && (
                            <button className="text-[9px] px-2 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold uppercase hover:bg-blue-500 hover:text-white transition">Confirm</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {displayedAdminBookings.length === 0 && (
                      <tr><td colSpan="6" className="p-6 text-center text-on-surface-variant">No {adminBookingFilter.toLowerCase()} bookings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TRAINERS */}
          {activeTab === 'trainers' && (
            <div className="glass-card rounded-xl overflow-hidden border border-white/5 animate-fadeIn">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-serif text-lg font-semibold text-primary">Trainers Directory</h4>
                <button className="px-4 py-2 bg-tertiary text-on-tertiary rounded-sm text-xs font-bold uppercase hover:brightness-110 tracking-wider" onClick={() => setShowAddTrainerModal(true)}>+ Add Coach</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container/50 border-b border-white/5 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                    <tr>
                      <th className="p-4">Trainer Details</th>
                      <th className="p-4">Specialization</th>
                      <th className="p-4">Tier Access</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trainers.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((coach) => (
                      <tr key={coach.id} className="hover:bg-white/5 transition-colors text-primary">
                        <td className="p-4 flex items-center gap-4">
                          <img className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" src={coach.image || '/images/default_avatar.png'} alt={coach.name} />
                          <div>
                            <input 
                              type="text" 
                              className="bg-transparent font-semibold border-none focus:ring-0 p-0 hover:bg-white/5 rounded"
                              value={coach.name}
                              onChange={(e) => updateTrainer(coach.id, { name: e.target.value })}
                            />
                            <p className="text-[10px] text-on-surface-variant font-mono">{coach.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          <input 
                            type="text" 
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm hover:bg-white/5 rounded"
                            value={coach.specialization}
                            onChange={(e) => updateTrainer(coach.id, { specialization: e.target.value })}
                          />
                        </td>
                        <td className="p-4">
                          <select 
                            className="bg-surface-container text-primary text-xs border border-white/10 rounded px-2 py-1"
                            value={coach.tier}
                            onChange={(e) => updateTrainer(coach.id, { tier: e.target.value })}
                          >
                            <option value="Standard">Standard</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select 
                            className="bg-surface-container text-primary text-xs border border-white/10 rounded px-2 py-1"
                            value={coach.availability || 'Active'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              updateTrainer(coach.id, { availability: newStatus });
                              addNotification(`Trainer '${coach.name}' is now ${newStatus}.`);
                            }}
                          >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-[10px] font-bold uppercase text-error border border-error/20 px-2 py-1 rounded hover:bg-error/10 transition" onClick={() => { if(confirm(`Delete ${coach.name}?`)) deleteTrainer(coach.id); }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PROGRAMS */}
          {activeTab === 'programs' && (
            <div className="glass-card rounded-xl overflow-hidden border border-white/5 animate-fadeIn">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-serif text-lg font-semibold text-primary">Program Portfolio</h4>
                <button className="px-4 py-2 bg-tertiary text-on-tertiary rounded-sm text-xs font-bold uppercase hover:brightness-110 tracking-wider" onClick={() => setShowAddProgramModal(true)}>+ New Program</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container/50 border-b border-white/5 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                    <tr>
                      <th className="p-4">Program Name</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Price (₹)</th>
                      <th className="p-4">Membership Access</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-primary">
                    {programs.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((prog) => (
                      <tr key={prog.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold">
                          <input 
                            type="text" 
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm hover:bg-white/5 rounded"
                            value={prog.title}
                            onChange={(e) => updateProgram(prog.id, { title: e.target.value })}
                          />
                        </td>
                        <td className="p-4 text-on-surface-variant">{prog.duration}</td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            className="bg-surface-container text-tertiary font-mono font-bold text-xs border border-white/10 rounded w-20 px-2 py-1"
                            value={prog.price}
                            onChange={(e) => updateProgram(prog.id, { price: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="p-4">
                          <select 
                            className="bg-surface-container text-primary text-xs border border-white/10 rounded px-2 py-1"
                            value={prog.tier}
                            onChange={(e) => updateProgram(prog.id, { tier: e.target.value })}
                          >
                            <option value="Standard">Standard</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select 
                            className="bg-surface-container text-primary text-xs border border-white/10 rounded px-2 py-1"
                            value={prog.availability || 'Available'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              updateProgram(prog.id, { availability: newStatus });
                              addNotification(`Program '${prog.title}' is now ${newStatus}.`);
                            }}
                          >
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-[10px] font-bold uppercase text-error border border-error/20 px-2 py-1 rounded hover:bg-error/10 transition" onClick={() => { if(confirm(`Delete ${prog.title}?`)) deleteProgram(prog.id); }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: MEMBERSHIPS */}
          {activeTab === 'memberships' && (
            <div className="glass-card p-8 rounded-xl border border-white/5 space-y-6 animate-fadeIn">
              <h4 className="font-serif text-lg font-semibold text-primary">Membership Pricing Structure</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Changes made here automatically update the public site and booking wizard pricing.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {memberships.map((tier) => (
                  <div key={tier.id} className="bg-surface-container/40 p-6 rounded-lg border border-white/5 space-y-4">
                    <span className="text-[12px] text-tertiary uppercase tracking-widest font-bold block">{tier.title}</span>
                    <div>
                      <label className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">Price (₹)</label>
                      <input 
                        type="number" 
                        className="w-full bg-surface text-primary border border-white/10 rounded px-3 py-2 font-mono font-bold text-lg focus:border-tertiary focus:ring-1 focus:ring-tertiary transition"
                        value={tier.price}
                        onChange={(e) => updateMembershipPricing(tier.id, { price: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PAYMENTS / BILLING */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="glass-card p-6 rounded-xl border border-white/5 inline-block">
                <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Total Revenue Collected</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="font-serif text-2xl md:text-headline-sm text-tertiary font-bold">₹{totalRevenue.toLocaleString('en-IN')}</h3>
                </div>
              </div>
              <div className="glass-card rounded-xl overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5">
                  <h4 className="font-serif text-md font-semibold text-primary">Global Transactions Ledger</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container/50 border-b border-white/5 text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest">
                      <tr>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Billing Member</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-primary">
                      {allPayments.filter(tx => tx.userName?.toLowerCase().includes(searchQuery.toLowerCase())).map((tx, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-[10px] text-on-surface-variant">{tx.id}</td>
                          <td className="p-4 font-semibold">{tx.userName}</td>
                          <td className="p-4 text-xs">{tx.type}<br/><span className="text-[9px] text-on-surface-variant">{tx.description}</span></td>
                          <td className="p-4 font-mono font-bold text-tertiary">₹{(tx.amount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-4 text-on-surface-variant">{tx.date}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                              tx.status === 'Paid' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-tertiary/10 text-tertiary border-tertiary/20'
                            }`}>{tx.status}</span>
                          </td>
                        </tr>
                      ))}
                      {allPayments.length === 0 && (
                        <tr><td colSpan="6" className="p-6 text-center text-on-surface-variant">No transactions found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn">
              <h4 className="font-serif text-lg font-semibold text-primary">Live Analytics</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Program Popularity */}
                <div className="glass-card p-6 rounded-xl border border-white/5">
                  <h5 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-6">Program Popularity</h5>
                  <div className="space-y-4">
                    {programs.slice(0,5).map(p => {
                      const count = allBookings.filter(b => b.program === p.title).length;
                      const percentage = allBookings.length ? (count / allBookings.length) * 100 : 0;
                      return (
                        <div key={p.id}>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-primary font-bold">{p.title}</span>
                            <span className="text-on-surface-variant font-mono">{count} Bookings</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-tertiary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(percentage, 2)}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Trainer Workload */}
                <div className="glass-card p-6 rounded-xl border border-white/5">
                  <h5 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-6">Trainer Workload</h5>
                  <div className="space-y-4">
                    {trainers.slice(0,5).map(t => {
                      const count = allBookings.filter(b => b.coach === t.name).length;
                      const percentage = allBookings.length ? (count / allBookings.length) * 100 : 0;
                      return (
                        <div key={t.id}>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-primary font-bold">{t.name}</span>
                            <span className="text-on-surface-variant font-mono">{count} Sessions</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(percentage, 2)}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="glass-card rounded-xl overflow-hidden border border-white/5 animate-fadeIn max-w-3xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-serif text-lg font-semibold text-primary">Admin Notification Center</h4>
              </div>
              <div className="divide-y divide-white/5 p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 && <p className="text-sm text-on-surface-variant p-4 text-center">No new notifications.</p>}
                {notifications.map(n => (
                  <div key={n.id} className="p-4 bg-white/5 rounded-lg flex justify-between items-center hover:bg-white/10 transition">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-xl">notifications_active</span>
                      <p className="text-sm text-primary">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="glass-card rounded-xl overflow-hidden border border-white/5 animate-fadeIn max-w-3xl">
              <div className="p-6 border-b border-white/5">
                <h4 className="font-serif text-lg font-semibold text-primary">System Activity Log</h4>
              </div>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {activityLog.length === 0 && <p className="text-sm text-on-surface-variant text-center">No activity logged yet.</p>}
                {activityLog.map(log => (
                  <div key={log.id} className="flex gap-4 group">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-tertiary group-hover:scale-150 transition-transform"></div>
                    <div>
                      <div className="flex items-baseline gap-3">
                        <p className="text-[10px] font-mono text-tertiary">{log.time}</p>
                        <p className="text-[10px] font-mono text-on-surface-variant">{log.date}</p>
                      </div>
                      <p className="text-sm text-primary mt-1">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD MODALS */}
          {showAddTrainerModal && (
            <AddTrainerModal
              onClose={() => setShowAddTrainerModal(false)}
              onSave={(trainerData) => {
                addTrainer(trainerData);
                logActivity(`Trainer '${trainerData.name}' added successfully.`);
              }}
              programs={programs}
            />
          )}

          {showAddProgramModal && (
            <AddProgramModal
              onClose={() => setShowAddProgramModal(false)}
              onSave={(programData) => {
                addProgram(programData);
                logActivity(`Program '${programData.title}' added successfully.`);
              }}
              trainers={trainers}
            />
          )}

        </div>
      </main>
    </div>
  );
}
