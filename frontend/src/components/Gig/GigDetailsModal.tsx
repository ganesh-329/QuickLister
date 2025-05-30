import React from 'react';
import { DollarSignIcon, MapPinIcon, ClockIcon, StarIcon, UserIcon } from 'lucide-react';
interface GigDetailsModalProps {
  gig: {
    title: string;
    pay: string;
    skills: string[];
    description?: string;
    location?: string;
    duration?: string;
    postedBy?: string;
  };
  onApply: () => void;
}
const GigDetailsModal = ({
  gig,
  onApply
}: GigDetailsModalProps) => {
  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{gig.title}</h2>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center text-green-600">
            <DollarSignIcon size={18} className="mr-1" />
            <span className="font-semibold">{gig.pay}</span>
          </div>
          {gig.location && <div className="flex items-center text-gray-600">
              <MapPinIcon size={18} className="mr-1" />
              <span>{gig.location}</span>
            </div>}
          {gig.duration && <div className="flex items-center text-gray-600">
              <ClockIcon size={18} className="mr-1" />
              <span>{gig.duration}</span>
            </div>}
        </div>
      </div>
      {gig.postedBy && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium">Posted by {gig.postedBy}</div>
            <div className="flex items-center text-sm text-gray-600">
              <StarIcon size={16} className="mr-1 text-yellow-400 fill-current" />
              <span>4.8 (124 reviews)</span>
            </div>
          </div>
        </div>}
      {gig.description && <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-600">{gig.description}</p>
        </div>}
      <div>
        <h3 className="font-medium mb-2">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {gig.skills.map((skill, index) => <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {skill}
            </span>)}
        </div>
      </div>
      <button onClick={onApply} className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
        Apply Now
      </button>
    </div>;
};
export default GigDetailsModal;