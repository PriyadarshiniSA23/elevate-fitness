import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AddProgramModal({ onClose, onSave, trainers, initialData }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    duration: initialData?.duration || '',
    price: initialData?.price || '',
    category: initialData?.category || 'wellness',
    tier: initialData?.tier || 'Standard',
    difficulty: initialData?.difficulty || 'Beginner',
    maxCapacity: initialData?.maxCapacity || initialData?.capacity || '',
    description: initialData?.description || '',
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
    if (!formData.title || !formData.duration || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    // Default placeholder image
    let finalImage = formData.image || '/images/default_program.png';

    const newProgram = {
      id: Date.now().toString(),
      title: formData.title,
      duration: `${formData.duration} min`,
      price: Number(formData.price),
      category: formData.category,
      tier: formData.tier,
      difficulty: formData.difficulty,
      maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : null,
      description: formData.description || 'Elevate standard program.',
      image: finalImage,
      rating: 5.0
    };

    onSave(newProgram);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose}></div>
      <div 
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-white/10 p-6 shadow-2xl custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-primary">{isEditing ? 'Edit Program' : 'Add New Program'}</h2>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-white transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image & Main Details */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-24 h-24 rounded border border-white/10 overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">image</span>
                )}
              </div>
              <label className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-tertiary hover:text-primary transition">
                Upload Cover
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Program Name *</label>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. High Intensity Flow" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Duration (Minutes) *</label>
                <input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} required className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. 60 min" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Price (₹) *</label>
                <input type="number" name="price" value={formData.price ?? ''} onChange={handleChange} required className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. 1500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none">
                <option value="wellness">Wellness & Recovery</option>
                <option value="strength">Strength & Conditioning</option>
                <option value="cardio">Cardio & Endurance</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Membership Access</label>
              <select name="tier" value={formData.tier} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none">
                <option value="Standard">Standard</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Max Capacity (Optional)</label>
              <input type="number" name="maxCapacity" value={formData.maxCapacity ?? ''} onChange={handleChange} className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none" placeholder="e.g. 20" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Program Description</label>
            <textarea name="description" value={formData.description ?? ''} onChange={handleChange} rows="3" className="w-full bg-surface-container border border-white/5 rounded p-2 text-sm text-primary focus:border-tertiary focus:outline-none custom-scrollbar" placeholder="Details about this program..."></textarea>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Assigned Trainers (Read Only)</label>
            <div className="flex flex-col gap-1">
              {trainers && initialData?.title && trainers.filter(t => t.assignedPrograms && t.assignedPrograms.includes(initialData.title)).length > 0 ? (
                trainers.filter(t => t.assignedPrograms && t.assignedPrograms.includes(initialData.title)).map(t => (
                  <span
                    key={t.id}
                    className="text-xs text-on-surface-variant flex items-center gap-2"
                  >
                    • {t.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-on-surface-variant italic">No trainers assigned.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-tertiary text-on-tertiary text-xs font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition">{isEditing ? 'Save Changes' : 'Save Program'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
