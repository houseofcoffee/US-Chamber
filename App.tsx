import React, { useState, useEffect } from 'react';
import { Member } from './types';
import { MemberCard } from './components/MemberCard';
import { MemberForm } from './components/MemberForm';
import { fetchMembers, addMember } from './sheetsService';
import { Plus, Users, Search } from 'lucide-react';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load members on mount
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    const data = await fetchMembers();
    setMembers(data);
    setIsLoading(false);
  };

  const handleAddMember = () => {
    setEditingMember(undefined);
    setIsFormOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      // Note: Deleting from Google Sheets requires additional implementation
      alert('Delete functionality needs to be implemented in the Google Apps Script');
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSaving(true);
    
    if (editingMember) {
      // Update - needs implementation in Google Apps Script
      alert('Edit functionality needs to be implemented');
      setIsFormOpen(false);
      setIsSaving(false);
    } else {
      // Create new
      const result = await addMember(data);
      if (result.success) {
        await loadMembers(); // Reload to get the new member
        setIsFormOpen(false);
      } else {
        alert('Failed to add member. Please try again.');
      }
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.specialties && m.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 hidden sm:block">
              Elite Member Directory
            </h1>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:hidden">
              Directory
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

      {/* Main Content */}
