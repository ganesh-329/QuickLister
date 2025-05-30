// Google Maps Configuration

// The API key should be stored in environment variables for production
// For development, you can replace this with your API key
// In production, use: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
export const GOOGLE_MAPS_API_KEY = "AIzaSyC80llSiGLLP65mGdtN5deyTDDpNiLMW3A";

// Default map settings
export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // Delhi
export const DEFAULT_ZOOM = 13;

// Map styling options (can be customized)
export const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: false,        // We have custom zoom controls
  streetViewControl: false,  // Keep street view disabled as manually set
  cameraControl: false,      // Keep camera control disabled as manually set
  mapTypeControl: false,     // We have custom map type control
  fullscreenControl: true,   // Show fullscreen button
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// Marker settings
export const MARKER_SETTINGS = {
  DEFAULT_ICON: {
    url: "/markers/default-marker.svg",
    scaledSize: { width: 35, height: 35 }
  },
  SELECTED_ICON: {
    url: "/markers/selected-marker.svg",
    scaledSize: { width: 40, height: 40 }
  }
}; 


 