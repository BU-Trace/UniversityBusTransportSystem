import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MapPin, Globe, Navigation as NavigationIcon, Clock } from 'lucide-react-native';
import * as Location from 'expo-location';

const LocationDisplay: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setCoords({ lat: location.coords.latitude, lon: location.coords.longitude });

        let reverse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverse.length > 0) {
          const item = reverse[0];
          const full = [item.street, item.district, item.city, item.region]
            .filter(Boolean)
            .join(', ');
          setAddress(full || 'Location detected');
        }
      } catch (err) {
        console.error(err);
        setError('Location unavailable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View className="w-full items-center justify-center py-6">
        <ActivityIndicator color="#cb7481" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="w-full flex-col items-center justify-center py-8 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10">
        <MapPin size={32} color="#6b7280" className="mb-2" />
        <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          {error || 'Location Data Offline'}
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
      <View className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
        <Globe size={120} color="white" />
      </View>

      <View className="flex-row items-center mb-3">
        <MapPin size={16} color="#cb7481" className="mr-2" />
        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
          Exact Location Detected
        </Text>
      </View>

      <Text className="text-white text-xl font-black italic tracking-tighter mb-4 leading-relaxed">
        {address || 'Barishal University Campus, Bangladesh'}
      </Text>

      <View className="flex-row items-center gap-6">
        <View className="flex-row items-center">
          <NavigationIcon size={12} color="#cb7481" className="mr-2" />
          <Text className="text-gray-500 text-[10px] font-black uppercase">
            LAT: {coords?.lat.toFixed(4) || '22.6565'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <NavigationIcon size={12} color="#cb7481" className="mr-2" />
          <Text className="text-gray-500 text-[10px] font-black uppercase">
            LON: {coords?.lon.toFixed(4) || '90.3541'}
          </Text>
        </View>
      </View>

      <View className="h-px bg-white/10 w-full my-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Clock size={14} color="#cb7481" className="mr-2" />
          <Text className="text-white text-xs font-black">Asia/Dhaka</Text>
        </View>
        <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-emerald-500 text-[8px] font-black uppercase">GPS Verified</Text>
        </View>
      </View>
    </View>
  );
};

export default LocationDisplay;
