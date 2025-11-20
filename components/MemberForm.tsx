import React, { useState, useEffect } from 'react';
import { Member, MemberFormData, Specialty } from '../types';
import { ALL_SPECIALTIES } from '../constants';
import { X, Check, Upload } from 'lucide-react';

interface MemberFormProps {
  initialData?: Member;
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
}

const EMPTY_FORM: MemberFormData = {
  photoUrl: '',
  name: '',
  phone: '',
  email: '',
  website: '',
  businessName: '',
  address: '',
  specialties: [],
};

export const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<MemberFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof MemberFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpecialty = (specialty: Specialty) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(specialty);
      let newSpecialties = [...prev.specialties];

      if (exists) {
        newSpecialties = newSpecialties.filter(s => s !== specialty);
      } else {
        if (newSpecialties.length >= 2) return prev;
        newSpecialties.push(specialty);
      }

      return { ...prev, specialties: newSpecialties };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Partial<Record<keyof MemberFormData, string>> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.businessName) newErrors.businessName = "Business name is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  // FIXED: Switched to placehold.co because via.placeholder.com is down
  const photoPreview = formData.photoUrl || 'https://placehold.co/400x300?text=Upload+Photo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-slate-800">
            {initialData ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="memberForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photo Upload */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
               <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="w-24 h-24 rounded-full bg-white overflow-hidden shrink-0 border-2 border-white shadow-md">
                   <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Photo'} 
                   />
                 </div>
                 <div className="flex-1">
                   <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer">
                     <Upload size={16} className="mr-2" />
                     <span>Upload Photo</span>
                     <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                     />
                   </label>
                   <p className="mt-2 text-xs text-slate-500">
                     Upload a professional photo from your device.<br/>
                     Supported formats: JPG, PNG. Max 5MB.
                   </p>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.businessName ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`}
                />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className={`w-full p-2 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`}
                />
                 {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.example.com"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Specialties Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Specialties</label>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  formData.specialties.length === 2 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  Selected: {formData.specialties.length}/2
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_SPECIALTIES.map((specialty) => {
                  const isSelected = formData.specialties.includes(specialty);
                  const isDisabled = !isSelected && formData.specialties.length >= 2;
                  
                  return (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      disabled={isDisabled}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all border
                        ${isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : isDisabled
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }
                      `}
                    >
                      {specialty}
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2">Select up to 2 specialties.</p>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors hover:bg-slate-200/50 rounded-lg"
          >
            Cancel
          </button>
          <button 
            form="memberForm"
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {initialData ? 'Update Member' : 'Create Member'}
          </button>
        </div>
      </div>
    </div>
  );
};
