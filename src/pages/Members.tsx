import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  X,
  Save,
  UserPlus
} from 'lucide-react';
import api from '../services/api';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  membershipType: string;
  membershipStatus: string;
  membershipEnd: string;
  emergencyContact: string;
  age: number;
  gender: string;
  goals: string;
}

type MemberFormData = Omit<Member, 'id'> & { id?: number };

const emptyMemberForm: MemberFormData = {
  name: '',
  email: '',
  phone: '',
  joinDate: new Date().toISOString().split('T')[0],
  membershipType: 'Standard',
  membershipStatus: 'Active',
  membershipEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  emergencyContact: '',
  age: 18,
  gender: 'Male',
  goals: '',
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormData>(emptyMemberForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    let result = [...members];
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(member => member.membershipStatus === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(member => 
        member.name.toLowerCase().includes(term) || 
        member.email.toLowerCase().includes(term) ||
        member.phone.includes(term)
      );
    }
    
    setFilteredMembers(result);
  }, [members, searchTerm, statusFilter]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/members');
      setMembers(response.data);
      setFilteredMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setMemberForm(emptyMemberForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (member: Member) => {
    setMemberForm(member);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setMemberForm(emptyMemberForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Update existing member
        await api.put(`/members/${memberForm.id}`, memberForm);
        toast.success('Member updated successfully');
        
        setMembers(prev => 
          prev.map(member => 
            member.id === memberForm.id ? memberForm as Member : member
          )
        );
      } else {
        // Add new member
        const response = await api.post('/members', memberForm);
        toast.success('Member added successfully');
        
        setMembers(prev => [...prev, response.data]);
      }
      
      closeModal();
      
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error(isEditing ? 'Failed to update member' : 'Failed to add member');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }
    
    try {
      await api.delete(`/members/${id}`);
      toast.success('Member deleted successfully');
      
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Members</h1>
          <p className="text-text-light">Manage gym members</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-light" />
          </div>
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        
        <div className="sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-text-light" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input pl-10 appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Membership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-light">Loading members...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-light">No members found</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{member.email}</div>
                      <div className="text-sm text-text-light">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{member.membershipType}</div>
                      <div className="text-sm text-text-light">
                        Expires: {new Date(member.membershipEnd).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        member.membershipStatus === 'Active' 
                          ? 'badge-success' 
                          : 'badge-error'
                      }`}>
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="text-secondary hover:text-secondary-dark transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="text-error hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg animate-slide-up">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <UserPlus size={20} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-secondary">
                  {isEditing ? 'Edit Member' : 'Add New Member'}
                </h2>
              </div>
              <button 
                onClick={closeModal}
                className="text-text-light hover:text-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-secondary">Personal Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={memberForm.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={memberForm.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      required
                      value={memberForm.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="form-label">Age</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        min="14"
                        max="100"
                        required
                        value={memberForm.age}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="form-label">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={memberForm.gender}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyContact" className="form-label">Emergency Contact</label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={memberForm.emergencyContact}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Name: Phone"
                    />
                  </div>
                </div>
                
                {/* Membership Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-secondary">Membership Information</h3>
                  
                  <div>
                    <label htmlFor="membershipType" className="form-label">Membership Type</label>
                    <select
                      id="membershipType"
                      name="membershipType"
                      required
                      value={memberForm.membershipType}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="membershipStatus" className="form-label">Status</label>
                    <select
                      id="membershipStatus"
                      name="membershipStatus"
                      required
                      value={memberForm.membershipStatus}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="joinDate" className="form-label">Join Date</label>
                    <input
                      type="date"
                      id="joinDate"
                      name="joinDate"
                      required
                      value={memberForm.joinDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="membershipEnd" className="form-label">Membership End Date</label>
                    <input
                      type="date"
                      id="membershipEnd"
                      name="membershipEnd"
                      required
                      value={memberForm.membershipEnd}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="goals" className="form-label">Fitness Goals</label>
                    <textarea
                      id="goals"
                      name="goals"
                      rows={3}
                      value={memberForm.goals}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Weight loss, Muscle gain, General fitness, etc."
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>{isEditing ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;