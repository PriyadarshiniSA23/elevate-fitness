import React, { createContext, useContext, useState, useEffect } from 'react';

const logAppActivity = (action, color = 'text-tertiary', bg = 'bg-tertiary') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('elevate_activity', { detail: { action, color, bg } }));
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]); // Kept for mock data compatibility
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep mock registered users for Admin Dashboard to not break
    const savedUsers = localStorage.getItem('elevate_registered_users');
    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    }

    const token = localStorage.getItem('elevate_token');
    if (token) {
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          ...data.user,
          bookings: data.user?.bookings || [],
          payments: data.user?.payments || [],
          remainingTrials: data.user?.remainingTrials !== undefined ? data.user?.remainingTrials : 2,
          totalSavings: data.user?.totalSavings || 0,
          tier: data.user?.tier || 'Guest'
        });
      } else {
        localStorage.removeItem('elevate_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('elevate_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userDetails) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: userDetails.full_name,
          email: userDetails.email,
          phone_number: userDetails.phone_number,
          password: userDetails.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.message && data.message.includes('already exists')) {
          return { error: 'EXISTS' };
        }
        return { error: data.message || 'Registration failed' };
      }
      
      logAppActivity(`New account created: ${userDetails.full_name}`, 'text-blue-400', 'bg-blue-400');
      return { success: true };
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.message === 'Invalid credentials' || data.message === 'Invalid email or password') {
          return { error: 'INVALID_PASSWORD' };
        }
        if (data.message === 'User not found') {
          return { error: 'NOT_FOUND' };
        }
        return { error: data.message || 'Login failed' };
      }

      localStorage.setItem('elevate_token', data.token);
      
      const loggedInUser = {
        ...data.user,
        bookings: data.user?.bookings || [],
        payments: data.user?.payments || [],
        remainingTrials: data.user?.remainingTrials !== undefined ? data.user?.remainingTrials : 2,
        totalSavings: data.user?.totalSavings || 0,
        tier: data.user?.tier || 'Guest'
      };
      
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  const resetPassword = async (email, newPassword, confirmPassword) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, confirmPassword })
      });
      
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elevate_token');
  };

  const updateMembership = (membershipDetails) => {
    setUser(prev => {
      if (!prev) return null;
      
      const newPayment = {
        id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: 'Membership',
        description: `${membershipDetails.type} Membership (${membershipDetails.cycle})`,
        amount: membershipDetails.amount,
        status: 'Paid',
        method: 'Card'
      };

      const updated = { 
        ...prev, 
        membership: membershipDetails, 
        tier: membershipDetails?.type || prev.tier,
        payments: [newPayment, ...(prev.payments || [])]
      };
      return updated;
    });
  };

  const updateProfile = (profileData) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...profileData };
    });
  };

  const cancelBooking = (bookingId) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedBookings = prev.bookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: 'Cancelled' };
        }
        return b;
      });
      
      const targetBooking = prev.bookings.find(b => b.id === bookingId);
      let newRemainingTrials = prev.remainingTrials;
      if (targetBooking && targetBooking.type && targetBooking.type.includes('Discovery')) {
        newRemainingTrials = Math.min(newRemainingTrials + 1, 2);
      }

      logAppActivity(`Booking Cancelled by User`, 'text-error', 'bg-error');
      return { ...prev, bookings: updatedBookings, remainingTrials: newRemainingTrials };
    });
  };

  const rescheduleBooking = (bookingId, newDate, newTime) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedBookings = prev.bookings.map(b => {
        if (b.id === bookingId) {
          let newSessionDateTime;
          try {
            newSessionDateTime = new Date(`${newDate} ${newTime}`).toISOString();
          } catch {
            newSessionDateTime = new Date().toISOString();
          }
          return { ...b, date: newDate, time: newTime, sessionDateTime: newSessionDateTime, status: 'Confirmed' };
        }
        return b;
      });

      logAppActivity(`Booking Rescheduled by User`, 'text-purple-400', 'bg-purple-400');
      return { ...prev, bookings: updatedBookings };
    });
  };

  const addBooking = (bookingDetails) => {
    setUser(prev => {
      if (!prev) return null;

      let updatedRemainingTrials = prev.remainingTrials;
      let sessionType = "Member Session";

      const hasActiveMembership = prev.membership && prev.membership.status === "Active";
      if (!hasActiveMembership) {
        if (prev.remainingTrials === 2) {
          sessionType = "Discovery Session #1";
          updatedRemainingTrials = 1;
        } else if (prev.remainingTrials === 1) {
          sessionType = "Discovery Session #2";
          updatedRemainingTrials = 0;
        }
      }

      const newBooking = {
        id: `EF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        sessionDateTime: (() => {
          try { return new Date(`${bookingDetails.date} ${bookingDetails.time}`).toISOString(); } 
          catch { return new Date().toISOString(); }
        })(),
        date: bookingDetails.date,
        time: bookingDetails.time,
        program: bookingDetails.program,
        coach: bookingDetails.coach,
        status: "Confirmed",
        type: sessionType
      };

      const updatedBookings = [newBooking, ...(prev.bookings || [])];
      
      let updatedPayments = prev.payments || [];
      let updatedSavings = prev.totalSavings || 0;

      if (bookingDetails.transaction) {
        const newPayment = {
          id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          type: 'Booking',
          description: bookingDetails.program,
          amount: bookingDetails.transaction.amount,
          status: 'Paid',
          method: 'Card'
        };
        updatedPayments = [newPayment, ...updatedPayments];
        if (bookingDetails.transaction.savings) {
          updatedSavings += bookingDetails.transaction.savings;
        }
      }

      if (sessionType.includes('Discovery')) {
        logAppActivity(`Discovery Session booked by ${prev.full_name || prev.name}`, 'text-purple-400', 'bg-purple-400');
      } else {
        logAppActivity(`Program booked by ${prev.full_name || prev.name}`, 'text-blue-400', 'bg-blue-400');
      }

      return {
        ...prev,
        remainingTrials: updatedRemainingTrials,
        bookings: updatedBookings,
        payments: updatedPayments,
        totalSavings: updatedSavings
      };
    });
  };

  const adminUpdateUserStatus = (email, newStatus) => {
    setRegisteredUsers(prev => prev.map(u => u.email === email ? { ...u, status: newStatus } : u));
  };
  const adminDeleteUser = (email) => {
    setRegisteredUsers(prev => prev.filter(u => u.email !== email));
  };
  const adminUpdateBooking = (email, bookingId, newStatus) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === email) {
        const updatedBookings = u.bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
        return { ...u, bookings: updatedBookings };
      }
      return u;
    }));
  };
  const getAllBookings = () => {
    return [];
  };

  return (
    <AuthContext.Provider value={{ 
      user, registeredUsers, login, register, logout, resetPassword, isAuthenticated: !!user, isLoading,
      updateMembership, updateProfile, addBooking, cancelBooking, rescheduleBooking,
      adminUpdateUserStatus, adminDeleteUser, adminUpdateBooking, getAllBookings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
