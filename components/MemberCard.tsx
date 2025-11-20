import React from 'react';
import { Member } from '../types';
import { Mail, Phone, MapPin, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit, onDelete }) => {
  // SAFETY CHECK: If the website is missing/empty, don't try to link it
  const hasWebsite = member.website && member.website.length > 0;
  // Helper to ensure website has https
  const websiteUrl = hasWebsite && !member.website.startsWith('http') 
    ? `https://${member.website}` 
    : member.website;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-slate-100 group">
      {/* Image Header */}
      <div className="h-48 overflow-hidden relative bg-slate-200">
        <img
          src={member.photoUrl || 'https://via.placeholder.com/400x300?text=No+Photo'}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Photo';
          }}
        />
        {/* Action Buttons (Overlay) */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onEdit(member)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-indigo-50 text-indigo-600 shadow-sm transition-colors"
            title="Edit Member"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(member.id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 text-red-500 shadow-sm transition-colors"
            title="Delete Member"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
          <p className="text-indigo-600 font-medium">{member.businessName}</p>
        </div>

        {/* Specialties Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {member.specialties && member.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Contact Info List */}
        <div className="mt-auto space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <a href={`mailto:${member.email}`} className="hover:text-indigo-600 truncate transition-colors">
              {member.email}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            {/* FIXED: Changed member.phoneNumber to member.phone */}
            <a href={`tel:${member.phone}`} className="hover:text-indigo-600 transition-colors">
              {member.phone}
            </a>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            {/* FIXED: Changed member.businessAddress to member.address */}
            <span className="leading-tight">{member.address}</span>
          </div>

          <div className="flex items-center gap-3">
            <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
            {/* FIXED: Changed member.businessWebsite to member.website */}
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
