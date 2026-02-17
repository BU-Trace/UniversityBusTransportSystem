export type LocationData = {
  city: string;
  region: string;
  country: string;
  timezone: string;
  lat: number;
  lon: number;
  isIPBased?: boolean;
  fullAddress?: string;
};

export async function getCurrentLocation(): Promise<LocationData> {
  // IP-based fallback function using multiple providers
  const getIPLocation = async (): Promise<LocationData> => {
    const providers = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
    ];

    for (const url of providers) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        
        // Normalize data based on provider
        if (url.includes('ipapi.co')) {
          const city = data.city || '';
          const region = data.region || '';
          const country = data.country_name || '';
          return {
            city,
            region,
            country,
            timezone: data.timezone || '',
            lat: data.latitude || 0,
            lon: data.longitude || 0,
            isIPBased: true,
            fullAddress: [city, region, country].filter(Boolean).join(', '),
          };
        } else if (url.includes('ip-api.com')) {
          if (data.status !== 'success') continue;
          const city = data.city || '';
          const region = data.regionName || '';
          const country = data.country || '';
          return {
            city,
            region,
            country,
            timezone: data.timezone || '',
            lat: data.lat || 0,
            lon: data.lon || 0,
            isIPBased: true,
            fullAddress: [city, region, country].filter(Boolean).join(', '),
          };
        }
      } catch (err) {
        console.warn(`Fetch to ${url} failed`, err);
      }
    }
    throw new Error('All IP-based location providers failed');
  };

  // Prioritize IP-based detection to avoid browser prompt as per user request
  try {
    const ipLocation = await getIPLocation();
    if (ipLocation) return ipLocation;
  } catch (err) {
    console.warn('IP location detection failed, attempting geolocation fallback', err);
  }

  // Fallback to Geolocation only if IP fails
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(null as unknown as LocationData);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (!res.ok) throw new Error('Reverse geocoding failed');
          const data = await res.json();
          
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          resolve({
            city: data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || '',
            region: data.address?.state || '',
            country: data.address?.country || '',
            timezone: timezone,
            lat: latitude,
            lon: longitude,
            isIPBased: false,
            fullAddress: data.display_name || '',
          });
        } catch (err) {
          console.error('Geolocation reverse geocoding failed', err);
          resolve(null as unknown as LocationData);
        }
      },
      (err) => {
        console.warn('Geolocation failed', err);
        resolve(null as unknown as LocationData);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}
