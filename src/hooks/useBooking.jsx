import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

const initialBookingState = {
  program: null, // { title, price, duration, category }
  trainer: null, // { name, title }
  date: null,    // string e.g. "Nov 14"
  time: null,    // string e.g. "07:30 AM"
  name: '',
  email: '',
  notes: '',
  paymentCard: '',
  paymentExpiry: '',
  paymentCvc: ''
};

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(initialBookingState);
  const [currentStep, setCurrentStep] = useState(1);

  const selectProgram = (program) => {
    // If program changes, reset trainer (Program -> Trainer dependency)
    setBooking(prev => ({
      ...prev,
      program,
      trainer: null
    }));
  };

  const selectTrainer = (trainer) => {
    setBooking(prev => ({ ...prev, trainer }));
  };

  const selectSchedule = (date, time) => {
    setBooking(prev => ({ ...prev, date, time }));
  };

  const setDetails = (details) => {
    setBooking(prev => ({ ...prev, ...details }));
  };

  const setPayment = (payment) => {
    setBooking(prev => ({ ...prev, ...payment }));
  };

  const resetBooking = () => {
    setBooking(initialBookingState);
    setCurrentStep(1);
  };

  return (
    <BookingContext.Provider value={{
      booking,
      currentStep,
      setCurrentStep,
      selectProgram,
      selectTrainer,
      selectSchedule,
      setDetails,
      setPayment,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
