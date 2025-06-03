import React, { useState } from 'react';
import { MapPinIcon, ClockIcon, TagIcon } from 'lucide-react';
import { useGigStore } from '../../stores/gigStore';
import { useAuth } from '../Auth/AuthContext';
import GigLocationPicker from './GigLocationPicker';

interface CreateGigFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateGigForm = ({
  onClose,
  onSuccess
}: CreateGigFormProps) => {
  const { createGig, loading } = useGigStore();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    address: '',
    city: '',
    state: '',
    latitude: 28.6139,
    longitude: 77.209,
    pay: '',
    paymentType: 'hourly' as 'hourly' | 'fixed',
    skills: [] as string[],
    duration: '1',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    experienceLevel: 'intermediate' as 'entry' | 'intermediate' | 'experienced' | 'expert',
    isFlexible: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in to create a gig');
      return;
    }

    try {
      const gigData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          type: 'Point' as const,
          coordinates: [formData.longitude, formData.latitude] as [number, number],
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: 'India'
        },
        skills: formData.skills.map(skill => ({
          name: skill,
          category: 'general',
          proficiency: 'intermediate' as const,
          isRequired: true
        })),
        payment: {
          rate: parseInt(formData.pay),
          currency: 'INR',
          paymentType: formData.paymentType,
          paymentMethod: 'bank_transfer' as const
        },
        timeline: {
          duration: parseInt(formData.duration),
          isFlexible: formData.isFlexible
        },
        urgency: formData.urgency,
        experienceLevel: formData.experienceLevel,
        status: 'posted' as const
      };

      await createGig(gigData);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create gig');
    }
  };

  const handleSkillChange = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address
    }));
    setIsLocationPickerOpen(false);
  };

  const SKILL_OPTIONS = [
    'JavaScript', 'React', 'Node.js', 'Python', 'House Cleaning', 
    'Plumbing', 'Electrical', 'Driving', 'Tutoring', 'Photography', 
    'Writing', 'Design', 'Marketing', 'Customer Service', 'Repair', 'Gardening'
  ];
  
  const CATEGORY_OPTIONS = [
    { value: 'tech_services', label: 'Tech Services' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'photography', label: 'Photography' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'home_services', label: 'Home Services' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gig Title
          </label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" 
            placeholder="Enter gig title" 
            required 
            minLength={5}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select 
            value={formData.category} 
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" 
            required
          >
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" 
            rows={4} 
            placeholder="Describe the gig requirements (minimum 20 characters)" 
            required 
            minLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <MapPinIcon size={16} className="mr-1" />
              Location
            </div>
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" 
                placeholder="Street address" 
                required 
              />
              <input 
                type="text" 
                value={formData.city} 
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" 
                placeholder="City" 
                required 
              />
            </div>
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-2"
            >
              <MapPinIcon size={16} />
              Select Location on Map
            </button>
            {formData.latitude !== 28.6139 || formData.longitude !== 77.209 ? (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                ✓ Location selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </div>
            ) : null}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <span className="mr-1 text-green-600 font-bold">₹</span>
                Pay Rate (INR)
              </div>
            </label>
            <input 
              type="number" 
              value={formData.pay} 
              onChange={e => setFormData(prev => ({ ...prev, pay: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" 
              placeholder="Enter amount" 
              required 
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select 
              value={formData.paymentType} 
              onChange={e => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'hourly' | 'fixed' }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="hourly">Per Hour</option>
              <option value="fixed">Fixed Price</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <TagIcon size={16} className="mr-1" />
              Required Skills
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => (
              <button 
                key={skill} 
                type="button" 
                onClick={() => handleSkillChange(skill)} 
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.skills.includes(skill) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <ClockIcon size={16} className="mr-1" />
                Duration (hours)
              </div>
            </label>
            <select 
              value={formData.duration} 
              onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="1">1 hour</option>
              <option value="4">4 hours</option>
              <option value="8">8 hours</option>
              <option value="16">2 days</option>
              <option value="40">1 week</option>
              <option value="80">2 weeks</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select 
              value={formData.urgency} 
              onChange={e => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Post Gig'}
          </button>
        </div>
      </form>

      <GigLocationPicker
        isOpen={isLocationPickerOpen}
        onLocationSelect={handleLocationSelect}
        onClose={() => setIsLocationPickerOpen(false)}
        initialLocation={{ lat: formData.latitude, lng: formData.longitude }}
      />
    </>
  );
};

export default CreateGigForm;
