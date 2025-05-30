import React, { useState } from 'react';
import { MapPinIcon, DollarSignIcon, ClockIcon, TagIcon } from 'lucide-react';
interface CreateGigFormProps {
  onSubmit: (gigData: any) => void;
  onClose: () => void;
}
const CreateGigForm = ({
  onSubmit,
  onClose
}: CreateGigFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    pay: '',
    skills: [] as string[],
    duration: '1',
    availability: 'immediate'
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  const handleSkillChange = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
    }));
  };
  const SKILL_OPTIONS = ['Driving', 'Cleaning', 'IT', 'Customer Service', 'Repair', 'Tools', 'Writing', 'Design', 'Photography', 'Marketing'];
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gig Title
        </label>
        <input type="text" value={formData.title} onChange={e => setFormData(prev => ({
        ...prev,
        title: e.target.value
      }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" placeholder="Enter gig title" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea value={formData.description} onChange={e => setFormData(prev => ({
        ...prev,
        description: e.target.value
      }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" rows={3} placeholder="Describe the gig requirements" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <MapPinIcon size={16} className="mr-1" />
              Location
            </div>
          </label>
          <input type="text" value={formData.location} onChange={e => setFormData(prev => ({
          ...prev,
          location: e.target.value
        }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Enter location" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <DollarSignIcon size={16} className="mr-1" />
              Pay Rate (per hour)
            </div>
          </label>
          <input type="number" value={formData.pay} onChange={e => setFormData(prev => ({
          ...prev,
          pay: e.target.value
        }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Enter pay rate" required />
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
          {SKILL_OPTIONS.map(skill => <button key={skill} type="button" onClick={() => handleSkillChange(skill)} className={`px-3 py-1 rounded-full text-sm ${formData.skills.includes(skill) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {skill}
            </button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-1" />
              Duration (days)
            </div>
          </label>
          <select value={formData.duration} onChange={e => setFormData(prev => ({
          ...prev,
          duration: e.target.value
        }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="7">1 week</option>
            <option value="14">2 weeks</option>
            <option value="30">1 month</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <select value={formData.availability} onChange={e => setFormData(prev => ({
          ...prev,
          availability: e.target.value
        }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
            <option value="immediate">Immediate</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="next_week">Next Week</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Post Gig
        </button>
      </div>
    </form>;
};
export default CreateGigForm;