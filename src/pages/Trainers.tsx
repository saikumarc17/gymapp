import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Save,
  Award
} from 'lucide-react';
import api from '../services/api';

interface Trainer {
  id: number;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  specialties: string[];
  certifications: string[];
  bio: string;
  schedule: string;
  imageUrl: string;
}

type TrainerFormData = Omit<Trainer, 'id'> & { id?: number };

const emptyTrainerForm: TrainerFormData = {
  name: '',
  email: '',
  phone: '',
  hireDate: new Date().toISOString().split('T')[0],
  specialties: [],
  certifications: [],
  bio: '',
  schedule: '',
  imageUrl: '',
};

const Trainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [trainerForm, setTrainerForm] = useState<TrainerFormData>(emptyTrainerForm);
  const [isEditing, setIsEditing] = useState(false);

  // For handling arrays like specialties and certifications
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredTrainers(trainers.filter(trainer => 
        trainer.name.toLowerCase().includes(term) || 
        trainer.email.toLowerCase().includes(term) ||
        trainer.specialties.some(s => s.toLowerCase().includes(term))
      ));
    } else {
      setFilteredTrainers(trainers);
    }
  }, [trainers, searchTerm]);

  const fetchTrainers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/trainers');
      setTrainers(response.data);
      setFilteredTrainers(response.data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setTrainerForm(emptyTrainerForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (trainer: Trainer) => {
    setTrainerForm({...trainer});
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTrainerForm(emptyTrainerForm);
    setSpecialtyInput('');
    setCertificationInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrainerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setTrainerForm(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (index: number) => {
    setTrainerForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (certificationInput.trim()) {
      setTrainerForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()]
      }));
      setCertificationInput('');
    }
  };

  const removeCertification = (index: number) => {
    setTrainerForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Update existing trainer
        await api.put(`/trainers/${trainerForm.id}`, trainerForm);
        toast.success('Trainer updated successfully');
        
        setTrainers(prev => 
          prev.map(trainer => 
            trainer.id === trainerForm.id ? trainerForm as Trainer : trainer
          )
        );
      } else {
        // Add new trainer
        const response = await api.post('/trainers', trainerForm);
        toast.success('Trainer added successfully');
        
        setTrainers(prev => [...prev, response.data]);
      }
      
      closeModal();
      
    } catch (error) {
      console.error('Error saving trainer:', error);
      toast.error(isEditing ? 'Failed to update trainer' : 'Failed to add trainer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) {
      return;
    }
    
    try {
      await api.delete(`/trainers/${id}`);
      toast.success('Trainer deleted successfully');
      
      setTrainers(prev => prev.filter(trainer => trainer.id !== id));
    } catch (error) {
      console.error('Error deleting trainer:', error);
      toast.error('Failed to delete trainer');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Trainers</h1>
          <p className="text-text-light">Manage gym trainers</p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Trainer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-text-light" />
        </div>
        <input
          type="text"
          placeholder="Search trainers by name, email, or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pl-10"
        />
      </div>

      {/* Trainers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-card">
          <div className="text-text-light">No trainers found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <div 
              key={trainer.id}
              className="card overflow-hidden hover:shadow-card-hover"
            >
              <div className="aspect-video overflow-hidden rounded-md mb-4 bg-gray-100">
                <img 
                  src={trainer.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-secondary">{trainer.name}</h3>
                  <p className="text-text-light text-sm">{trainer.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(trainer)}
                    className="p-1 text-secondary hover:text-secondary-dark transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(trainer.id)}
                    className="p-1 text-error hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {trainer.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-sm text-secondary mb-1">Certifications</h4>
                <div className="flex flex-wrap gap-1">
                  {trainer.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-text-light text-xs px-2 py-1 rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="mt-4 text-sm text-text-light line-clamp-3">
                {trainer.bio}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Trainer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg animate-slide-up">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Award size={20} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-secondary">
                  {isEditing ? 'Edit Trainer' : 'Add New Trainer'}
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
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-secondary">Basic Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={trainerForm.name}
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
                      value={trainerForm.email}
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
                      value={trainerForm.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="hireDate" className="form-label">Hire Date</label>
                    <input
                      type="date"
                      id="hireDate"
                      name="hireDate"
                      required
                      value={trainerForm.hireDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="imageUrl" className="form-label">Profile Image URL</label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={trainerForm.imageUrl}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-secondary">Professional Information</h3>
                  
                  <div>
                    <label className="form-label">Specialties</label>
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        className="form-input rounded-r-none"
                        placeholder="e.g., Weight training"
                      />
                      <button
                        type="button"
                        onClick={addSpecialty}
                        className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trainerForm.specialties.map((specialty, index) => (
                        <div key={index} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center gap-1">
                          <span>{specialty}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Certifications</label>
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        value={certificationInput}
                        onChange={(e) => setCertificationInput(e.target.value)}
                        className="form-input rounded-r-none"
                        placeholder="e.g., NASM CPT"
                      />
                      <button
                        type="button"
                        onClick={addCertification}
                        className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trainerForm.certifications.map((cert, index) => (
                        <div key={index} className="bg-gray-100 text-text-light rounded-full px-3 py-1 text-sm flex items-center gap-1">
                          <span>{cert}</span>
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="text-text-light hover:text-text"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="schedule" className="form-label">Schedule</label>
                    <input
                      type="text"
                      id="schedule"
                      name="schedule"
                      value={trainerForm.schedule}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., Mon-Fri: 9AM-5PM"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="form-label">Biography</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={trainerForm.bio}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Brief bio of the trainer..."
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

export default Trainers;