import React, { useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { Gig } from '../../services/gigService';
import { MapPinIcon, CalendarIcon } from 'lucide-react';

interface GigMarkerProps {
  gig: Gig;
  isSelected: boolean;
  onClick: (gigId: string) => void;
  mapRef: google.maps.Map | null;
}

const GigMarker: React.FC<GigMarkerProps> = ({ gig, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Position for the marker
  const position = {
    lat: gig.location.coordinates[1],
    lng: gig.location.coordinates[0]
  };

  // Trigger animation when selected
  React.useEffect(() => {
    if (isSelected) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(gig._id);
    }
  }, [gig._id, onClick]);

  // Get urgency color
  const getUrgencyColor = () => {
    switch (gig.urgency) {
      case 'urgent':
        return 'bg-red-500 border-red-600';
      case 'high':
        return 'bg-orange-500 border-orange-600';
      case 'medium':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-green-500 border-green-600';
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    // You can expand this based on actual categories
    switch (gig.category.toLowerCase()) {
      case 'delivery':
        return '🚚';
      case 'tech':
        return '💻';
      case 'home':
        return '🏠';
      case 'food':
        return '🍕';
      default:
        return '💼';
    }
  };

  return (
    <OverlayView
      position={position}
      mapPaneName="overlayMouseTarget"
      getPixelPositionOffset={() => ({ x: -20, y: -40 })}
    >
      <div className="relative">
        {/* Main Marker */}
        <div
          className={`
            relative cursor-pointer transform transition-all duration-200 hover:scale-110
            ${shouldAnimate ? 'animate-bounce' : ''}
            ${isSelected ? 'z-50' : 'z-10'}
          `}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Marker Pin */}
          <div className={`
            w-10 h-10 ${getUrgencyColor()} rounded-full flex items-center justify-center
            shadow-lg border-2 border-white relative
            ${isHovered || isSelected ? 'ring-4 ring-opacity-30' : ''}
            ${isHovered || isSelected ? 'ring-blue-400' : ''}
          `}>
            <span className="text-white text-lg">{getCategoryIcon()}</span>
            
            {/* Pin tail */}
            <div className={`
              absolute -bottom-2 left-1/2 transform -translate-x-1/2
              w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px]
              border-l-transparent border-r-transparent
              ${getUrgencyColor().replace('bg-', 'border-t-')}
            `} />
          </div>

          {/* Price Badge */}
          <div className={`
            absolute -top-2 -right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-full
            font-semibold shadow-md border border-gray-700
            ${isHovered || isSelected ? 'opacity-100' : 'opacity-90'}
          `}>
            ₹{gig.payment.rate}
            {gig.payment.paymentType === 'hourly' && '/hr'}
          </div>
        </div>

        {/* Hover Card */}
        {(isHovered || isSelected) && (
          <div className={`
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
            bg-white rounded-lg shadow-xl border border-gray-200 p-3
            min-w-[250px] max-w-[300px] z-50
            ${isHovered || isSelected ? 'animate-fadeIn' : ''}
          `}>
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                          w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px]
                          border-l-transparent border-r-transparent border-t-white" />
            
            <div className="space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {gig.title}
              </h3>

              {/* Location */}
              <div className="flex items-center text-xs text-gray-600 gap-1">
                <MapPinIcon className="text-gray-400" />
                <span className="line-clamp-1">{gig.location.address}</span>
              </div>

              {/* Timeline */}
              <div className="flex items-center text-xs text-gray-600 gap-1">
                <CalendarIcon className="text-gray-400" />
                <span>
                  {gig.timeline.duration ? `${gig.timeline.duration} hours` : 'Flexible'}
                  {gig.timeline.preferredTime && ` • ${gig.timeline.preferredTime}`}
                </span>
              </div>

              {/* Skills */}
              {gig.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {gig.skills.slice(0, 3).map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {gig.skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{gig.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {gig.applicationsCount} applicant{gig.applicationsCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OverlayView>
  );
};

export default GigMarker;
