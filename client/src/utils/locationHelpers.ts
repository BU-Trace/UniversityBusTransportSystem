// Earth radius in kilometers
const R = 6371;

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get Distance, ETA and Status info
 */
export const getBusTimingInfo = (
  studentPos: [number, number] | null,
  busLat: number,
  busLng: number,
  speed: number
) => {
  // Return placeholder if student location is unavailable
  if (!studentPos) return { distance: '...', eta: 'Calculating', isPassed: false };

  const distance = calculateDistance(studentPos[0], studentPos[1], busLat, busLng);

  // Set minimum speed to 20 km/h for university bus context
  const busSpeed = speed > 5 ? speed : 20;
  const timeInMinutes = Math.round((distance / busSpeed) * 60);

  // Check if bus is very close (less than 100 meters)
  const isArriving = distance < 0.1;

  return {
    distance: distance.toFixed(2) + ' km',
    eta: isArriving ? 'Arriving Now' : `${timeInMinutes} mins`,
    isPassed: false, // Placeholder for direction-based logic
  };
};
