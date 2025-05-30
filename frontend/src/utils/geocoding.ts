export async function geocodeAddress(address: string): Promise<google.maps.GeocoderResult[]> {
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<google.maps.GeocoderResult[]> {
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
} 