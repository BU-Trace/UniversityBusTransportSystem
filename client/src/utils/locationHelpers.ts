const R = 6371;
 
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

 
export const getBusTimingInfo = (
  userPos: [number, number] | null,
  busLat: number,
  busLng: number,
  speed: number
) => {
  if (!userPos) return { distance: '...', eta: 'Calculating', isPassed: false };

  const distance = calculateDistance(userPos[0], userPos[1], busLat, busLng);

  const busSpeed = speed > 5 ? speed : 20;
  const timeInMinutes = Math.round((distance / busSpeed) * 60);

  const isArriving = distance < 0.1;

  return {
    distance: distance.toFixed(2) + ' km',
    eta: isArriving ? 'Arriving Now' : `${timeInMinutes} mins`,
    isPassed: false,
  };
};
