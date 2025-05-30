import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import GigMarker from './GigMarker';
import MapControls from './MapControls';
import UserLocationMarker from './UserLocationMarker';
import LocationPicker from './LocationPicker';
import { 
  GOOGLE_MAPS_API_KEY, 
  DEFAULT_CENTER, 
  DEFAULT_ZOOM, 
  MAP_OPTIONS 
} from '../../config/maps';

// Mock data for initial display
const MOCK_GIGS = [{
  id: 1,
  title: 'Delivery Driver',
  lat: 28.6139,
  lng: 77.209,
  pay: '$15/hr',
  skills: ['Driving', 'Navigation']
}, {
  id: 2,
  title: 'House Cleaning',
  lat: 28.6229,
  lng: 77.219,
  pay: '$20/hr',
  skills: ['Cleaning']
}, {
  id: 3,
  title: 'Tech Support',
  lat: 28.6339,
  lng: 77.229,
  pay: '$25/hr',
  skills: ['IT', 'Customer Service']
}, {
  id: 4,
  title: 'Event Staff',
  lat: 28.6129,
  lng: 77.239,
  pay: '$18/hr',
  skills: ['Customer Service']
}, {
  id: 5,
  title: 'Handyman',
  lat: 28.6239,
  lng: 77.249,
  pay: '$22/hr',
  skills: ['Repair', 'Tools']
}];

interface MapViewProps {
  searchQuery: string;
  activeFilters: string[];
  selectedLocation?: google.maps.places.PlaceResult | null;
  onMapsApiLoaded?: (isLoaded: boolean) => void;
}

const MapView: React.FC<MapViewProps> = ({ searchQuery, activeFilters, selectedLocation, onMapsApiLoaded }) => {
  const [gigs, setGigs] = useState(MOCK_GIGS);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [selectedGig, setSelectedGig] = useState<typeof MOCK_GIGS[0] | null>(null);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [isLocationPickerActive, setIsLocationPickerActive] = useState(false);
  const [userDefinedLocation, setUserDefinedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isInitialLocationSet, setIsInitialLocationSet] = useState(false);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const [markerObjects, setMarkerObjects] = useState<google.maps.Marker[]>([]);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [filteredGigs, setFilteredGigs] = useState(MOCK_GIGS);
  const circleRef = useRef<google.maps.Circle | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  useEffect(() => {
    if (onMapsApiLoaded) onMapsApiLoaded(isLoaded);
  }, [isLoaded, onMapsApiLoaded]);

  // Automatically get user's location on initial load
  useEffect(() => {
    if (isLoaded && !isInitialLocationSet && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newPos);
          if (mapRef) {
            mapRef.panTo(newPos);
            mapRef.setZoom(15);
          }
          setIsInitialLocationSet(true);
        },
        (error) => {
          console.error('Error getting initial location:', error);
          // Fall back to default center if geolocation fails
          setIsInitialLocationSet(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000
        }
      );
    }
  }, [isLoaded, mapRef, isInitialLocationSet]);

  // Filter gigs based on search query and active filters
  useEffect(() => {
    if (!searchQuery && activeFilters.length === 0) {
      setGigs(MOCK_GIGS);
      return;
    }
    
    const filteredGigs = MOCK_GIGS.filter(gig => {
      const matchesSearch = searchQuery 
        ? gig.title.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true;
      
      const matchesFilters = activeFilters.length > 0 
        ? activeFilters.some(filter => gig.skills.includes(filter)) 
        : true;
      
      return matchesSearch && matchesFilters;
    });
    
    setGigs(filteredGigs);
  }, [searchQuery, activeFilters]);

  // Filter gigs based on search radius
  useEffect(() => {
    if (!searchRadius) {
      setFilteredGigs(gigs);
      return;
    }

    const origin = userDefinedLocation || center;
    const filtered = gigs.filter(gig => {
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(origin.lat, origin.lng),
        new window.google.maps.LatLng(gig.lat, gig.lng)
      );
      return distance <= searchRadius;
    });

    setFilteredGigs(filtered);
  }, [gigs, searchRadius, center, userDefinedLocation]);

  // Callback for when the map loads
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Toggle location picker mode
  const toggleLocationPicker = useCallback(() => {
    setIsLocationPickerActive(prev => !prev);
    
    // Deselect any selected gig when entering location picker mode
    if (!isLocationPickerActive) {
      setSelectedGig(null);
    }
  }, [isLocationPickerActive]);

  // Handle location selection from manual picker
  const handleLocationSelected = useCallback((location: google.maps.LatLngLiteral) => {
    setUserDefinedLocation(location);
    setCenter(location);
    setIsLocationPickerActive(false);
    setShowUserLocation(false); // Hide live location when manual location is set
    
    // You might want to store this in user preferences or use it for job searches
    console.log('User selected location:', location);
  }, []);

  // Cancel location picking
  const handleLocationPickerCancel = useCallback(() => {
    setIsLocationPickerActive(false);
  }, []);

  // Reset to live location
  const resetToLiveLocation = useCallback(() => {
    setUserDefinedLocation(null);
    setShowUserLocation(true);
  }, []);

  // Update marker clustering when filtered gigs change
  useEffect(() => {
    if (!mapRef || isLocationPickerActive) return;
    // Remove previous markers from clusterer
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
    // Remove previous markers from map
    markerObjects.forEach(marker => marker.setMap(null));
    // Create new markers for filtered gigs
    const newMarkers = filteredGigs.map(gig => {
      const marker = new window.google.maps.Marker({
        position: { lat: gig.lat, lng: gig.lng },
        map: mapRef,
        title: gig.title,
        icon: {
          url: '/markers/default-marker.svg',
          scaledSize: new window.google.maps.Size(35, 35)
        }
      });
      marker.addListener('click', () => setSelectedGig(gig));
      return marker;
    });
    // Create or update clusterer
    markerClustererRef.current = new MarkerClusterer({
      map: mapRef,
      markers: newMarkers,
    });
    setMarkerObjects(newMarkers);
    // Cleanup on unmount
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      if (markerClustererRef.current) markerClustererRef.current.clearMarkers();
    };
  }, [filteredGigs, mapRef, isLocationPickerActive]);

  // Handle search query changes
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery) {
        setGigs(MOCK_GIGS);
        return;
      }

      try {
        const location = await geocodeAddress(searchQuery);
        if (location) {
          setCenter(location);
          if (mapRef) {
            mapRef.panTo(location);
            mapRef.setZoom(15);
          }
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    };

    handleSearch();
  }, [searchQuery, mapRef]);

  // Handle radius change
  const handleRadiusChange = useCallback((radius: number | null) => {
    setSearchRadius(radius);
  }, []);

  useEffect(() => {
    if (selectedLocation && selectedLocation.geometry?.location) {
      const newCenter = {
        lat: selectedLocation.geometry.location.lat(),
        lng: selectedLocation.geometry.location.lng()
      };
      setCenter(newCenter);
      setUserDefinedLocation(newCenter);
      setShowUserLocation(false);
      if (mapRef) {
        mapRef.panTo(newCenter);
        mapRef.setZoom(15);
      }
    }
  }, [selectedLocation, mapRef]);

  // Handle map errors
  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  // Show loading state
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
        {/* Show real-time user location only if it's enabled and not in location picker mode */}
        {showUserLocation && !isLocationPickerActive && <UserLocationMarker mapRef={mapRef} />}
        
        {/* Show user-defined location if set and not in location picker mode */}
        {userDefinedLocation && !isLocationPickerActive && (
          <Marker
            position={userDefinedLocation}
            icon={{
              path: window.google?.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#10B981', // Green color
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            title="Your selected location"
          />
        )}

        {/* Show search radius circle */}
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
            onLoad={circle => {
              circleRef.current = circle;
            }}
          />
        )}
        
        {/* Location picker mode */}
        <LocationPicker
          isActive={isLocationPickerActive}
          onSelect={handleLocationSelected}
          onCancel={handleLocationPickerCancel}
          mapRef={mapRef}
        />

        {/* Map controls */}
        <MapControls 
          setCenter={setCenter}
          onToggleLocationPicker={toggleLocationPicker}
          isLocationPickerActive={isLocationPickerActive}
          resetToLiveLocation={resetToLiveLocation}
          hasManualLocation={!!userDefinedLocation}
          mapRef={mapRef}
          searchRadius={searchRadius}
          onRadiusChange={handleRadiusChange}
        />
      </GoogleMap>
    </div>
  );
};

export default MapView;