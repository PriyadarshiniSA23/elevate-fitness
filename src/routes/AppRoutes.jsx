import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import Programs from '../pages/Programs';
import Trainers from '../pages/Trainers';
import Memberships from '../pages/Memberships';
import AboutContact from '../pages/AboutContact';
import Login from '../pages/Login';
import Booking from '../pages/Booking';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';

// Layout Wrappers
import MainLayout from '../layouts/MainLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Main Site Routes (with Main Header/Footer) */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/programs" element={<MainLayout><Programs /></MainLayout>} />
      <Route path="/trainers" element={<MainLayout><Trainers /></MainLayout>} />
      <Route path="/memberships" element={<MainLayout><Memberships /></MainLayout>} />
      <Route path="/about-contact" element={<MainLayout><AboutContact /></MainLayout>} />
      
      {/* Separate Pages (Custom Header/Footers or Panels) */}
      <Route path="/login" element={<Login />} />
      <Route path="/book" element={<Booking />} />
      
      {/* Portals */}
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      
      {/* Error & Redirect fallback */}
      <Route path="/404" element={<MainLayout><NotFound /></MainLayout>} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
