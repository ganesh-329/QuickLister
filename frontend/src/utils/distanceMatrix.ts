export async function getTravelDistanceAndDuration(origin, destinations, apiKey) {
  const service = new window.google.maps.DistanceMatrixService();
  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK') {
          resolve(response);
        } else {
          reject(status);
        }
      }
    );
  });
} 