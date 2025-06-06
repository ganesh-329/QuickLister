import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  onClose: () => void;
  isActive: boolean;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  onPlaceSelected,
  onClose,
  isActive
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 2) {
      try {
        const autocompleteService = new google.maps.places.AutocompleteService();
        const response = await autocompleteService.getPlacePredictions({
          input: value,
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'in' }
        });
        
        setPredictions(response?.predictions || []);
        setShowPredictions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionClick = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      const placesService = new google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.getDetails(
          {
            placeId: prediction.place_id,
            fields: ['geometry', 'name', 'formatted_address']
          },
          (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error('Failed to get place details'));
            }
          }
        );
      });

      onPlaceSelected(place);
      setSearchQuery(prediction.description);
      setShowPredictions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] w-full max-w-md px-4">
      <div className="bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search for a location..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPredictions([]);
                  setShowPredictions(false);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        {/* Predictions dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handlePredictionClick(prediction)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <Search className="text-gray-400" />
                <span className="text-sm">{prediction.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
