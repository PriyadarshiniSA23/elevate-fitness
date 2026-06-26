import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockTrainers, mockPrograms, mockMemberships } from '../services/api';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [trainers, setTrainers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Initialize from LocalStorage or API Mocks
  useEffect(() => {
    const savedTrainers = localStorage.getItem('elevate_trainers');
    if (savedTrainers) setTrainers(JSON.parse(savedTrainers));
    else { setTrainers(mockTrainers); localStorage.setItem('elevate_trainers', JSON.stringify(mockTrainers)); }

    const savedPrograms = localStorage.getItem('elevate_programs');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));
    else { setPrograms(mockPrograms); localStorage.setItem('elevate_programs', JSON.stringify(mockPrograms)); }

    const savedMemberships = localStorage.getItem('elevate_memberships');
    if (savedMemberships) setMemberships(JSON.parse(savedMemberships));
    else { setMemberships(mockMemberships); localStorage.setItem('elevate_memberships', JSON.stringify(mockMemberships)); }

    const savedNotifs = localStorage.getItem('elevate_notifications');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    const savedLogs = localStorage.getItem('elevate_activity_logs');
    if (savedLogs) setActivityLog(JSON.parse(savedLogs));

    const handleCustomActivity = (e) => {
      if (e.detail) {
        logActivity(e.detail.action, e.detail.color, e.detail.bg);
      }
    };
    window.addEventListener('elevate_activity', handleCustomActivity);
    return () => window.removeEventListener('elevate_activity', handleCustomActivity);
  }, []);

  const addNotification = (message) => {
    const newNotif = { id: Date.now().toString() + Math.random(), message, date: new Date().toLocaleString() };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('elevate_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const logActivity = (action, color = 'text-tertiary', bg = 'bg-tertiary') => {
    const newLog = { 
      id: Date.now().toString() + Math.random(), 
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      color,
      bg,
      action 
    };
    setActivityLog(prev => {
      const updated = [newLog, ...prev].slice(0, 100); // Keep last 100
      localStorage.setItem('elevate_activity_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // --- Trainer Updaters ---
  const updateTrainer = (id, updatedData) => {
    setTrainers(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updatedData } : t);
      localStorage.setItem('elevate_trainers', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Trainer ${updatedData.name || id} updated.`);
  };

  const addTrainer = (newTrainer) => {
    setTrainers(prev => {
      const updated = [...prev, newTrainer];
      localStorage.setItem('elevate_trainers', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Trainer ${newTrainer.name} added.`);
    addNotification(`New Trainer Added: ${newTrainer.name}`);
  };

  const deleteTrainer = (id) => {
    setTrainers(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('elevate_trainers', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Trainer ID ${id} deleted.`);
  };

  // --- Program Updaters ---
  const updateProgram = (id, updatedData) => {
    setPrograms(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedData } : p);
      localStorage.setItem('elevate_programs', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Program ${updatedData.title || id} updated.`);
  };

  const addProgram = (newProgram) => {
    setPrograms(prev => {
      const updated = [...prev, newProgram];
      localStorage.setItem('elevate_programs', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Program ${newProgram.title} added.`);
    addNotification(`New Program Added: ${newProgram.title}`);
  };

  const deleteProgram = (id) => {
    setPrograms(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('elevate_programs', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Program ID ${id} deleted.`);
  };

  // --- Membership Updaters ---
  const updateMembershipPricing = (id, updatedData) => {
    setMemberships(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...updatedData } : m);
      localStorage.setItem('elevate_memberships', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Membership ${id} pricing updated.`);
  };

  return (
    <AppDataContext.Provider value={{
      trainers, updateTrainer, addTrainer, deleteTrainer,
      programs, updateProgram, addProgram, deleteProgram,
      memberships, updateMembershipPricing,
      notifications, addNotification,
      activityLog, logActivity
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
