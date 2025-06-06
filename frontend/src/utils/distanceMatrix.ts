export async function getTravelDistanceAndDuration(
  origin: google.maps.LatLngLiteral, 
  destinations: google.maps.LatLngLiteral[], 
  _apiKey: string
) {
  // Mock implementation - replace with actual Google Distance Matrix API call
  return {
    distances: destinations.map(dest => {
      // Calculate rough distance using origin and destination
      const dx = dest.lat - origin.lat;
      const dy = dest.lng - origin.lng;
      return Math.sqrt(dx * dx + dy * dy) * 111000; // Rough conversion to meters
    }),
    durations: destinations.map(() => Math.random() * 60)
  };
} 