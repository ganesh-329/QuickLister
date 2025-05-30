import React from 'react';
import { LayersIcon, AlertCircleIcon, MapPinIcon, PlusIcon, MinusIcon, ArrowLeftIcon } from 'lucide-react';
import { FaLocationArrow, FaMapMarkerAlt, FaSatellite, FaRoad, FaSearch } from 'react-icons/fa';

interface MapControlsProps {
  setCenter: (position: google.maps.LatLngLiteral) => void;
  onToggleLocationPicker: () => void;
  resetToLiveLocation: () => void;
  isLocationPickerActive: boolean;
  hasManualLocation: boolean;
  mapRef: google.maps.Map | null;
  searchRadius: number | null;
  onRadiusChange: (radius: number | null) => void;
  onToggleSearchOverlay: () => void;
  isSearchOverlayActive: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({ 
  setCenter,
  onToggleLocationPicker,
  resetToLiveLocation,
  isLocationPickerActive,
  hasManualLocation,
  mapRef,
  searchRadius,
  onRadiusChange,
  onToggleSearchOverlay,
  isSearchOverlayActive
}) => {
  // Handle zoom in
  const handleZoomIn = () => {
    if (mapRef) {
      const currentZoom = mapRef.getZoom() || 0;
      mapRef.setZoom(currentZoom + 1);
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (mapRef) {
      const currentZoom = mapRef.getZoom() || 0;
      mapRef.setZoom(Math.max(0, currentZoom - 1));
    }
  };

  // Toggle between map types (e.g., roadmap, satellite)
  const toggleMapLayer = () => {
    if (mapRef) {
      const currentType = mapRef.getMapTypeId();
      const newType = currentType === 'roadmap' ? 'satellite' : 'roadmap';
      mapRef.setMapTypeId(newType);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onRadiusChange(value || null);
  };

  return (
    <>
      {/* Main controls group (left side) */}
      <div className="absolute left-6 top-32 z-[400] flex flex-col gap-3">
        {/* Zoom controls */}
        <button 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none transition-all"
          title="Zoom In"
          onClick={handleZoomIn}
        >
          <PlusIcon size={24} className="text-gray-700" />
        </button>
        
        <button 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none transition-all"
          title="Zoom Out"
          onClick={handleZoomOut}
        >
          <MinusIcon size={24} className="text-gray-700" />
        </button>
        
        {/* Map type toggle */}
        <button 
          onClick={toggleMapLayer} 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none transition-all"
          title="Toggle Map Type"
        >
          <LayersIcon size={24} className="text-gray-700" />
        </button>
        
        {/* Search overlay toggle */}
        <button 
          onClick={onToggleSearchOverlay}
          className={`p-3 rounded-full shadow-lg focus:outline-none transition-all ${
            isSearchOverlayActive
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Search Location"
        >
          <FaSearch size={24} />
        </button>
        
        {/* Manual location picker */}
        <button 
          onClick={onToggleLocationPicker}
          className={`p-3 rounded-full shadow-lg focus:outline-none transition-all ${
            isLocationPickerActive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : hasManualLocation
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Set Location Manually"
        >
          <MapPinIcon size={24} />
        </button>
        
        {/* Return to live location button - only when using manual location */}
        {hasManualLocation && (
          <button 
            onClick={resetToLiveLocation}
            className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none transition-all"
            title="Return to Live Location"
          >
            <ArrowLeftIcon size={24} />
          </button>
        )}
      </div>
      
      {/* Report issue button (bottom left) */}
      <div className="absolute bottom-6 left-6 z-[400] flex gap-3">
        <button 
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none transition-all"
          title="Report Issue"
        >
          <AlertCircleIcon size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Radius Control */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Search Radius</label>
            <input
              type="range"
              min="0"
              max="15000"
              step="100"
              value={searchRadius || 0}
              onChange={handleRadiusChange}
              className="w-32"
            />
            <div className="text-xs text-gray-500">
              {searchRadius ? `${searchRadius / 1000} km` : 'No radius'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapControls;