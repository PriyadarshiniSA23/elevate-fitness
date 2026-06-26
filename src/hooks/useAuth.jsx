import React, { createContext, useContext, useState, useEffect } from 'react';

const logAppActivity = (action, color = 'text-tertiary', bg = 'bg-tertiary') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('elevate_activity', { detail: { action, color, bg } }));
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Auto-login Julian by default for demonstration or read from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('elevate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedUsers = localStorage.getItem('elevate_registered_users');
    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    }
  }, []);

  const register = (userDetails) => {
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === userDetails.email.toLowerCase());
    if (emailExists) {
      return { error: 'EXISTS' };
    }

    const newId = `MF${String(registeredUsers.length + 1).padStart(4, '0')}`;

    const newUser = {
      ...userDetails,
      memberId: newId,
      role: 'member',
      remainingTrials: 2,
      membership: null,
      tier: 'Guest',
      registrationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      bookings: [],
      payments: [],
      totalSavings: 0
    };
    
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));
    
    setUser(newUser);
    localStorage.setItem('elevate_user', JSON.stringify(newUser));
    logAppActivity(`New account created: ${newUser.name}`, 'text-blue-400', 'bg-blue-400');
    return newUser;
  };

  const login = (email, password) => {
    // Check Admin first
    if (email.toLowerCase() === 'elevateadmin@gmail.com') {
      if (password === 'admin123') {
        const adminUser = {
          name: "Rajiv Sharma",
          email: "elevateadmin@gmail.com",
          role: "admin",
          avatar: "/images/img_6e03f63b.png"
        };
        setUser(adminUser);
        localStorage.setItem('elevate_user', JSON.stringify(adminUser));
        return adminUser;
      } else {
        return { error: 'INVALID_PASSWORD' };
      }
    }

    // Check registered users
    const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      return { error: 'NOT_FOUND' };
    }

    if (existingUser.password !== password) {
      return { error: 'INVALID_PASSWORD' };
    }

    setUser(existingUser);
    localStorage.setItem('elevate_user', JSON.stringify(existingUser));
    return existingUser;
  };

  const resetPassword = (email, newPassword) => {
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex !== -1) {
      const updatedUsers = [...registeredUsers];
      updatedUsers[userIndex].password = newPassword;
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elevate_user');
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
      localStorage.setItem('elevate_user', JSON.stringify(updated));
      
      const storedUsers = JSON.parse(localStorage.getItem('elevate_registered_users') || '[]');
      const updatedUsers = storedUsers.map(u => u.email === updated.email ? updated : u);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));
      
      return updated;
    });
  };

  const updateProfile = (profileData) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...profileData };
      localStorage.setItem('elevate_user', JSON.stringify(updated));
      
      const storedUsers = JSON.parse(localStorage.getItem('elevate_registered_users') || '[]');
      const updatedUsers = storedUsers.map(u => u.email === updated.email ? updated : u);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));
      
      return updated;
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

      const updatedUser = { ...prev, bookings: updatedBookings, remainingTrials: newRemainingTrials };
      localStorage.setItem('elevate_user', JSON.stringify(updatedUser));

      const storedUsers = JSON.parse(localStorage.getItem('elevate_registered_users') || '[]');
      const updatedUsers = storedUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));
      
      logAppActivity(`Booking Cancelled by User`, 'text-error', 'bg-error');
      return updatedUser;
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

      const updatedUser = { ...prev, bookings: updatedBookings };
      localStorage.setItem('elevate_user', JSON.stringify(updatedUser));

      const storedUsers = JSON.parse(localStorage.getItem('elevate_registered_users') || '[]');
      const updatedUsers = storedUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));

      logAppActivity(`Booking Rescheduled by User`, 'text-purple-400', 'bg-purple-400');
      return updatedUser;
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

      const updatedUser = {
        ...prev,
        remainingTrials: updatedRemainingTrials,
        bookings: updatedBookings,
        payments: updatedPayments,
        totalSavings: updatedSavings
      };

      localStorage.setItem('elevate_user', JSON.stringify(updatedUser));
      
      const storedUsers = JSON.parse(localStorage.getItem('elevate_registered_users') || '[]');
      const updatedUsers = storedUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updatedUsers));
      
      if (sessionType.includes('Discovery')) {
        logAppActivity(`Discovery Session booked by ${prev.name}`, 'text-purple-400', 'bg-purple-400');
      } else {
        logAppActivity(`Program booked by ${prev.name}`, 'text-blue-400', 'bg-blue-400');
      }

      return updatedUser;
    });
  };

  const adminUpdateUserStatus = (email, newStatus) => {
    setRegisteredUsers(prev => {
      const updated = prev.map(u => u.email === email ? { ...u, status: newStatus } : u);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updated));
      return updated;
    });
  };

  const adminDeleteUser = (email) => {
    setRegisteredUsers(prev => {
      const updated = prev.filter(u => u.email !== email);
      localStorage.setItem('elevate_registered_users', JSON.stringify(updated));
      return updated;
    });
  };

  const adminUpdateBooking = (email, bookingId, newStatus) => {
    setRegisteredUsers(prev => {
      const updated = prev.map(u => {
        if (u.email === email) {
          const updatedBookings = u.bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
          return { ...u, bookings: updatedBookings };
        }
        return u;
      });
      localStorage.setItem('elevate_registered_users', JSON.stringify(updated));
      return updated;
    });
    
    setUser(prev => {
      if (prev && prev.email === email) {
        const updatedBookings = prev.bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
        const updatedUser = { ...prev, bookings: updatedBookings };
        localStorage.setItem('elevate_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prev;
    });
  };

  const getAllBookings = () => {
    const allBookings = [];
    registeredUsers.forEach(u => {
      if (u.bookings) {
        u.bookings.forEach(b => {
          let syntheticSessionDT = b.sessionDateTime;
          if (!syntheticSessionDT) {
            try {
              syntheticSessionDT = new Date(`${b.date} ${b.time}`).toISOString();
            } catch {
              syntheticSessionDT = new Date().toISOString();
            }
          }

          let syntheticCreatedAt = b.createdAt;
          if (!syntheticCreatedAt) {
            syntheticCreatedAt = syntheticSessionDT;
          }

          allBookings.push({ 
            ...b, 
            createdAt: syntheticCreatedAt,
            sessionDateTime: syntheticSessionDT,
            userEmail: u.email, 
            userName: u.name, 
            userMembership: u.membership?.type || 'Guest' 
          });
        });
      }
    });
    return allBookings;
  };

  return (
    <AuthContext.Provider value={{ 
      user, registeredUsers, login, register, logout, resetPassword, isAuthenticated: !!user, 
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

