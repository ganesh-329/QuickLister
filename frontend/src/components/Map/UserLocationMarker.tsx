import React, { useEffect, useState } from 'react';
import { Marker, Circle } from '@react-google-maps/api';

interface UserLocationMarkerProps {
  mapRef: google.maps.Map | null;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ mapRef }) => {
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [initialCenter, setInitialCenter] = useState(true);
  const [isWatching, setIsWatching] = useState(false);

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
        setPosition(newPos);
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
        setPosition(newPos);
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
    
    setWatchId(id);
    
    // Clean up by stopping the watch when component unmounts
    return () => {
      console.log('Cleaning up geolocation watch...');
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
      setIsWatching(false);
    };
  }, [mapRef]); // Remove initialCenter from dependencies to prevent unnecessary re-runs

  if (!position) return null;

  return (
    <>
      {/* Accuracy circle */}
      <Circle
        center={position}
        radius={accuracy}
        options={{
          fillColor: '#4285F4',
          fillOpacity: 0.2,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 1,
        }}
      />
      
      {/* User location marker */}
      <Marker
        position={position}
        icon={{
          path: window.google?.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }}
      />
    </>
  );
};

export default UserLocationMarker;
