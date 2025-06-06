import React, { useEffect, useState, useRef } from 'react';
import { Circle } from '@react-google-maps/api';

interface UserLocationMarkerProps {
  mapRef: google.maps.Map | null;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ mapRef }) => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [initialCenter, setInitialCenter] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Start watching position when component mounts and mapRef is available
  useEffect(() => {
    if (!mapRef || isWatching || !('geolocation' in navigator)) return;

    console.log('Starting geolocation watch...');
    setIsWatching(true);
    
    // First, try to get current position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Got initial position:', newPos);
        setUserLocation(newPos);
        setAccuracy(position.coords.accuracy);
        
        // Center map on user location immediately
        if (mapRef && initialCenter) {
          mapRef.panTo(newPos);
          mapRef.setZoom(15);
          setInitialCenter(false);
        }
      },
      (error) => {
        console.warn('Error getting initial position:', error);
        // Continue with watch even if initial position fails
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 10000, // Accept cached position up to 10 seconds old
        timeout: 8000 // 8 second timeout for initial position
      }
    );

    // Then start continuous watching
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Position updated:', newPos);
        setUserLocation(newPos);
        setAccuracy(position.coords.accuracy);
        
        // Center map on user location on first position acquisition
        if (mapRef && initialCenter) {
          mapRef.panTo(newPos);
          mapRef.setZoom(15);
          setInitialCenter(false);
        }
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 30000, // Accept cached position up to 30 seconds old
        timeout: 10000 // 10 second timeout
      }
    );
    
    // Clean up by stopping the watch when component unmounts
    return () => {
      console.log('Cleaning up geolocation watch...');
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
      setIsWatching(false);
    };
  }, [mapRef]); // Remove initialCenter from dependencies to prevent unnecessary re-runs

  // Update marker position when user location changes
  useEffect(() => {
    if (!mapRef || !userLocation) return;

    // Clean up existing marker
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }

    // Create marker element
    const markerElement = document.createElement('div');
    markerElement.style.width = '16px';
    markerElement.style.height = '16px';
    markerElement.style.borderRadius = '50%';
    markerElement.style.backgroundColor = '#4285F4';
    markerElement.style.border = '2px solid #FFFFFF';
    markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

    try {
      // Use AdvancedMarkerElement (recommended approach)
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef,
        position: userLocation,
        content: markerElement,
        title: 'Your location',
      });
    } catch (error) {
      console.warn('Error creating advanced marker, falling back to regular marker:', error);
      // Fallback to regular Marker only if AdvancedMarkerElement is not available
      markerRef.current = new google.maps.Marker({
        map: mapRef,
        position: userLocation,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: 'Your location',
      }) as any;
    }

    // Clean up on unmount
    return () => {
      if (markerRef.current) {
        try {
          // For AdvancedMarkerElement
          if ('map' in markerRef.current && typeof markerRef.current.map === 'object') {
            markerRef.current.map = null;
          }
          // For regular Marker
          else if ('setMap' in markerRef.current && typeof markerRef.current.setMap === 'function') {
            (markerRef.current as any).setMap(null);
          }
        } catch (error) {
          console.warn('Error cleaning up marker:', error);
        }
        markerRef.current = null;
      }
    };
  }, [mapRef, userLocation]);

  if (!userLocation) return null;

  return (
    <>
      {/* Accuracy circle */}
      <Circle
        center={userLocation}
        radius={accuracy}
        options={{
          fillColor: '#4285F4',
          fillOpacity: 0.2,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 1,
        }}
      />
      {/* User location marker is now handled programmatically in useEffect */}
    </>
  );
};

export default UserLocationMarker;
