import React, { useState } from 'react';
import { Marker } from '@react-google-maps/api';
import { MapPinIcon, CheckIcon, XIcon } from 'lucide-react';

interface LocationPickerProps {
  isActive: boolean;
  onSelect: (location: google.maps.LatLngLiteral) => void;
  onCancel: () => void;
  mapRef: google.maps.Map | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  isActive, 
  onSelect, 
  onCancel, 
  mapRef 
}) => {
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);

  // Handle map click to place marker
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!isActive || !e.latLng) return;
    setPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  };

  // Add click listener when component becomes active
  React.useEffect(() => {
    if (!mapRef || !isActive) return;
    
    // Add click listener
    const clickListener = mapRef.addListener('click', handleMapClick);
    
    // Add instructions overlay
    const instructionDiv = document.createElement('div');
    instructionDiv.id = 'location-picker-instruction';
    instructionDiv.className = 'absolute top-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-full shadow-md z-50';
    instructionDiv.innerHTML = '<span class="font-medium">Tap on the map to set your location</span>';
    document.querySelector('.h-full.w-full.relative')?.appendChild(instructionDiv);
    
    // Add cursor style
    const mapElement = mapRef.getDiv();
    mapElement.style.cursor = 'crosshair';
    
    return () => {
      // Remove listener and UI elements when inactive
      google.maps.event.removeListener(clickListener);
      document.getElementById('location-picker-instruction')?.remove();
      mapElement.style.cursor = '';
      
      // Clear selected position when deactivated without confirming
      if (isActive) setPosition(null);
    };
  }, [mapRef, isActive]);

  // Confirm location selection
  const confirmLocation = () => {
    if (position) {
      onSelect(position);
      setPosition(null);
    }
  };

  return (
    <>
      {/* Selected location marker */}
      {isActive && position && (
        <>
          <Marker
            position={position}
            icon={{
              path: window.google?.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
          
          {/* Confirmation controls */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
            <button
              onClick={onCancel}
              className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
              aria-label="Cancel location selection"
            >
              <XIcon size={24} className="text-red-500" />
            </button>
            
            <button
              onClick={confirmLocation}
              className="bg-blue-500 p-3 rounded-full shadow-md hover:bg-blue-600 focus:outline-none"
              aria-label="Confirm location selection"
            >
              <CheckIcon size={24} className="text-white" />
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default LocationPicker; 