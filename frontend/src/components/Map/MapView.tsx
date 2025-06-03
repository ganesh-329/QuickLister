import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import MapControls from './MapControls';
import UserLocationMarker from './UserLocationMarker';
import LocationPicker from './LocationPicker';
import SearchOverlay from './SearchOverlay';
import Modal from '../UI/Modal';
import GigDetailsModal from '../Gig/GigDetailsModal';
import { useGigStore } from '../../stores/gigStore';
import { 
  GOOGLE_MAPS_API_KEY, 
  DEFAULT_CENTER, 
  DEFAULT_ZOOM, 
  MAP_OPTIONS 
} from '../../config/maps';

// Static libraries array to prevent reloading warning
const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

interface MapViewProps {
  searchQuery: string;
  activeFilters: string[];
  selectedLocation?: google.maps.places.PlaceResult | null;
  onMapsApiLoaded?: (isLoaded: boolean) => void;
}

const MapView: React.FC<MapViewProps> = ({ searchQuery, activeFilters, selectedLocation, onMapsApiLoaded }) => {
  // Get gigs from the store
  const { 
    gigs, 
    loading, 
    error, 
    fetchGigs, 
 
    setUserLocation, 
    searchGigs,
    selectedGig,
    setSelectedGig
  } = useGigStore();

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [isLocationPickerActive, setIsLocationPickerActive] = useState(false);
  const [userDefinedLocation, setUserDefinedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isInitialLocationSet, setIsInitialLocationSet] = useState(false);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const [markerObjects, setMarkerObjects] = useState<google.maps.Marker[]>([]);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [filteredGigs, setFilteredGigs] = useState(gigs);
  const [gigsInRadius, setGigsInRadius] = useState<number>(0);
  const [isSearchOverlayActive, setIsSearchOverlayActive] = useState(false);

  // Load Google Maps API with static libraries array
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  useEffect(() => {
    if (onMapsApiLoaded) onMapsApiLoaded(isLoaded);
  }, [isLoaded, onMapsApiLoaded]);

  // Fetch all gigs globally on mount - only once
  useEffect(() => {
    fetchGigs();
  }, []); // Remove dependency to prevent infinite loop

  // Handle search query changes
  useEffect(() => {
    if (searchQuery) {
      const currentLocation = userDefinedLocation || center;
      if (currentLocation) {
        searchGigs(searchQuery);
      }
    } else {
      // When no search query, show all global gigs
      fetchGigs();
    }
  }, [searchQuery]); // Remove dependencies that cause loops

  // Initialize location tracking when component mounts (navigation to Browse Jobs)
  useEffect(() => {

    setIsInitialLocationSet(false);
    setUserDefinedLocation(null);
    setShowUserLocation(true);
    setSearchSelectedLocation(null);
  }, []);

  // Filter gigs based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredGigs(gigs);
      return;
    }
    
    const filtered = gigs.filter(gig => {
      return activeFilters.some(filter => 
        gig.skills.some(skill => skill.name.toLowerCase().includes(filter.toLowerCase()))
      );
    });
    
    setFilteredGigs(filtered);
  }, [gigs, activeFilters]);

  // Automatically get user's location on initial load or when navigating to Browse Jobs
  useEffect(() => {
    if (isLoaded && navigator.geolocation && !isInitialLocationSet && showUserLocation) {

      // Get current location when component first loads
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCenter(newPos);
          setUserLocation(newPos);
          if (mapRef) {
            mapRef.panTo(newPos);
            mapRef.setZoom(15);
          }
          setIsInitialLocationSet(true);
        },
        () => {
          setIsInitialLocationSet(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10000
        }
      );
    }
  }, [isLoaded, mapRef, setUserLocation, isInitialLocationSet, showUserLocation]);

  // Callback for when the map loads
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Toggle location picker mode
  const toggleLocationPicker = useCallback(() => {
    setIsLocationPickerActive(prev => !prev);
    if (!isLocationPickerActive) {
      setSelectedGig(null);
    }
  }, [isLocationPickerActive, setSelectedGig]);

  // Handle location selection from manual picker
  const handleLocationSelected = useCallback((location: google.maps.LatLngLiteral) => {
    setUserDefinedLocation(location);
    setCenter(location);
    setIsLocationPickerActive(false);
    setShowUserLocation(false);
    setUserLocation(location);
    fetchGigs({ lat: location.lat, lng: location.lng, radius: 15 });
  }, [setUserLocation, fetchGigs]);

  // Cancel location picking
  const handleLocationPickerCancel = useCallback(() => {
    setIsLocationPickerActive(false);
  }, []);

  // Reset to live location
  const resetToLiveLocation = useCallback(() => {
    setUserDefinedLocation(null);
    setShowUserLocation(true);
  }, []);

  // Handle search overlay place selection
  const handleSearchPlaceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setCenter(newCenter);
      setUserDefinedLocation(newCenter);
      setShowUserLocation(false);
      setUserLocation(newCenter);
      setSearchSelectedLocation(newCenter);
      fetchGigs({ lat: newCenter.lat, lng: newCenter.lng, radius: 15 });
      if (mapRef) {
        mapRef.panTo(newCenter);
        mapRef.setZoom(15);
      }
      setIsSearchOverlayActive(false);
    }
  }, [mapRef, setUserLocation, fetchGigs]);

  // Toggle search overlay
  const toggleSearchOverlay = useCallback(() => {
    setIsSearchOverlayActive(prev => !prev);
  }, []);

  // Update marker clustering when filtered gigs change
  useEffect(() => {
    if (!mapRef || !window.google) return;
    
    // Remove previous markers
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
    markerObjects.forEach(marker => marker.setMap(null));
    
    // Create new markers for filtered gigs (always show them, even during location picking)
    const newMarkers = filteredGigs.map(gig => {
      const marker = new window.google.maps.Marker({
        position: { 
          lat: gig.location.coordinates[1],
          lng: gig.location.coordinates[0] 
        },
        map: mapRef,
        title: gig.title,
        // Make markers slightly transparent during location picking to show they're still there
        opacity: isLocationPickerActive ? 0.6 : 1.0
      });
      
      // Only allow clicking on gig markers when not in location picker mode
      if (!isLocationPickerActive) {
        marker.addListener('click', () => setSelectedGig(gig));
      }
      
      return marker;
    });
    
    // Create clusterer
    if (newMarkers.length > 0) {
      markerClustererRef.current = new MarkerClusterer({
        map: mapRef,
        markers: newMarkers,
      });
    }
    
    setMarkerObjects(newMarkers);
    
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      if (markerClustererRef.current) markerClustererRef.current.clearMarkers();
    };
  }, [filteredGigs, mapRef, isLocationPickerActive, setSelectedGig]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }, []);

  // Handle radius change
  const handleRadiusChange = useCallback((radius: number | null) => {
    setSearchRadius(radius);
  }, []);

  // Calculate gigs within radius when radius or center changes
  useEffect(() => {
    if (searchRadius && searchRadius <= 15000) { // Only when radius is 15km or less
      const centerPoint = userDefinedLocation || center;
      const gigsWithinRadius = filteredGigs.filter(gig => {
        const distance = calculateDistance(
          centerPoint.lat,
          centerPoint.lng,
          gig.location.coordinates[1],
          gig.location.coordinates[0]
        );
        return distance <= searchRadius;
      });
      setGigsInRadius(gigsWithinRadius.length);
    } else {
      setGigsInRadius(0);
    }
  }, [searchRadius, filteredGigs, userDefinedLocation, center, calculateDistance]);

  // Handle selected location changes
  useEffect(() => {
    if (selectedLocation && selectedLocation.geometry?.location) {
      const newCenter = {
        lat: selectedLocation.geometry.location.lat(),
        lng: selectedLocation.geometry.location.lng()
      };
      setCenter(newCenter);
      setUserDefinedLocation(newCenter);
      setShowUserLocation(false);
      setUserLocation(newCenter);
      fetchGigs({ lat: newCenter.lat, lng: newCenter.lng, radius: 15 });
      if (mapRef) {
        mapRef.panTo(newCenter);
        mapRef.setZoom(15);
      }
    }
  }, [selectedLocation, mapRef, setUserLocation, fetchGigs]);

  // State to track search-selected location for red pin
  const [searchSelectedLocation, setSearchSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  
  // Update search selected location when selectedLocation changes
  useEffect(() => {
    if (selectedLocation && selectedLocation.geometry?.location) {
      const newLocation = {
        lat: selectedLocation.geometry.location.lat(),
        lng: selectedLocation.geometry.location.lng()
      };
      setSearchSelectedLocation(newLocation);
    }
  }, [selectedLocation]);

  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p>Loading maps...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onMapLoad}
      >
        {showUserLocation && !isLocationPickerActive && <UserLocationMarker mapRef={mapRef} />}
        
        {userDefinedLocation && !isLocationPickerActive && (
          <Marker
            position={userDefinedLocation}
            icon={{
              path: window.google?.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#10B981',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            title="Your selected location"
          />
        )}

        {/* Red pin for search-selected location */}
        {searchSelectedLocation && !isLocationPickerActive && (
          <Marker
            position={searchSelectedLocation}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
                  <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 40),
              anchor: new window.google.maps.Point(16, 40)
            }}
            title="Selected search location"
          />
        )}



        {searchRadius && !isLocationPickerActive && (
          <Circle
            center={userDefinedLocation || center}
            radius={searchRadius}
            options={{
              strokeColor: '#10B981',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#10B981',
              fillOpacity: 0.1,
            }}
          />
        )}
        
        <LocationPicker
          isActive={isLocationPickerActive}
          onSelect={handleLocationSelected}
          onCancel={handleLocationPickerCancel}
          mapRef={mapRef}
        />

        <MapControls 
          onToggleLocationPicker={toggleLocationPicker}
          isLocationPickerActive={isLocationPickerActive}
          resetToLiveLocation={resetToLiveLocation}
          hasManualLocation={!!userDefinedLocation}
          mapRef={mapRef}
          searchRadius={searchRadius}
          onRadiusChange={handleRadiusChange}

        />
      </GoogleMap>

      {/* Search Overlay */}
      <SearchOverlay
        isActive={isSearchOverlayActive}
        onPlaceSelected={handleSearchPlaceSelected}
        onClose={() => setIsSearchOverlayActive(false)}
      />

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p>Loading gigs...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => fetchGigs()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}



      {/* Gig Details Modal */}
      {selectedGig && (
        <Modal
          isOpen={!!selectedGig}
          onClose={() => setSelectedGig(null)}
          title="Gig Details"
          size="lg"
        >
          <GigDetailsModal
            gig={selectedGig}
            onApply={() => {
              // Refresh all gigs after application
              fetchGigs();
            }}
            onClose={() => setSelectedGig(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default MapView;
