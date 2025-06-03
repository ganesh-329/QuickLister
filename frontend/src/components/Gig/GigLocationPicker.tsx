import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { MapPinIcon, CheckIcon, XIcon, LocateIcon } from 'lucide-react';
import { 
  GOOGLE_MAPS_API_KEY, 
  DEFAULT_CENTER, 
  MAP_OPTIONS 
} from '../../config/maps';

// Static libraries array to prevent reloading warning
const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

interface GigLocationPickerProps {
  isOpen: boolean;
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number };
}

const GigLocationPicker: React.FC<GigLocationPickerProps> = ({
  isOpen,
  onLocationSelect,
  onClose,
  initialLocation
}) => {
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(
    initialLocation || null
  );
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(initialLocation || DEFAULT_CENTER);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  // Get user's current location when component opens
  useEffect(() => {
    if (isOpen && !userLocation && navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(currentPos);
          setMapCenter(currentPos);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setIsGettingLocation(false);
          // Fallback to default center or initial location
          setMapCenter(initialLocation || DEFAULT_CENTER);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, [isOpen, userLocation, initialLocation]);

  // Handle map click to place marker
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    console.log('Map clicked at position:', newPosition);
    setSelectedPosition(newPosition);
  }, []);

  // Set location to user's current position
  const useCurrentLocation = useCallback(() => {
    if (userLocation) {
      setSelectedPosition(userLocation);
    }
  }, [userLocation]);

  // Confirm location selection
  const confirmLocation = useCallback(async () => {
    if (!selectedPosition) return;

    try {
      // Try to get address from coordinates using reverse geocoding
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode(
          { location: selectedPosition },
          (results, status) => {
            if (status === 'OK') {
              resolve({ results: results || [] } as google.maps.GeocoderResponse);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      const address = response.results?.[0]?.formatted_address || '';
      
      onLocationSelect({
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        address
      });
    } catch (error) {
      console.error('Error getting address:', error);
      // Still return the coordinates even if address lookup fails
      onLocationSelect({
        lat: selectedPosition.lat,
        lng: selectedPosition.lng
      });
    }
  }, [selectedPosition, onLocationSelect]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      {loadError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Map</h3>
            <p className="text-gray-600 mb-4">Unable to load Google Maps. Please try again later.</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {!isLoaded && !loadError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg">
            <p>Loading map...</p>
          </div>
        </div>
      )}

      {isLoaded && !loadError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[80vh] mx-4 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <MapPinIcon size={20} className="mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Select Gig Location</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XIcon size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Instructions */}
            <div className={`p-4 border-b border-gray-200 ${
              selectedPosition ? 'bg-green-50' : 'bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${
                  selectedPosition ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {selectedPosition 
                    ? '✅ Location selected! You can confirm or click elsewhere to change it.'
                    : isGettingLocation 
                    ? 'Getting your location...' 
                    : 'Click on the map to select where this gig will take place. The map is centered on your current location.'
                  }
                </p>
                {userLocation && (
                  <button
                    onClick={useCurrentLocation}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 flex items-center gap-1"
                  >
                    <LocateIcon size={12} />
                    Use My Location
                  </button>
                )}
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={mapCenter}
                zoom={15} // Higher zoom since we're showing user's location
                options={MAP_OPTIONS}
                onClick={handleMapClick}
              >
                {/* User's current location marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: window.google?.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#3B82F6',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    title="Your current location"
                  />
                )}

                {/* Selected position marker using OverlayView */}
                {selectedPosition && (
                  <OverlayView
                    position={selectedPosition}
                    mapPaneName="overlayMouseTarget"
                  >
                    <div className="relative">
                      <div 
                        className="absolute bg-red-500 border-2 border-white rounded-full shadow-lg"
                        style={{
                          width: '18px',
                          height: '18px',
                          transform: 'translate(-50%, -50%)',
                          left: '0px',
                          top: '0px'
                        }}
                      >
                        <div 
                          className="absolute bg-white border border-red-500 rounded-full"
                          style={{
                            width: '6px',
                            height: '6px',
                            transform: 'translate(-50%, -50%)',
                            left: '50%',
                            top: '50%'
                          }}
                        />
                      </div>
                    </div>
                  </OverlayView>
                )}
              </GoogleMap>

              {/* Action Buttons */}
              {selectedPosition && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="bg-white border border-gray-300 p-3 rounded-full shadow-lg hover:bg-gray-50 focus:outline-none"
                    title="Clear Selection"
                  >
                    <XIcon size={24} className="text-red-500" />
                  </button>
                  
                  <button
                    onClick={confirmLocation}
                    className="bg-blue-500 p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
                    title="Confirm Location"
                  >
                    <CheckIcon size={24} className="text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedPosition ? (
                  <span>
                    Selected: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                  </span>
                ) : userLocation ? (
                  <span className="text-blue-600">
                    📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                ) : (
                  <span>No location selected</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLocation}
                  disabled={!selectedPosition}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Use This Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default GigLocationPicker;
