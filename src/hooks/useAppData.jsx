import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPrograms, mockMemberships } from '../services/api';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [trainers, setTrainers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Initialize from LocalStorage or API Mocks
  useEffect(() => {
    fetchTrainers();

    fetchPrograms();

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
  const fetchTrainers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trainers');
      const data = await res.json();
      if (data.success) {
        // Map backend schema to frontend expectation
        const mappedTrainers = data.trainers.map(t => ({
          id: t.id,
          name: t.trainer_name,
          email: t.email,
          phone: t.phone,
          specialization: t.specialization,
          experience: t.years_of_experience,
          certifications: t.certifications,
          bio: t.biography,
          tier: t.membership_access_level,
          availability: t.availability,
          category: t.category,
          title: t.title,
          image: t.profile_image || '/images/default_trainer.png',
          rating: parseFloat(t.rating) || 5.0,
          assignedPrograms: t.assignedPrograms || [],
          mapped_programs: t.mapped_programs || [] // Raw objects if needed
        }));
        setTrainers(mappedTrainers);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
      addNotification('Failed to fetch trainers from server.');
    }
  };

  const updateTrainer = async (id, updatedData) => {
    try {
      const existingTrainer = trainers.find(t => t.id === id);
      if (!existingTrainer) return;
      const merged = { ...existingTrainer, ...updatedData };
      const token = localStorage.getItem('elevate_token');

      // Map assigned program titles to program IDs
      const programIds = (merged.assignedPrograms || []).map(title => {
        const prog = programs.find(p => p.title === title);
        return prog ? prog.id : null;
      }).filter(id => id !== null);

      const payload = {
        // Standard keys used currently
        trainer_name: merged.name,
        email: merged.email,
        phone: merged.phone,
        specialization: merged.specialization,
        years_of_experience: merged.experience,
        certifications: merged.certifications,
        biography: merged.bio,
        membership_access_level: merged.tier,
        availability: merged.availability,
        category: merged.category,
        title: merged.title,
        profile_image: merged.image,
        assignedPrograms: merged.assignedPrograms,

        // Required API naming conventions from requirements list
        full_name: merged.name,
        phone_number: merged.phone,
        experience: merged.experience,
        tier_access: merged.tier,
        programIds: programIds
      };

      const res = await fetch(`http://localhost:5000/api/trainers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        logActivity(`Trainer ${merged.name} updated.`);
        if (data.trainer) {
          const t = data.trainer;
          const updatedTrainerObj = {
            id: t.id,
            name: t.trainer_name,
            email: t.email,
            phone: t.phone,
            specialization: t.specialization,
            experience: t.years_of_experience,
            certifications: t.certifications,
            bio: t.biography,
            tier: t.membership_access_level,
            availability: t.availability,
            category: t.category,
            title: t.title,
            image: t.profile_image || '/images/default_trainer.png',
            rating: parseFloat(t.rating) || 5.0,
            assignedPrograms: t.assignedPrograms || [],
            mapped_programs: t.mapped_programs || []
          };
          setTrainers(prev => prev.map(item => item.id === id ? updatedTrainerObj : item));
        }
        fetchTrainers();
      } else {
        addNotification(data.message || 'Failed to update trainer.');
      }
    } catch (error) {
      console.error('Error updating trainer:', error);
      addNotification('Error updating trainer.');
    }
  };

  const addTrainer = async (newTrainer) => {
    try {
      const token = localStorage.getItem('elevate_token');
      const payload = {
        trainer_name: newTrainer.name,
        email: newTrainer.email,
        phone: newTrainer.phone,
        specialization: newTrainer.specialization,
        years_of_experience: newTrainer.experience,
        certifications: newTrainer.certifications,
        biography: newTrainer.bio,
        membership_access_level: newTrainer.tier,
        availability: newTrainer.availability,
        category: newTrainer.category,
        title: newTrainer.title,
        profile_image: newTrainer.image,
        assignedPrograms: newTrainer.assignedPrograms
      };

      const res = await fetch('http://localhost:5000/api/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        logActivity(`Trainer ${newTrainer.name} added.`);
        addNotification(`New Trainer Added: ${newTrainer.name}`);
        fetchTrainers();
      } else {
        addNotification(data.message || 'Failed to add trainer.');
      }
    } catch (error) {
      console.error('Error adding trainer:', error);
      addNotification('Error adding trainer.');
    }
  };

  const deleteTrainer = async (id) => {
    try {
      const token = localStorage.getItem('elevate_token');
      const res = await fetch(`http://localhost:5000/api/trainers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        logActivity(`Trainer ID ${id} deleted.`);
        fetchTrainers();
      } else {
        addNotification(data.message || 'Failed to delete trainer.');
      }
    } catch (error) {
      console.error('Error deleting trainer:', error);
      addNotification('Error deleting trainer.');
    }
  };

  // --- Program Updaters (API Integration) ---
  const fetchPrograms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/programs');
      const data = await res.json();
      if (data.success) {
        // Map backend schema to frontend mock structure
        const mappedPrograms = data.programs.map(p => ({
          id: p.id,
          title: p.program_name,
          description: p.description,
          duration: p.duration + ' min', // keep as string to match old UI expectations
          price: p.price,
          image: p.program_image || '/images/default.png',
          availability: p.availability,
          tier: p.membership_access_level || 'Standard',
          category: p.difficulty_level || 'wellness',
          capacity: p.capacity,
          rating: 5.0
        }));
        setPrograms(mappedPrograms);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      addNotification('Failed to fetch programs from server.');
    }
  };

  const updateProgram = async (id, updatedData) => {
    try {
      const existingProgram = programs.find(p => p.id === id);
      if (!existingProgram) {
        console.error('Program not found for update');
        return;
      }
      const merged = { ...existingProgram, ...updatedData };

      const token = localStorage.getItem('elevate_token');
      // Reverse map
      const payload = {
        program_name: merged.title,
        description: merged.description,
        duration: parseInt(merged.duration),
        price: merged.price,
        program_image: merged.image,
        availability: merged.availability,
        membership_access_level: merged.tier,
        difficulty_level: merged.category,
        capacity: merged.maxCapacity || merged.capacity
      };

      const res = await fetch(`http://localhost:5000/api/programs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        logActivity(`Program ${updatedData.title || id} updated.`);
        fetchPrograms(); // refresh list
      } else {
        addNotification(data.message || 'Failed to update program.');
      }
    } catch (error) {
      console.error('Error updating program:', error);
      addNotification('Error updating program.');
    }
  };

  const addProgram = async (newProgram) => {
    try {
      const token = localStorage.getItem('elevate_token');
      const payload = {
        program_name: newProgram.title,
        description: newProgram.description,
        duration: parseInt(newProgram.duration),
        price: newProgram.price,
        program_image: newProgram.image,
        availability: newProgram.availability,
        membership_access_level: newProgram.tier,
        difficulty_level: newProgram.category,
        capacity: newProgram.maxCapacity
      };

      const res = await fetch('http://localhost:5000/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        logActivity(`Program ${newProgram.title} added.`);
        addNotification(`New Program Added: ${newProgram.title}`);
        fetchPrograms(); // refresh list
      } else {
        addNotification(data.message || 'Failed to add program.');
      }
    } catch (error) {
      console.error('Error adding program:', error);
      addNotification('Error adding program.');
    }
  };

  const deleteProgram = async (id) => {
    try {
      const token = localStorage.getItem('elevate_token');
      const res = await fetch(`http://localhost:5000/api/programs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        logActivity(`Program ID ${id} deleted.`);
        fetchPrograms(); // refresh list
      } else {
        addNotification(data.message || 'Failed to delete program.');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      addNotification('Error deleting program.');
    }
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
