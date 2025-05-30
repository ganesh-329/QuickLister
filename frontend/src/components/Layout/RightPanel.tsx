import React, { useState } from 'react';
import { XIcon, TagIcon, MapPinIcon, ClockIcon, DollarSignIcon } from 'lucide-react';
const SKILL_OPTIONS = ['Driving', 'Cleaning', 'IT', 'Customer Service', 'Repair', 'Tools', 'Writing', 'Design', 'Photography', 'Marketing'];
const RightPanel = ({
  isOpen,
  activeFilters,
  setActiveFilters
}) => {
  const [distance, setDistance] = useState(10);
  const [minPay, setMinPay] = useState(10);
  const toggleFilter = filter => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  const clearFilters = () => {
    setActiveFilters([]);
    setDistance(10);
    setMinPay(10);
  };
  if (!isOpen) return null;
  return <div className="w-72 bg-white shadow-lg z-10 overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <XIcon size={20} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <TagIcon size={18} className="mr-2 text-blue-600" />
            <h3 className="font-medium">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => <button key={skill} onClick={() => toggleFilter(skill)} className={`px-3 py-1 rounded-full text-sm ${activeFilters.includes(skill) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {skill}
              </button>)}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <MapPinIcon size={18} className="mr-2 text-blue-600" />
            <h3 className="font-medium">Distance</h3>
          </div>
          <input type="range" min="1" max="50" value={distance} onChange={e => setDistance(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>1 km</span>
            <span>{distance} km</span>
            <span>50 km</span>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <DollarSignIcon size={18} className="mr-2 text-blue-600" />
            <h3 className="font-medium">Minimum Pay</h3>
          </div>
          <input type="range" min="5" max="50" value={minPay} onChange={e => setMinPay(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>$5/hr</span>
            <span>${minPay}/hr</span>
            <span>$50/hr</span>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <ClockIcon size={18} className="mr-2 text-blue-600" />
            <h3 className="font-medium">Availability</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              Today
            </button>
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              Tomorrow
            </button>
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              This Week
            </button>
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              Next Week
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={clearFilters} className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Clear All
          </button>
          <button className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Apply Filters
          </button>
        </div>
      </div>
    </div>;
};
export default RightPanel;