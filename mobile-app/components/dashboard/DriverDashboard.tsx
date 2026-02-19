import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Bus, MapPin, Play, Square, Pause, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // In mobile, localhost won't work usually, needs dev machine IP

type Status = 'idle' | 'sharing' | 'paused';

interface BusInfo {
  busNo: string;
  reg: string;
  route: string;
}

const DriverDashboard = () => {
  const [selectedBus, setSelectedBus] = useState<BusInfo | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const watchSubscription = useRef<any>(null);

  const availableBuses: BusInfo[] = [
    { busNo: 'BRTC-8', reg: 'DHK-11-2233', route: 'Route-1' },
    { busNo: 'BRTC-9', reg: 'DHK-11-2345', route: 'Route-1' },
    { busNo: 'BRTC-10', reg: 'DHK-22-8899', route: 'Route-2' },
  ];

  useEffect(() => {
    return () => {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
    };
  }, []);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required for tracking.');
      return false;
    }
    return true;
  };

  const startTracking = async () => {
    if (!selectedBus) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setStatus('sharing');
    socket.emit('joinRoute', { routeId: selectedBus.route });
    socket.emit('busStatus', {
      busId: selectedBus.busNo,
      routeId: selectedBus.route,
      status: 'running',
    });

    watchSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude: lat, longitude: lng } = location.coords;
        setCurrentLocation({ lat, lng });

        socket.emit('sendLocation', {
          routeId: selectedBus.route,
          busId: selectedBus.busNo,
          lat,
          lng,
          status: 'running',
        });
      }
    );
  };

  const stopTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setStatus('idle');
    if (selectedBus) {
      socket.emit('busStatus', {
        busId: selectedBus.busNo,
        routeId: selectedBus.route,
        status: 'stopped',
      });
    }
    setCurrentLocation(null);
  };

  const togglePause = () => {
    const newStatus = status === 'paused' ? 'sharing' : 'paused';
    setStatus(newStatus);

    if (selectedBus) {
      socket.emit('busStatus', {
        busId: selectedBus.busNo,
        routeId: selectedBus.route,
        status: newStatus === 'sharing' ? 'running' : 'paused',
      });
    }

    if (newStatus === 'paused' && watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    } else if (newStatus === 'sharing') {
      startTracking();
    }
  };

  if (!selectedBus) {
    return (
      <View className="flex-1 bg-gray-50 p-6">
        <Text className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
          Your Shift
        </Text>
        <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">
          Select Assigned Bus
        </Text>

        <ScrollView className="flex-1">
          {availableBuses.map((bus) => (
            <TouchableOpacity
              key={bus.busNo}
              onPress={() => setSelectedBus(bus)}
              className="bg-white p-6 rounded-[32px] border border-gray-100 mb-4 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="bg-red-50 p-4 rounded-2xl mr-4">
                  <Bus size={24} color="#9b111e" />
                </View>
                <View>
                  <Text className="text-lg font-black text-gray-900 uppercase">{bus.busNo}</Text>
                  <Text className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">
                    {bus.route}
                  </Text>
                </View>
              </View>
              <View className="bg-green-50 px-3 py-1 rounded-full">
                <Text className="text-green-600 text-[10px] font-black uppercase">Ready</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Map Placeholder */}
      <View className="h-[50%] bg-gray-200 justify-center items-center">
        {currentLocation ? (
          <View className="items-center">
            <View className="bg-brick-600 p-4 rounded-full mb-4 shadow-xl">
              <MapPin size={32} color="white" />
            </View>
            <Text className="text-gray-900 font-black uppercase tracking-widest text-xs">
              Tracking Lat: {currentLocation.lat.toFixed(4)}
            </Text>
            <Text className="text-gray-900 font-black uppercase tracking-widest text-xs">
              Lng: {currentLocation.lng.toFixed(4)}
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <View className="bg-gray-300 p-8 rounded-full mb-4">
              <MapPin size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 font-black uppercase tracking-widest text-xs">
              Awaiting Fix...
            </Text>
          </View>
        )}
      </View>

      {/* Info & Controls */}
      <View className="flex-1 bg-white -mt-10 rounded-t-[48px] p-8 shadow-2xl border-t border-gray-100">
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Active Bus
            </Text>
            <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
              {selectedBus.busNo}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Status
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${status === 'sharing' ? 'bg-green-500' : 'bg-amber-500'}`}
              />
              <Text
                className={`text-sm font-black uppercase tracking-tighter ${status === 'sharing' ? 'text-green-600' : 'text-amber-600'}`}
              >
                {status}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-4 mb-8">
          {status === 'idle' ? (
            <TouchableOpacity
              onPress={startTracking}
              className="flex-1 bg-brick-600 py-6 rounded-3xl flex-row justify-center items-center shadow-lg shadow-brick-900/40"
            >
              <Play size={20} color="white" className="mr-2" />
              <Text className="text-white font-black uppercase tracking-widest ml-2">
                Start Shift
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={togglePause}
                className="flex-1 bg-amber-500 py-6 rounded-3xl flex-row justify-center items-center shadow-sm"
              >
                {status === 'paused' ? (
                  <Play size={20} color="white" />
                ) : (
                  <Pause size={20} color="white" />
                )}
                <Text className="text-white font-black uppercase tracking-widest ml-2">
                  {status === 'paused' ? 'Resume' : 'Pause'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={stopTracking}
                className="flex-1 bg-gray-900 py-6 rounded-3xl flex-row justify-center items-center shadow-sm"
              >
                <Square size={20} color="white" />
                <Text className="text-white font-black uppercase tracking-widest ml-2">End</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setSelectedBus(null)}
          disabled={status !== 'idle'}
          className={`flex-row justify-center items-center p-4 border border-gray-100 rounded-2xl ${status !== 'idle' ? 'opacity-30' : ''}`}
        >
          <RefreshCw size={16} color="#6b7280" />
          <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-3">
            Switch Assigned Bus
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverDashboard;
