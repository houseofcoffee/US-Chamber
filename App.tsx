import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Lock, Mail, Phone, MapPin, Link as LinkIcon, X, Check, Upload, Filter, Edit2 } from 'lucide-react';

// --- CONFIGURATION ---
const SITE_PASSWORD = 'member'; 
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzeaKmya-twSvdeOauZsZSbsJSump5WXfCr4jwDcITk_0QJCm1LOHdKxo0w7nqIkKSn2Q/exec';

// --- TYPES ---
export enum Specialty {
  Agriculture = 'Agriculture',
  Consulting = 'Consulting',
  ECommerce = 'E-Commerce',
  FinancialServices = 'Financial Services',
  Healthcare = 'Healthcare',
  Landscaping = 'Landscaping',
  Marketing = 'Marketing',
  Media = 'Media',
  Retail = 'Retail',
  Technology = 'Technology',
}

export const ALL_SPECIALTIES = [
  Specialty.Agriculture,
  Specialty.Consulting,
  Specialty.ECommerce,
  Specialty.FinancialServices,
  Specialty.Healthcare,
  Specialty.Landscaping,
  Specialty.Marketing,
  Specialty.Media,
  Specialty.Retail,
  Specialty.Technology,
];

export interface Member {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  specialties: string[];
  photoUrl: string;
  pin?: string; // New field for the PIN
}

export type MemberFormData = Omit<Member, 'id'>;

// --- HELPERS ---

const inferSpecialties = (businessName: string, existingSpecialties: string[]): string[] => {
  if (existingSpecialties && existingSpecialties.length > 0 && existingSpecialties[0] !== '') {
    return existingSpecialties;
  }

  const name = businessName.toLowerCase();
  const tags = new Set<string>();

  if (name.includes('farm') || name.includes('hay') || name.includes('dairy')) tags.add(Specialty.Agriculture);
  if (name.includes('tech') || name.includes('web') || name.includes('data') || name.includes('systems') || name.includes('precision') || name.includes('digital') || name.includes('cyber')) tags.add(Specialty.Technology);
  if (name.includes('health') || name.includes('medical') || name.includes('care') || name.includes('wellness') || name.includes('dental') || name.includes('clinic')) tags.add(Specialty.Healthcare);
  if (name.includes('bank') || name.includes('capital') || name.includes('wealth') || name.includes('insurance') || name.includes('financial') || name.includes('invest')) tags.add(Specialty.FinancialServices);
  if (name.includes('media') || name.includes('tv') || name.includes('radio') || name.includes('productions') || name.includes('pixels') || name.includes('communications')) tags.add(Specialty.Media);
  if (name.includes('marketing') || name.includes('brand') || name.includes('creative') || name.includes('advertising') || name.includes('pr ')) tags.add(Specialty.Marketing);
  if (name.includes('landscaping') || name.includes('garden') || name.includes('lawn') || name.includes('builders') || name.includes('construction')) tags.add(Specialty.Landscaping);
  if (name.includes('consulting') || name.includes('group') || name.includes('associates') || name.includes('partners') || name.includes('solutions') || name.includes('advisors') || name.includes('services') || name.includes('hire') || name.includes('staffing')) tags.add(Specialty.Consulting);
  if (name.includes('coffee') || name.includes('wine') || name.includes('shop') || name.includes('store') || name.includes('market') || name.includes('grape') || name.includes('retail') || name.includes('sales') || name.includes('solar')) tags.add(Specialty.Retail);
  if (name.includes('online') || name.includes('.com') || name.includes('e-commerce')) tags.add(Specialty.ECommerce);

  if (tags.size === 0) {
    tags.add(Specialty.Consulting);
  }

  return Array.from(tags).slice(0, 2);
};

// --- SERVICES ---
async function fetchMembers(): Promise<Member[]> {
  try {
    const response = await fetch(SHEETS_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    const rawData = await response.json();
    
    const cleanData = rawData.map((item: any) => {
      const rawSpecialties = Array.isArray(item.specialties) ? item.specialties : item.specialties ? item.specialties.split(',') : [];
      
      return {
        id: item.id,
        name: item.name || '',
        businessName: item.businessName || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        website: item.website || '',
        specialties: inferSpecialties(item.businessName || '', rawSpecialties), 
        photoUrl: item.photoUrl || '',
        pin: item.pin ? String(item.pin) : '' // Ensure PIN is a string
      };
    });

    // SORTING: Sort by Last Name (Ascending)
    cleanData.sort((a: any, b: any) => {
      const getLastName = (fullName: string) => {
        if (!fullName) return '';
        const parts = fullName.trim().split(' ');
        return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
      };

      const lastNameA = getLastName(a.name);
      const lastNameB = getLastName(b.name);

      return lastNameA.localeCompare(lastNameB);
    });

    return cleanData;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

async function addMember(member: Omit<Member, 'id'>): Promise<{ success: boolean; id?: string }> {
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      body: JSON.stringify(member),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add member');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding member:', error);
    return { success: false };
  }
}

// --- COMPONENTS ---

// 1. PinModal Component
interface PinModalProps {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ onSubmit, onCancel }) => {
  const [pin, setPin] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Enter Security PIN</h3>
          <p className="text-sm text-slate-500 mt-1">Please enter the last 4 digits of the member's phone number to edit.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            placeholder="0000"
            className="w-full p-4 text-center text-2xl tracking-widest border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none mb-6 font-mono"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length < 4}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. MemberCard Component
interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
}

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    let idMatch = url.match(/id=([^&]+)/);
    if (!idMatch) {
      idMatch = url.match(/\/file\/d\/([^/]+)/);
    }
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w800`;
    }
  }
  return url;
};

const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit }) => {
  const hasWebsite = member.website && member.website.length > 0;
  const websiteUrl = hasWebsite && !member.website?.startsWith('http') 
    ? `https://${member.website}` 
    : member.website;
  const placeholderImage = 'https://placehold.co/400x300?text=No+Photo';
  const validPhotoUrl = getOptimizedImageUrl(member.photoUrl);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-slate-100 group relative">
      {/* Edit Button (Visible on Hover) */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(member)}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
          title="Edit Member"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {/* SQUARE IMAGE CONTAINER */}
      <div className="aspect-square w-full overflow-hidden relative bg-white border-b border-slate-100">
        <img
          src={validPhotoUrl || placeholderImage}
          alt={member.name || 'Member'}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== placeholderImage) {
              target.src = placeholderImage;
            }
          }}
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
          <p className="text-indigo-600 font-medium">{member.businessName}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {member.specialties?.map((specialty) => (
            <span
              key={specialty}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>

        <div className="mt-auto space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <a href={`mailto:${member.email}`} className="hover:text-indigo-600 truncate transition-colors">
              {member.email}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <a href={`tel:${member.phone}`} className="hover:text-indigo-600 transition-colors">
              {member.phone}
            </a>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{member.address}</span>
          </div>

          <div className="flex items-center gap-3">
            <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
            {hasWebsite ? (
              <a 
                href={websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-indigo-600 truncate transition-colors"
              >
                {member.website}
              </a>
            ) : (
              <span className="text-slate-400 italic">No website</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. MemberForm Component
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

const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSubmit, onCancel }) => {
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

  const toggleSpecialty = (specialty: string) => {
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

// --- MAIN APP ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [verifyPinMember, setVerifyPinMember] = useState<Member | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('chamber_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadMembers();
    }
  }, [isAuthenticated]);

  const loadMembers = async () => {
    setIsLoading(true);
    const data = await fetchMembers();
    setMembers(data);
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SITE_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
      sessionStorage.setItem('chamber_auth', 'true');
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  const handleAddMember = () => {
    setEditingMember(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (member: Member) => {
    // Instead of opening form immediately, prompt for PIN
    setVerifyPinMember(member);
  };

  const handlePinVerify = (pin: string) => {
    if (verifyPinMember) {
      if (pin === verifyPinMember.pin) {
        setEditingMember(verifyPinMember);
        setIsFormOpen(true);
        setVerifyPinMember(undefined);
      } else {
        alert("Incorrect PIN. Please try again.");
      }
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      alert('Delete functionality needs to be implemented in the Google Apps Script');
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSaving(true);
    
    if (editingMember) {
      // TODO: Implement Edit logic in Google Apps Script
      // For now, just show alert
      alert('Edit functionality needs to be implemented in the Google Apps Script.');
      setIsFormOpen(false);
      setIsSaving(false);
    } else {
      const result = await addMember(data);
      if (result.success) {
        await loadMembers(); 
        setIsFormOpen(false);
      } else {
        alert('Failed to add member. Please try again.');
      }
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.specialties && m.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesSpecialty = selectedSpecialty 
      ? m.specialties && m.specialties.includes(selectedSpecialty)
      : true;

    return matchesSearch && matchesSpecialty;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 text-center">U.S. Chamber of Commerce<br/>Small Business Council Members</h1>
            <p className="text-slate-500 mt-2 text-sm">Please enter the password to access.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className={`w-full p-3 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500 text-center ${
                  loginError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-xs mt-2 text-center font-medium">Incorrect password</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors shadow-md hover:shadow-lg active:scale-95 transform duration-100"
            >
              Access Directory
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 hidden sm:block">
              U.S. Chamber of Commerce Small Business Council Members
            </h1>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:hidden">
              Small Business Council Members
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search members by name, business, or specialty..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Specialty Filter Bubbles */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSpecialty(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSpecialty === null
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              All
            </button>
            {ALL_SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialty === specialty
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-slate-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Loading members...</h3>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20">
             <div className="mx-auto h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Filter className="h-10 w-10 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No members found</h3>
             <p className="mt-2 text-slate-500">
               {searchTerm || selectedSpecialty ? "Try adjusting your filters." : "Get started by adding a new member."}
             </p>
             {!searchTerm && !selectedSpecialty && (
                <div className="mt-6 flex justify-center">
                   <button onClick={handleAddMember} className="text-indigo-600 hover:underline">Add Member</button>
                </div>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={handleEditClick}
                onDelete={handleDeleteMember}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Form Modal */}
      {isFormOpen && (
        <MemberForm
          initialData={editingMember}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {/* PIN Verification Modal */}
      {verifyPinMember && (
        <PinModal
          onSubmit={handlePinVerify}
          onCancel={() => setVerifyPinMember(undefined)}
        />
      )}
      
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p className="text-lg font-medium">Saving member...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
