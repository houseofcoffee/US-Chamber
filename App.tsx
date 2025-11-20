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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Bar */}
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

        {/* Loading State */}
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
               <Users className="h-10 w-10 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No members found</h3>
             <p className="mt-2 text-slate-500">
               {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new member."}
             </p>
             {!searchTerm && (
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
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <MemberForm
          initialData={editingMember}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      
      {/* Saving overlay */}
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
