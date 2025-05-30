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

  // Start watching position when component mounts
  useEffect(() => {
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setPosition(newPos);
          setAccuracy(position.coords.accuracy);
          
          // Center map on user location on first position acquisition
          // or when significant movement is detected
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
          maximumAge: 5000, // 5 seconds
          timeout: 5000 // 5 second timeout
        }
      );
      
      setWatchId(id);
    }
    
    // Clean up by stopping the watch when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [mapRef, initialCenter]);

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