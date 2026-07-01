import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AddTrainerModal({ onClose, onSave, programs, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    specialization: initialData?.specialization || '',
    experience: initialData?.experience || '',
    certifications: initialData?.certifications || '',
    bio: initialData?.bio || '',
    tier: initialData?.tier || 'Standard',
    availability: initialData?.availability || 'Active',
    assignedPrograms: initialData?.assignedPrograms || [],
    image: initialData?.image || null
  });

  const isEditing = !!initialData;

  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.95, y: 20, duration: 0.2, ease: 'power2.in',
      onComplete: onClose
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProgramToggle = (programTitle) => {
    setFormData(prev => {
      const assigned = prev.assignedPrograms.includes(programTitle)
        ? prev.assignedPrograms.filter(p => p !== programTitle)
        : [...prev.assignedPrograms, programTitle];
      return { ...prev, assignedPrograms: assigned };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialization || !formData.experience) {
      alert("Please fill in all required fields.");
      return;
    }
    
    // Generate initials avatar if no image
    let finalImage = formData.image;
    if (!finalImage) {
      const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      finalImage = `https://ui-avatars.com/api/?name=${initials}&background=E9C349&color=111111&size=200&font-size=0.4&bold=true`;
    }

    const newTrainer = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialization,
      experience: formData.experience,
      certifications: formData.certifications,
      bio: formData.bio,
      tier: formData.tier,
      availability: formData.availability,
      category: formData.assignedPrograms.length > 0 ? 'wellness' : 'strength', // simplistic category map
      title: 'Performance Coach',
      rating: 5.0,
      image: finalImage,
      assignedPrograms: formData.assignedPrograms
    };

    onSave(newTrainer);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose}></div>
      <div 
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-white/10 p-6 shadow-2xl custom-scrollbar"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-primary">{isEditing ? 'Edit Coach' : 'Add New Coach'}</h2>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Row: Photo & Basic Details */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-24 h-24 rounded-full border border-white/10 overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">person</span>
                )}
              </div>
              <label className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-tertiary hover:text-primary transition">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Full Name *</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. Marcus Lee" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="marcus@elevate.fit" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Specialization *</label>
                <input type="text" name="specialization" value={formData.specialization || ''} onChange={handleChange} required className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. Hypertrophy & Biomechanics" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Years of Experience *</label>
              <input type="text" name="experience" value={formData.experience || ''} onChange={handleChange} required className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. 5 Years" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Certifications</label>
              <input type="text" name="certifications" value={formData.certifications || ''} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. CSCS, NASM" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Membership Tier</label>
              <select name="tier" value={formData.tier} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none">
                <option value="Standard">Standard</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Availability</label>
              <select name="availability" value={formData.availability} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none">
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Biography</label>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none custom-scrollbar" placeholder="Enter professional biography..."></textarea>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Assigned Programs</label>
            <div className="flex flex-wrap gap-2">
              {programs && programs.length > 0 ? programs.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProgramToggle(p.title)}
                  className={`px-3 py-1 text-xs border rounded-full transition-all ${formData.assignedPrograms.includes(p.title) ? 'bg-tertiary/20 border-tertiary text-tertiary font-bold' : 'bg-transparent border-white/10 text-on-surface-variant hover:border-white/30'}`}
                >
                  {p.title}
                </button>
              )) : (
                <span className="text-xs text-on-surface-variant italic">No programs available.</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-white/5">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-6 py-2.5 rounded font-label-caps text-xs tracking-wider uppercase font-bold text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded font-label-caps text-xs tracking-wider uppercase font-bold bg-tertiary text-on-tertiary hover:brightness-110 transition-all shadow-lg shadow-tertiary/20"
            >
              {isEditing ? 'Save Changes' : 'Create Coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
